// ============================================
// AU-BESS v3 — Station Detail Mock Data
// Seeded random ensures consistent data across refreshes
// ============================================

/** Seeded PRNG based on station ID */
function makePrng(seed: number) {
  let s = seed
  return (min: number, max: number): number => {
    s = (s * 9301 + 49297) % 233280
    return +(min + (s / 233280) * (max - min)).toFixed(2)
  }
}

// === Types ===

export interface StationOverviewData {
  healthScore: number
  systemStatus: 'excellent' | 'warning' | 'abnormal'
  stationMode: 'charging' | 'discharging' | 'idle'
  currentSOC: number
  soh: number
  communication: { status: 'connected' | 'offline'; sub: string; subZh: string }
  deviceStatus: { status: 'normal' | 'fault'; sub: string; subZh: string; faultCount: number }
  batteryHealth: { status: 'healthy' | 'degraded'; soh: number }
  temperature: { status: 'normal' | 'high'; value: number }
  weather: { condition: string; conditionZh: string; temp: number; icon: string }
  devices: Array<{
    name: string
    nameZh: string
    icon: string
    status: 'normal' | 'fault'
  }>
}

export interface RunningDataValues {
  bess: {
    realtimePower: number
    soc: number
    soh: number
    dcVoltage: number
    dcCurrent: number
    batteryTemp: number
    cycleCount: number
    dailyCharge: number
    dailyDischarge: number
  }
  pcs: {
    status: string
    statusZh: string
    acVoltage: number
    acCurrent: number
    frequency: number
    powerFactor: number
    conversionEfficiency: number
    inverterTemp: number
  }
  bms: {
    status: string
    statusZh: string
    maxCellVoltage: number
    minCellVoltage: number
    maxCellTemp: number
    minCellTemp: number
    insulationResistance: number
  }
  thermal: {
    coolingMode: string
    coolingModeZh: string
    coolantTemp: number
    fanSpeed: number
    ambientTemp: number
  }
  grid: {
    exchangePower: number
    frequency: number
    acVoltage: number
    powerFactor: number
    dailyExport: number
    dailyImport: number
  }
  system: {
    runMode: string
    connection: string
    connectionZh: string
    alarmCount: number
  }
}

export interface DispatchRecord {
  date: string
  hasDispatch: boolean
  charge: number
  discharge: number
}

export interface ProfitData {
  labels: string[]
  charge: number[]
  discharge: number[]
  buyPrice: number[]
  sellPrice: number[]
}

// === Generators ===

