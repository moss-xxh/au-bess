<template>
  <div class="fault-alarm-page">
    <!-- Header -->
    <h1 class="page-title">{{ i18n.t('faultAlarm') }}</h1>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <select v-model="stationFilter" class="filter-select">
        <option value="">{{ i18n.t('allStations') }}</option>
        <option v-for="s in availableStations" :key="s" :value="s">{{ s }}</option>
      </select>
      <select v-model="levelFilter" class="filter-select">
        <option value="">{{ i18n.t('allAlarmLevel') }}</option>
        <option value="fault">{{ i18n.t('fault') }}</option>
        <option value="alarm">{{ i18n.t('alarm') }}</option>
        <option value="warning">{{ i18n.t('warning') }}</option>
      </select>
      <div class="date-range">
        <input v-model="dateStart" type="date" class="date-input" />
        <span class="date-arrow">→</span>
        <input v-model="dateEnd" type="date" class="date-input" />
      </div>
      <button class="btn-reset" @click="resetFilter">{{ i18n.t('reset') }}</button>
      <button class="btn-search" @click="applyFilter">{{ i18n.t('search') }}</button>
    </div>

    <!-- Tab Bar -->
    <div class="tab-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'unprocessed' }]"
        @click="activeTab = 'unprocessed'; currentPage = 1"
      >
        {{ i18n.t('unprocessed') }} ({{ unprocessedCount }})
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'processed' }]"
        @click="activeTab = 'processed'; currentPage = 1"
      >
        {{ i18n.t('processed') }}
      </button>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <label class="select-all-label">
        <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
        {{ i18n.t('selectAll') }}
      </label>
      <button class="btn-batch" @click="batchProcess">{{ i18n.t('batchProcess') }}</button>
      <button class="btn-export" @click="exportData">{{ i18n.t('export') }}</button>
    </div>

    <!-- Data Table -->
    <div class="table-wrap">
      <table class="alarm-table">
        <thead>
          <tr>
            <th class="th-check"><input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" /></th>
            <th class="sortable" @click="toggleSort('alarmTime')">
              {{ i18n.t('alarmTime') }}
              <span class="sort-icon">{{ sortKey === 'alarmTime' ? (sortAsc ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>{{ i18n.t('alarmStation') }}</th>
            <th>{{ i18n.t('alarmDevice') }}</th>
            <th>{{ i18n.t('description') }}</th>
            <th>{{ i18n.t('alarmLevel') }}</th>
            <th>{{ i18n.t('alarmStatus') }}</th>
            <th class="sortable" @click="toggleSort('recoveryTime')">
              {{ i18n.t('recoveryTime') }}
              <span class="sort-icon">{{ sortKey === 'recoveryTime' ? (sortAsc ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>{{ i18n.t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedAlarms" :key="item.id">
            <td><input type="checkbox" v-model="selectedIds" :value="item.id" /></td>
            <td class="time-cell">{{ formatTime(item.alarmTime) }}</td>
            <td>{{ item.station }}</td>
            <td>{{ item.device }}</td>
            <td>{{ item.description }}</td>
            <td>
              <span class="level-badge" :class="'level-' + item.level">
                <span class="level-dot"></span>
                {{ i18n.t(item.level) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="'alarm-status-' + item.status">
                <span class="status-dot"></span>
                {{ i18n.t(item.status) }}
              </span>
            </td>
            <td class="time-cell">{{ item.recoveryTime ? formatTime(item.recoveryTime) : '--' }}</td>
            <td class="actions-cell">
              <button v-if="item.status === 'unprocessed'" class="btn-resolve" @click="resolveAlarm(item)">
                {{ i18n.t('resolve') }}
              </button>
              <button class="btn-detail-action" @click="openDetail(item)">{{ i18n.t('detail') }}</button>
            </td>
          </tr>
          <tr v-if="paginatedAlarms.length === 0">
            <td colspan="9" class="empty-row">No data</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <span class="page-info">
        {{ i18n.t('totalItems').replace('{n}', String(tabFilteredAlarms.length)) }}
      </span>
      <div class="page-buttons">
        <button :disabled="currentPage <= 1" @click="currentPage--">‹</button>
        <button class="page-btn active">{{ currentPage }}</button>
        <button :disabled="currentPage >= totalPages" @click="currentPage++">›</button>
      </div>
      <span class="page-size-info">{{ pageSize }}/page</span>
    </div>

    <!-- Detail Drawer -->
    <Teleport to="body">
      <div v-if="drawerVisible" class="drawer-overlay" @click="closeDrawer">
        <div class="drawer-panel" @click.stop>
          <div class="drawer-header">
            <h2 class="drawer-title">{{ i18n.t('alarmDetail') }}</h2>
            <button class="drawer-close" @click="closeDrawer">✕</button>
          </div>
          <div class="drawer-body" v-if="drawerItem">
            <div class="detail-row">
              <span class="detail-label">ALARM TIME</span>
              <span class="detail-value">{{ formatTime(drawerItem.alarmTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ALARM STATION</span>
              <span class="detail-value">{{ drawerItem.station }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ALARM DEVICE</span>
              <span class="detail-value">{{ drawerItem.device }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">DESCRIPTION</span>
              <span class="detail-value">{{ drawerItem.description }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ALARM LEVEL</span>
              <span class="detail-value">
                <span class="level-badge" :class="'level-' + drawerItem.level">
                  <span class="level-dot"></span>
                  {{ i18n.t(drawerItem.level) }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ALARM STATUS</span>
              <span class="detail-value">
                <span class="status-badge" :class="'alarm-status-' + drawerItem.status">
                  <span class="status-dot"></span>
                  {{ i18n.t(drawerItem.status) }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">RECOVERY TIME</span>
              <span class="detail-value">{{ drawerItem.recoveryTime ? formatTime(drawerItem.recoveryTime) : '--' }}</span>
            </div>
          </div>
          <div class="drawer-footer">
            <button
              v-if="drawerItem && drawerItem.status === 'unprocessed'"
              class="btn-resolve-lg"
              @click="resolveAlarm(drawerItem); closeDrawer()"
            >
              {{ i18n.t('resolve') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Resolve确认弹窗 -->
    <Teleport to="body">
    <Transition name="fade">
      <div v-if="showResolveConfirm" class="resolve-overlay" @click.self="showResolveConfirm = false">
        <div class="resolve-modal">
          <div class="resolve-icon">⚠️</div>
          <h3 class="resolve-title">Confirm Resolve</h3>
          <p class="resolve-desc" v-if="pendingResolveItem">
            Are you sure you want to resolve this alarm?<br>
            <strong>{{ pendingResolveItem.description }}</strong> at <strong>{{ pendingResolveItem.station }}</strong>
          </p>
          <div class="resolve-actions">
            <button class="resolve-cancel" @click="showResolveConfirm = false">Cancel</button>
            <button class="resolve-confirm" @click="confirmResolve">Resolve</button>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useI18nStore } from '@/stores/i18nStore'

const i18n = useI18nStore()

// === Types ===
interface AlarmRecord {
  id: string
  alarmTime: number
  station: string
  device: string
  description: string
  level: 'fault' | 'alarm' | 'warning'
  status: 'unprocessed' | 'processed'
  recoveryTime: number | null
}

// === Station lists by role ===
const operatorStations = ['Hornsdale Power Reserve', 'Victorian Big Battery']
const allStationNames = [
  'Hornsdale Power Reserve',
  'Victorian Big Battery',
  'Wandoan BESS',
  'Torrens Island BESS',
  'Capital Battery',
  'Kwinana BESS',
  'Broken Hill Solar Farm',
]

// === Mock Data (10 records) ===
const mockAlarms: AlarmRecord[] = reactive([
  {
    id: 'ALM001',
    alarmTime: new Date('2026-03-04T07:33:00+11:00').getTime(),
    station: 'Hornsdale Power Reserve',
    device: 'PCS',
    description: 'Low Insulation',
    level: 'fault',
    status: 'unprocessed',
    recoveryTime: null,
  },
  {
    id: 'ALM002',
    alarmTime: new Date('2026-03-04T06:15:00+11:00').getTime(),
    station: 'Victorian Big Battery',
    device: 'BMS',
    description: 'Over Temperature',
    level: 'alarm',
    status: 'unprocessed',
    recoveryTime: null,
  },
  {
    id: 'ALM003',
    alarmTime: new Date('2026-03-04T05:42:00+11:00').getTime(),
    station: 'Wandoan BESS',
    device: 'Inverter',
    description: 'High Total Voltage',
    level: 'alarm',
    status: 'unprocessed',
    recoveryTime: null,
  },
  {
    id: 'ALM004',
    alarmTime: new Date('2026-03-03T22:10:00+11:00').getTime(),
    station: 'Torrens Island BESS',
    device: 'HVAC',
    description: 'Fan Speed Abnormal',
    level: 'warning',
    status: 'unprocessed',
    recoveryTime: null,
  },
  {
    id: 'ALM005',
    alarmTime: new Date('2026-03-03T18:25:00+11:00').getTime(),
    station: 'Capital Battery',
    device: 'PCS',
    description: 'DC Bus Overvoltage',
    level: 'fault',
    status: 'unprocessed',
    recoveryTime: null,
  },
  {
    id: 'ALM006',
    alarmTime: new Date('2026-03-03T14:08:00+11:00').getTime(),
    station: 'Kwinana BESS',
    device: 'BMS',
    description: 'Communication Failure',
    level: 'alarm',
    status: 'processed',
    recoveryTime: new Date('2026-03-03T15:30:00+11:00').getTime(),
  },
  {
    id: 'ALM007',
    alarmTime: new Date('2026-03-03T10:55:00+11:00').getTime(),
    station: 'Hornsdale Power Reserve',
    device: 'Inverter',
    description: 'Over Temperature',
    level: 'alarm',
    status: 'processed',
    recoveryTime: new Date('2026-03-03T12:20:00+11:00').getTime(),
  },
  {
    id: 'ALM008',
    alarmTime: new Date('2026-03-02T23:40:00+11:00').getTime(),
    station: 'Victorian Big Battery',
    device: 'HVAC',
    description: 'Fan Speed Abnormal',
    level: 'warning',
    status: 'processed',
    recoveryTime: new Date('2026-03-03T01:15:00+11:00').getTime(),
  },
  {
    id: 'ALM009',
    alarmTime: new Date('2026-03-04T04:20:00+11:00').getTime(),
    station: 'Broken Hill Solar Farm',
    device: 'PCS',
    description: 'Communication Failure',
    level: 'alarm',
    status: 'unprocessed',
    recoveryTime: null,
  },
  {
    id: 'ALM010',
    alarmTime: new Date('2026-03-04T03:05:00+11:00').getTime(),
    station: 'Wandoan BESS',
    device: 'BMS',
    description: 'Low Insulation',
    level: 'warning',
    status: 'unprocessed',
    recoveryTime: null,
  },
])

// === State ===
const activeTab = ref<'unprocessed' | 'processed'>('unprocessed')
const stationFilter = ref('')
const levelFilter = ref('')
const dateStart = ref('')
const dateEnd = ref('')
const currentPage = ref(1)
const pageSize = 10
const sortKey = ref('')
const sortAsc = ref(true)
const selectedIds = ref<string[]>([])
const drawerVisible = ref(false)
const drawerItem = ref<AlarmRecord | null>(null)

// === Computed ===
const userRole = computed(() => localStorage.getItem('userRole') || 'owner')

const availableStations = computed(() => {
  return userRole.value === 'operator' ? operatorStations : allStationNames
})

const roleFilteredAlarms = computed(() => {
  const stations = availableStations.value
  return mockAlarms.filter(a => stations.includes(a.station))
})

const filteredAlarms = computed(() => {
  let result = roleFilteredAlarms.value

  if (stationFilter.value) {
    result = result.filter(a => a.station === stationFilter.value)
  }
  if (levelFilter.value) {
    result = result.filter(a => a.level === levelFilter.value)
  }
  if (dateStart.value) {
    const start = new Date(dateStart.value).getTime()
    result = result.filter(a => a.alarmTime >= start)
  }
  if (dateEnd.value) {
    const end = new Date(dateEnd.value + 'T23:59:59').getTime()
    result = result.filter(a => a.alarmTime <= end)
  }

  return result
})

const tabFilteredAlarms = computed(() => {
  let result = filteredAlarms.value.filter(a => a.status === activeTab.value)

  if (sortKey.value) {
    result = [...result].sort((a, b) => {
      let aVal: number
      let bVal: number
      if (sortKey.value === 'alarmTime') {
        aVal = a.alarmTime
        bVal = b.alarmTime
      } else {
        aVal = a.recoveryTime || 0
        bVal = b.recoveryTime || 0
      }
      return sortAsc.value ? aVal - bVal : bVal - aVal
    })
  }

  return result
})

const unprocessedCount = computed(() => {
  return filteredAlarms.value.filter(a => a.status === 'unprocessed').length
})

const totalPages = computed(() => Math.max(1, Math.ceil(tabFilteredAlarms.value.length / pageSize)))

const paginatedAlarms = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return tabFilteredAlarms.value.slice(start, start + pageSize)
})

const isAllSelected = computed(() => {
  if (paginatedAlarms.value.length === 0) return false
  return paginatedAlarms.value.every(a => selectedIds.value.includes(a.id))
})

// === Helpers ===
function formatTime(ts: number): string {
  const d = new Date(ts)
  const aest = new Date(ts + (11 * 60 * 60 * 1000) - (d.getTimezoneOffset() * 60 * 1000))
  const yyyy = aest.getFullYear()
  const MM = String(aest.getMonth() + 1).padStart(2, '0')
  const dd = String(aest.getDate()).padStart(2, '0')
  const hh = String(aest.getHours()).padStart(2, '0')
  const mm = String(aest.getMinutes()).padStart(2, '0')
  const ss = String(aest.getSeconds()).padStart(2, '0')
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}(AEST)`
}

// === Actions ===
function applyFilter() {
  currentPage.value = 1
}

function resetFilter() {
  stationFilter.value = ''
  levelFilter.value = ''
  dateStart.value = ''
  dateEnd.value = ''
  currentPage.value = 1
  sortKey.value = ''
  sortAsc.value = true
  selectedIds.value = []
}

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    const ids = paginatedAlarms.value.map(a => a.id)
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
  } else {
    const ids = paginatedAlarms.value.map(a => a.id)
    const newIds = ids.filter(id => !selectedIds.value.includes(id))
    selectedIds.value = [...selectedIds.value, ...newIds]
  }
}

const showResolveConfirm = ref(false)
const pendingResolveItem = ref<AlarmRecord | null>(null)

function resolveAlarm(item: AlarmRecord) {
  pendingResolveItem.value = item
  showResolveConfirm.value = true
}

function confirmResolve() {
  if (pendingResolveItem.value) {
    pendingResolveItem.value.status = 'processed'
    pendingResolveItem.value.recoveryTime = Date.now()
    selectedIds.value = selectedIds.value.filter(id => id !== pendingResolveItem.value!.id)
  }
  showResolveConfirm.value = false
  pendingResolveItem.value = null
}

function batchProcess() {
  const selected = mockAlarms.filter(a => selectedIds.value.includes(a.id) && a.status === 'unprocessed')
  const now = Date.now()
  selected.forEach(a => {
    a.status = 'processed'
    a.recoveryTime = now
  })
  selectedIds.value = []
}

function exportData() {
  console.log('Export alarm data:', tabFilteredAlarms.value)
}

function openDetail(item: AlarmRecord) {
  drawerItem.value = item
  drawerVisible.value = true
}

function closeDrawer() {
  drawerVisible.value = false
  drawerItem.value = null
}
</script>

<style scoped>
/* === Page Layout === */
.fault-alarm-page {
  padding: 24px;
  min-height: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 20px 0;
}

/* === Filter Bar === */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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
  min-width: 160px;
}

.filter-select:focus {
  border-color: var(--color-primary);
}

.filter-select option {
  background: var(--bg-elevated);
  color: var(--color-text);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  padding: 10px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 14px;
  outline: none;
  min-width: 140px;
}

.date-input:focus {
  border-color: var(--color-primary);
  background: var(--bg-input-focus);
}

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

.date-arrow {
  color: var(--color-text-muted);
  font-size: 14px;
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

/* === Tab Bar === */
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border-default);
  margin-bottom: 16px;
}

.tab-btn {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--color-text);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

/* === Action Bar === */
.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.select-all-label input[type="checkbox"] {
  cursor: pointer;
}

.btn-batch {
  padding: 8px 18px;
  background: var(--color-primary);
  color: #000;
  border: none;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-batch:hover {
  background: var(--color-primary-hover);
}

.btn-export {
  padding: 8px 18px;
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-export:hover {
  background: var(--color-primary-dim);
}

/* === Table === */
.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
  margin-bottom: 20px;
}

.alarm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.alarm-table thead {
  background: var(--bg-elevated);
}

.alarm-table th {
  padding: 14px 16px;
  text-align: left;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  border-bottom: 1px solid var(--border-default);
  user-select: none;
}

.alarm-table th.sortable {
  cursor: pointer;
  transition: color var(--transition-fast);
}

.alarm-table th.sortable:hover {
  color: var(--color-primary);
}

.sort-icon {
  margin-left: 4px;
  opacity: 0.5;
}

.alarm-table th.sortable:hover .sort-icon {
  opacity: 1;
}

.th-check {
  width: 40px;
}

.alarm-table td {
  padding: 14px 16px;
  color: var(--color-text);
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;
}

.alarm-table tbody tr {
  transition: background var(--transition-fast);
}

.alarm-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.time-cell {
  font-family: var(--font-mono);
  font-size: 13px;
}

.empty-row {
  text-align: center;
  color: var(--color-text-muted);
  padding: 40px 16px !important;
}

/* === Level Badge === */
.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.level-fault {
  color: #ff4757;
}

.level-fault .level-dot {
  background: #ff4757;
}

.level-alarm {
  color: #ffa502;
}

.level-alarm .level-dot {
  background: #ffa502;
}

.level-warning {
  color: #00ff88;
}

.level-warning .level-dot {
  background: #00ff88;
}

/* === Status Badge === */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.alarm-status-unprocessed {
  color: #00ff88;
}

.alarm-status-unprocessed .status-dot {
  background: #00ff88;
}

.alarm-status-processed {
  color: rgba(255, 255, 255, 0.5);
}

.alarm-status-processed .status-dot {
  background: rgba(255, 255, 255, 0.4);
}

/* === Action Buttons === */
.actions-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-resolve {
  padding: 5px 14px;
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-resolve:hover {
  background: var(--color-primary-dim);
}

.alarm-table td:last-child {
  min-width: 140px;
  white-space: nowrap;
}

.btn-detail-action {
  padding: 5px 10px;
  background: transparent;
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-detail-action:hover {
  background: rgba(255, 165, 2, 0.12);
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

.page-size-info {
  font-size: 14px;
  color: var(--color-text-muted);
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

/* === Drawer === */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-panel {
  width: 420px;
  max-width: 90vw;
  height: 100%;
  background: var(--bg-card);
  border-left: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-default);
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.drawer-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 16px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.drawer-close:hover {
  background: var(--bg-input);
  color: var(--color-text);
}

.drawer-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.detail-row {
  margin-bottom: 24px;
}

.detail-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.detail-value {
  display: block;
  font-size: 15px;
  color: var(--color-text);
  font-weight: 500;
}

.drawer-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-default);
}

.btn-resolve-lg {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  color: #000;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-resolve-lg:hover {
  background: var(--color-primary-hover);
}

/* === Responsive === */
@media (max-width: 768px) {
  .fault-alarm-page {
    padding: 16px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 8px;
  }

  .filter-select {
    min-width: unset;
    width: 100%;
  }

  .date-range {
    width: 100%;
  }

  .date-input {
    flex: 1;
    min-width: unset;
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

  .drawer-panel {
    width: 100%;
  }
}
</style>

<style>
.resolve-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.resolve-modal {
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 28px 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.resolve-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.resolve-title {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px;
}

.resolve-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 24px;
}

.resolve-desc strong {
  color: #fff;
}

.resolve-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.resolve-cancel {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
}

.resolve-cancel:hover {
  background: rgba(255, 255, 255, 0.12);
}

.resolve-confirm {
  padding: 10px 24px;
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.resolve-confirm:hover {
  background: #00cc6a;
}
</style>
