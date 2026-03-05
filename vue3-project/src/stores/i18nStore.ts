import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Locale = 'en' | 'zh'

// 翻译字典 — 覆盖所有已有的中文字符串
const messages: Record<string, Record<Locale, string>> = {
  // Dashboard 指标卡片
  totalCapacity: { en: 'Total Capacity', zh: '总容量' },
  realTimePower: { en: 'Real-time Power', zh: '实时总功率' },
  todayRevenue: { en: 'Today Revenue', zh: '今日收益' },
  avgSpotPrice: { en: 'Avg Spot Price', zh: '平均现货电价' },
  activeAlerts: { en: 'Active Alerts', zh: '活跃告警' },

  // 电站概览
  stationOverview: { en: 'Station Overview', zh: '电站概览' },
  online: { en: 'Online', zh: '在线' },
  offline: { en: 'Offline', zh: '离线' },

  // 电站卡片
  soc: { en: 'SOC', zh: 'SOC' },
  power: { en: 'Power', zh: '功率' },
  capacity: { en: 'Capacity', zh: '容量' },
  todayProfit: { en: 'Today Profit', zh: '今日收益' },

  // 状态标签
  charging: { en: 'Charging', zh: '充电中' },
  discharging: { en: 'Discharging', zh: '放电中' },
  idle: { en: 'Idle', zh: '待机' },

  // 运行模式
  fcasResponse: { en: 'FCAS Response', zh: 'FCAS响应' },
  arbitrage: { en: 'Arbitrage', zh: '套利模式' },
  vppDispatch: { en: 'VPP Dispatch', zh: 'VPP调度' },
  standby: { en: 'Standby', zh: '备用待命' },
  maintenance: { en: 'Maintenance', zh: '维护模式' },

  // Operator 指标卡片
  todayCharge: { en: 'Today Charge', zh: '今日充电' },
  todayDischarge: { en: 'Today Discharge', zh: '今日放电' },
  netProfit: { en: 'Net Profit', zh: '净利润' },
  cost: { en: 'Cost', zh: '成本' },
  revenue: { en: 'Revenue', zh: '收入' },
  vsYesterday: { en: 'vs Yesterday', zh: '较昨日' },

  // Operator 图表标题
  marketOverview: { en: 'Market Overview — Price & Demand (24h)', zh: '市场概览 — 电价与需求 (24h)' },
  bessOperations: { en: 'BESS Operations — Power & Profit (24h)', zh: 'BESS运营 — 充放电与收益 (24h)' },

  // 图表 legend
  historicalPrice: { en: 'Historical Price', zh: '历史价格' },
  predictedPrice: { en: 'Predicted Price', zh: '预测价格' },
  demand: { en: 'Demand', zh: '需求' },
  predictedDemand: { en: 'Predicted Demand', zh: '预测需求' },
  chargeMWh: { en: 'Charge (MWh)', zh: '充电 (MWh)' },
  dischargeMWh: { en: 'Discharge (MWh)', zh: '放电 (MWh)' },
  chargeCost: { en: 'Charge Cost ($)', zh: '充电成本 ($)' },
  dischargeRevenue: { en: 'Discharge Revenue ($)', zh: '放电收入 ($)' },
  netProfitDollar: { en: 'Net Profit ($)', zh: '净利润 ($)' },

  // 图表轴标签
  priceMWh: { en: 'Price ($/MWh)', zh: '电价 ($/MWh)' },
  demandMW: { en: 'Demand (MW)', zh: '需求 (MW)' },

  // 图表占位
  chartsPlaceholder: { en: 'Charts Area - Phase 3', zh: '图表区域 - Phase 3' },

  // 角色

  // Navigation menu
  navOverview: { en: 'Overview', zh: '概览' },
  navStation: { en: 'Station', zh: '电站' },
  navFaultAlarm: { en: 'Fault Alarm', zh: '故障告警' },
  navClients: { en: 'Clients', zh: '客户' },
  navReports: { en: 'Reports', zh: '报表' },
  navLogs: { en: 'Logs', zh: '日志' },

  owner: { en: 'Owner', zh: '业主' },
  operator: { en: 'Operator', zh: '运维方' },

  // Station Control Panel
  stationManagement: { en: 'Station Management', zh: '电站管理' },
  auto: { en: 'Auto', zh: '自动' },
  manual: { en: 'Manual', zh: '手动' },
  charge: { en: 'Charge', zh: '充电' },
  discharge: { en: 'Discharge', zh: '放电' },
  spotPriceLabel: { en: 'Spot Price ($/MWh)', zh: '现货价格 ($/MWh)' },
  strategy: { en: 'Strategy', zh: '策略' },
  runMode: { en: 'Run Mode', zh: '运行模式' },
  stop: { en: 'STOP', zh: '停止' },

  // Settings section
  edit: { en: 'Edit', zh: '编辑' },
  save: { en: 'Save', zh: '保存' },
  chargeStopSOC: { en: 'Charge Stop SOC', zh: '充电截止SOC' },
  dischargeStopSOC: { en: 'Discharge Stop SOC', zh: '放电截止SOC' },
  autoCharge: { en: 'Auto Charge', zh: '自动充电' },
  autoDischarge: { en: 'Auto Discharge', zh: '自动放电' },

  // Market tabs
  market: { en: 'Market', zh: '行情' },
  autoPreview: { en: 'Auto Preview', zh: '自动预览' },
  comingSoon: { en: 'Coming Soon', zh: '即将上线' },
  estChargeCost: { en: 'Est. Charge Cost', zh: '预计充电成本' },
  estSellRevenue: { en: 'Est. Sell Revenue', zh: '预计卖电收益' },
  estNetProfit: { en: 'Est. Net Profit', zh: '预计净利润' },
  aiPredictedPrice: { en: 'AI Predicted Price', zh: 'AI预测价格' },
  chargeWindow: { en: 'Charge Window', zh: '充电窗口' },
  dischargeWindow: { en: 'Discharge Window', zh: '放电窗口' },

  // Market metric cards
  currentSpotPrice: { en: 'Current Spot Price', zh: '当前现货价格' },
  currentDemand: { en: 'Current Demand', zh: '当前需求' },
  forecastPrice: { en: 'Forecast Price', zh: '预测价格' },
  forecastDemand: { en: 'Forecast Demand', zh: '预测需求' },
  next30min: { en: 'NEXT 30MIN', zh: '未来30分钟' },

  // Power & Profit section
  powerAndProfit: { en: 'Power & Profit', zh: '电量与收益' },
  day: { en: 'Day', zh: '日' },
  month: { en: 'Month', zh: '月' },
  year: { en: 'Year', zh: '年' },
  cumulative: { en: 'Cumulative', zh: '累计' },

  // Power & Profit period-specific metric titles
  monthlyCharge: { en: 'Monthly Charge', zh: '本月充电' },
  monthlyDischarge: { en: 'Monthly Discharge', zh: '本月放电' },
  annualCharge: { en: 'Annual Charge', zh: '年度充电' },
  annualDischarge: { en: 'Annual Discharge', zh: '年度放电' },
  totalCharge: { en: 'Total Charge', zh: '累计充电' },
  totalDischarge: { en: 'Total Discharge', zh: '累计放电' },
  vsLastMonth: { en: 'vs Last Month', zh: '较上月' },
  vsLastYear: { en: 'vs Last Year', zh: '较去年' },

  // Header UI
  operationType: { en: 'Operation Type', zh: '操作类型' },
  estChargeTime: { en: 'Est. Full Charge Time', zh: '预计充满时间' },
  estDischargeTime: { en: 'Est. Full Discharge Time', zh: '预计放完时间' },
  estCost: { en: 'Est. Cost', zh: '预计成本' },
  estRevenue: { en: 'Est. Revenue', zh: '预计收益' },
  conflictTitle: { en: 'Cannot Switch to Auto', zh: '无法切换自动模式' },
  conflictMsg: { en: 'Please stop manual dispatch first before enabling Auto mode.', zh: '请先停止手动调度再开启自动模式。' },
  switchToManual: { en: 'Switch to Manual Mode', zh: '切换至手动模式' },
  autoOffMsg: { en: 'The station is currently running. Please stop the operation first before switching modes.', zh: '电站当前正在运行中，请先停止，再进行模式切换。' },
  confirmSwitch: { en: 'Switch to Manual', zh: '切换手动' },
  chargeStopSOCLabel: { en: 'Charge Stop SOC', zh: '充电停止SOC' },
  dischargeStopSOCLabel: { en: 'Discharge Stop SOC', zh: '放电停止SOC' },
  autoChargeLabel: { en: 'Auto Charge', zh: '自动充电条件' },
  autoDischargeLabel: { en: 'Auto Discharge', zh: '自动放电条件' },
  settingsTitle: { en: 'Settings', zh: '设置' },
  confirmAutoMode: { en: 'Confirm Enable Auto Mode', zh: '确认启用自动模式' },
  confirmAutoModeDesc: { en: 'System will auto charge/discharge based on the conditions below', zh: '系统将根据以下条件自动执行充放电操作' },
  chargeConditions: { en: 'Charge Conditions', zh: '充电条件' },
  dischargeConditions: { en: 'Discharge Conditions', zh: '放电条件' },
  timeSlot: { en: 'Time slot', zh: '时间段' },
  chargeToSOC: { en: 'Charge to SOC:', zh: '充电至 SOC：' },
  dischargeToSOC: { en: 'Discharge to SOC:', zh: '放电至 SOC：' },
  autoHint: { en: "To modify conditions, click Edit Settings", zh: "如需修改条件，请点击编辑设置按钮" },
  editSettings: { en: 'Edit Settings', zh: '编辑设置' },
  confirmEnable: { en: 'Confirm Enable', zh: '确认启用' },
  confirmDisableAuto: { en: 'Disable Auto Mode', zh: '关闭自动模式' },
  confirmDisableAutoDesc: { en: 'Are you sure you want to disable auto mode? The system will stop auto charge/discharge operations.', zh: '确认关闭自动模式？系统将停止自动充放电操作。' },
  confirmDisable: { en: 'Confirm Disable', zh: '确认关闭' },
  saveSettings: { en: 'Save Settings', zh: '保存设置' },
  socSettings: { en: 'SOC Settings', zh: 'SOC 设置' },
  timeConditionSettings: { en: 'Time Condition Settings', zh: '分时段策略' },
  settingsHint: { en: 'Set charge and discharge time windows. Periods cannot overlap — conflicts are detected automatically.', zh: '设置充电和放电的执行时间段。充电时间与放电时间不能重叠，保存时将自动检测冲突。' },
  add: { en: 'Add', zh: '添加' },
  confirmCharge: { en: 'Confirm Charge Operation', zh: '确认充电操作' },
  confirmDischarge: { en: 'Confirm Discharge Operation', zh: '确认放电操作' },
  chargeWarning: { en: 'Will start charging from grid. This will consume grid power.', zh: '即将开始从电网充电，此操作将消耗电网电力。' },
  dischargeWarning: { en: 'Will start discharging to grid for revenue.', zh: '即将向电网放电以获取收益。' },
  startCharge: { en: 'Start Charge', zh: '开始充电' },
  startDischarge: { en: 'Start Discharge', zh: '开始放电' },
  station: { en: 'Station', zh: '电站' },
  confirmStop: { en: 'Confirm Stop', zh: '确认停止' },
  confirmStopDesc: { en: 'Are you sure you want to stop the current operation?', zh: '确定要停止当前操作吗？' },
  confirmStopBtn: { en: 'Stop Now', zh: '立即停止' },
  cancel: { en: 'Cancel', zh: '取消' },
  settings: { en: 'Settings', zh: '设置' },
  logout: { en: 'Logout', zh: '退出' },
  confirmLogout: { en: 'Confirm Logout', zh: '确认退出' },
  confirmLogoutMsg: { en: 'Are you sure you want to logout?', zh: '您确定要退出系统吗？' },
  cancel: { en: 'Cancel', zh: '取消' },
  confirmBtn: { en: 'Confirm', zh: '确认退出' },

  // Station View (Phase 6)
  stations: { en: 'Stations', zh: '电站列表' },
  table: { en: 'Table', zh: '表格' },
  card: { en: 'Card', zh: '卡片' },
  searchStation: { en: 'Search station name...', zh: '搜索电站名称...' },
  allRegions: { en: 'All Regions', zh: '全部区域' },
  allStatus: { en: 'All Status', zh: '全部状态' },
  search: { en: 'Search', zh: '搜索' },
  reset: { en: 'Reset', zh: '重置' },
  stationName: { en: 'Station Name', zh: '电站名称' },
  capacityMW: { en: 'Capacity (MW)', zh: '容量 (MW)' },
  region: { en: 'Region', zh: '区域' },
  status: { en: 'Status', zh: '状态' },
  powerMW: { en: 'Power (MW)', zh: '功率 (MW)' },
  todayNetProfit: { en: 'Today Net Profit', zh: '今日净收益' },
  totalNetProfit: { en: 'Total Net Profit', zh: '累计净收益' },
  actions: { en: 'Actions', zh: '操作' },
  // Fault Alarm page (Phase 6B)
  faultAlarm: { en: 'Fault Alarm', zh: '故障告警' },
  alarmTime: { en: 'Alarm Time', zh: '告警时间' },
  alarmStation: { en: 'Alarm Station', zh: '告警电站' },
  alarmDevice: { en: 'Alarm Device', zh: '告警设备' },
  description: { en: 'Description', zh: '描述' },
  alarmLevel: { en: 'Alarm Level', zh: '告警级别' },
  alarmStatus: { en: 'Alarm Status', zh: '告警状态' },
  recoveryTime: { en: 'Recovery Time', zh: '恢复时间' },
  fault: { en: 'Fault', zh: '故障' },
  alarm: { en: 'Alarm', zh: '告警' },
  warning: { en: 'Warning', zh: '警告' },
  unprocessed: { en: 'Unprocessed', zh: '未处理' },
  processed: { en: 'Processed', zh: '已处理' },
  resolve: { en: 'Resolve', zh: '处理' },
  detail: { en: 'Detail', zh: '详情' },
  alarmDetail: { en: 'Alarm Detail', zh: '告警详情' },
  batchProcess: { en: 'Batch Process', zh: '批量处理' },
  export: { en: 'Export', zh: '导出' },
  selectAll: { en: 'Select All', zh: '全选' },
  allStations: { en: 'All Stations', zh: '全部电站' },
  allAlarmLevel: { en: 'All Alarm Level', zh: '全部告警级别' },
  totalItems: { en: 'Total {n} items', zh: '共 {n} 条' },
  // Map page (Phase 7)
  navMap: { en: 'Map', zh: '地图' },
  stationMap: { en: 'Station Map', zh: '电站地图' },
  deviceCount: { en: 'Devices', zh: '设备数' },
}

// 运行模式：mock数据中的中文值 → 翻译key 的映射
const runModeKeyMap: Record<string, string> = {
  'FCAS响应': 'fcasResponse',
  '套利模式': 'arbitrage',
  'VPP调度': 'vppDispatch',
  '备用待命': 'standby',
  '维护模式': 'maintenance',
}

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref<Locale>(
    (localStorage.getItem('au-bess-locale') as Locale) || 'en'
  )

  function setLocale(l: Locale) {
    locale.value = l
    localStorage.setItem('au-bess-locale', l)
  }

  function toggleLocale() {
    setLocale(locale.value === 'en' ? 'zh' : 'en')
  }

  /** 翻译函数：key不存在则原样返回 */
  function t(key: string): string {
    const entry = messages[key]
    if (!entry) return key
    return entry[locale.value] || entry['en'] || key
  }

  /** 运行模式翻译：接收mock里的中文字符串，返回当前语言对应值 */
  function tRunMode(rawMode: string): string {
    const key = runModeKeyMap[rawMode]
    if (!key) return rawMode
    return t(key)
  }

  return { locale, setLocale, toggleLocale, t, tRunMode }
}, {
  persist: {
    key: 'au-bess-locale-v1',
    paths: ['locale'],
  },
})