export function getStationOverview(id: string, soc: number, power: number, commStatus: string, runStatus: string): StationOverviewData {
  const idNum = parseInt(id.replace(/\D/g, '')) || 1

  const temperature = +(25 + (idNum % 9) + 0.4 * (idNum % 5)).toFixed(1)
  const tempHigh = temperature > 32
  const isOffline = commStatus === 'offline'
  const soh = +(92 + (idNum % 7) + 0.1 * (idNum % 5)).toFixed(1)

  const devices: StationOverviewData['devices'] = [
    { name: 'BMS', nameZh: 'BMS', icon: '🔋', status: isOffline ? 'fault' : 'normal' },
    { name: 'PCS', nameZh: 'PCS', icon: '⚡', status: isOffline ? 'fault' : 'normal' },
    { name: 'EMS', nameZh: 'EMS', icon: '🖥️', status: 'normal' },
    { name: 'Transformer', nameZh: '变压器', icon: '🔌', status: 'normal' },
    { name: 'HVAC', nameZh: 'HVAC', icon: '❄️', status: tempHigh ? 'fault' : 'normal' },
    { name: 'Fire Suppression', nameZh: '消防系统', icon: '🧯', status: 'normal' },
    { name: 'Smart Meter', nameZh: '智能电表', icon: '📊', status: 'normal' },
    { name: 'AC Distribution', nameZh: '交流配电', icon: '🔧', status: 'normal' },
    { name: 'Comm Gateway', nameZh: '通信网关', icon: '📡', status: 'normal' },
  ]

  const faultCount = devices.filter(d => d.status === 'fault').length
  const hasError = faultCount > 0
  const healthScore = hasError
    ? Math.round(devices.filter(d => d.status === 'normal').length / devices.length * 100)
    : +(97 + (idNum % 3) + 0.1 * (idNum % 5)).toFixed(1)

  const weathers = [
    { icon: '☀️', condition: 'Sunny', conditionZh: '晴朗' },
    { icon: '⛅', condition: 'Partly Cloudy', conditionZh: '多云间晴' },
    { icon: '🌤️', condition: 'Mostly Sunny', conditionZh: '局部晴天' },
    { icon: '🌥️', condition: 'Overcast', conditionZh: '阴天' },
    { icon: '🌦️', condition: 'Light Showers', conditionZh: '间歇小雨' },
  ]
  const weather = weathers[idNum % weathers.length]
  const offlineHours = ((idNum * 7) % 23) + 1

  return {
    healthScore,
    systemStatus: hasError ? 'abnormal' : (tempHigh ? 'warning' : 'excellent'),
    stationMode: runStatus as 'charging' | 'discharging' | 'idle',
    currentSOC: soc,
    soh,
    communication: {
      status: commStatus === 'online' ? 'connected' : 'offline',
      sub: commStatus === 'online' ? 'Connection stable' : `Offline for ${offlineHours}h`,
      subZh: commStatus === 'online' ? '实时通讯正常' : `已离线 ${offlineHours} 小时`,
    },
    deviceStatus: {
      status: faultCount > 0 ? 'fault' : 'normal',
      sub: faultCount > 0 ? `${faultCount} device(s) fault` : 'All devices normal',
      subZh: faultCount > 0 ? `${faultCount} 台设备故障` : '所有设备运行正常',
      faultCount,
    },
    batteryHealth: { status: soh >= 85 ? 'healthy' : 'degraded', soh },
    temperature: { status: tempHigh ? 'high' : 'normal', value: temperature },
    weather: { ...weather, temp: temperature },
    devices,
  }
}

