<template>
  <div class="tab-profit">
    <!-- Period Selector -->
    <div class="period-row">
      <button
        v-for="p in periods"
        :key="p.key"
        :class="['time-pill', { active: period === p.key }]"
        @click="period = p.key"
      >{{ i18n.t(p.label) }}</button>
    </div>

    <!-- Stats Cards -->
    <div class="profit-stats-grid">
      <div class="profit-stat-card">
        <div class="profit-stat-label">{{ i18n.t('sdTotalCharged') }}</div>
        <div class="profit-stat-val" style="color: #60a5fa">
          {{ totalCharge.toFixed(1) }}<span class="unit">MWh</span>
        </div>
        <div class="profit-stat-change positive">+2.3%</div>
      </div>
      <div class="profit-stat-card">
        <div class="profit-stat-label">{{ i18n.t('sdTotalDischarged') }}</div>
        <div class="profit-stat-val" style="color: #ffc107">
          {{ totalDischarge.toFixed(1) }}<span class="unit">MWh</span>
        </div>
        <div class="profit-stat-change positive">+1.8%</div>
      </div>
      <div class="profit-stat-card">
        <div class="profit-stat-label">{{ i18n.t('sdAvgBuyPrice') }}</div>
        <div class="profit-stat-val" style="color: #a78bfa">
          ${{ avgBuy.toFixed(1) }}<span class="unit">/MWh</span>
        </div>
        <div class="profit-stat-change negative">-5.2%</div>
      </div>
      <div class="profit-stat-card">
        <div class="profit-stat-label">{{ i18n.t('sdAvgSellPrice') }}</div>
        <div class="profit-stat-val" style="color: #fb923c">
          ${{ avgSell.toFixed(1) }}<span class="unit">/MWh</span>
        </div>
        <div class="profit-stat-change positive">+8.1%</div>
      </div>
      <div class="profit-stat-card">
        <div class="profit-stat-label">{{ i18n.t('sdNetProfitLabel') }}</div>
        <div class="profit-stat-val" :style="{ color: totalProfit >= 0 ? '#00ff88' : '#ff6b6b' }">
          ${{ Math.round(totalProfit).toLocaleString() }}
        </div>
        <div :class="['profit-stat-change', totalProfit >= 0 ? 'positive' : 'negative']">
          {{ totalProfit >= 0 ? '+12.4%' : '-3.1%' }}
        </div>
      </div>
    </div>

    <!-- View Toggle -->
    <div class="view-toggle">
      <button
        :class="['view-tab', { active: viewMode === 'chart' }]"
        @click="viewMode = 'chart'"
      >📊 {{ i18n.t('sdChartView') }}</button>
      <button
        :class="['view-tab', { active: viewMode === 'table' }]"
        @click="viewMode = 'table'"
      >📋 {{ i18n.t('sdTableView') }}</button>
    </div>

    <!-- Chart View -->
    <div v-show="viewMode === 'chart'">
      <div ref="chartEl" class="chart-container" style="height: 360px"></div>
    </div>

    <!-- Table View -->
    <div v-show="viewMode === 'table'">
      <div class="profit-table-wrap">
        <table class="profit-table">
          <thead>
            <tr>
              <th>{{ i18n.t('sdPeriodLabel') }}</th>
              <th>{{ i18n.t('sdChargeAmount') }} (MWh)</th>
              <th>{{ i18n.t('sdDischargeAmount') }} (MWh)</th>
              <th>{{ i18n.t('sdAvgBuyPrice') }} ($/MWh)</th>
              <th>{{ i18n.t('sdAvgSellPrice') }} ($/MWh)</th>
              <th>{{ i18n.t('sdChargeCost') }} ($)</th>
              <th>{{ i18n.t('sdDischargeRev') }} ($)</th>
              <th>{{ i18n.t('sdNetProfitLabel') }} ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lbl, idx) in profitData.labels" :key="idx">
              <td style="font-weight:500">{{ lbl }}</td>
              <td style="color:#60a5fa">{{ profitData.charge[idx].toFixed(1) }}</td>
              <td style="color:#ffc107">{{ profitData.discharge[idx].toFixed(1) }}</td>
              <td>${{ profitData.buyPrice[idx].toFixed(1) }}</td>
              <td>${{ profitData.sellPrice[idx].toFixed(1) }}</td>
              <td>${{ (profitData.charge[idx] * profitData.buyPrice[idx]).toFixed(0) }}</td>
              <td>${{ (profitData.discharge[idx] * profitData.sellPrice[idx]).toFixed(0) }}</td>
              <td :style="{ color: profitRow(idx) >= 0 ? '#00ff88' : '#ff6b6b', fontWeight: '600' }">
                ${{ Math.round(profitRow(idx)).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useI18nStore } from '@/stores/i18nStore'
import { getStationProfit } from '@/mock/station-detail'
import type { Station } from '@/mock/dashboard'

const props = defineProps<{ station: Station }>()
const i18n = useI18nStore()

const period = ref('day')
const viewMode = ref<'chart' | 'table'>('chart')
const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const periods = [
  { key: 'day', label: 'day' },
  { key: 'month', label: 'month' },
  { key: 'year', label: 'year' },
  { key: 'cumulative', label: 'cumulative' },
]

const profitData = computed(() => getStationProfit(props.station.id, props.station.capacity, period.value))

const totalCharge = computed(() => profitData.value.charge.reduce((a, b) => a + b, 0))
const totalDischarge = computed(() => profitData.value.discharge.reduce((a, b) => a + b, 0))
const avgBuy = computed(() => {
  const arr = profitData.value.buyPrice.filter(v => v > 0)
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
})
const avgSell = computed(() => {
  const arr = profitData.value.sellPrice.filter(v => v > 0)
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
})
const totalProfit = computed(() => {
  const d = profitData.value
  return d.labels.reduce((sum, _, i) => sum + (d.discharge[i] * d.sellPrice[i] - d.charge[i] * d.buyPrice[i]), 0)
})

function profitRow(idx: number) {
  const d = profitData.value
  return d.discharge[idx] * d.sellPrice[idx] - d.charge[idx] * d.buyPrice[idx]
}

function renderChart() {
  if (!chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value)
  const d = profitData.value
  const isEn = i18n.locale === 'en'

  chart.setOption({
    backgroundColor: 'transparent',
    grid: { left: 55, right: 20, top: 40, bottom: 32 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params: any) => params[0].axisValue + '<br>' + params.map((p: any) => `${p.marker} ${p.seriesName}: ${Math.abs(p.value).toFixed(1)} MWh`).join('<br>'),
    },
    legend: {
      top: 8, left: 'center',
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    },
    xAxis: {
      type: 'category', data: d.labels,
      axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value', name: 'MWh',
      axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, formatter: (v: number) => String(Math.abs(v)) },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
      axisLine: { show: false },
    },
    series: [
      {
        name: isEn ? 'Charge' : '充电量', type: 'bar', barMaxWidth: 32,
        data: d.charge,
        itemStyle: { color: 'rgba(59,130,246,0.85)', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: isEn ? 'Discharge' : '放电量', type: 'bar', barMaxWidth: 32,
        data: d.discharge.map(v => -v),
        itemStyle: { color: 'rgba(255,193,7,0.85)', borderRadius: [0, 0, 3, 3] },
      },
    ],
  }, true)
}

