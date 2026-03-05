<template>
  <div class="station-page">
    <!-- Header -->
    <div class="station-header-bar">
      <h1 class="page-title">{{ i18n.t('stations') }}</h1>
      <div class="view-toggle">
        <button
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          📋 {{ i18n.t('table') }}
        </button>
        <button
          :class="{ active: viewMode === 'card' }"
          @click="viewMode = 'card'"
        >
          🗂️ {{ i18n.t('card') }}
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <input
        v-model="searchQuery"
        :placeholder="i18n.t('searchStation')"
        class="search-input"
        @keyup.enter="applyFilter"
      />
      <select v-model="regionFilter" class="filter-select">
        <option value="">{{ i18n.t('allRegions') }}</option>
        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
      </select>
      <select v-model="statusFilter" class="filter-select">
        <option value="">{{ i18n.t('allStatus') }}</option>
        <option value="online">{{ i18n.t('online') }}</option>
        <option value="offline">{{ i18n.t('offline') }}</option>
      </select>
      <button class="btn-search" @click="applyFilter">
        🔍 {{ i18n.t('search') }}
      </button>
      <button class="btn-reset" @click="resetFilter">
        🔄 {{ i18n.t('reset') }}
      </button>
    </div>

    <!-- Card View -->
    <div v-if="viewMode === 'card'" class="station-grid">
      <div
        v-for="station in paginatedStations"
        :key="station.id"
        class="station-card"
      >
        <!-- Card Header: 站名+容量 | 状态 -->
        <div class="card-header">
          <div>
            <div class="station-name">{{ station.name }}</div>
            <div class="station-capacity">{{ station.capacity }} MW</div>
          </div>
          <span
            class="status-badge"
            :class="'status-' + station.commStatus"
          >
            ● {{ station.commStatus === 'online' ? i18n.t('online') : i18n.t('offline') }}
          </span>
        </div>

        <!-- Energy Flow: BESS → Power → Grid -->
        <div class="energy-flow">
          <div class="flow-node bess-node">
            <div class="flow-icon">🔋</div>
            <div class="flow-label">BESS</div>
            <div class="flow-value">{{ station.soc }}%</div>
          </div>
          <div class="flow-line">
            <div class="flow-dots" :class="'dots-' + station.runStatus"></div>
            <div class="flow-power">{{ Math.abs(station.power).toFixed(1) }} MW</div>
          </div>
          <div class="flow-node grid-node">
            <div class="flow-icon">⚡</div>
            <div class="flow-label">Grid</div>
            <div class="flow-value">—</div>
          </div>
        </div>

        <!-- Footer: 位置 + Detail -->
        <div class="card-footer">
          <span class="location">📍 {{ station.region }}, Australia</span>
          <button class="btn-detail" @click="goDetail(station.id)">
            Detail
          </button>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="station-table-wrap">
      <table class="station-table">
        <thead>
          <tr>
            <th class="th-check"><input type="checkbox" /></th>
            <th class="sortable" @click="toggleSort('name')">
              {{ i18n.t('stationName') }}
              <span class="sort-icon">↕</span>
            </th>
            <th class="sortable" @click="toggleSort('capacity')">
              {{ i18n.t('capacityMW') }}
              <span class="sort-icon">↕</span>
            </th>
            <th>{{ i18n.t('region') }}</th>
            <th>{{ i18n.t('status') }}</th>
            <th class="sortable" @click="toggleSort('soc')">
              SOC
              <span class="sort-icon">↕</span>
            </th>
            <th class="sortable" @click="toggleSort('power')">
              {{ i18n.t('powerMW') }}
              <span class="sort-icon">↕</span>
            </th>
            <th class="sortable" @click="toggleSort('todayProfit')">
              {{ i18n.t('todayNetProfit') }}
              <span class="sort-icon">↕</span>
            </th>
            <th class="sortable" @click="toggleSort('totalProfit')">
              {{ i18n.t('totalNetProfit') }}
              <span class="sort-icon">↕</span>
            </th>
            <th>{{ i18n.t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="station in paginatedStations" :key="station.id">
            <td><input type="checkbox" /></td>
            <td class="name-cell">{{ station.name }}</td>
            <td>{{ station.capacity }}</td>
            <td>{{ station.region }}</td>
            <td class="status-cell">
              <span
                class="mode-tag"
                :class="station.isAuto ? 'tag-auto' : 'tag-manual'"
              >
                {{ station.isAuto ? i18n.t('auto') : i18n.t('manual') }}
              </span>
              <span
                class="run-tag"
                :class="'tag-' + station.runStatus"
              >
                ● {{ i18n.t(station.runStatus) }}
              </span>
            </td>
            <td>{{ station.soc }}%</td>
            <td :class="station.power < 0 ? 'power-negative' : 'power-positive'">
              {{ station.power }} MW
            </td>
            <td class="profit-positive">
              {{ station.todayProfit >= 0 ? '+' : '' }}${{ station.todayProfit.toLocaleString() }}
            </td>
            <td class="profit-total">
              ${{ station.totalProfit.toLocaleString() }}
            </td>
            <td>
              <button class="btn-detail-sm" @click="goDetail(station.id)">
                Detail
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <span class="page-info">
        Total {{ filteredStations.length }} items, Page {{ currentPage }}/{{ totalPages }}
      </span>
      <div class="page-buttons">
        <button :disabled="currentPage <= 1" @click="currentPage = 1">«</button>
        <button :disabled="currentPage <= 1" @click="currentPage--">‹</button>
        <button class="page-btn active">{{ currentPage }}</button>
        <button :disabled="currentPage >= totalPages" @click="currentPage++">›</button>
        <button :disabled="currentPage >= totalPages" @click="currentPage = totalPages">»</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18nStore'
import { useAuthStore } from '@/stores/authStore'
import { getAllStations, type Station } from '@/mock/dashboard'

const router = useRouter()
const i18n = useI18nStore()
const authStore = useAuthStore()

// === State ===
const viewMode = ref<'table' | 'card'>('card')
const searchQuery = ref('')
const appliedQuery = ref('')
const regionFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 6
const sortKey = ref('')
const sortAsc = ref(true)

// === Extended station type with computed fields ===
interface StationExtended extends Station {
  isAuto: boolean
}

// === Data ===

// Seed-based pseudo-random to avoid re-render flicker
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs((Math.sin(hash) * 10000) % 1)
}

const stations = computed<StationExtended[]>(() => {
  const role = authStore.user?.role
  const all = getAllStations()
  const filtered = role === 'operator' ? all.slice(0, 2) : all
  return filtered.map(s => ({
    ...s,
    isAuto: seededRandom(s.id + 'auto') > 0.3,
  }))
})

const regions = computed(() => [...new Set(stations.value.map(s => s.region))])

const filteredStations = computed(() => {
  let result = stations.value.filter(s => {
    if (appliedQuery.value && !s.name.toLowerCase().includes(appliedQuery.value.toLowerCase())) return false
    if (regionFilter.value && s.region !== regionFilter.value) return false
    if (statusFilter.value && s.commStatus !== statusFilter.value) return false
    return true
  })

  // Sort (table view)
  if (sortKey.value) {
    result = [...result].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey.value]
      const bVal = (b as Record<string, unknown>)[sortKey.value]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc.value ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortAsc.value ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredStations.value.length / pageSize)))

