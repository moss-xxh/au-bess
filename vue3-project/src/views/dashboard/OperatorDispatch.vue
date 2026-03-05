<template>
  <div class="operator-dispatch">
    <!-- Upper Left: Station Control Panel -->
    <div class="left-panel">
      <StationControlPanel ref="controlPanelRef" />
    </div>

    <!-- Upper Right: Market Area -->
    <div class="right-panel">
      <div class="market-card">
        <!-- Tab: Market | Auto Preview -->
        <div class="market-tabs">
          <button class="market-tab" :class="{ active: activeTab === 'market' }" @click="activeTab = 'market'">
            {{ i18n.t('market') }}
          </button>
          <button class="market-tab" :class="{ active: activeTab === 'autoPreview' }" @click="activeTab = 'autoPreview'">
            {{ i18n.t('autoPreview') }}
          </button>
        </div>

        <!-- Market Tab -->
        <template v-if="activeTab === 'market'">
          <div class="metric-cards">
            <div class="metric-card">
              <div class="metric-label">{{ i18n.t('currentSpotPrice') }}</div>
              <div class="metric-sublabel">$/MWh</div>
              <div class="metric-value price-value-text">${{ currentSpotPrice.toFixed(2) }}</div>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-card">
              <div class="metric-label">{{ i18n.t('currentDemand') }}</div>
              <div class="metric-sublabel">MW</div>
              <div class="metric-value demand-value-text">{{ currentDemandValue.toLocaleString() }}</div>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-card">
              <div class="metric-label">{{ i18n.t('forecastPrice') }}</div>
              <div class="metric-sublabel">$/MWh · {{ i18n.t('next30min') }}</div>
              <div class="metric-value price-value-text">${{ forecastPriceValue.toFixed(2) }}</div>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-card">
              <div class="metric-label">{{ i18n.t('forecastDemand') }}</div>
              <div class="metric-sublabel">MW · {{ i18n.t('next30min') }}</div>
              <div class="metric-value demand-value-text">{{ forecastDemandValue.toLocaleString() }}</div>
            </div>
          </div>
          <div ref="marketChartRef" class="chart-container"></div>
        </template>

        <!-- Auto Preview Panel -->
        <template v-else>
          <div class="auto-preview-panel">
            <!-- 3 预估指标 -->
            <div class="ap-stats-row">
              <div class="ap-stat-card">
                <div class="ap-stat-label">{{ i18n.t('estChargeCost') }}</div>
                <div class="ap-stat-sub">($)</div>
                <div class="ap-stat-value charge-cost">${{ estimatedChargeCost }}</div>
              </div>
              <div class="ap-stat-divider"></div>
              <div class="ap-stat-card">
                <div class="ap-stat-label">{{ i18n.t('estSellRevenue') }}</div>
                <div class="ap-stat-sub">($)</div>
                <div class="ap-stat-value sell-revenue">${{ estimatedSellRevenue }}</div>
              </div>
              <div class="ap-stat-divider"></div>
              <div class="ap-stat-card">
                <div class="ap-stat-label">{{ i18n.t('estNetProfit') }}</div>
                <div class="ap-stat-sub">($)</div>
                <div class="ap-stat-value net-profit">${{ estimatedNetProfit }}</div>
              </div>
            </div>
            <!-- 迷你价格预测图 -->
            <div ref="autoPreviewChartRef" class="chart-container" style="height: 320px;"></div>
          </div>
        </template>
      </div>
    </div>

    <!-- Bottom: Power & Profit full-width -->
    <div class="bottom-panel">
      <div class="power-profit-card">
        <div class="pp-header">
          <h2 class="pp-title">{{ i18n.t('powerAndProfit') }}</h2>
          <div class="pp-controls">
            <select v-model="ppPeriod" class="pp-select">
              <option value="day">{{ i18n.t('day') }}</option>
              <option value="month">{{ i18n.t('month') }}</option>
              <option value="year">{{ i18n.t('year') }}</option>
              <option value="cumulative">{{ i18n.t('cumulative') }}</option>
            </select>
            <!-- Dynamic date picker based on period -->
            <input
              v-if="ppPeriod === 'day'"
              v-model="ppDate"
              type="date"
              class="pp-date-input"
            />
            <input
              v-else-if="ppPeriod === 'month'"
              v-model="ppMonth"
              type="month"
              class="pp-date-input"
            />
            <input
              v-else-if="ppPeriod === 'year'"
              v-model.number="ppYear"
              type="number"
              :min="2020"
              :max="currentYear"
              class="pp-date-input pp-year-input"
            />
            <!-- cumulative: no picker -->
          </div>
        </div>

        <div class="pp-metric-cards">
          <div class="pp-metric-card">
            <div class="pp-metric-title">{{ i18n.t(chargeLabel) }}</div>
            <div class="pp-metric-main">{{ formatEnergy(totalCharge) }} MWh</div>
            <div class="pp-metric-sub">{{ i18n.t('cost') }} ${{ formatDollar(Math.abs(totalChargeCost)) }}</div>
          </div>
          <div class="pp-metric-card">
            <div class="pp-metric-title">{{ i18n.t(dischargeLabel) }}</div>
            <div class="pp-metric-main">{{ formatEnergy(totalDischarge) }} MWh</div>
            <div class="pp-metric-sub">{{ i18n.t('revenue') }} ${{ formatDollar(totalDischargeRevenue) }}</div>
          </div>
          <div class="pp-metric-card">
            <div class="pp-metric-title">{{ i18n.t('netProfit') }}</div>
            <div class="pp-metric-main profit-value">${{ formatDollar(netProfitTotal) }}</div>
            <div class="pp-metric-sub">
              {{ i18n.t(comparisonLabel) }}
              <span class="pp-trend" :class="vsComparison >= 0 ? 'trend-up' : 'trend-down'">
                {{ vsComparison >= 0 ? '↑' : '↓' }}{{ Math.abs(vsComparison) }}%
              </span>
            </div>
          </div>
        </div>

        <div ref="powerProfitChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useI18nStore } from '@/stores/i18nStore'