function handleResize() {
  chart?.resize()
}

onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})

watch(period, () => nextTick(renderChart))
watch(viewMode, (m) => { if (m === 'chart') nextTick(renderChart) })
watch(() => i18n.locale, () => nextTick(renderChart))
</script>

<style scoped>
.tab-profit {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.period-row {
  display: flex;
  gap: 6px;
}

.time-pill {
  padding: 6px 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.time-pill.active {
  background: var(--color-primary);
  color: #000;
  border-color: var(--color-primary);
  font-weight: 600;
}

.time-pill:hover:not(.active) {
  border-color: var(--border-hover);
  color: var(--color-text);
}

/* Stats Cards */
.profit-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.profit-stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: center;
}

.profit-stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.profit-stat-val {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
}

.profit-stat-val .unit {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-tertiary);
  margin-left: 2px;
}

.profit-stat-change {
  font-size: 12px;
  font-weight: 600;
}
.profit-stat-change.positive { color: #00ff88; }
.profit-stat-change.negative { color: #ff6b6b; }

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 4px;
}

.view-tab {
  padding: 8px 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-tab.active {
  background: var(--color-primary);
  color: #000;
  border-color: var(--color-primary);
  font-weight: 600;
}

.chart-container { width: 100%; }

/* Table */
.profit-table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
}

.profit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.profit-table thead { background: var(--bg-elevated); }

.profit-table th {
  padding: 12px 14px;
  text-align: left;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;
}

.profit-table td {
  padding: 10px 14px;
  color: var(--color-text);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  white-space: nowrap;
}

.profit-table tbody tr:hover { background: rgba(255,255,255,0.02); }

@media (max-width: 1024px) {
  .profit-stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .profit-stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