const paginatedStations = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredStations.value.slice(start, start + pageSize)
})

// === Actions ===

function applyFilter() {
  appliedQuery.value = searchQuery.value
  currentPage.value = 1
}

function resetFilter() {
  searchQuery.value = ''
  appliedQuery.value = ''
  regionFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  sortKey.value = ''
  sortAsc.value = true
}

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

function goDetail(id: string) {
  router.push(`/station/${id}`)
}
</script>

<style scoped>
/* === Page Layout === */
.station-page {
  padding: 24px;
  min-height: 100%;
}

/* === Header Bar === */
.station-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: var(--bg-input);
  border-radius: var(--radius-md);
  padding: 3px;
}

.view-toggle button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.view-toggle button.active {
  background: var(--color-primary);
  color: #000;
  font-weight: 600;
}

.view-toggle button:hover:not(.active) {
  background: var(--bg-input-focus);
  color: var(--color-text);
}

/* === Filter Bar === */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  width: 280px;
  max-width: 280px;
  padding: 10px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 14px;
  outline: none;
  transition: border-color var(--transition-fast);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus {
  border-color: var(--color-primary);
  background: var(--bg-input-focus);
}

.filter-select {
  padding: 10px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 14px;
  outline: none;
  cursor: pointer;
  min-width: 140px;
}

.filter-select:focus {
  border-color: var(--color-primary);
}

.filter-select option {
  background: var(--bg-elevated);
  color: var(--color-text);
}