import {
  getOperatorChartData,
  getPowerProfitMonthData,
  getPowerProfitYearData,
  getPowerProfitCumulativeData,
} from '@/mock/dashboard'
import type { OperatorChartData, PowerProfitDataPoint } from '@/mock/dashboard'
import StationControlPanel from './StationControlPanel.vue'

const controlPanelRef = ref<InstanceType<typeof StationControlPanel> | null>(null)

const i18n = useI18nStore()

const activeTab = ref<'market' | 'autoPreview'>('market')
const ppPeriod = ref('day')

const now = new Date()
const currentYear = now.getFullYear()
const ppDate = ref(now.toISOString().slice(0, 10))
const ppMonth = ref(now.toISOString().slice(0, 7))
const ppYear = ref(currentYear)

const chartData = ref<OperatorChartData>({ market: [], powerProfit: [] })
const ppData = ref<PowerProfitDataPoint[]>([])

const marketChartRef = ref<HTMLElement | null>(null)
const autoPreviewChartRef = ref<HTMLElement | null>(null)
const powerProfitChartRef = ref<HTMLElement | null>(null)

const marketChart = shallowRef<echarts.ECharts | null>(null)
const autoPreviewChart = shallowRef<echarts.ECharts | null>(null)
const powerProfitChart = shallowRef<echarts.ECharts | null>(null)

// === Metric label keys based on period ===
const chargeLabel = computed(() => {
  const map: Record<string, string> = {
    day: 'todayCharge',
    month: 'monthlyCharge',
    year: 'annualCharge',
    cumulative: 'totalCharge',
  }
  return map[ppPeriod.value] || 'todayCharge'
})

const dischargeLabel = computed(() => {
  const map: Record<string, string> = {
    day: 'todayDischarge',
    month: 'monthlyDischarge',
    year: 'annualDischarge',
    cumulative: 'totalDischarge',
  }
  return map[ppPeriod.value] || 'todayDischarge'
})

const comparisonLabel = computed(() => {
  const map: Record<string, string> = {
    day: 'vsYesterday',
    month: 'vsLastMonth',
    year: 'vsLastYear',
    cumulative: 'vsLastYear',
  }
  return map[ppPeriod.value] || 'vsYesterday'
})

// === Format helpers ===
function formatEnergy(val: number): string {
  if (ppPeriod.value === 'day') return val.toFixed(2)
  if (ppPeriod.value === 'month') return val.toFixed(1)
  return Math.round(val).toLocaleString()
}

