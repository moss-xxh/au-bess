<template>
  <div class="reports-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ i18n.t('rptTitle') }}</h1>
        <p class="page-subtitle">{{ i18n.t('rptSubtitle') }}</p>
      </div>
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
    </div>

    <!-- Control Bar -->
    <div class="control-bar">
      <select v-model="selectedStation" class="station-select">
        <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <div class="period-pills">
        <button
          v-for="p in periods"
          :key="p.key"
          :class="['time-pill', { active: currentPeriod === p.key }]"
          @click="currentPeriod = p.key"
        >{{ i18n.t(p.label) }}</button>
      </div>
      <div class="date-display">
        <span class="date-icon">📅</span>
        <span>{{ todayFormatted }}</span>
      </div>
      <button class="refresh-btn" @click="refreshData">🔄 {{ i18n.t('rptRefresh') }}</button>
    </div>

    <!-- Stats Section Header -->
    <div class="stats-section-header">
      <span class="stats-section-title">{{ i18n.t('rptDataOverview') }}</span>
      <span class="stats-context-badge">{{ currentStationName }} · {{ todayFormatted }}</span>
    </div>

    <!-- Metric Cards -->
    <div class="stats-grid">
      <div v-for="card in metricCards" :key="card.labelKey" class="stat-card">
        <div class="stat-label">{{ i18n.t(card.labelKey) }}</div>
        <div class="stat-value">
          <template v-if="card.prefix">{{ card.prefix }}</template>{{ card.displayValue }}<span class="stat-unit">{{ card.unit }}</span>
        </div>
        <div :class="['stat-change', { negative: !card.isPositive }]">
          {{ i18n.t(compareLabel) }} {{ card.isPositive ? '↑' : '↓' }} {{ card.changeDisplay }}
        </div>
      </div>
    </div>

    <!-- Chart Section Title -->
    <div class="chart-section-title">
      {{ currentStationName }} — {{ i18n.t('rptChartCharge') }} &amp; {{ i18n.t('rptChartCumProfit') }}
    </div>

    <!-- Chart View -->
    <div v-show="viewMode === 'chart'" class="chart-wrap">
      <div ref="chartEl" class="chart-container"></div>
    </div>

    <!-- Table View -->
    <div v-show="viewMode === 'table'" class="table-section">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ i18n.t('sdPeriodLabel') }}</th>
              <th>{{ i18n.t('rptChargeMWh') }}</th>
              <th>{{ i18n.t('rptDischargeMWh') }}</th>
              <th>{{ i18n.t('sdAvgBuyPrice') }} ($/MWh)</th>
              <th>{{ i18n.t('sdAvgSellPrice') }} ($/MWh)</th>
              <th>{{ i18n.t('sdChargeCost') }} ($)</th>
              <th>{{ i18n.t('sdDischargeRev') }} ($)</th>
              <th>{{ i18n.t('sdNetProfitLabel') }} ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedRows" :key="row.time">
              <td class="cell-period">{{ row.time }}</td>
              <td class="cell-charge">{{ row.chargeMWh }}</td>
              <td class="cell-discharge">{{ row.dischargeMWh }}</td>
              <td>${{ row.avgBuyPrice }}</td>
              <td>${{ row.avgSellPrice }}</td>
              <td>${{ row.chargeCost }}</td>
              <td>${{ row.dischargeRevenue }}</td>
              <td :class="row.netProfit >= 0 ? 'cell-profit-pos' : 'cell-profit-neg'">
                ${{ row.netProfit }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="tablePage <= 1" @click="tablePage--">‹</button>
        <span class="page-info">{{ tablePage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="tablePage >= totalPages" @click="tablePage++">›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useI18nStore } from '@/stores/i18nStore'
import { getReportsData, getReportStations } from '@/mock/reports'
import type { ReportPeriod } from '@/mock/reports'

const i18n = useI18nStore()

// --- State ---
const stations = getReportStations()
const selectedStation = ref(stations[0]?.id || '')
const currentPeriod = ref<ReportPeriod>('day')
const viewMode = ref<'chart' | 'table'>('chart')
const tablePage = ref(1)
const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
const refreshKey = ref(0)

const periods = [
  { key: 'day' as ReportPeriod, label: 'day' },
  { key: 'month' as ReportPeriod, label: 'month' },
  { key: 'year' as ReportPeriod, label: 'year' },
  { key: 'cumulative' as ReportPeriod, label: 'cumulative' },
]

const PAGE_SIZE = 15

// --- Computed ---
const todayFormatted = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const currentStationName = computed(() => {
  return stations.find(s => s.id === selectedStation.value)?.name || ''
})

const reportData = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  refreshKey.value // dependency for refresh
  return getReportsData(selectedStation.value, currentPeriod.value)
})