export function getStationRunningData(id: string, power: number, soc: number, commStatus: string, runMode: string): RunningDataValues {
  const idNum = parseInt(id.replace(/\D/g, '')) || 1
  const isOffline = commStatus !== 'online'
  const pw = power || 0

  const dcV = 750 + (idNum * 17 % 100)
  const dcI = pw !== 0 ? +((Math.abs(pw) * 1000 / dcV)).toFixed(2) : 0
  const battTemp = +(28 + (idNum * 3 % 8)).toFixed(1)
  const soh = +(92 + (idNum % 7) + 0.1 * (idNum % 5)).toFixed(1)
  const cycles = 365 + (idNum * 23 % 800)
  const dailyCharge = pw > 0 ? +((pw * (6 + idNum % 4))).toFixed(1) : +((idNum * 7 % 30) + 5).toFixed(1)
  const dailyDischarge = pw < 0 ? +((Math.abs(pw) * (6 + idNum % 4))).toFixed(1) : +((idNum * 11 % 40) + 10).toFixed(1)
  const freq = +(49.95 + (idNum * 3 % 10) / 100).toFixed(2)
  const acV = +(33.0 + (idNum * 7 % 10) / 10).toFixed(1)
  const pf = +(0.97 + (idNum % 3) * 0.01).toFixed(2)
  const alarmCount = idNum * 3 % 5
  const pcsEff = +(96.5 + (idNum % 5) * 0.3).toFixed(1)
  const pcsTemp = +(42 + (idNum * 3 % 15)).toFixed(1)
  const acI = pw !== 0 ? +((Math.abs(pw) * 1000 / (Math.sqrt(3) * acV))).toFixed(1) : 0
  const maxCellV = +(3.62 + (idNum * 7 % 30) / 1000).toFixed(3)
  const minCellV = +(3.58 - (idNum * 3 % 20) / 1000).toFixed(3)
  const maxCellT = +(32 + (idNum * 5 % 8)).toFixed(1)
  const minCellT = +(26 - (idNum * 3 % 5)).toFixed(1)
  const insulation = 500 + (idNum * 37 % 300)
  const coolantT = +(28 + (idNum * 5 % 10)).toFixed(1)
  const fanRpm = pw !== 0 ? (1200 + (idNum * 47 % 800)) : (300 + (idNum * 13 % 200))
  const envT = +(22 + (idNum * 3 % 12)).toFixed(1)

  return {
    bess: {
      realtimePower: pw, soc, soh,
      dcVoltage: isOffline ? 0 : dcV,
      dcCurrent: isOffline ? 0 : dcI,
      batteryTemp: isOffline ? 0 : battTemp,
      cycleCount: isOffline ? 0 : cycles,
      dailyCharge: isOffline ? 0 : dailyCharge,
      dailyDischarge: isOffline ? 0 : dailyDischarge,
    },
    pcs: {
      status: isOffline ? 'Offline' : pw !== 0 ? 'Running' : 'Standby',
      statusZh: isOffline ? '离线' : pw !== 0 ? '运行中' : '待机',
      acVoltage: isOffline ? 0 : acV,
      acCurrent: isOffline ? 0 : acI,
      frequency: isOffline ? 0 : freq,
      powerFactor: isOffline ? 0 : pf,
      conversionEfficiency: isOffline ? 0 : pcsEff,
      inverterTemp: isOffline ? 0 : pcsTemp,
    },
    bms: {
      status: isOffline ? 'Offline' : 'Normal',
      statusZh: isOffline ? '离线' : '正常',
      maxCellVoltage: isOffline ? 0 : maxCellV,
      minCellVoltage: isOffline ? 0 : minCellV,
      maxCellTemp: isOffline ? 0 : maxCellT,
      minCellTemp: isOffline ? 0 : minCellT,
      insulationResistance: isOffline ? 0 : insulation,
    },
    thermal: {
      coolingMode: pw !== 0 ? 'Active Cooling' : 'Natural Conv.',
      coolingModeZh: pw !== 0 ? '主动冷却' : '自然对流',
      coolantTemp: isOffline ? 0 : coolantT,
      fanSpeed: isOffline ? 0 : fanRpm,
      ambientTemp: isOffline ? 0 : envT,
    },
    grid: {
      exchangePower: pw,
      frequency: isOffline ? 0 : freq,
      acVoltage: isOffline ? 0 : acV,
      powerFactor: isOffline ? 0 : pf,
      dailyExport: isOffline ? 0 : dailyDischarge,
      dailyImport: isOffline ? 0 : dailyCharge,
    },
    system: {
      runMode,
      connection: commStatus === 'online' ? 'Online' : 'Offline',
      connectionZh: commStatus === 'online' ? '● 在线' : '○ 离线',
      alarmCount,
    },
  }
}

export function getStationHistorical(id: string, capacity: number): { labels: string[]; soc: number[]; power: number[] } {
  const idNum = parseInt(id.replace(/\D/g, '')) || 1
  const seed = idNum * 31 + 7
  const rnd = makePrng(seed)
  const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v))

  const labels: string[] = []
  const soc: number[] = []
  const power: number[] = []
  let s = rnd(25, 60)

  for (let h = 0; h < 24; h++) {
    labels.push(String(h).padStart(2, '0') + ':00')
    const p = rnd(-capacity * 0.7, capacity * 0.7)
    power.push(+p.toFixed(1))
    s = clamp(s + (p / capacity) * 13, 5, 95)
    soc.push(+s.toFixed(1))
  }

  return { labels, soc, power }
}