function formatDollar(val: number): string {
  if (ppPeriod.value === 'day') return val.toFixed(0)
  return Math.round(val).toLocaleString()
}

// === Market metric computeds ===
const currentSpotPrice = computed(() => {
  const data = chartData.value.market
  const currentHour = (new Date().getUTCHours() + 10) % 24
  const current = data[currentHour]
  return current?.historicalPrice ?? current?.predictedPrice ?? 0
})

const currentDemandValue = computed(() => {
  const data = chartData.value.market
  const currentHour = (new Date().getUTCHours() + 10) % 24
  const current = data[currentHour]
  return Math.round(current?.demand ?? current?.predictedDemand ?? 0)
})

const forecastPriceValue = computed(() => {
  const data = chartData.value.market
  const currentHour = (new Date().getUTCHours() + 10) % 24
  const nextIdx = Math.min(currentHour + 1, 23)
  const next = data[nextIdx]
  return next?.predictedPrice ?? next?.historicalPrice ?? 0
})

const forecastDemandValue = computed(() => {
  const data = chartData.value.market
  const currentHour = (new Date().getUTCHours() + 10) % 24
  const nextIdx = Math.min(currentHour + 1, 23)
  const next = data[nextIdx]
  return Math.round(next?.predictedDemand ?? next?.demand ?? 0)
})

