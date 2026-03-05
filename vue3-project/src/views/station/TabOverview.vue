<template>
  <div class="tab-overview">
    <!-- Top Row: Health Gauge + Station Mode/SOC | Map Placeholder -->
    <div class="top-row">
      <div class="hero-card">
        <div class="hero-body">
          <!-- Left: Gauge -->
          <div class="hero-left">
            <div ref="gaugeEl" class="gauge-chart"></div>
            <div class="system-status" :class="'status-' + overview.systemStatus">
              {{ i18n.t('sdSystemStatus') }}: {{ i18n.t('sdStatus_' + overview.systemStatus) }}
            </div>
          </div>
          <!-- Right: Mode + SOC -->
          <div class="hero-right">
            <div class="hero-metric">
              <div class="metric-label">{{ i18n.t('sdStationMode') }}</div>
              <span class="mode-badge" :class="'mode-' + overview.stationMode">
                {{ overview.stationMode === 'charging' ? '⚡' : overview.stationMode === 'discharging' ? '🔋' : '⏸️' }}
                {{ i18n.t(overview.stationMode) }}
              </span>
            </div>
            <div class="hero-divider"></div>
            <div class="hero-metric">
              <div class="metric-label">{{ i18n.t('sdCurrentSOC') }}</div>
              <div class="soc-value" :style="{ color: socColor }">{{ overview.currentSOC }}%</div>
              <div class="soc-bar">
                <div class="soc-fill" :style="{ width: overview.currentSOC + '%', background: socColor }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Placeholder -->
      <div class="map-placeholder">
        <div class="map-content">
          <div class="map-icon">📍</div>
          <div class="map-name">{{ station.name }}</div>
          <div class="map-region">{{ station.region }}, Australia</div>
        </div>
      </div>
    </div>

    <!-- Status Cards Row -->
    <div class="status-cards">
      <div class="status-card">
        <div class="status-card-icon">📡</div>
        <div class="status-card-label">{{ i18n.t('sdCommunication') }}</div>
        <div class="status-card-value" :style="{ color: overview.communication.status === 'connected' ? '#00ff88' : '#ff4757' }">
          ● {{ i18n.t('sdComm_' + overview.communication.status) }}
        </div>
        <div class="status-card-sub">{{ i18n.locale === 'zh' ? overview.communication.subZh : overview.communication.sub }}</div>
      </div>
      <div class="status-card">
        <div class="status-card-icon">⚙️</div>
        <div class="status-card-label">{{ i18n.t('sdDeviceStatus') }}</div>
        <div class="status-card-value" :style="{ color: overview.deviceStatus.status === 'normal' ? '#00ff88' : '#ff4757' }">
          {{ i18n.t('sdDevice_' + overview.deviceStatus.status) }}
        </div>
        <div class="status-card-sub">{{ i18n.locale === 'zh' ? overview.deviceStatus.subZh : overview.deviceStatus.sub }}</div>
      </div>
      <div class="status-card">
        <div class="status-card-icon">🔋</div>
        <div class="status-card-label">{{ i18n.t('sdBatteryHealth') }}</div>
        <div class="status-card-value" :style="{ color: overview.batteryHealth.status === 'healthy' ? '#00ff88' : '#ffa502' }">
          {{ i18n.t('sdBattery_' + overview.batteryHealth.status) }}
        </div>
        <div class="status-card-sub">SOH {{ overview.batteryHealth.soh }}%</div>
      </div>
      <div class="status-card">
        <div class="status-card-icon">🌡️</div>
        <div class="status-card-label">{{ i18n.t('sdTemperature') }}</div>
        <div class="status-card-value" :style="{ color: overview.temperature.status === 'normal' ? '#00ff88' : '#ffa502' }">
          {{ i18n.t('sdTemp_' + overview.temperature.status) }}
        </div>
        <div class="status-card-sub">{{ overview.temperature.value }} °C</div>
      </div>
      <div class="status-card">
        <div class="status-card-icon">{{ overview.weather.icon }}</div>
        <div class="status-card-label">{{ i18n.t('sdWeather') }}</div>
        <div class="status-card-value" style="color: rgba(255,255,255,0.9)">
          {{ i18n.locale === 'zh' ? overview.weather.conditionZh : overview.weather.condition }}
        </div>
        <div class="status-card-sub">{{ overview.weather.temp }} °C</div>
      </div>
    </div>

    <!-- Device Status Grid -->
    <div class="devices-section">
      <div class="devices-title">{{ i18n.t('sdDeviceStatusTitle') }}</div>
      <div class="devices-grid">
        <div
          v-for="dev in overview.devices"
          :key="dev.name"
          class="device-card"
          :class="{ 'device-fault': dev.status === 'fault' }"
        >
          <div class="device-icon">{{ dev.icon }}</div>
          <div class="device-name">{{ i18n.locale === 'zh' ? dev.nameZh : dev.name }}</div>
          <div class="device-status-wrap">
            <span class="device-dot" :class="dev.status === 'normal' ? 'dot-ok' : 'dot-error'"></span>
            <span class="device-status-text">{{ i18n.t('sdDevice_' + dev.status) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useI18nStore } from '@/stores/i18nStore'
import { getStationOverview } from '@/mock/station-detail'
import type { Station } from '@/mock/dashboard'

const props = defineProps<{ station: Station }>()
const i18n = useI18nStore()

const gaugeEl = ref<HTMLElement>()
let gaugeChart: echarts.ECharts | null = null

const overview = computed(() =>
  getStationOverview(props.station.id, props.station.soc, props.station.power, props.station.commStatus, props.station.runStatus)
)

const socColor = computed(() => {
  const soc = overview.value.currentSOC
  return soc > 60 ? '#00ff88' : soc > 30 ? '#ffd93d' : '#ff6b6b'
})

function renderGauge() {
  if (!gaugeEl.value) return
  if (!gaugeChart) {
    gaugeChart = echarts.init(gaugeEl.value)
  }
  const score = overview.value.healthScore
  const color = overview.value.systemStatus === 'abnormal' ? '#ff6b6b' : overview.value.systemStatus === 'warning' ? '#ffd93d' : '#00ff88'
  gaugeChart.setOption({
    series: [{
      type: 'gauge',
      startAngle: 225,
      endAngle: -45,
      min: 0,
      max: 100,
      radius: '90%',
      progress: { show: true, width: 12, itemStyle: { color } },
      axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(255,255,255,0.07)']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      title: { show: true, offsetCenter: [0, '30%'], fontSize: 11, color: 'rgba(255,255,255,0.5)' },
      detail: {
        valueAnimation: true,
        fontSize: 28,
        fontWeight: 700,
        color,
        offsetCenter: [0, '-5%'],
        formatter: '{value}',
      },
      data: [{ value: Math.round(score), name: 'Health Score' }],
    }],
  })
}

function handleResize() {
  gaugeChart?.resize()
}

onMounted(() => {
  renderGauge()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  gaugeChart?.dispose()
  gaugeChart = null
})

watch(() => props.station.id, () => {
  renderGauge()
})
</script>

<style scoped>
.tab-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Top Row */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.hero-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.hero-body {
  display: flex;
  gap: 24px;
  align-items: center;
}

.hero-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.gauge-chart {
  width: 150px;
  height: 150px;
}

.system-status {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}
.status-excellent { color: #00ff88; }
.status-warning { color: #ffd93d; }
.status-abnormal { color: #ff6b6b; }

.hero-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-divider {
  height: 1px;
  background: var(--border-default);
}

.metric-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.mode-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
}
.mode-charging { background: rgba(0,255,136,0.15); color: #00ff88; }
.mode-discharging { background: rgba(255,165,2,0.15); color: #ffa502; }
.mode-idle { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }

.soc-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.soc-bar {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.soc-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* Map Placeholder */
.map-placeholder {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  position: relative;
  overflow: hidden;
}

.map-placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 50%, rgba(0,255,136,0.05) 0%, transparent 60%);
}

.map-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.map-icon { font-size: 36px; margin-bottom: 12px; }
.map-name { font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
.map-region { font-size: 13px; color: var(--text-secondary); }

/* Status Cards */
.status-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.status-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 18px;
}

.status-card-icon { font-size: 24px; margin-bottom: 8px; }
.status-card-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.status-card-value { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.status-card-sub { font-size: 11px; color: var(--text-tertiary); }

/* Devices */
.devices-section {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.devices-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.device-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.device-card:hover {
  background: rgba(255,255,255,0.04);
}

.device-fault {
  border-color: rgba(255,71,87,0.3);
  background: rgba(255,71,87,0.05);
}

.device-icon { font-size: 20px; }
.device-name { flex: 1; font-size: 13px; color: var(--color-text); font-weight: 500; }

.device-status-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.device-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot-ok { background: #00ff88; box-shadow: 0 0 6px rgba(0,255,136,0.5); }
.dot-error { background: #ff4757; box-shadow: 0 0 6px rgba(255,71,87,0.5); }

.device-status-text {
  font-size: 12px;
  font-weight: 600;
  color: #00ff88;
}

.device-fault .device-status-text { color: #ff4757; }

@media (max-width: 1024px) {
  .top-row { grid-template-columns: 1fr; }
  .status-cards { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .status-cards { grid-template-columns: repeat(2, 1fr); }
  .devices-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-body { flex-direction: column; }
}
</style>
