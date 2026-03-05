<template>
  <div class="dashboard-page">
    <!-- === 指标卡片 === -->
    <section class="metric-cards">
      <div class="metric-card">
        <div class="metric-icon icon-capacity">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="6" width="18" height="12" rx="2" />
            <line x1="23" y1="10" x2="23" y2="14" />
            <line x1="6" y1="10" x2="6" y2="14" />
            <line x1="10" y1="10" x2="10" y2="14" />
            <line x1="14" y1="10" x2="14" y2="14" />
          </svg>
        </div>
        <div class="metric-body">
          <span class="metric-label">{{ i18n.t('totalCapacity') }}</span>
          <span class="metric-value">{{ summary.totalCapacity }}<small>MW</small></span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon icon-power">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div class="metric-body">
          <span class="metric-label">{{ i18n.t('realTimePower') }}</span>
          <span class="metric-value" :class="summary.totalPower >= 0 ? 'val-positive' : 'val-negative'">
            {{ summary.totalPower > 0 ? '+' : '' }}{{ summary.totalPower }}<small>MW</small>
          </span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon icon-revenue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div class="metric-body">
          <span class="metric-label">{{ i18n.t('todayRevenue') }}</span>
          <span class="metric-value">${{ formatNumber(summary.todayRevenue) }}<small>AUD</small></span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon icon-price">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div class="metric-body">
          <span class="metric-label">{{ i18n.t('avgSpotPrice') }}</span>
          <span class="metric-value">{{ summary.avgSpotPrice }}<small>$/MWh</small></span>
        </div>
      </div>

      <div class="metric-card" :class="{ 'has-alert': summary.alertCount > 0 }">
        <div class="metric-icon icon-alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div class="metric-body">
          <span class="metric-label">{{ i18n.t('activeAlerts') }}</span>
          <span class="metric-value val-alert">{{ summary.alertCount }}</span>
        </div>
      </div>
    </section>

    <!-- === 电站列表 === -->
    <section class="station-section">
      <h2 class="section-title">
        {{ i18n.t('stationOverview') }}
        <span class="station-count">{{ summary.onlineCount }}/{{ summary.stationCount }} {{ i18n.t('online') }}</span>
      </h2>
      <div class="station-grid">
        <div
          v-for="station in stations"
          :key="station.id"
          class="station-card"
          :class="{ offline: station.commStatus === 'offline' }"
        >
          <div class="station-header">
            <span class="station-name">{{ station.name }}</span>
            <span class="comm-badge" :class="station.commStatus">
              {{ station.commStatus === 'online' ? i18n.t('online') : i18n.t('offline') }}
            </span>
          </div>

          <div class="station-meta">
            <span class="region-tag">{{ station.region }}</span>
            <span class="brand-tag">{{ station.brand }}</span>
            <span class="run-badge" :class="station.runStatus">
              {{ runStatusLabel(station.runStatus) }}
            </span>
          </div>

          <div class="station-metrics">
            <div class="soc-bar-wrapper">
              <div class="soc-label">
                <span>{{ i18n.t('soc') }}</span>
                <span :class="socClass(station.soc)">{{ station.soc }}%</span>
              </div>
              <div class="soc-track">
                <div
                  class="soc-fill"
                  :class="socClass(station.soc)"
                  :style="{ width: station.soc + '%' }"
                />
              </div>
            </div>

            <div class="kv-row">
              <span class="kv-label">{{ i18n.t('power') }}</span>
              <span class="kv-value" :class="powerClass(station.power)">
                {{ station.power > 0 ? '+' : '' }}{{ station.power }} MW
              </span>
            </div>

            <div class="kv-row">
              <span class="kv-label">{{ i18n.t('capacity') }}</span>
              <span class="kv-value">{{ station.capacity }} MW</span>
            </div>

            <div class="kv-row">
              <span class="kv-label">{{ i18n.t('todayProfit') }}</span>
              <span class="kv-value" :class="station.todayProfit >= 0 ? 'val-positive' : 'val-negative'">
                ${{ formatNumber(station.todayProfit) }}
              </span>
            </div>
          </div>

          <div class="station-mode">
            {{ i18n.tRunMode(station.runMode) }}
          </div>
        </div>
      </div>
    </section>

    <!-- === 图表预留 === -->
    <div class="charts-placeholder">{{ i18n.t('chartsPlaceholder') }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useI18nStore } from '@/stores/i18nStore'
import { getDashboardSummary, getStationList } from '@/api/dashboard'
import type { Station, DashboardSummary } from '@/mock/dashboard'

const authStore = useAuthStore()
const i18n = useI18nStore()