// === Auto Preview estimated values ===
// Use a seeded random so values are stable within a session
const apSeed = Date.now()
function seededRandom(i: number): number {
  const x = Math.sin(apSeed + i * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

const predictedPrices = computed(() => {
  const data = chartData.value.market
  return data.map((d, i) => {
    const base = d.historicalPrice ?? d.predictedPrice ?? 0
    const factor = 0.9 + seededRandom(i) * 0.2 // 0.9 - 1.1
    return +(base * factor).toFixed(2)
  })
})

const estimatedChargeCost = computed(() => {
  const prices = predictedPrices.value
  // Charge window: 09:00-13:00 (indices 9,10,11,12)
  const chargeHours = [9, 10, 11, 12]
  const avgPrice = chargeHours.reduce((sum, h) => sum + Math.abs(prices[h] || 0), 0) / chargeHours.length
  // 4h * 1MW capacity
  return (avgPrice * 4 * 1).toFixed(0)
})

const estimatedSellRevenue = computed(() => {
  const prices = predictedPrices.value
  // Discharge window: 17:00-21:00 (indices 17,18,19,20)
  const dischargeHours = [17, 18, 19, 20]
  const avgPrice = dischargeHours.reduce((sum, h) => sum + Math.abs(prices[h] || 0), 0) / dischargeHours.length
  // 4h * 1MW capacity
  return (avgPrice * 4 * 1).toFixed(0)
})

const estimatedNetProfit = computed(() => {
  const profit = Number(estimatedSellRevenue.value) - Number(estimatedChargeCost.value)
  return profit.toFixed(0)
})

// === Power & Profit metric computeds (use ppData) ===
const totalCharge = computed(() =>
  ppData.value.reduce((sum, d) => sum + Math.abs(d.chargeEnergy), 0)
)
const totalChargeCost = computed(() =>
  ppData.value.reduce((sum, d) => sum + d.chargeCost, 0)
)
const totalDischarge = computed(() =>
  ppData.value.reduce((sum, d) => sum + d.dischargeEnergy, 0)
)
const totalDischargeRevenue = computed(() =>
  ppData.value.reduce((sum, d) => sum + d.dischargeRevenue, 0)
)
const netProfitTotal = computed(() =>
  ppData.value.reduce((sum, d) => sum + d.netProfit, 0)
)
const vsComparison = computed(() => {
  const map: Record<string, number> = {
    day: 12.5,
    month: 8.3,
    year: 15.2,
    cumulative: 22.1,
  }
  return map[ppPeriod.value] ?? 12.5
})

// === Load Power & Profit data based on period ===
function loadPPData() {
  if (ppPeriod.value === 'day') {
    ppData.value = chartData.value.powerProfit
  } else if (ppPeriod.value === 'month') {
    const [y, m] = ppMonth.value.split('-').map(Number)
    ppData.value = getPowerProfitMonthData(y, m)
  } else if (ppPeriod.value === 'year') {
    ppData.value = getPowerProfitYearData(ppYear.value)
  } else {
    ppData.value = getPowerProfitCumulativeData()
  }
}

// === Chart builders ===
function buildMarketOption(): echarts.EChartsOption {
  const data = chartData.value.market
  const times = data.map(d => d.time)
  const historicalPrices = data.map(d => d.historicalPrice)
  const predictedPrices = data.map(d => d.predictedPrice)
  const demands = data.map(d => d.demand)
  const predictedDemands = data.map(d => d.predictedDemand)

  const currentIdx = data.findIndex(d => d.historicalPrice !== null && d.predictedPrice !== null)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderColor: '#00ff88',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter(params: any) {
        let result = `<div style="font-weight:bold;margin-bottom:5px">${params[0].axisValue}</div>`
        params.forEach((p: any) => {
          if (p.value !== null && p.value !== undefined) {
            const isPriceSeries = p.seriesName.includes('Price') || p.seriesName.includes('价格')
            const val = isPriceSeries
              ? `$${typeof p.value === 'number' ? p.value.toFixed(2) : p.value}`
              : `${typeof p.value === 'number' ? p.value.toFixed(0) : p.value} MW`
            result += `<div>${p.marker} ${p.seriesName}: <strong>${val}</strong></div>`
          }
        })
        return result
      },
    },
    legend: {
      data: [
        i18n.t('historicalPrice'),
        i18n.t('predictedPrice'),
        i18n.t('demand'),
        i18n.t('predictedDemand'),
      ],
      textStyle: { color: 'rgba(255,255,255,0.7)' },
      top: 10,
    },
    grid: { left: 10, right: 10, bottom: 40, top: 50, containLabel: true },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.7)', interval: 23, fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: i18n.t('priceMWh'),
        nameTextStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
        position: 'left',
        scale: true,
        axisLine: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.7)', formatter: '${value}' },
        splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed', width: 1 } },
      },
      {
        type: 'value',
        name: i18n.t('demandMW'),
        nameTextStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
        position: 'right',
        scale: true,
        axisLine: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.7)', formatter: '{value} MW' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: i18n.t('historicalPrice'),
        type: 'line',
        data: historicalPrices,
        smooth: true, showSymbol: false,
        lineStyle: { color: '#00ff88', width: 2 },
        itemStyle: { color: '#00ff88' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,255,136,0.3)' },
            { offset: 1, color: 'rgba(0,255,136,0.05)' },
          ]),
        },
        markLine: currentIdx >= 0 ? {
          symbol: 'none', silent: true,
          data: [{ xAxis: currentIdx, lineStyle: { color: 'rgba(255,255,255,0.4)', type: 'dashed', width: 2 }, label: { show: false } }],
        } : undefined,
      },
      {
        name: i18n.t('demand'), type: 'line', yAxisIndex: 1, data: demands,
        smooth: true, showSymbol: false,
        lineStyle: { color: '#ffd700', width: 2 }, itemStyle: { color: '#ffd700' },
      },
      {
        name: i18n.t('predictedPrice'), type: 'line', data: predictedPrices,
        smooth: true, showSymbol: false, connectNulls: true,
        lineStyle: { color: '#00ff88', width: 2, type: 'dashed' }, itemStyle: { color: '#00ff88' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,255,136,0.15)' },
            { offset: 1, color: 'rgba(0,255,136,0.02)' },
          ]),
        },
      },
      {
        name: i18n.t('predictedDemand'), type: 'line', yAxisIndex: 1, data: predictedDemands,
        smooth: true, showSymbol: false, connectNulls: true,
        lineStyle: { color: '#ffd700', width: 2, type: 'dashed' }, itemStyle: { color: '#ffd700' },
      },
    ],
  }
}

