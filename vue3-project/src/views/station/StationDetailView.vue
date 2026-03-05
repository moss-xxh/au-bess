<template>
  <div class="station-detail">
    <!-- Header -->
    <div class="detail-header">
      <button class="back-btn" @click="goBack">← {{ i18n.t('sdBackToStations') }}</button>
      <div class="header-info">
        <h1 class="station-name">{{ station?.name || 'Unknown' }}</h1>
        <div class="station-meta" v-if="station">
          {{ station.id }} · {{ station.region }}, Australia · {{ station.capacity }} MW
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ i18n.t(tab.label) }}
      </button>
    </div>

    <!-- Tab Content (v-show to avoid ECharts blank) -->
    <div class="tab-content" v-if="station">
      <div v-show="activeTab === 'overview'">
        <TabOverview :station="station" />
      </div>
      <div v-show="activeTab === 'runningData'">
        <TabRunningData :station="station" />
      </div>
      <div v-show="activeTab === 'historical'">
        <TabHistorical :station="station" />
      </div>
      <div v-show="activeTab === 'dispatch'">
        <TabDispatch :station="station" />
      </div>
      <div v-show="activeTab === 'profit'">
        <TabProfit :station="station" />
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="not-found">
      <div class="not-found-icon">⚠️</div>
      <div class="not-found-title">Station Not Found</div>
      <button class="back-btn" @click="goBack">← {{ i18n.t('sdBackToStations') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18nStore'
import { allStations } from '@/mock/dashboard'
import TabOverview from './TabOverview.vue'
import TabRunningData from './TabRunningData.vue'
import TabHistorical from './TabHistorical.vue'
import TabDispatch from './TabDispatch.vue'
import TabProfit from './TabProfit.vue'

const route = useRoute()
const router = useRouter()
const i18n = useI18nStore()

const activeTab = ref('overview')

const tabs = [
  { key: 'overview', label: 'sdOverview' },
  { key: 'runningData', label: 'sdRunningData' },
  { key: 'historical', label: 'sdHistoricalData' },
  { key: 'dispatch', label: 'sdDispatchRecords' },
  { key: 'profit', label: 'sdProfit' },
]

const station = computed(() => {
  const id = route.params.id as string
  return allStations.find(s => s.id === id) || null
})

function goBack() {
  router.push('/stations')
}

// When tab changes, trigger resize for ECharts in newly visible tab
watch(activeTab, () => {
  nextTick(() => {
    window.dispatchEvent(new Event('resize'))
  })
})
</script>

<style scoped>
.station-detail {
  padding: 24px;
  min-height: 100%;
}

/* Header */
.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.back-btn {
  padding: 10px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
}

.header-info {
  flex: 1;
}

.station-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 4px 0;
}

.station-meta {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Tab Navigation */
.tab-nav {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-default);
  padding-bottom: 0;
}

.tab-btn {
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--color-text);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 80px 20px;
}

.not-found-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.not-found-title {
  font-size: 20px;
  color: var(--color-text);
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .station-detail {
    padding: 16px;
  }
  .detail-header {
    flex-direction: column;
    gap: 12px;
  }
  .station-name {
    font-size: 22px;
  }
  .tab-nav {
    overflow-x: auto;
  }
  .tab-btn {
    padding: 10px 14px;
    font-size: 13px;
  }
}
</style>