const summary = ref<DashboardSummary>({
  totalCapacity: 0,
  totalPower: 0,
  todayRevenue: 0,
  avgSpotPrice: 0,
  alertCount: 0,
  stationCount: 0,
  onlineCount: 0,
})

const stations = ref<Station[]>([])

onMounted(async () => {
  try {
    const role = authStore.user.role === 'operator' ? 'operator' : 'owner'

    const [summaryRes, stationsRes] = await Promise.all([
      getDashboardSummary(role),
      getStationList(role),
    ])

    if (summaryRes.code === 0) summary.value = summaryRes.data
    if (stationsRes.code === 0) stations.value = stationsRes.data
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})

// === 格式化工具 ===

function formatNumber(n: number): string {
  return n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function runStatusLabel(status: string): string {
  const map: Record<string, string> = {
    charging: 'charging',
    discharging: 'discharging',
    idle: 'idle',
  }
  const key = map[status]
  return key ? i18n.t(key) : status
}

function socClass(soc: number): string {
  if (soc >= 60) return 'soc-high'
  if (soc >= 30) return 'soc-mid'
  return 'soc-low'
}

function powerClass(power: number): string {
  if (power > 0) return 'val-charging'
  if (power < 0) return 'val-discharging'
  return ''
}
</script>

<style scoped>
/* === 页面容器 === */
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: pageFadeIn 0.3s ease-out;
}

/* === 指标卡片网格 === */
.metric-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.metric-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-elevated);
}

.metric-card.has-alert {
  border-color: rgba(255, 71, 87, 0.35);
}

/* 图标容器 */
.metric-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon svg {
  width: 22px;
  height: 22px;
}

.icon-capacity {
  background: rgba(0, 255, 136, 0.12);
  color: var(--color-primary);
}

.icon-power {
  background: rgba(0, 122, 255, 0.12);
  color: #007aff;
}

.icon-revenue {
  background: rgba(255, 193, 7, 0.12);
  color: #ffc107;
}

.icon-price {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
}

.icon-alert {
  background: rgba(255, 71, 87, 0.12);
  color: #ff4757;
}

/* 指标文字 */
.metric-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.metric-label {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
  white-space: nowrap;
}

.metric-value small {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-tertiary);
  margin-left: 4px;
}

.val-positive { color: var(--color-primary); }
.val-negative { color: #ff4757; }
.val-alert    { color: #ff4757; }
.val-charging { color: #007aff; }
.val-discharging { color: #ff9500; }

/* === 电站区域 === */
.station-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.station-count {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-tertiary);
  padding: 2px 10px;
  background: rgba(0, 255, 136, 0.08);
  border-radius: var(--radius-full);
}

/* 电站卡片网格 */
.station-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.station-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.station-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-elevated);
  transform: translateY(-2px);
}

.station-card.offline {
  opacity: 0.6;
  border-color: rgba(255, 71, 87, 0.2);
}

/* 卡片头部 */
.station-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.station-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 通讯状态 */
.comm-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.comm-badge.online {
  background: rgba(0, 255, 136, 0.15);
  color: var(--color-primary);
}

.comm-badge.offline {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
}

/* 元信息行 */
.station-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.region-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
}

.brand-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-tertiary);
}

/* 运行状态 */
.run-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  margin-left: auto;
}

.run-badge.charging {
  background: rgba(0, 122, 255, 0.15);
  color: #007aff;
}

.run-badge.discharging {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
}

.run-badge.idle {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-tertiary);
}

/* === SOC 进度条 === */
.soc-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.soc-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-tertiary);
}

.soc-label .soc-high { color: var(--color-primary); }
.soc-label .soc-mid  { color: #ffa502; }
.soc-label .soc-low  { color: #ff4757; }

.soc-track {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.soc-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.soc-fill.soc-high { background: var(--color-primary); }
.soc-fill.soc-mid  { background: #ffa502; }
.soc-fill.soc-low  { background: #ff4757; }

/* KV 行 */
.kv-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.kv-label {
  color: var(--text-tertiary);
}

.kv-value {
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: 500;
}

/* 运行模式 */
.station-mode {
  font-size: 12px;
  color: var(--text-tertiary);
  padding-top: 8px;
  border-top: 1px solid var(--border-default);
}

/* === 图表预留 === */
.charts-placeholder {
  padding: 48px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
  background: var(--bg-card);
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-md);
}

/* === 响应式 === */
@media (max-width: 1200px) {
  .metric-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .metric-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .station-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .metric-cards {
    grid-template-columns: 1fr;
  }
}
</style>