function buildPowerProfitOption(): echarts.EChartsOption {
  const data = ppData.value
  const times = data.map(d => d.time)
  const period = ppPeriod.value

  // Adjust xAxis label interval based on period
  let xAxisInterval = 2
  if (period === 'day') xAxisInterval = 2
  else if (period === 'month') xAxisInterval = 2
  else xAxisInterval = 0

  // Tooltip value formatting based on period
  const energyDecimals = period === 'day' ? 2 : period === 'month' ? 1 : 0

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.92)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter(params: any) {
        const time = params[0].axisValue
        const lines = [`<b>${time}</b>`]
        params.forEach((p: any) => {
          if (p.value === null || p.value === undefined) return
          const isEnergy = p.seriesName.includes('MWh')
          let val: string
          if (isEnergy) {
            val = `${Math.abs(p.value).toFixed(energyDecimals)} MWh`
          } else {
            val = `$${Math.abs(p.value).toLocaleString()}`
          }
          lines.push(`${p.marker} ${p.seriesName}: ${val}`)
        })
        return lines.join('<br>')
      },
    },
    legend: {
      data: [
        i18n.t('chargeMWh'), i18n.t('dischargeMWh'), i18n.t('chargeCost'),
        i18n.t('dischargeRevenue'), i18n.t('netProfitDollar'),
      ],
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
      top: 0, itemGap: 12, itemWidth: 14, itemHeight: 10,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category', data: times,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { color: 'rgba(255,255,255,0.6)', interval: xAxisInterval },
    },
    yAxis: [
      {
        type: 'value', name: 'MWh',
        nameTextStyle: { color: 'rgba(255,255,255,0.6)' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.6)' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      {
        type: 'value', name: 'AUD ($)',
        nameTextStyle: { color: 'rgba(255,255,255,0.6)' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
        axisLabel: { color: 'rgba(255,255,255,0.6)', formatter: '${value}' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: i18n.t('chargeMWh'), type: 'bar', stack: 'energy',
        data: data.map(d => d.chargeEnergy),
        itemStyle: { color: 'rgba(0,255,136,0.7)', borderRadius: [0, 0, 3, 3] }, barWidth: '35%',
      },
      {
        name: i18n.t('dischargeMWh'), type: 'bar', stack: 'energy',
        data: data.map(d => d.dischargeEnergy),
        itemStyle: { color: 'rgba(255,193,7,0.8)', borderRadius: [3, 3, 0, 0] }, barWidth: '35%',
      },
      {
        name: i18n.t('chargeCost'), type: 'line', yAxisIndex: 1,
        data: data.map(d => d.chargeCost),
        lineStyle: { width: 2, color: '#ff6b6b', type: 'dashed' },
        itemStyle: { color: '#ff6b6b' }, symbol: 'none', smooth: true,
      },
      {
        name: i18n.t('dischargeRevenue'), type: 'line', yAxisIndex: 1,
        data: data.map(d => d.dischargeRevenue),
        lineStyle: { width: 2, color: '#00ff88' },
        itemStyle: { color: '#00ff88' }, symbol: 'none', smooth: true,
      },
      {
        name: i18n.t('netProfitDollar'), type: 'line', yAxisIndex: 1,
        data: data.map(d => d.netProfit),
        lineStyle: { width: 3, color: '#ffd700' },
        itemStyle: { color: '#ffd700' }, symbol: 'circle', symbolSize: 5, smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,215,0,0.15)' },
            { offset: 1, color: 'rgba(255,215,0,0)' },
          ]),
        },
        markArea: period === 'day' ? {
          silent: true,
          data: [
            ...(controlPanelRef.value?.chargePeriods || [{ start: '09:00', end: '13:00' }]).map((p: any) => [
              { xAxis: p.start, itemStyle: { color: 'rgba(0, 255, 136, 0.06)' } },
              { xAxis: p.end },
            ]),
            ...(controlPanelRef.value?.dischargePeriods || [{ start: '17:00', end: '21:00' }]).map((p: any) => [
              { xAxis: p.start, itemStyle: { color: 'rgba(255, 193, 7, 0.06)' } },
              { xAxis: p.end },
            ]),
          ],
        } : undefined,
      },
    ],
  }
}