.btn-search,
.btn-reset {
  padding: 10px 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-search {
  background: var(--color-primary);
  color: #000;
  border-color: var(--color-primary);
  font-weight: 600;
}

.btn-search:hover {
  background: var(--color-primary-hover);
}

.btn-reset {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-reset:hover {
  background: var(--bg-input);
  color: var(--color-text);
}

/* === Card Grid === */
.station-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* === Station Card === */
.station-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: all var(--transition-normal);
}

.station-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: var(--shadow-card);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.station-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.station-capacity {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.status-badge {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.status-online {
  color: var(--color-primary);
  background: var(--color-primary-dim);
}

.status-offline {
  color: var(--color-danger);
  background: rgba(255, 71, 87, 0.15);
}

/* === Energy Flow === */
.energy-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  margin-bottom: 16px;
}

.flow-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.flow-icon {
  font-size: 28px;
  line-height: 1;
}

.flow-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.flow-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.flow-line {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0 12px;
}

.flow-dots {
  width: 100%;
  height: 2px;
  background: var(--color-gray-600);
  border-radius: 1px;
  position: relative;
  overflow: hidden;
}

.flow-dots::after {
  content: '';
  position: absolute;
  top: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation-duration: 1.5s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.dots-charging {
  background: rgba(0, 255, 136, 0.3);
}

.dots-charging::after {
  background: var(--color-primary);
  animation-name: flowLeftToRight;
}

.dots-discharging {
  background: rgba(255, 165, 2, 0.3);
}

.dots-discharging::after {
  background: var(--color-warning);
  animation-name: flowRightToLeft;
}

.dots-idle {
  background: var(--color-gray-600);
}

.dots-idle::after {
  display: none;
}

@keyframes flowLeftToRight {
  0% { left: -6px; }
  100% { left: 100%; }
}

@keyframes flowRightToLeft {
  0% { right: -6px; left: auto; }
  100% { right: 100%; left: auto; }
}

.flow-power {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 6px;
  white-space: nowrap;
}

/* === Card Footer === */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-default);
}

.location {
  font-size: 13px;
  color: var(--color-text-muted);
}

.btn-detail {
  padding: 6px 18px;
  background: var(--color-primary);
  color: #000;
  border: none;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-detail:hover {
  background: var(--color-primary-hover);
}

/* === Table View === */
.station-table-wrap {
  overflow-x: auto;
  margin-bottom: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
}

.station-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.station-table thead {
  background: var(--bg-elevated);
}

.station-table th {
  padding: 14px 16px;
  text-align: left;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  border-bottom: 1px solid var(--border-default);
  user-select: none;
}

.station-table th.sortable {
  cursor: pointer;
  transition: color var(--transition-fast);
}

.station-table th.sortable:hover {
  color: var(--color-primary);
}

.sort-icon {
  margin-left: 4px;
  opacity: 0.5;
}

.station-table th.sortable:hover .sort-icon {
  opacity: 1;
}

.th-check {
  width: 40px;
}

.station-table td {
  padding: 14px 16px;
  color: var(--color-text);
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;
}

.station-table tbody tr {
  transition: background var(--transition-fast);
}

.station-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.name-cell {
  font-weight: 600;
  color: var(--color-text) !important;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-tag,
.run-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

.tag-auto {
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  background: var(--color-primary-dim);
}

.tag-manual {
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
  background: rgba(255, 165, 2, 0.12);
}

.tag-charging {
  color: var(--color-primary);
  background: var(--color-primary-dim);
}

.tag-discharging {
  color: var(--color-warning);
  background: rgba(255, 165, 2, 0.12);
}

.tag-idle {
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.06);
}

.power-negative {
  color: var(--color-warning) !important;
}

.power-positive {
  color: var(--color-primary) !important;
}

.profit-positive {
  color: var(--color-primary) !important;
  font-weight: 500;
}

.profit-total {
  color: var(--color-text) !important;
  font-weight: 500;
}

.btn-detail-sm {
  padding: 5px 14px;
  background: var(--color-primary);
  color: #000;
  border: none;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-detail-sm:hover {
  background: var(--color-primary-hover);
}

/* === Pagination === */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  flex-wrap: wrap;
  gap: 12px;
}

.page-info {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.page-buttons {
  display: flex;
  gap: 4px;
}

.page-buttons button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.page-buttons button:hover:not(:disabled):not(.active) {
  background: var(--bg-input);
  border-color: var(--border-hover);
  color: var(--color-text);
}

.page-buttons button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-btn.active {
  background: var(--color-primary) !important;
  color: #000 !important;
  border-color: var(--color-primary) !important;
  font-weight: 600;
}

/* === Responsive === */
@media (max-width: 768px) {
  .station-page {
    padding: 16px;
  }

  .station-header-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 8px;
  }

  .search-input {
    min-width: unset;
  }

  .filter-select {
    min-width: unset;
    width: 100%;
  }

  .station-grid {
    grid-template-columns: 1fr;
  }

  .btn-search,
  .btn-reset {
    width: 100%;
    text-align: center;
  }

  .pagination {
    flex-direction: column;
    align-items: center;
  }
}
</style>
