<template>
  <div class="tab-running-data">
    <div class="section-title">{{ i18n.t('sdRunningData') }}</div>
    <div class="equipment-grid">
      <!-- BESS -->
      <div class="equipment-card">
        <div class="equipment-header">🔋 {{ i18n.t('sdBESS') }}</div>
        <div class="equipment-stats">
          <DataItem :label="i18n.t('sdRealtimePower')" :value="data.bess.realtimePower" unit="MW" :color="data.bess.realtimePower > 0 ? '#3b82f6' : data.bess.realtimePower < 0 ? '#ffd93d' : undefined" />
          <DataItem :label="'SOC'" :value="data.bess.soc" unit="%" />
          <DataItem :label="'SOH'" :value="data.bess.soh" unit="%" />
          <DataItem :label="i18n.t('sdDCVoltage')" :value="data.bess.dcVoltage" unit="V" />
          <DataItem :label="i18n.t('sdDCCurrent')" :value="data.bess.dcCurrent" unit="kA" />
          <DataItem :label="i18n.t('sdBatteryTemp')" :value="data.bess.batteryTemp" unit="°C" />
          <DataItem :label="i18n.t('sdCycleCount')" :value="data.bess.cycleCount" />
          <DataItem :label="i18n.t('sdDailyCharge')" :value="data.bess.dailyCharge" unit="MWh" />
          <DataItem :label="i18n.t('sdDailyDischarge')" :value="data.bess.dailyDischarge" unit="MWh" />
        </div>
      </div>

      <!-- Inverter (PCS) -->
      <div class="equipment-card">
        <div class="equipment-header">⚡ {{ i18n.t('sdInverterPCS') }}</div>
        <div class="equipment-stats">
          <DataItem :label="i18n.t('sdInverterStatus')" :value="i18n.locale === 'zh' ? data.pcs.statusZh : data.pcs.status" :color="data.pcs.status === 'Running' ? '#00ff88' : data.pcs.status === 'Offline' ? '#ff6b6b' : '#ffd93d'" />
          <DataItem :label="i18n.t('sdACVoltage3Phase')" :value="data.pcs.acVoltage" unit="kV" />
          <DataItem :label="i18n.t('sdACCurrent')" :value="data.pcs.acCurrent" unit="A" />
          <DataItem :label="i18n.t('sdFrequency')" :value="data.pcs.frequency" unit="Hz" />
          <DataItem :label="i18n.t('sdPowerFactor')" :value="data.pcs.powerFactor" />
          <DataItem :label="i18n.t('sdConversionEfficiency')" :value="data.pcs.conversionEfficiency" unit="%" />
          <DataItem :label="i18n.t('sdInverterTemp')" :value="data.pcs.inverterTemp" unit="°C" />
        </div>
      </div>

      <!-- Battery Mgmt (BMS) -->
      <div class="equipment-card">
        <div class="equipment-header">🧩 {{ i18n.t('sdBatteryMgmtBMS') }}</div>
        <div class="equipment-stats">
          <DataItem :label="i18n.t('sdBMSStatus')" :value="i18n.locale === 'zh' ? data.bms.statusZh : data.bms.status" :color="data.bms.status === 'Normal' ? '#00ff88' : '#ff6b6b'" />
          <DataItem :label="i18n.t('sdMaxCellVoltage')" :value="data.bms.maxCellVoltage" unit="V" />
          <DataItem :label="i18n.t('sdMinCellVoltage')" :value="data.bms.minCellVoltage" unit="V" />
          <DataItem :label="i18n.t('sdMaxCellTemp')" :value="data.bms.maxCellTemp" unit="°C" />
          <DataItem :label="i18n.t('sdMinCellTemp')" :value="data.bms.minCellTemp" unit="°C" />
          <DataItem :label="i18n.t('sdInsulationResistance')" :value="data.bms.insulationResistance" unit="MΩ" />
        </div>
      </div>

      <!-- Thermal Management -->
      <div class="equipment-card">
        <div class="equipment-header">🌡️ {{ i18n.t('sdThermalMgmt') }}</div>
        <div class="equipment-stats">
          <DataItem :label="i18n.t('sdCoolingMode')" :value="i18n.locale === 'zh' ? data.thermal.coolingModeZh : data.thermal.coolingMode" />
          <DataItem :label="i18n.t('sdCoolantTemp')" :value="data.thermal.coolantTemp" unit="°C" />
          <DataItem :label="i18n.t('sdFanSpeed')" :value="data.thermal.fanSpeed" unit="RPM" />
          <DataItem :label="i18n.t('sdAmbientTemp')" :value="data.thermal.ambientTemp" unit="°C" />
        </div>
      </div>

      <!-- Grid -->
      <div class="equipment-card">
        <div class="equipment-header">🔌 {{ i18n.t('sdGrid') }}</div>
        <div class="equipment-stats">
          <DataItem :label="i18n.t('sdExchangePower')" :value="data.grid.exchangePower" unit="MW" :color="data.grid.exchangePower < 0 ? '#00ff88' : data.grid.exchangePower > 0 ? '#3b82f6' : undefined" />
          <DataItem :label="i18n.t('sdFrequency')" :value="data.grid.frequency" unit="Hz" />
          <DataItem :label="i18n.t('sdACVoltage')" :value="data.grid.acVoltage" unit="kV" />
          <DataItem :label="i18n.t('sdPowerFactor')" :value="data.grid.powerFactor" />
          <DataItem :label="i18n.t('sdDailyExport')" :value="data.grid.dailyExport" unit="MWh" />
          <DataItem :label="i18n.t('sdDailyImport')" :value="data.grid.dailyImport" unit="MWh" />
        </div>
      </div>

      <!-- System Status -->
      <div class="equipment-card">
        <div class="equipment-header">📊 {{ i18n.t('sdSystemStatus') }}</div>
        <div class="equipment-stats">
          <DataItem :label="i18n.t('sdRunMode')" :value="i18n.tRunMode(data.system.runMode)" />
          <DataItem :label="i18n.t('sdConnection')" :value="i18n.locale === 'zh' ? data.system.connectionZh : data.system.connection" :color="data.system.connection === 'Online' ? '#00ff88' : '#ff6b6b'" />
          <DataItem :label="i18n.t('sdAlarmCount')" :value="data.system.alarmCount" :color="data.system.alarmCount > 0 ? '#ffd93d' : '#00ff88'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { useI18nStore } from '@/stores/i18nStore'
import { getStationRunningData } from '@/mock/station-detail'
import type { Station } from '@/mock/dashboard'

const props = defineProps<{ station: Station }>()
const i18n = useI18nStore()

const data = computed(() =>
  getStationRunningData(props.station.id, props.station.power, props.station.soc, props.station.commStatus, props.station.runMode)
)

// Inline DataItem component
const DataItem = defineComponent({
  props: {
    label: String,
    value: [String, Number],
    unit: { type: String, default: '' },
    color: { type: String, default: '' },
  },
  setup(props) {
    return () => h('div', { class: 'data-item' }, [
      h('span', { class: 'data-label' }, props.label),
      h('span', { class: 'data-value', style: props.color ? { color: props.color, fontWeight: '600' } : {} }, [
        String(props.value ?? '--'),
        props.unit ? ' ' + props.unit : '',
      ]),
    ])
  },
})
</script>

<style scoped>
.tab-running-data {
  padding: 4px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 20px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.equipment-card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.equipment-header {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-default);
}

.equipment-stats {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.data-item:last-child {
  border-bottom: none;
}

.data-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.data-value {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
  text-align: right;
}

@media (max-width: 1024px) {
  .equipment-grid { grid-template-columns: 1fr; }
}
</style>