// === Chart init helpers ===
function buildAutoPreviewOption(): echarts.EChartsOption {
  const data = chartData.value.market
  const times = data.map(d => d.time)
  const historicalPrices = data.map(d => d.historicalPrice ?? d.predictedPrice ?? 0)
  const aiPrices = predictedPrices.value

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderColor: '#00ff88',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter(params: any) {
        let result = `<div style="font-weight:bold;margin-bottom:5px">${params[0].axisValue}</div>`
        params.forEach((p: any) => {
          if (p.value !== null && p.value !== undefined) {
            result += `<div>${p.marker} ${p.seriesName}: <strong>$${typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong></div>`
          }
        })
        return result
      },
    },
    legend: {
      data: [
        i18n.t('historicalPrice'),
        i18n.t('aiPredictedPrice'),
      ],
      textStyle: { color: 'rgba(255,255,255,0.7)' },
      top: 10,
    },
    grid: { left: 10, right: 10, bottom: 40, top: 50, containLabel: true },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.7)', interval: 1, fontSize: 12 },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: i18n.t('priceMWh'),
      nameTextStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
      scale: true,
      axisLine: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.7)', formatter: '${value}' },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed', width: 1 } },
    },
    series: [
      {
        name: i18n.t('historicalPrice'),
        type: 'line',
        data: historicalPrices,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#00ff88', width: 3 },
        itemStyle: { color: '#00ff88' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,255,136,0.15)' },
            { offset: 1, color: 'rgba(0,255,136,0.02)' },
          ]),
        },
        markArea: {
          silent: true,
          data: [
            [
              {
                xAxis: '09:00',
                itemStyle: { color: 'rgba(0,255,136,0.08)' },
                label: { show: true, position: 'insideTop', formatter: i18n.t('chargeWindow'), color: 'rgba(0,255,136,0.6)', fontSize: 11 },
              },
              { xAxis: '13:00' },
            ],
            [
              {
                xAxis: '17:00',
                itemStyle: { color: 'rgba(255,193,7,0.08)' },
                label: { show: true, position: 'insideTop', formatter: i18n.t('dischargeWindow'), color: 'rgba(255,193,7,0.6)', fontSize: 11 },
              },
              { xAxis: '21:00' },
            ],
          ],
        },
      },
      {
        name: i18n.t('aiPredictedPrice'),
        type: 'line',
        data: aiPrices,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#a855f7', width: 2, type: 'dashed' },
        itemStyle: { color: '#a855f7' },
      },
    ],
  }
}

function initMarketChart() {
  if (!marketChartRef.value) return
  marketChart.value = echarts.init(marketChartRef.value)
  marketChart.value.setOption(buildMarketOption())
}

function initAutoPreviewChart() {
  if (!autoPreviewChartRef.value) return
  if (autoPreviewChart.value) {
    autoPreviewChart.value.setOption(buildAutoPreviewOption(), true)
    return
  }
  autoPreviewChart.value = echarts.init(autoPreviewChartRef.value)
  autoPreviewChart.value.setOption(buildAutoPreviewOption())
}

function initPowerProfitChart() {
  if (!powerProfitChartRef.value) return
  powerProfitChart.value = echarts.init(powerProfitChartRef.value)
  powerProfitChart.value.setOption(buildPowerProfitOption())
}

function refreshPPChart() {
  loadPPData()
  nextTick(() => {
    if (powerProfitChart.value) {
      powerProfitChart.value.setOption(buildPowerProfitOption(), true)
    } else {
      initPowerProfitChart()
    }
  })
}

// === Watchers ===
watch(() => i18n.locale, () => {
  nextTick(() => {
    marketChart.value?.setOption(buildMarketOption(), true)
    powerProfitChart.value?.setOption(buildPowerProfitOption(), true)
    if (activeTab.value === 'autoPreview') {
      autoPreviewChart.value?.setOption(buildAutoPreviewOption(), true)
    }
  })
})

watch(activeTab, (newTab) => {
  if (newTab === 'market') {
    nextTick(() => { initMarketChart() })
  } else if (newTab === 'autoPreview') {
    nextTick(() => { initAutoPreviewChart() })
  }
})

// Watch period change: reset picker defaults + reload data + redraw chart
watch(ppPeriod, (newPeriod) => {
  const today = new Date()
  if (newPeriod === 'day') {
    ppDate.value = today.toISOString().slice(0, 10)
  } else if (newPeriod === 'month') {
    ppMonth.value = today.toISOString().slice(0, 7)
  } else if (newPeriod === 'year') {
    ppYear.value = today.getFullYear()
  }
  refreshPPChart()
})

// Watch date/month/year value changes to reload data
watch(ppDate, () => {
  if (ppPeriod.value === 'day') refreshPPChart()
})
watch(ppMonth, () => {
  if (ppPeriod.value === 'month') refreshPPChart()
})
watch(ppYear, () => {
  if (ppPeriod.value === 'year') refreshPPChart()
})

