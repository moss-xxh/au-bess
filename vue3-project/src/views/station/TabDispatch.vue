<template>
  <div class="tab-dispatch">
    <div class="section-title">{{ i18n.t('sdDispatchRecords') }}</div>
    <div class="dispatch-table-wrap">
      <table class="dispatch-table">
        <thead>
          <tr>
            <th>{{ i18n.t('sdDate') }}</th>
            <th>{{ i18n.t('sdHasDispatch') }}</th>
            <th>{{ i18n.t('sdChargeAmount') }} (MWh)</th>
            <th>{{ i18n.t('sdDischargeAmount') }} (MWh)</th>
            <th>{{ i18n.t('sdDetails') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(rec, idx) in records" :key="idx">
            <td class="date-cell">{{ rec.date }}</td>
            <td>
              <span :class="['dispatch-badge', rec.hasDispatch ? 'badge-yes' : 'badge-no']">
                <span class="badge-dot"></span>
                {{ rec.hasDispatch ? i18n.t('sdYes') : i18n.t('sdNo') }}
              </span>
            </td>
            <td class="charge-val">{{ rec.charge.toFixed(2) }}</td>
            <td class="discharge-val">{{ rec.discharge.toFixed(2) }}</td>
            <td>
              <button
                class="details-btn"
                :disabled="!rec.hasDispatch"
                :class="{ disabled: !rec.hasDispatch }"
              >
                {{ i18n.t('sdDetails') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18nStore } from '@/stores/i18nStore'
import { getStationDispatchRecords } from '@/mock/station-detail'
import type { Station } from '@/mock/dashboard'

const props = defineProps<{ station: Station }>()
const i18n = useI18nStore()

const records = computed(() => getStationDispatchRecords(props.station.id, props.station.capacity))
</script>

<style scoped>
.tab-dispatch {
  padding: 4px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 20px;
}

.dispatch-table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
  background: var(--bg-card);
}

.dispatch-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.dispatch-table thead {
  background: var(--bg-elevated);
}

.dispatch-table th {
  padding: 14px 20px;
  text-align: left;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border-default);
}

.dispatch-table td {
  padding: 14px 20px;
  color: var(--color-text);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.dispatch-table tbody tr {
  transition: background var(--transition-fast);
}

.dispatch-table tbody tr:hover {
  background: rgba(255,255,255,0.02);
}

.date-cell { white-space: nowrap; font-weight: 500; }

.dispatch-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

.badge-yes {
  color: #00ff88;
  background: rgba(0,255,136,0.12);
}

.badge-no {
  color: #ff4757;
  background: rgba(255,71,87,0.12);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-yes .badge-dot { background: #00ff88; }
.badge-no .badge-dot { background: #ff4757; }

.charge-val { color: #3b82f6; font-weight: 500; }
.discharge-val { color: #f59e0b; font-weight: 500; }

.details-btn {
  padding: 5px 16px;
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.details-btn:hover:not(.disabled) {
  background: var(--color-primary);
  color: #000;
  border-color: var(--color-primary);
}

.details-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
