<template>
  <div class="logs-page">
    <!-- Page Header -->
    <h1 class="page-title">{{ i18n.t('logTitle') }}</h1>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-left">
        <select v-model="filters.stationId" class="filter-select">
          <option value="">{{ i18n.t('allStations') }}</option>
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <div class="date-range">
          <input v-model="filters.dateStart" type="date" class="date-input" placeholder="YYYY-MM-DD" />
          <span class="date-arrow">→</span>
          <input v-model="filters.dateEnd" type="date" class="date-input" placeholder="YYYY-MM-DD" />
        </div>
        <select v-model="filters.dispatchType" class="filter-select">
          <option value="">{{ i18n.t('logAllDispatch') }}</option>
          <option value="yes">{{ i18n.t('logDispatchYes') }}</option>
          <option value="no">{{ i18n.t('logDispatchNo') }}</option>
        </select>
      </div>
      <div class="filter-right">
        <button class="btn-reset" @click="resetFilters">🔄 {{ i18n.t('reset') }}</button>
        <button class="btn-search" @click="applyFilters">🔍 {{ i18n.t('logQuery') }}</button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-card">
      <div class="table-header">
        <h3 class="table-title">{{ i18n.t('logDailyStats') }}</h3>
        <span class="table-count">{{ i18n.t('totalItems').replace('{n}', String(filteredLogs.length)) }}</span>
      </div>

      <div class="table-wrap">
        <table class="logs-table">
          <thead>
            <tr>
              <th>{{ i18n.t('sdDate') }}</th>
              <th>{{ i18n.t('station') }}</th>
              <th>{{ i18n.t('sdHasDispatch') }}</th>
              <th>{{ i18n.t('sdDetails') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in paginatedLogs" :key="log.id">
              <td>{{ log.date }}</td>
              <td>{{ log.station }}</td>
              <td>
                <span :class="['dispatch-badge', log.hasDispatch ? 'dispatch-yes' : 'dispatch-no']">
                  {{ log.hasDispatch ? 'Y' : 'N' }}
                </span>
              </td>
              <td>
                <button class="btn-detail" @click="showDetail(log)">{{ i18n.t('detail') }}</button>
              </td>
            </tr>
            <tr v-if="paginatedLogs.length === 0">
              <td colspan="4" class="empty-cell">{{ i18n.t('logNoData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">‹</button>
        <template v-for="p in visiblePages" :key="p">
          <button
            :class="['page-btn', { active: p === currentPage }]"
            @click="currentPage = p"
          >{{ p }}</button>
        </template>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">›</button>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="detailLog" class="modal-overlay" @click.self="detailLog = null">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ i18n.t('logDetailTitle') }}</h3>
            <button class="modal-close" @click="detailLog = null">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">{{ i18n.t('sdDate') }}</span>
              <span>{{ detailLog.date }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ i18n.t('station') }}</span>
              <span>{{ detailLog.station }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ i18n.t('sdHasDispatch') }}</span>
              <span :class="detailLog.hasDispatch ? 'text-green' : 'text-red'">
                {{ detailLog.hasDispatch ? i18n.t('sdYes') : i18n.t('sdNo') }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ i18n.t('logChargeKWh') }}</span>
              <span>{{ detailLog.chargeKWh }} kWh</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ i18n.t('logDischargeKWh') }}</span>
              <span>{{ detailLog.dischargeKWh }} kWh</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ i18n.t('logOperator') }}</span>
              <span>{{ detailLog.operator }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ i18n.t('logType') }}</span>
              <span>{{ detailLog.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useI18nStore } from '@/stores/i18nStore'
import { getOperationLogs, getLogStations } from '@/mock/operation-logs'
import type { OperationLog, LogFilters } from '@/mock/operation-logs'

const i18n = useI18nStore()
const stations = getLogStations()

const PAGE_SIZE = 15
const currentPage = ref(1)
const detailLog = ref<OperationLog | null>(null)

// Buffered search: filters are editing state, appliedFilters is what's actually used
const filters = reactive<LogFilters>({
  stationId: '',
  dateStart: '',
  dateEnd: '',
  dispatchType: '',
})

const appliedFilters = reactive<LogFilters>({
  stationId: '',
  dateStart: '',
  dateEnd: '',
  dispatchType: '',
})

const filteredLogs = computed(() => {
  return getOperationLogs(appliedFilters)
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredLogs.value.slice(start, start + PAGE_SIZE)
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / PAGE_SIZE))

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  const start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function applyFilters() {
  appliedFilters.stationId = filters.stationId
  appliedFilters.dateStart = filters.dateStart
  appliedFilters.dateEnd = filters.dateEnd
  appliedFilters.dispatchType = filters.dispatchType
  currentPage.value = 1
}

function resetFilters() {
  filters.stationId = ''
  filters.dateStart = ''
  filters.dateEnd = ''
  filters.dispatchType = ''
  appliedFilters.stationId = ''
  appliedFilters.dateStart = ''
  appliedFilters.dateEnd = ''
  appliedFilters.dispatchType = ''
  currentPage.value = 1
}

function showDetail(log: OperationLog) {
  detailLog.value = log
}
</script>

<style scoped>
.logs-page {
  padding: 0;
}

.page-title {
  font-size: 48px;
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 24px;
  letter-spacing: -2px;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-right {
  display: flex;
  gap: 10px;
}

.filter-select {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  color: var(--color-text);
  padding: 10px 32px 10px 14px;
  border-radius: var(--radius-md);
  font-size: 14px;
  min-width: 140px;
  max-width: 280px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  transition: border-color var(--transition-fast);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.filter-select option {
  background: #1a1a1a;
  color: #fff;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  color: var(--color-text);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  width: 140px;
  transition: border-color var(--transition-fast);
}

.date-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.date-arrow {
  color: var(--text-tertiary);
  font-size: 14px;
}

.btn-reset {
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--bg-input);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-reset:hover {
  border-color: var(--border-hover);
  background: rgba(255,255,255,0.08);
}

.btn-search {
  padding: 10px 22px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: #000;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-search:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 12px rgba(0,255,136,0.3);
}

/* Table Card */
.table-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-default);
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.table-count {
  font-size: 13px;
  color: var(--text-tertiary);
}

.table-wrap {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.logs-table thead {
  background: var(--bg-elevated);
}

.logs-table th {
  padding: 12px 16px;
  text-align: left;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 13px;
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;
}

.logs-table td {
  padding: 14px 16px;
  color: var(--color-text);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.logs-table tbody tr:hover {
  background: rgba(255,255,255,0.02);
}

.empty-cell {
  text-align: center;
  color: var(--text-tertiary);
  padding: 40px 16px;
}

/* Dispatch Badge */
.dispatch-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}

.dispatch-yes {
  background: rgba(0,255,136,0.15);
  color: #00ff88;
  border: 1px solid rgba(0,255,136,0.3);
}

.dispatch-no {
  background: rgba(255,71,87,0.15);
  color: #ff4757;
  border: 1px solid rgba(255,71,87,0.3);
}

/* Detail Button */
.btn-detail {
  padding: 6px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-detail:hover {
  background: var(--color-primary);
  color: #000;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn.active {
  background: var(--color-primary);
  color: #000;
  border-color: var(--color-primary);
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  width: 480px;
  max-width: 90vw;
  box-shadow: var(--shadow-modal);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-default);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--color-text);
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255,255,255,0.1);
  color: var(--color-text);
}

.modal-body {
  padding: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 14px;
  color: var(--color-text);
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.text-green { color: #00ff88; }
.text-red { color: #ff4757; }

/* Responsive */
@media (max-width: 768px) {
  .page-title { font-size: 28px; }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .filter-left { flex-direction: column; }
  .filter-right { justify-content: flex-end; }
}
</style>