const compareLabel = computed(() => {
  const map: Record<string, string> = { day: 'vsYesterday', month: 'vsLastMonth', year: 'vsLastYear', cumulative: 'vsLastYear' }
  return map[currentPeriod.value] || 'vsYesterday'
})

const metricCards = computed(() => {
  const m = reportData.value.metrics
  return [
    {
      labelKey: 'rptChargeAmount',
      displayValue: m.charge.value,
      unit: ' MWh',
      prefix: '',
      isPositive: m.charge.isPositive,
      changeDisplay: `${m.charge.changeValue} ${m.charge.changeUnit}`,
    },
    {
      labelKey: 'rptDischargeAmount',
      displayValue: m.discharge.value,
      unit: ' MWh',
      prefix: '',
      isPositive: m.discharge.isPositive,
      changeDisplay: `${m.discharge.changeValue} ${m.discharge.changeUnit}`,
    },
    {
      labelKey: 'rptAvgBuyPrice',
      displayValue: m.avgBuyPrice.value,
      unit: '/MWh',
      prefix: '$',
      isPositive: m.avgBuyPrice.isPositive,
      changeDisplay: `$${m.avgBuyPrice.changeValue}`,
    },
    {
      labelKey: 'rptAvgSellPrice',
      displayValue: m.avgSellPrice.value,
      unit: '/MWh',
      prefix: '$',
      isPositive: m.avgSellPrice.isPositive,
      changeDisplay: `$${m.avgSellPrice.changeValue}`,
    },
    {
      labelKey: 'netProfit',
      displayValue: '$' + m.netProfit.value.toLocaleString(),
      unit: '',
      prefix: '',
      isPositive: m.netProfit.isPositive,
      changeDisplay: `$${m.netProfit.changeValue}`,
    },
  ]
})

const paginatedRows = computed(() => {
  const start = (tablePage.value - 1) * PAGE_SIZE
  return reportData.value.timeSeries.slice(start, start + PAGE_SIZE)
})

const totalPages = computed(() => Math.ceil(reportData.value.timeSeries.length / PAGE_SIZE))

// --- Chart ---
function renderChart() {
  if (!chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value)
  const ts = reportData.value.timeSeries
  const isEn = i18n.locale === 'en'

  const chargeLabel = isEn ? 'Charge (MWh)' : '充电量 (MWh)'
  const dischargeLabel = isEn ? 'Discharge (MWh)' : '放电量 (MWh)'
  const cumProfitLabel = isEn ? 'Cumulative Profit ($)' : '累计收益 ($)'

  chart.setOption({
    backgroundColor: 'transparent',
    grid: { left: 65, right: 65, top: 50, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.9)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#fff', fontSize: 12 },
    },
    legend: {
      top: 8, left: 'center',
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
      data: [chargeLabel, dischargeLabel, cumProfitLabel],
    },
    xAxis: {
      type: 'category',
      data: ts.map(p => p.time),
      axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'MWh',
        nameTextStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
        axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
        axisLine: { show: false },
      },
      {
        type: 'value',
        name: '$',
        nameTextStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
        axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, formatter: '${value}' },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: chargeLabel,
        type: 'bar',
        yAxisIndex: 0,
        barMaxWidth: 28,
        data: ts.map(p => p.chargeMWh),
        itemStyle: { color: 'rgba(59,130,246,0.85)', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: dischargeLabel,
        type: 'bar',
        yAxisIndex: 0,
        barMaxWidth: 28,
        data: ts.map(p => -p.dischargeMWh),
        itemStyle: { color: 'rgba(0,255,136,0.75)', borderRadius: [0, 0, 3, 3] },
      },
      {
        name: cumProfitLabel,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#ffc107', width: 2 },
        itemStyle: { color: '#ffc107' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,193,7,0.3)' },
            { offset: 1, color: 'rgba(255,193,7,0.02)' },
          ]),
        },
        data: ts.map(p => p.cumulativeProfit),
      },
    ],
  }, true)
}

