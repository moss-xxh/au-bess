<template>
  <div class="map-page">
    <div class="map-header">
      <h2 class="map-title">{{ i18n.t('stationMap') }}</h2>
      <div class="map-stats">
        <span class="stat-item">
          <span class="stat-dot dot-online"></span>
          {{ i18n.t('online') }}: {{ onlineCount }}
        </span>
        <span class="stat-item">
          <span class="stat-dot dot-maintenance"></span>
          {{ i18n.t('maintenance') }}: {{ maintenanceCount }}
        </span>
        <span class="stat-item">
          <span class="stat-dot dot-offline"></span>
          {{ i18n.t('offline') }}: {{ offlineCount }}
        </span>
      </div>
    </div>
    <div ref="chartRef" class="map-chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, shallowRef } from 'vue'
import * as echarts from 'echarts'
import { useI18nStore } from '@/stores/i18nStore'

const i18n = useI18nStore()
const chartRef = ref<HTMLElement | null>(null)
const chart = shallowRef<echarts.ECharts | null>(null)

// === State data ===
interface StateInfo {
  name: string
  center: [number, number] // [lng, lat]
  color: string
  radius: number
  deviceCount: number
}

const australianStates: StateInfo[] = [
  { name: 'NSW', center: [147, -32], color: '#00ff88', radius: 25, deviceCount: 120 },
  { name: 'VIC', center: [144, -37], color: '#00aaff', radius: 20, deviceCount: 100 },
  { name: 'QLD', center: [145, -22], color: '#8A4AFF', radius: 28, deviceCount: 90 },
  { name: 'WA', center: [122, -26], color: '#ffaa00', radius: 30, deviceCount: 70 },
  { name: 'SA', center: [135, -30], color: '#9c27b0', radius: 22, deviceCount: 60 },
  { name: 'TAS', center: [147, -42], color: '#4caf50', radius: 12, deviceCount: 30 },
  { name: 'NT', center: [133, -19], color: '#2196f3', radius: 20, deviceCount: 20 },
  { name: 'ACT', center: [149, -35.3], color: '#ff9800', radius: 8, deviceCount: 10 },
]

// Generate random device scatter points around each state center
function generateDevicePoints(state: StateInfo): Array<{ value: [number, number]; state: string }> {
  const points: Array<{ value: [number, number]; state: string }> = []
  const count = Math.floor(state.deviceCount / 4) // ~25% shown as scatter dots
  for (let i = 0; i < count; i++) {
    const lngOffset = (Math.random() - 0.5) * 8
    const latOffset = (Math.random() - 0.5) * 6
    points.push({
      value: [state.center[0] + lngOffset, state.center[1] + latOffset],
      state: state.name,
    })
  }
  return points
}

// Stats
const totalDevices = australianStates.reduce((sum, s) => sum + s.deviceCount, 0)
const onlineCount = computed(() => Math.floor(totalDevices * 0.78))
const maintenanceCount = computed(() => Math.floor(totalDevices * 0.12))
const offlineCount = computed(() => totalDevices - onlineCount.value - maintenanceCount.value)

// === Build ECharts option ===
function buildOption(): echarts.EChartsOption {
  // State center big circles
  const stateCenters = australianStates.map((s) => ({
    value: s.center,
    name: s.name,
    symbolSize: s.radius * 2,
    itemStyle: {
      color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
        { offset: 0, color: s.color + 'cc' },
        { offset: 0.7, color: s.color + '66' },
        { offset: 1, color: s.color + '11' },
      ]),
      borderColor: s.color,
      borderWidth: 1.5,
    },
    label: {
      show: true,
      formatter: s.name,
      color: '#fff',
      fontSize: 13,
      fontWeight: 600 as const,
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowBlur: 4,
    },
    _deviceCount: s.deviceCount,
    _color: s.color,
  }))

  // Device scatter points for each state
  const allDevicePoints: Array<{ value: [number, number]; state: string; color: string }> = []
  australianStates.forEach((s) => {
    generateDevicePoints(s).forEach((p) => {
      allDevicePoints.push({ ...p, color: s.color })
    })
  })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 13,
      },
      formatter: (params: any) => {
        if (params.seriesIndex === 0) {
          // State center tooltip
          const d = params.data
          const color = d._color || '#fff'
          return `
            <div style="padding: 4px 0;">
              <div style="font-size: 16px; font-weight: 700; color: ${color}; margin-bottom: 8px;">${d.name}</div>
              <div style="display: flex; justify-content: space-between; gap: 24px; font-size: 13px;">
                <span style="color: rgba(255,255,255,0.5);">${i18n.t('deviceCount')}</span>
                <span style="font-weight: 600;">${d._deviceCount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 24px; font-size: 13px; margin-top: 2px;">
                <span style="color: rgba(255,255,255,0.5);">${i18n.t('status')}</span>
                <span style="color: #00ff88;">● ${i18n.t('online')}</span>
              </div>
            </div>
          `
        }
        // Device point tooltip
        return `<span style="color: rgba(255,255,255,0.6);">${params.data.state} — Device</span>`
      },
    },
    xAxis: {
      type: 'value',
      min: 110,
      max: 160,
      show: false,
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: -45,
      max: -10,
      show: false,
      splitLine: { show: false },
      inverse: false,
    },
    grid: {
      left: 20,
      right: 20,
      top: 20,
      bottom: 20,
      containLabel: false,
    },
    series: [
      // Series 0: State centers (big glowing circles)
      {
        type: 'scatter',
        coordinateSystem: 'cartesian2d',
        data: stateCenters,
        z: 10,
        animationDuration: 1200,
        animationEasing: 'elasticOut',
      },
      // Series 1: Device scatter points (small dots)
      {
        type: 'scatter',
        coordinateSystem: 'cartesian2d',
        data: allDevicePoints.map((p) => ({
          value: p.value,
          state: p.state,
          itemStyle: {
            color: p.color + '55',
            borderColor: p.color + '88',
            borderWidth: 0.5,
          },
        })),
        symbolSize: 4,
        z: 5,
        silent: false,
        animationDuration: 800,
        animationDelay: (idx: number) => idx * 5,
      },
      // Series 2: Ripple effect on state centers
      {
        type: 'effectScatter',
        coordinateSystem: 'cartesian2d',
        data: australianStates.map((s) => ({
          value: s.center,
          symbolSize: s.radius * 1.2,
          itemStyle: {
            color: s.color + '44',
          },
        })),
        rippleEffect: {
          brushType: 'stroke',
          scale: 3,
          period: 4,
        },
        z: 8,
        silent: true,
      },
    ],
  }
}

// === Lifecycle ===
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    if (!chartRef.value) return
    chart.value = echarts.init(chartRef.value)
    chart.value.setOption(buildOption())

    // Responsive resize
    resizeObserver = new ResizeObserver(() => {
      chart.value?.resize()
    })
    resizeObserver.observe(chartRef.value)
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart.value?.dispose()
  chart.value = null
})
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px - 48px);
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.map-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.map-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-online {
  background: #00ff88;
  box-shadow: 0 0 6px #00ff8866;
}

.dot-maintenance {
  background: #ffaa00;
  box-shadow: 0 0 6px #ffaa0066;
}

.dot-offline {
  background: #ff4444;
  box-shadow: 0 0 6px #ff444466;
}

.map-chart {
  flex: 1;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  min-height: 400px;
}
</style>
