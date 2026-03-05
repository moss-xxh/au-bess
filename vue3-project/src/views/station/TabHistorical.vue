<template>
  <div class="tab-historical">
    <!-- Header with date -->
    <div class="hist-header">
      <div class="hist-title">{{ i18n.t('sdHistoricalData') }}</div>
      <div class="hist-date">{{ todayStr }}</div>
    </div>

    <!-- SOC & Power Chart -->
    <div class="chart-section">
      <div class="chart-label">{{ i18n.t('sdSocPower') }}</div>
      <div ref="socPowerEl" class="chart-container" style="height: 280px"></div>
    </div>

    <!-- Energy Chart -->
    <div class="chart-section">
      <div class="energy-header">
        <div class="chart-label">{{ i18n.t('sdChargeDischarge') }} (MWh)</div>
        <div class="period-controls">
          <button
            v-for="p in periods"
            :key="p.key"
            :class="['time-pill', { active: energyPeriod === p.key }]"
            @click="energyPeriod = p.key"
          >{{ i18n.t(p.label) }}</button>
          <div class="date-display">{{ todayStr }}</div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="energy-summary">
        <div class="energy-card charge-card">
          <div class="energy-card-label">{{ i18n.t('sdTotalCharge') }}</div>
          <div class="energy-card-value">
            <span class="energy-number charge-color">{{ energyData.totalCharge.toFixed(1) }}</span>
            <span class="energy-unit">MWh</span>
          </div>
        </div>
        <div class="energy-card discharge-card">
          <div class="energy-card-label">{{ i18n.t('sdTotalDischargeLabel') }}</div>
          <div class="energy-card-value">
            <span class="energy-number discharge-color">{{ energyData.totalDischarge.toFixed(1) }}</span>
            <span class="energy-unit">MWh</span>
          </div>
        </div>
      </div>

      <div ref="energyEl" class="chart-container" style="height: 260px"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useI18nStore } from '@/stores/i18nStore'
import { getStationHistorical, getStationEnergyData } from '@/mock/station-detail'
import type { Station } from '@/mock/dashboard'

const props = defineProps<{ station: Station }>()
const i18n = useI18nStore()

const socPowerEl = ref<HTMLElement>()
const energyEl = ref<HTMLElement>()
let socPowerChart: echarts.ECharts | null = null
let energyChart: echarts.ECharts | null = null

const energyPeriod = ref('day')
const periods = [
  { key: 'day', label: 'day' },
  { key: 'month', label: 'month' },
  { key: 'year', label: 'year' },
  { key: 'cumulative', label: 'cumulative' },
]

const todayStr = new Date().toISOString().slice(0, 10)

const historicalData = computed(() => getStationHistorical(props.station.id, props.station.capacity))
const energyData = computed(() => getStationEnergyData(props.station.id, props.station.capacity, energyPeriod.value))

function renderSocPower() {
  if (!socPowerEl.value) return
  if (!socPowerChart) socPowerChart = echarts.init(socPowerEl.value)
  const d = historicalData.value
  const isEn = i18n.locale === 'en'

  socPowerChart.setOption({
    backgroundColor: 'transparent',
    grid: { left: 50, right: 55, top: 36, bottom: 32 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#fff', fontSize: 12 },
    },
    legend: {
      top: 4, left: 'center',
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
      data: ['SOC', isEn ? 'Power(MW)' : '功率(MW)'],
    },
    xAxis: {
      type: 'category', data: d.labels, boundaryGap: false,
      axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: [
      {
        type: 'value', name: 'SOC %', min: 0, max: 100,
        axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
        axisLine: { show: false },
      },
      {
        type: 'value', name: isEn ? 'MW' : '功率MW',
        axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: 'SOC', type: 'line', smooth: true, showSymbol: false, yAxisIndex: 0,
        data: d.soc,
        lineStyle: { color: '#00ff88', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(0,255,136,0.25)' }, { offset: 1, color: 'rgba(0,255,136,0.02)' }],
          },
        },
      },
      {
        name: isEn ? 'Power(MW)' : '功率(MW)', type: 'line', smooth: true, showSymbol: false, yAxisIndex: 1,
        data: d.power,
        lineStyle: { color: '#ffc107', width: 2, type: 'dashed' },
      },
    ],
  }, true)
}

function renderEnergy() {
  if (!energyEl.value) return
  if (!energyChart) energyChart = echarts.init(energyEl.value)
  const d = energyData.value
  const isEn = i18n.locale === 'en'

  energyChart.setOption({
    backgroundColor: 'transparent',
    grid: { left: 50, right: 16, top: 36, bottom: 32 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params: any) => params[0].axisValue + '<br>' + params.map((p: any) => `${p.marker} ${p.seriesName}: ${Math.abs(p.value).toFixed(1)} MWh`).join('<br>'),
    },
    legend: {
      top: 4, left: 'center',
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
  socPowerChart?.resize()
  energyChart?.resize()
}

onMounted(() => {
  renderSocPower()
  renderEnergy()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  socPowerChart?.dispose()
  energyChart?.dispose()
  socPowerChart = null
  energyChart = null
})

watch(energyPeriod, () => { nextTick(() => renderEnergy()) })
watch(() => i18n.locale, () => {
  nextTick(() => { renderSocPower(); renderEnergy() })
})
</script>

<style scoped>
.tab-historical {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hist-title { font-size: 16px; font-weight: 600; color: var(--color-text); }
.hist-date {
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-text);
}

.chart-section {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.chart-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.chart-container { width: 100%; }

.energy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.period-controls {
  display: flex;
  align-items: center;
  gap: 4px;
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

.date-display {
  padding: 6px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--color-text);
}

.energy-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.energy-card {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius-md);
}

.charge-card {
  background: rgba(59,130,246,0.08);
  border: 1px solid rgba(59,130,246,0.2);
}

.discharge-card {
  background: rgba(255,193,7,0.08);
  border: 1px solid rgba(255,193,7,0.2);
}

.energy-card-label {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.energy-card-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.energy-number { font-size: 22px; font-weight: 700; }
.charge-color { color: rgba(99,179,237,0.95); }
.discharge-color { color: rgba(255,193,7,0.95); }
.energy-unit { font-size: 11px; color: var(--text-tertiary); }
</style>