function handleResize() {
  chart?.resize()
}

function refreshData() {
  refreshKey.value++
}

// --- Lifecycle ---
onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})

// --- Watchers ---
watch([selectedStation, currentPeriod, refreshKey], () => {
  tablePage.value = 1
  nextTick(renderChart)
})
watch(viewMode, (m) => { if (m === 'chart') nextTick(renderChart) })
watch(() => i18n.locale, () => nextTick(renderChart))
</script>

<style scoped>
.reports-page {
  padding: 0;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.page-title {
  font-size: 48px;
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -2px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 6px 0 0;
}

/* View Toggle */
.view-toggle {
  display: inline-flex;
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.view-tab {
  padding: 10px 24px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-tab.active {
  background: var(--color-primary);
  color: #000;
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0,255,136,0.3);
  font-weight: 600;
}

.view-tab:hover:not(.active) {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
}

/* Control Bar */
.control-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px;
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border-default);
  margin-bottom: 20px;
}

.station-select {
  background: transparent;
  border: 1px solid var(--border-default);
  color: var(--color-text);
  padding: 8px 32px 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  min-width: 200px;
  max-width: 280px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.station-select option {
  background: #1a1a1a;
  color: #fff;
}

.period-pills {
  display: flex;
  gap: 4px;
}

.time-pill {
  padding: 8px 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
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
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  font-size: 14px;
  color: var(--color-text);
  white-space: nowrap;
}

.date-icon {
  font-size: 14px;
}

.refresh-btn {
  background: transparent;
  border: 1px solid var(--border-default);
  color: var(--color-text);
  padding: 8px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.refresh-btn:hover {
  background: rgba(255,255,255,0.05);
}

/* Stats Section Header */
.stats-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.stats-section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.stats-context-badge {
  padding: 3px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  font-size: 12px;
  color: rgba(255,255,255,0.45);
}

/* Metric Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.stat-unit {
  font-size: 16px;
  font-weight: 400;
  color: var(--text-secondary);
  margin-left: 4px;
}

.stat-change {
  font-size: 13px;
  color: var(--color-success);
}

.stat-change.negative {
  color: var(--color-danger);
}

/* Chart Section Title */
.chart-section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 16px;
}

/* Chart */
.chart-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.chart-container {
  width: 100%;
  height: calc(100vh - 540px);
  min-height: 380px;
}

/* Table */
.table-section {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead {
  background: var(--bg-elevated);
}

.data-table th {
  padding: 12px 14px;
  text-align: left;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;
}

.data-table td {
  padding: 10px 14px;
  color: var(--color-text);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: rgba(255,255,255,0.02);
}

.cell-period { font-weight: 500; }
.cell-charge { color: #60a5fa; }
.cell-discharge { color: #00ff88; }
.cell-profit-pos { color: #00ff88; font-weight: 600; }
.cell-profit-neg { color: #ff6b6b; font-weight: 600; }

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--color-text);
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .page-title { font-size: 28px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .control-bar { flex-wrap: wrap; }
  .stat-value { font-size: 28px; }
}
</style>