export function getStationEnergyData(id: string, capacity: number, period: string): {
  labels: string[]; charge: number[]; discharge: number[]; totalCharge: number; totalDischarge: number
} {
  const idNum = parseInt(id.replace(/\D/g, '')) || 1
  const seed = idNum * 3 + period.length * 11 + 2026
  const rnd = makePrng(seed)

  const labels: string[] = []
  const charge: number[] = []
  const discharge: number[] = []

  if (period === 'day') {
    for (let h = 0; h < 24; h++) {
      labels.push(String(h).padStart(2, '0') + ':00')
      const p = rnd(-capacity * 0.7, capacity * 0.7)
      charge.push(p > 0 ? +p.toFixed(2) : 0)
      discharge.push(p < 0 ? +(-p).toFixed(2) : 0)
    }
  } else if (period === 'month') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for (let m = 0; m < 12; m++) {
      labels.push(months[m])
      charge.push(+(rnd(capacity * 40, capacity * 90)).toFixed(0))
      discharge.push(+(rnd(capacity * 40, capacity * 90)).toFixed(0))
    }
  } else if (period === 'year') {
    for (let y = 2020; y <= 2026; y++) {
      labels.push(String(y))
      charge.push(+(rnd(capacity * 400, capacity * 900)).toFixed(0))
      discharge.push(+(rnd(capacity * 400, capacity * 900)).toFixed(0))
    }
  } else {
    let cumC = 0, cumD = 0
    for (let y = 2020; y <= 2026; y++) {
      cumC += rnd(capacity * 400, capacity * 900)
      cumD += rnd(capacity * 400, capacity * 900)
      labels.push(String(y))
      charge.push(+cumC.toFixed(0))
      discharge.push(+cumD.toFixed(0))
    }
  }

  return { labels, charge, discharge, totalCharge: charge.reduce((a, b) => a + b, 0), totalDischarge: discharge.reduce((a, b) => a + b, 0) }
}

export function getStationDispatchRecords(id: string, capacity: number): DispatchRecord[] {
  const idNum = parseInt(id.replace(/\D/g, '')) || 1
  const seed = idNum * 7 + 333
  const rnd = makePrng(seed)
  const records: DispatchRecord[] = []
  const now = new Date()

  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - i * 86400000)
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    const hasDispatch = i < 2 ? false : rnd(0, 1) > 0.15
    const chg = hasDispatch ? +rnd(0.5, capacity * 3).toFixed(2) : 0
    const dch = hasDispatch ? +rnd(0.5, capacity * 3).toFixed(2) : 0
    records.push({ date: dateStr, hasDispatch, charge: chg, discharge: dch })
  }

  return records
}

export function getStationProfit(id: string, capacity: number, period: string): ProfitData {
  const idNum = parseInt(id.replace(/\D/g, '')) || 1
  const seed = idNum + period.length * 13
  const rnd = makePrng(seed)

  const labels: string[] = []
  const charge: number[] = []
  const discharge: number[] = []
  const buyPrice: number[] = []
  const sellPrice: number[] = []

  if (period === 'day') {
    for (let h = 0; h < 24; h++) {
      labels.push(String(h).padStart(2, '0') + ':00')
      const isCharge = h < 8
      const isDisch = h >= 13 && h < 20
      charge.push(isCharge ? +rnd(1.5, 3.5).toFixed(2) : 0)
      discharge.push(isDisch ? +rnd(1.5, 3.2).toFixed(2) : 0)
      buyPrice.push(isCharge ? +rnd(30, 60).toFixed(1) : 0)
      sellPrice.push(isDisch ? +rnd(150, 350).toFixed(1) : 0)
    }
  } else if (period === 'month') {
    for (let d = 1; d <= 30; d++) {
      labels.push(String(d))
      charge.push(+rnd(8, 20).toFixed(1))
      discharge.push(+rnd(7, 18).toFixed(1))
      buyPrice.push(+rnd(35, 65).toFixed(1))
      sellPrice.push(+rnd(140, 320).toFixed(1))
    }
  } else if (period === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for (let m = 0; m < 12; m++) {
      labels.push(months[m])
      charge.push(+rnd(200, 600).toFixed(0))
      discharge.push(+rnd(180, 550).toFixed(0))
      buyPrice.push(+rnd(40, 70).toFixed(1))
      sellPrice.push(+rnd(150, 300).toFixed(1))
    }
  } else {
    for (let y = 2020; y <= 2026; y++) {
      labels.push(String(y))
      charge.push(+rnd(2000, 6000).toFixed(0))
      discharge.push(+rnd(1800, 5500).toFixed(0))
      buyPrice.push(+rnd(45, 75).toFixed(1))
      sellPrice.push(+rnd(160, 290).toFixed(1))
    }
  }

  return { labels, charge, discharge, buyPrice, sellPrice }
}