function handleResize() {
  marketChart.value?.resize()
  powerProfitChart.value?.resize()
  autoPreviewChart.value?.resize()
}

onMounted(() => {
  chartData.value = getOperatorChartData()
  loadPPData()
  initMarketChart()
  initPowerProfitChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  marketChart.value?.dispose()
  powerProfitChart.value?.dispose()
  autoPreviewChart.value?.dispose()
  marketChart.value = null
  powerProfitChart.value = null
  autoPreviewChart.value = null
})
</script>

<style scoped>
.operator-dispatch {
  display: grid;
  grid-template-columns: 35% 1fr;
  grid-template-rows: auto auto;
  gap: 16px;
  padding: 16px;
  animation: pageFadeIn 0.3s ease-out;
}
.left-panel { grid-column: 1; grid-row: 1; align-self: stretch; }
.right-panel { grid-column: 2; grid-row: 1; align-self: stretch; }
.bottom-panel { grid-column: 1 / -1; grid-row: 2; }

.market-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.market-tabs {
  display: flex;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-default);
}
.market-tab {
  padding: 10px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.market-tab:hover { color: var(--text-primary); }
.market-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.metric-cards {
  display: flex;
  align-items: stretch;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  padding: 16px 0;
}
.metric-card { flex: 1; text-align: center; padding: 0 16px; }
.metric-divider { width: 1px; background: rgba(255, 255, 255, 0.1); align-self: stretch; }
.metric-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; margin-bottom: 2px; }
.metric-sublabel { font-size: 10px; color: var(--text-tertiary); margin-bottom: 8px; }
.metric-value { font-size: 22px; font-weight: 700; font-family: var(--font-mono); }
.price-value-text { color: var(--color-primary); }
.demand-value-text { color: #ffd700; }

.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 400px;
  color: var(--text-tertiary);
  font-size: 18px;
  font-weight: 500;
}
.coming-soon-icon { font-size: 48px; }

/* Auto Preview Panel */
.auto-preview-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ap-stats-row {
  display: flex;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 16px 0;
}
.ap-stat-card {
  flex: 1;
  text-align: center;
  padding: 0 16px;
}
.ap-stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 2px;
}
.ap-stat-sub {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}
.ap-stat-value {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-mono);
}
.ap-stat-value.charge-cost { color: #ff6b6b; }
.ap-stat-value.sell-revenue { color: #ffc107; }
.ap-stat-value.net-profit { color: #00ff88; }
.ap-stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  align-self: stretch;
}

.chart-container { width: 100%; height: 400px; }

.power-profit-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 20px;
}
.pp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pp-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
.pp-controls { display: flex; align-items: center; gap: 8px; }
.pp-select {
  padding: 6px 28px 6px 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--font-sans);
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: border-color var(--transition-fast);
}
.pp-select:focus { border-color: var(--border-focus); }
.pp-select option { background: #1a1a1a; color: #fff; }
.pp-date-input {
  padding: 6px 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--font-sans);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
  color-scheme: dark;
}
.pp-date-input:focus { border-color: var(--border-focus); }
.pp-year-input {
  width: 90px;
  -moz-appearance: textfield;
}
.pp-year-input::-webkit-outer-spin-button,
.pp-year-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pp-metric-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.pp-metric-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 16px 20px;
}
.pp-metric-title { font-size: 12px; color: var(--text-secondary); font-weight: 500; margin-bottom: 8px; }
.pp-metric-main { font-size: 20px; font-weight: 700; color: var(--text-primary); font-family: var(--font-mono); margin-bottom: 4px; }
.profit-value { color: var(--color-primary); }
.pp-metric-sub { font-size: 12px; color: var(--text-secondary); }
.pp-trend { font-weight: 600; margin-left: 4px; }
.trend-up { color: var(--color-primary); }
.trend-down { color: var(--color-danger); }

@media (max-width: 1024px) {
  .operator-dispatch { grid-template-columns: 1fr; }
  .left-panel, .right-panel, .bottom-panel { grid-column: 1; }
}
@media (max-width: 768px) {
  .chart-container { height: 300px; }
  .metric-cards { flex-direction: column; gap: 12px; }
  .metric-divider { width: 100%; height: 1px; }
  .pp-metric-cards { grid-template-columns: 1fr; }
}
</style>
