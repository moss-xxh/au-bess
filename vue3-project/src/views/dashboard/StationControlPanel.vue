<template>
  <div class="station-control-wrapper">
    <!-- 电站选择器（卡片外部，页面级数据切换） -->
    <select v-model="selectedStationId" class="station-select-top">
      <option v-for="s in stations" :key="s.id" :value="s.id">
        {{ s.name }} ({{ s.region }})
      </option>
    </select>

    <div class="control-panel">
      <!-- Header: 标题 + Auto开关 -->
      <div class="panel-header">
        <h3 class="panel-title">
          {{ i18n.t('stationManagement') }}
          <span
            v-if="currentStation.runStatus !== 'idle'"
            class="title-status-badge"
            :class="'status-' + currentStation.runStatus"
          >
            {{ i18n.t(currentStation.runStatus) }}
          </span>
          <span
            v-else-if="isAutoMode"
            class="title-status-badge status-standby"
          >
            {{ i18n.t('standby') }}
          </span>
        </h3>
        <div class="auto-toggle">
          <span class="auto-label">{{ i18n.t('auto') }}</span>
          <div
            class="toggle-switch"
            :class="{ active: isAutoMode }"
            @click="toggleAutoMode"
            role="switch"
            :aria-checked="isAutoMode"
          >
            <div class="toggle-knob"></div>
          </div>
        </div>
      </div>

      <!-- 中间区域：Charge按钮 | 电价圈 | Discharge按钮 -->
    <div class="control-center">
      <button
        class="action-btn charge-btn"
        v-show="!isAutoMode && currentStation.runStatus !== 'charging' && currentStation.runStatus !== 'discharging'"
        @click="handleCharge"
      >
        {{ i18n.t('charge') }}
      </button>

      <!-- 电价圈（静态科技渐变圆） -->
      <div
        class="price-circle-wrap"
        @mouseenter="showStopOverlay = canStop"
        @mouseleave="showStopOverlay = false"
        @click="handleCircleClick"
      >
        <div class="price-circle" :class="priceCircleClass">
          <div class="price-value">
            ${{ currentStation.currentSpotPrice?.toFixed(2) ?? '--' }}
          </div>
          <div class="price-label">{{ i18n.t('spotPriceLabel') }}</div>
        </div>
        <!-- STOP遮罩：充电/放电时hover显示 -->
        <Transition name="fade">
          <div v-if="showStopOverlay" class="stop-overlay">
            <span class="stop-text">STOP</span>
          </div>
        </Transition>
      </div>

      <button
        class="action-btn discharge-btn"
        v-show="!isAutoMode && currentStation.runStatus !== 'charging' && currentStation.runStatus !== 'discharging'"
        @click="handleDischarge"
      >
        {{ i18n.t('discharge') }}
      </button>
    </div>

    <!-- Cost成本 (v2风格) -->
    <div class="cost-section">
      <span class="cost-label">Cost($/MWh)</span>
      <span class="cost-value">${{ currentStation.currentSpotPrice ? (currentStation.currentSpotPrice * 0.85).toFixed(2) : '--' }}</span>
    </div>

    <!-- 电池SOC进度条 -->
    <div class="battery-row">
      <span class="battery-label">SOC</span>
      <div class="battery-container">
        <div class="battery-body">
          <div
            class="battery-fill"
            :style="{ width: currentStation.soc + '%' }"
            :class="socColorClass"
          ></div>
          <div class="battery-tick" style="left: 25%"></div>
          <div class="battery-tick" style="left: 50%"></div>
          <div class="battery-tick" style="left: 75%"></div>
          <span class="battery-text">{{ currentStation.soc }}%</span>
        </div>
        <div class="battery-terminal"></div>
      </div>

    </div>



    <!-- === Settings区 === -->
    <div class="settings-section">
      <div class="settings-header">
        <h4 class="settings-title">{{ i18n.t('settings') }}</h4>
        <button class="settings-edit-btn" @click="toggleEditMode">
          {{ i18n.t('edit') }}
        </button>
      </div>

      <!-- SOC阈值 纯文字 -->
      <div class="param-grid">
        <div class="param-line"><span class="param-label">{{ i18n.t('chargeStopSOCLabel') }}</span> <span class="charge-val">⚡ {{ chargeStopSOC }}%</span></div>
        <div class="param-line"><span class="param-label">{{ i18n.t('dischargeStopSOCLabel') }}</span> <span class="discharge-val">🔋 {{ dischargeStopSOC }}%</span></div>
      </div>

      <!-- Auto时段 保持卡片样式 -->
      <div class="auto-schedule-grid">
        <div class="schedule-card charge-schedule">
          <span class="schedule-icon">⚡</span>
          <div class="schedule-detail">
            <span class="schedule-label">{{ i18n.t('autoChargeLabel') }}</span>
            <span class="schedule-time">{{ autoChargeStart }}-{{ autoChargeEnd }}</span>
          </div>
        </div>
        <div class="schedule-card discharge-schedule">
          <span class="schedule-icon">🔋</span>
          <div class="schedule-detail">
            <span class="schedule-label">{{ i18n.t('autoDischargeLabel') }}</span>
            <span class="schedule-time">{{ autoDischargeStart }}-{{ autoDischargeEnd }}</span>
          </div>
        </div>
      </div>
    </div>
    </div><!-- .control-panel -->
  </div><!-- .station-control-wrapper -->

  <!-- STOP确认弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showStopConfirm" class="stop-confirm-overlay" @click.self="showStopConfirm = false">
        <div class="stop-confirm-modal">
          <div class="stop-confirm-icon">⚠️</div>
          <h3>{{ i18n.t('confirmStop') }}</h3>
          <p>{{ i18n.t('confirmStopDesc') }}</p>
          <div class="stop-confirm-actions">
            <button class="btn-cancel" @click="showStopConfirm = false">{{ i18n.t('cancel') }}</button>
            <button class="btn-confirm-stop" @click="confirmStop">{{ i18n.t('confirmStopBtn') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 冲突提示弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showConflictAlert" class="stop-confirm-overlay" @click.self="showConflictAlert = false">
        <div class="op-confirm-modal">
          <div class="op-confirm-header">
            <div class="op-confirm-icon-wrap" style="background: rgba(255,59,48,0.12); box-shadow: 0 4px 12px rgba(255,59,48,0.15);">
              <span>⚠️</span>
            </div>
            <h3 class="op-confirm-title">{{ i18n.t('conflictTitle') }}</h3>
          </div>
          <p style="color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.6; margin: 0 0 20px;">
            {{ i18n.t('conflictMsg') }}
          </p>
          <div class="op-confirm-actions" style="justify-content: flex-end;">
            <button class="btn-confirm-op charge" @click="showConflictAlert = false">OK</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Auto开启确认弹窗 (v2风格) -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showAutoOnConfirm" class="stop-confirm-overlay" @click.self="showAutoOnConfirm = false">
        <div class="auto-confirm-modal">
          <div class="auto-confirm-header">
            <h3>{{ i18n.t('confirmAutoMode') }}</h3>
            <p>{{ i18n.t('confirmAutoModeDesc') }}</p>
          </div>

          <div class="auto-confirm-body">
            <div class="auto-conditions-grid">
              <div class="condition-card charge-condition">
                <div class="condition-title">⚡ {{ i18n.t('chargeConditions') }}</div>
                <div v-for="(p, idx) in editChargePeriods" :key="'cc'+idx" class="condition-slot">
                  <div class="slot-label">{{ i18n.t('timeSlot') }} {{ idx + 1 }}</div>
                  <div class="slot-value"><span class="time-icon">⏰</span> {{ p.start }} – {{ p.end }}</div>
                </div>
                <div class="condition-soc">
                  ✓ {{ i18n.t('chargeToSOC') }} <span class="soc-val charge-val">{{ chargeStopSOC }}%</span>
                </div>
              </div>

              <div class="condition-card discharge-condition">
                <div class="condition-title">🔋 {{ i18n.t('dischargeConditions') }}</div>
                <div v-for="(p, idx) in editDischargePeriods" :key="'dc'+idx" class="condition-slot">
                  <div class="slot-label">{{ i18n.t('timeSlot') }} {{ idx + 1 }}</div>
                  <div class="slot-value"><span class="time-icon">⏰</span> {{ p.start }} – {{ p.end }}</div>
                </div>
                <div class="condition-soc">
                  ✓ {{ i18n.t('dischargeToSOC') }} <span class="soc-val discharge-val">{{ dischargeStopSOC }}%</span>
                </div>
              </div>
            </div>

            <div class="auto-confirm-hint">
              💡 {{ i18n.t('autoHint') }}
            </div>
          </div>

          <div class="auto-confirm-footer">
            <button class="btn-edit-settings" @click="editSettingsFromAutoConfirm">{{ i18n.t('editSettings') }}</button>
            <button class="btn-cancel" @click="showAutoOnConfirm = false">{{ i18n.t("cancel") }}</button>
            <button class="btn-confirm-op charge" @click="confirmEnableAuto">{{ i18n.t('confirmEnable') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>


  <!-- Auto关闭确认弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showAutoOffConfirm" class="stop-confirm-overlay" @click.self="showAutoOffConfirm = false">
        <div class="op-confirm-modal">
          <div class="op-confirm-header">
            <div class="op-confirm-icon-wrap" style="background: rgba(255,165,0,0.12); box-shadow: 0 4px 12px rgba(255,165,0,0.15);">
              <span>🔄</span>
            </div>
            <h3 class="op-confirm-title">{{ i18n.t('confirmDisableAuto') }}</h3>
          </div>
          <p style="color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.8; margin: 0 0 20px;">
            {{ i18n.t('confirmDisableAutoDesc') }}
          </p>
          <div class="op-confirm-actions">
            <button class="btn-cancel" @click="showAutoOffConfirm = false">{{ i18n.t("cancel") }}</button>
            <button class="btn-confirm-op charge" @click="confirmAutoOff">{{ i18n.t('confirmDisable') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Settings 设置弹窗 (v2风格全屏modal) -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showSettingsModal" class="stop-confirm-overlay" @click.self="closeSettings">
        <div class="settings-modal">
          <div class="settings-modal-header">
            <h2>{{ i18n.t("settingsTitle") }}</h2>

            <button class="settings-close-btn" @click="closeSettings">✕</button>
          </div>

          <!-- SOC Settings -->
          <div class="settings-section">
            <h3 class="settings-section-title">🔋 {{ i18n.t("socSettings") }}</h3>
            <div class="soc-settings-row">
              <div class="soc-setting-item">
                <div class="soc-header-row">
                  <label class="soc-setting-label charge-label">{{ i18n.t("chargeStopSOCLabel") }}</label>
                  <div class="soc-input-wrap">
                    <input type="number" v-model.number="editChargeSOC" min="0" max="100" class="soc-number-input charge-input" />
                    <span>%</span>
                  </div>
                </div>
                <input type="range" v-model.number="editChargeSOC" min="0" max="100" class="soc-slider charge-slider full-width" :style="{'--val': editChargeSOC + '%'}" />
              </div>
              <div class="soc-setting-item">
                <div class="soc-header-row">
                  <label class="soc-setting-label discharge-label">{{ i18n.t("dischargeStopSOCLabel") }}</label>
                  <div class="soc-input-wrap">
                    <input type="number" v-model.number="editDischargeSOC" min="0" max="100" class="soc-number-input discharge-input" />
                    <span>%</span>
                  </div>
                </div>
                <input type="range" v-model.number="editDischargeSOC" min="0" max="100" class="soc-slider discharge-slider full-width" :style="{'--val': editDischargeSOC + '%'}" />
              </div>
            </div>
          </div>

          <!-- Auto Conditions -->
          <div class="settings-section">
            <h3 class="settings-section-title">⏰ {{ i18n.t("timeConditionSettings") }}</h3>
            <p class="settings-hint">💡 {{ i18n.t("settingsHint") }}</p>

            <!-- 24h 时间轴可视化 -->
            <div class="timeline-bar">
              <div class="timeline-track">
                <div v-for="(p, i) in editChargePeriods" :key="'tc'+i" class="timeline-charge-block" :style="getTimeBlockStyle(p)"></div>
                <div v-for="(p, i) in editDischargePeriods" :key="'td'+i" class="timeline-discharge-block" :style="getTimeBlockStyle(p)"></div>
              </div>
              <div class="timeline-labels">
                <span>00:00</span><span>03:00</span><span>06:00</span><span>09:00</span>
                <span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span><span>24:00</span>
              </div>
            </div>

            <div class="time-settings-row">
              <!-- 充电时段（多个） -->
              <div class="time-setting-item">
                <div class="time-setting-header">
                  <label class="time-setting-label charge-label">{{ i18n.t('autoChargeLabel') }}</label>
                  <button class="add-period-btn charge-add" @click="addChargePeriod">+ {{ i18n.t('add') }}</button>
                </div>
                <div v-for="(p, idx) in editChargePeriods" :key="'c'+idx" class="period-row">
                  <input type="time" v-model="p.start" class="time-input-field" />
                  <span class="time-dash">-</span>
                  <input type="time" v-model="p.end" class="time-input-field" />
                  <button  class="del-period-btn" @click="editChargePeriods.splice(idx, 1)">✕</button>
                </div>
              </div>
              <!-- 放电时段（多个） -->
              <div class="time-setting-item">
                <div class="time-setting-header">
                  <label class="time-setting-label discharge-label">{{ i18n.t('autoDischargeLabel') }}</label>
                  <button class="add-period-btn discharge-add" @click="addDischargePeriod">+ {{ i18n.t('add') }}</button>
                </div>
                <div v-for="(p, idx) in editDischargePeriods" :key="'d'+idx" class="period-row">
                  <input type="time" v-model="p.start" class="time-input-field" />
                  <span class="time-dash">-</span>
                  <input type="time" v-model="p.end" class="time-input-field" />
                  <button  class="del-period-btn" @click="editDischargePeriods.splice(idx, 1)">✕</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="settings-modal-actions">
            <button class="btn-cancel" @click="closeSettings">{{ i18n.t("cancel") }}</button>
            <button class="btn-save-settings" @click="saveSettings">{{ i18n.t("saveSettings") }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 充放电操作确认弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showOperationConfirm" class="stop-confirm-overlay" @click.self="showOperationConfirm = false">
        <div class="op-confirm-modal">
          <!-- Header: icon + title -->
          <div class="op-confirm-header">
            <div class="op-confirm-icon-wrap" :class="pendingOperation">
              <span>{{ pendingOperation === 'charge' ? '⚡' : '🔋' }}</span>
            </div>
            <h3 class="op-confirm-title">
              {{ pendingOperation === 'charge' ? i18n.t('confirmCharge') : i18n.t('confirmDischarge') }}
            </h3>
          </div>

          <!-- 2x2 Grid Cards (v2 style) -->
          <div class="op-info-grid">
            <div class="op-info-card">
              <div class="op-card-label">{{ i18n.t('operationType') }}</div>
              <div class="op-card-value" :class="pendingOperation">
                {{ pendingOperation === 'charge' ? 'Charge' : 'Discharge' }}
              </div>
            </div>
            <div class="op-info-card">
              <div class="op-card-label">Current SOC</div>
              <div class="op-card-value" :class="pendingOperation">{{ currentStation.soc }}%</div>
            </div>
            <div class="op-info-card">
              <div class="op-card-label">{{ pendingOperation === 'charge' ? i18n.t('estChargeTime') : i18n.t('estDischargeTime') }}</div>
              <div class="op-card-value">{{ estimatedTime }}</div>
            </div>
            <div class="op-info-card">
              <div class="op-card-label">{{ pendingOperation === 'charge' ? i18n.t('estCost') : i18n.t('estRevenue') }}</div>
              <div class="op-card-value">{{ estimatedCost }}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="op-confirm-actions">
            <button class="btn-cancel" @click="showOperationConfirm = false">{{ i18n.t("cancel") }}</button>
            <button
              class="btn-confirm-op"
              :class="pendingOperation"
              @click="confirmOperation"
            >
              {{ pendingOperation === 'charge' ? 'Confirm Charge' : 'Confirm Discharge' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18nStore } from '@/stores/i18nStore'
import { allStations } from '@/mock/dashboard'

const i18n = useI18nStore()

// === 区域现货电价 ($/MWh) — 来自AEMO真实范围 ===
const regionSpotPrices: Record<string, number> = {
  NSW: 87.50,
  VIC: 72.30,
  QLD: 95.10,
  SA: 110.80,
  WA: 68.40,
  TAS: 55.20,
  ACT: 82.60,
}

// === 构建带 currentSpotPrice 的电站数据 ===
const stations = allStations.map(s => ({
  ...s,
  currentSpotPrice: regionSpotPrices[s.region] ?? 80,
}))

// === 响应式状态 ===
const selectedStationId = ref(stations[0].id)
const isAutoMode = ref(true)
const showStopOverlay = ref(false)
const showStopConfirm = ref(false)
const showOperationConfirm = ref(false)
const showSettingsModal = ref(false)
const showConflictAlert = ref(false)
const editChargeSOC = ref(75)
const editDischargeSOC = ref(30)
const editChargePeriods = ref([{ start: '09:00', end: '13:00' }])
const editDischargePeriods = ref([{ start: '17:00', end: '21:00' }])

function addChargePeriod() {
  editChargePeriods.value.push({ start: '00:00', end: '01:00' })
}
function addDischargePeriod() {
  editDischargePeriods.value.push({ start: '00:00', end: '01:00' })
}
const pendingOperation = ref<'charge' | 'discharge'>('charge') // 默认Auto

// 每个电站的可变运行状态（独立于base数据）
const stationStates = reactive<Record<string, { runStatus: string; soc: number }>>(
  Object.fromEntries(
    stations.map(s => [s.id, { runStatus: s.runStatus, soc: s.soc }])
  )
)

// === 计算属性 ===

interface CurrentStationView {
  id: string
  name: string
  region: string
  capacity: number
  power: number
  soc: number
  commStatus: string
  runStatus: string
  runMode: string
  todayProfit: number
  totalProfit: number
  brand: string
  model: string
  fcasEnabled: boolean
  currentSpotPrice: number
}

const currentStation = computed<CurrentStationView>(() => {
  const base = stations.find(s => s.id === selectedStationId.value) || stations[0]
  const state = stationStates[selectedStationId.value]
  return { ...base, ...state }
})

// 电价圈颜色根据价格变化
const priceCircleClass = computed(() => {
  const status = currentStation.value.runStatus
  if (status === 'charging') return 'price-charging'       // 绿色 - 充电中
  if (status === 'discharging') return 'price-discharging'  // 黄色 - 放电中
  return 'price-idle'                                        // 蓝色 - 待机
})

// SOC颜色
// 预估充放电时间和成本
const estimatedTime = computed(() => {
  const soc = currentStation.value.soc
  const capacity = currentStation.value.capacity || 50
  if (pendingOperation.value === 'charge') {
    const remaining = 100 - soc
    const hours = (remaining / 100) * (capacity / 25) // 大约25MW充电速率
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return h > 0 ? h + 'h ' + m + 'min' : m + 'min'
  } else {
    const hours = (soc / 100) * (capacity / 25)
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return h > 0 ? h + 'h ' + m + 'min' : m + 'min'
  }
})

const estimatedCost = computed(() => {
  const price = currentStation.value.currentSpotPrice || 0
  const soc = currentStation.value.soc
  const capacity = currentStation.value.capacity || 50
  if (pendingOperation.value === 'charge') {
    const mwh = ((100 - soc) / 100) * capacity
    return '$' + Math.round(price * mwh / 1000)
  } else {
    const mwh = (soc / 100) * capacity
    return '$' + Math.round(price * mwh / 1000)
  }
})

// 是否可以停止（充电或放电中才能停）
const canStop = computed(() => {
  if (isAutoMode.value) return false
  const status = currentStation.value.runStatus
  return status === 'charging' || status === 'discharging'
})

const socColorClass = computed(() => {
  const soc = currentStation.value.soc
  if (soc >= 60) return 'soc-high'
  if (soc >= 30) return 'soc-mid'
  return 'soc-low'
})

// === 状态机交互 ===

const showAutoOnConfirm = ref(false)
const showAutoOffConfirm = ref(false)

function toggleAutoMode() {
  const state = stationStates[selectedStationId.value]

  // 手动运行中→开Auto → 拦截
  if (!isAutoMode.value && state && (state.runStatus === 'charging' || state.runStatus === 'discharging')) {
    showConflictAlert.value = true
    return
  }

  if (!isAutoMode.value) {
    // 开启Auto → 弹确认弹窗(v2风格)
    showAutoOnConfirm.value = true
  } else {
    // 关闭Auto → 弹确认弹窗
    showAutoOffConfirm.value = true
  }
}

function confirmEnableAuto() {
  isAutoMode.value = true
  showAutoOnConfirm.value = false
}

function editSettingsFromAutoConfirm() {
  showAutoOnConfirm.value = false
  toggleEditMode()
}

function confirmAutoOff() {
  isAutoMode.value = false
  showAutoOffConfirm.value = false
  // 关闭Auto后强制停止运行，回到idle
  const state = stationStates[selectedStationId.value]
  if (state) {
    state.runStatus = 'idle'
  }
}

function handleCharge() {
  if (isAutoMode.value) return
  const state = stationStates[selectedStationId.value]
  if (!state) return
  if (state.runStatus === 'discharging') return // 互斥
  // 弹出确认弹窗
  pendingOperation.value = 'charge'
  showOperationConfirm.value = true
}

function handleDischarge() {
  if (isAutoMode.value) return
  const state = stationStates[selectedStationId.value]
  if (!state) return
  if (state.runStatus === 'charging') return // 互斥
  // 弹出确认弹窗
  pendingOperation.value = 'discharge'
  showOperationConfirm.value = true
}

// 24h 时间轴样式计算
function getTimeBlockStyle(p: { start: string; end: string }) {
  const s = timeToPercent(p.start || '00:00')
  const e = timeToPercent(p.end || '00:00')
  const w = e > s ? e - s : 0
  return { left: s + '%', width: w + '%' }
}

function timeToPercent(t: string) {
  const [h, m] = t.split(':').map(Number)
  return ((h * 60 + m) / 1440) * 100
}

function confirmOperation() {
  const state = stationStates[selectedStationId.value]
  if (state) {
    state.runStatus = pendingOperation.value === 'charge' ? 'charging' : 'discharging'
  }
  showOperationConfirm.value = false
}

// === Settings区 ===
const isEditMode = ref(false)
const chargeStopSOC = ref(75)
const dischargeStopSOC = ref(30)
const autoChargeStart = ref('09:00')
const autoChargeEnd = ref('13:00')
const autoDischargeStart = ref('17:00')
const autoDischargeEnd = ref('21:00')

function handleCircleClick() {
  if (!canStop.value) return
  showStopConfirm.value = true
  showStopOverlay.value = false
}

function confirmStop() {
  const state = stationStates[selectedStationId.value]
  if (state) {
    state.runStatus = 'idle'
  }
  showStopConfirm.value = false
}

function toggleEditMode() {
  // 打开Settings弹窗 (v2风格)
  editChargeSOC.value = chargeStopSOC.value
  editDischargeSOC.value = dischargeStopSOC.value
  editChargePeriods.value = [{ start: autoChargeStart.value, end: autoChargeEnd.value }]
  editDischargePeriods.value = [{ start: autoDischargeStart.value, end: autoDischargeEnd.value }]
  showSettingsModal.value = true
}

function closeSettings() {
  savedChargePeriods.value = JSON.parse(JSON.stringify(editChargePeriods.value))
  savedDischargePeriods.value = JSON.parse(JSON.stringify(editDischargePeriods.value))
  showSettingsModal.value = false
}

function saveSettings() {
  chargeStopSOC.value = editChargeSOC.value
  dischargeStopSOC.value = editDischargeSOC.value
  if (editChargePeriods.value.length > 0) { autoChargeStart.value = editChargePeriods.value[0].start; autoChargeEnd.value = editChargePeriods.value[0].end }
  if (editDischargePeriods.value.length > 0) { autoDischargeStart.value = editDischargePeriods.value[0].start; autoDischargeEnd.value = editDischargePeriods.value[0].end }
  savedChargePeriods.value = JSON.parse(JSON.stringify(editChargePeriods.value))
  savedDischargePeriods.value = JSON.parse(JSON.stringify(editDischargePeriods.value))
  showSettingsModal.value = false
}

// 暴露已保存的时段（不是草稿editXxx）
const savedChargePeriods = ref([{ start: '09:00', end: '13:00' }])
const savedDischargePeriods = ref([{ start: '17:00', end: '21:00' }])

defineExpose({
  chargePeriods: savedChargePeriods,
  dischargePeriods: savedDischargePeriods,
})
</script>

<style scoped>
/* === 控制面板容器 === */
.control-panel {
  height: 100%;
  box-sizing: border-box;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* === Header === */

.title-status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 10px;
  vertical-align: middle;
  letter-spacing: 0.5px;
}

.title-status-badge.status-charging {
  background: rgba(0, 255, 136, 0.15);
  color: var(--color-primary);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.title-status-badge.status-standby {
  background: rgba(100, 160, 220, 0.15);
  color: #6aa4dc;
  border: 1px solid rgba(100, 160, 220, 0.3);
}

.title-status-badge.status-discharging {
  background: rgba(255, 199, 7, 0.15);
  color: #ffc107;
  border: 1px solid rgba(255, 199, 7, 0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.auto-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auto-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Toggle Switch */
.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  position: relative;
  transition: background var(--transition-fast);
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(20px);
}

/* === 电站选择器 === */
.station-select-old-unused {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--font-sans);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.station-select:focus {
  border-color: var(--border-focus);
  background-color: var(--bg-input-focus);
}

.station-select option {
  background: #1a1a1a;
  color: #fff;
}

/* === 控制中心（Charge | 电价圈 | Discharge） === */
.control-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 8px 0;
}

/* Action Buttons */
.action-btn {
  padding: 12px 28px;
  border: none;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 110px;
}

.charge-btn {
  background: var(--color-primary);
  color: #000;
  box-shadow: 0 2px 12px rgba(0, 255, 136, 0.25);
}

.charge-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.35);
  transform: translateY(-1px);
}

.discharge-btn {
  background: #ffd700;
  color: #000;
  box-shadow: 0 2px 12px rgba(255, 215, 0, 0.25);
}

.discharge-btn:hover:not(:disabled) {
  background: #ffcc00;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.35);
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* === 电价圈 === */
.price-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.price-circle.price-discharging {
  background: radial-gradient(circle, #ffd700, #e6ac00);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.15);
}

.price-circle.price-idle {
  background: radial-gradient(circle, #4FC3F7, #2196F3, #1565C0);
  box-shadow: 0 6px 32px rgba(58, 184, 255, 0.35), 0 0 60px rgba(33, 150, 243, 0.15);
  border: 1px solid rgba(79, 195, 247, 0.3);
}

.price-circle.price-charging {
  background: radial-gradient(circle, #00cc6a, #00ff88);
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.4), 0 0 60px rgba(0, 255, 136, 0.15);
}

.price-value {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  font-family: var(--font-mono);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.price-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
  text-align: center;
  line-height: 1.2;
}

/* === 电池SOC === */
.battery-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.battery-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 32px;
  font-family: var(--font-mono);
}

.battery-container {
  display: flex;
  align-items: center;
  flex: 1;
}

.battery-body {
  width: 100%;
  max-width: 100px;
  height: 26px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.battery-row { max-width: 180px; }

.battery-fill {
  height: 100%;
  border-radius: 4px;
  transition: width var(--transition-normal), background var(--transition-normal);
}

.battery-fill.soc-high {
  background: linear-gradient(90deg, var(--color-primary), #00cc6a);
}

.battery-fill.soc-mid {
  background: linear-gradient(90deg, #ffd700, #ffaa00);
}

.battery-fill.soc-low {
  background: linear-gradient(90deg, #ff4757, #ff6b6b);
}

.battery-tick {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: rgba(255, 255, 255, 0.15);
}

.battery-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  font-family: var(--font-mono);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.battery-terminal {
  width: 6px;
  height: 14px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 0 3px 3px 0;
  margin-left: 2px;
  flex-shrink: 0;
}

/* Status Badge */
.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-charging {
  background: rgba(0, 255, 136, 0.15);
  color: var(--color-primary);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.status-discharging {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-idle {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* === 策略区 === */
.strategy-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border-default);
}

.strategy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.strategy-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.strategy-select {
  padding: 6px 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--font-sans);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 24px;
}

.strategy-select:focus {
  border-color: var(--border-focus);
}

.strategy-select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.strategy-select option {
  background: #1a1a1a;
  color: #fff;
}

.strategy-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

/* === 响应式 === */
@media (max-width: 768px) {
  .control-center {
    flex-direction: column;
    gap: 16px;
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
  }

  .price-circle {
    width: 120px;
    height: 120px;
  }

  .price-value {
    font-size: 18px;
  }

  .battery-body {
    max-width: 150px;
  }
}

/* === Settings区 === */
.settings-section {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--border-default);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settings-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.settings-edit-btn {
  padding: 4px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.settings-edit-btn:hover {
  background: var(--color-primary-dim);
  border-color: var(--color-primary);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.settings-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.settings-value-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}

.settings-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.settings-input {
  width: 64px;
  padding: 4px 8px;
  background: var(--bg-input);
  border: 1px solid var(--border-focus);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--font-mono);
  outline: none;
  text-align: center;
}

.settings-input.time-input {
  width: 88px;
}

.time-separator {
  color: var(--text-secondary);
  font-size: 13px;
  margin: 0 2px;
}

.settings-time-bar {
  display: inline-block;
  padding: 3px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.charge-time-bar {
  background: rgba(0, 255, 136, 0.12);
  color: var(--color-primary);
  border: 1px solid rgba(0, 255, 136, 0.25);
}

.discharge-time-bar {
  background: rgba(255, 215, 0, 0.12);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.25);
}
/* === 选择器置顶 === */
.station-control-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.station-select-top {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300ff88' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.station-select-top:focus {
  outline: none;
  border-color: var(--color-primary);
}

.station-select-top option {
  background: #1a1f2e;
  color: #fff;
}

/* === STOP遮罩 === */
.price-circle-wrap {
  position: relative;
  cursor: default;
}

.stop-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.stop-text {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 4px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* === STOP确认弹窗 === */
.stop-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.stop-confirm-modal {
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 360px;
  width: 90%;
}

.stop-confirm-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.stop-confirm-modal h3 {
  color: #ff4757;
  font-size: 18px;
  margin: 0 0 8px 0;
}

.stop-confirm-modal p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0 0 24px 0;
}

.stop-confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel {
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}

.btn-confirm-stop {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: var(--color-primary);
  color: #1a1f2e;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-confirm-stop:hover {
  background: #ee3344;
}

/* === 操作确认弹窗 (v2 style 2x2 grid) === */
.op-confirm-modal {
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 28px 32px;
  max-width: 440px;
  width: 90%;
}

.op-confirm-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.op-confirm-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.op-confirm-icon-wrap.charge {
  background: linear-gradient(145deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05));
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.15);
}

.op-confirm-icon-wrap.discharge {
  background: linear-gradient(145deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05));
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.15);
}

.op-confirm-title {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.op-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}

.op-info-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px 16px;
}

.op-card-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 6px;
}

.op-card-value {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.op-card-value.charge {
  color: var(--color-primary);
}

.op-card-value.discharge {
  color: #ffc107;
}

.op-confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-confirm-op {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  color: #1a1f2e;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-confirm-op.btn-charge {
  background: var(--color-primary);
}

.btn-confirm-op.btn-charge:hover {
  background: #00cc6a;
}

.btn-confirm-op.btn-discharge {
  background: #ffc107;
  color: #1a1f2e;
}

.btn-confirm-op.btn-discharge:hover {
  background: #e6ac00;
}

/* === Cost 成本显示 (v2风格) === */
.cost-section {
  text-align: center;
  padding: 4px 0 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.cost-value {
  color: var(--color-primary);
  font-weight: 600;
  margin-left: 6px;
}

/* === Settings v2布局 === */


.auto-schedule-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.schedule-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 14px;
}

.charge-schedule {
  border-color: rgba(0, 255, 136, 0.25);
}

.discharge-schedule {
  border-color: rgba(255, 193, 7, 0.25);
}

.schedule-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.schedule-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.schedule-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.schedule-icon {
  font-size: 14px;
}

.schedule-time {
  font-size: 13px;
  font-weight: 700;
}

.charge-schedule .schedule-time {
  color: var(--color-primary);
}

.discharge-schedule .schedule-time {
  color: #ffc107;
}

/* === Settings参数纯文字 === */
.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}

.param-line {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
}

.param-line .param-label {
  color: rgba(255, 255, 255, 0.5);
}

.param-line .charge-val {
  color: var(--color-primary);
  font-weight: 700;
}

.param-line .discharge-val {
  color: #ffc107;
  font-weight: 700;
}


/* === Auto时段卡片 === */
.auto-schedule-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 6px;
}

.schedule-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.schedule-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.schedule-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.schedule-icon { font-size: 14px; }

.schedule-time { font-size: 13px; font-weight: 700; }
.charge-schedule .schedule-time { color: var(--color-primary); }
.discharge-schedule .schedule-time { color: #ffc107; }

</style>
<style>

/* === Settings Modal (v2风格) === */
.settings-modal {
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 28px 32px;
  max-width: 680px;
  width: 92%;
  max-height: 85vh;
  overflow-y: auto;
}

.settings-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.settings-modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.settings-station-tag {
  background: rgba(0, 255, 136, 0.12);
  color: var(--color-primary);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.settings-close-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.settings-close-btn:hover { color: #fff; }

.settings-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.settings-section-title {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.settings-hint {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 14px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.soc-settings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.soc-setting-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.soc-setting-label { font-size: 13px; font-weight: 600; }
.charge-label { color: var(--color-primary); }
.discharge-label { color: #ffc107; }

.soc-slider-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.soc-slider {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  outline: none;
}

.charge-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
  margin-top: -5px;
}

.discharge-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: #ffc107;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
  margin-top: -5px;
}

.soc-input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.soc-number-input {
  width: 52px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #fff;
  padding: 6px 8px;
  font-size: 14px;
  text-align: center;
}

.time-settings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.time-setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-setting-label { font-size: 13px; font-weight: 600; }

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-input-field {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  padding: 8px 12px;
  font-size: 14px;
  flex: 1;
  color-scheme: dark;
}
.time-input-field::-webkit-calendar-picker-indicator {
  filter: invert(0.6) brightness(1.2);
}

.time-dash {
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
}

.settings-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-save-settings {

  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: var(--color-primary);
  color: #1a1f2e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save-settings:hover { background: #00cc6a; }


/* === 24h Timeline Bar === */
.timeline-bar {
  margin-bottom: 20px;
}

.timeline-track {
  position: relative;
  height: 24px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  margin-bottom: 4px;
}

.timeline-charge-block {
  position: absolute;
  top: 2px;
  height: 20px;
  background: linear-gradient(90deg, rgba(0, 255, 136, 0.3), rgba(0, 255, 136, 0.5));
  border: 1px solid rgba(0, 255, 136, 0.6);
  border-radius: 3px;
}

.timeline-discharge-block {
  position: absolute;
  top: 2px;
  height: 20px;
  background: linear-gradient(90deg, rgba(255, 193, 7, 0.3), rgba(255, 193, 7, 0.5));
  border: 1px solid rgba(255, 193, 7, 0.6);
  border-radius: 3px;
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
}

/* === SOC Header Row (label left, input right) === */
.soc-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* SOC Slider 绿/黄填充 (v2 parity) */
.soc-slider.charge-slider {
  accent-color: #00ff88;
}
.soc-slider.charge-slider::-webkit-slider-thumb {
  background: #00ff88;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 255, 136, 0.4);
  margin-top: -5px;
}
.soc-slider.charge-slider::-webkit-slider-runnable-track {
  background: linear-gradient(to right, #00ff88 0%, #00ff88 var(--val, 75%), rgba(255,255,255,0.1) var(--val, 75%));
  border-radius: 9999px;
  height: 8px;
}
.soc-slider.discharge-slider {
  accent-color: #ffc107;
}
.soc-slider.discharge-slider::-webkit-slider-thumb {
  background: #ffc107;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(255, 193, 7, 0.4);
  margin-top: -5px;
}
.soc-slider.discharge-slider::-webkit-slider-runnable-track {
  background: linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) var(--val, 30%), #ffc107 var(--val, 30%), #ffc107 100%);
  border-radius: 9999px;
  height: 8px;
}

.soc-slider.full-width {
  width: 100%;
}

.soc-number-input.charge-input {
  border-color: rgba(0, 255, 136, 0.3);
}

.soc-number-input.discharge-input {
  border-color: rgba(255, 193, 7, 0.3);
}


/* === 所有Teleport弹窗CSS (非scoped) === */
.stop-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.stop-confirm-modal {
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 28px 32px;
  text-align: center;
  max-width: 360px;
  width: 90%;
}

.stop-confirm-icon { font-size: 40px; margin-bottom: 12px; }
.stop-confirm-modal h3 { color: #ff3b30; font-size: 18px; margin: 0 0 8px; }
.stop-confirm-modal p { color: rgba(255,255,255,0.5); font-size: 13px; margin: 0 0 20px; }

.stop-confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel:hover { background: rgba(255, 255, 255, 0.12); }

.btn-confirm-stop {
  padding: 10px 24px;
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  color: #1a1f2e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm-stop:hover { background: #00cc6a; }

/* 操作确认弹窗 */
.op-confirm-modal {
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 28px 32px;
  max-width: 440px;
  width: 90%;
}

.op-confirm-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.op-confirm-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.op-confirm-icon-wrap.charge {
  background: linear-gradient(145deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05));
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.15);
}

.op-confirm-icon-wrap.discharge {
  background: linear-gradient(145deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05));
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.15);
}

.op-confirm-title {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.op-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}

.op-info-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px 16px;
}

.op-card-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 6px;
}

.op-card-value {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.op-card-value.charge { color: var(--color-primary); }
.op-card-value.discharge { color: #ffc107; }

.op-confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-confirm-op {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  color: #1a1f2e;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  background: var(--color-primary);
}

.btn-confirm-op:hover {
  background: #00cc6a;
}

.btn-confirm-op.charge,
.btn-confirm-op.btn-charge {
  background: var(--color-primary);
  color: #1a1f2e;
}

.btn-confirm-op.charge:hover,
.btn-confirm-op.btn-charge:hover {
  background: #00cc6a;
}

.btn-confirm-op.discharge,
.btn-confirm-op.btn-discharge {
  background: #ffc107;
  color: #1a1f2e;
}

.btn-confirm-op.discharge:hover,
.btn-confirm-op.btn-discharge:hover {
  background: #e6ac00;
}

/* fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


/* === Auto开启确认弹窗 (v2 style) === */
.auto-confirm-modal {
  background: linear-gradient(145deg, #1e1e2e 0%, #252535 100%);
  border-radius: 16px;
  width: 520px;
  max-width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.auto-confirm-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.auto-confirm-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #fff;
}

.auto-confirm-header p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0;
}

.auto-confirm-body {
  padding: 20px 24px;
}

.auto-conditions-grid {
  align-items: stretch;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.condition-card {
  border-radius: 12px;
  padding: 14px;
}

.condition-card.charge-condition {
  background: rgba(0, 255, 136, 0.04);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.condition-card.discharge-condition {
  background: rgba(255, 193, 7, 0.04);
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.condition-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}

.charge-condition .condition-title { color: #00ff88; }
.discharge-condition .condition-title { color: #ffc107; }

.condition-slot {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.charge-condition .condition-slot { border-left: 3px solid #00ff88; }
.discharge-condition .condition-slot { border-left: 3px solid #ffc107; }

.slot-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.slot-value {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.condition-soc {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 8px;
  padding-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.condition-soc .soc-val {
  font-weight: 700;
  font-size: 14px;
}

.condition-soc .charge-val { color: #00ff88; }
.condition-soc .discharge-val { color: #ffc107; }

.auto-confirm-hint {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.auto-confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-edit-settings {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-edit-settings:hover {
  background: rgba(255, 255, 255, 0.12);
}


/* === 多时段增删 === */
.time-setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.add-period-btn {
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.add-period-btn.charge-add {
  border-color: rgba(0, 255, 136, 0.4);
  color: #00ff88;
}

.add-period-btn.discharge-add {
  border-color: rgba(255, 193, 7, 0.4);
  color: #ffc107;
}

.period-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.del-period-btn {
  background: transparent;
  border: none;
  color: #ff6b6b;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
}

.del-period-btn:hover {
  background: rgba(255, 107, 107, 0.1);
}

</style>