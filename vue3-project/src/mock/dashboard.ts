// ============================================
import { aemoTimeLabels, aemoRealPriceData, aemoRealDemandData } from './aemo-data'
// AU-BESS v3 — Mock Data Layer
// 澳洲储能电站静态数据 + TypeScript类型定义
// ============================================

// === 类型定义 ===

export interface Station {
  id: string
  name: string
  region: string
  capacity: number       // MW
  power: number          // MW (正=充电, 负=放电)
  soc: number            // 0-100%
  commStatus: 'online' | 'offline'
  runStatus: 'charging' | 'discharging' | 'idle'
  runMode: string
  todayProfit: number    // AUD
  totalProfit: number    // AUD
  brand: string
  model: string
  fcasEnabled: boolean  // FCAS frequency control ancillary service
}

export interface DashboardSummary {
  totalCapacity: number  // MWh
  totalPower: number     // MW
  todayRevenue: number   // AUD
  avgSpotPrice: number   // $/MWh
  alertCount: number
  stationCount: number
  onlineCount: number
}

// === 7个真实澳洲储能电站 ===

export const allStations: Station[] = [
  {
    id: 'AU0001',
    name: 'Hornsdale Power Reserve',
    region: 'SA',
    capacity: 50,
    power: -38.5,
    soc: 72,
    commStatus: 'online',
    runStatus: 'discharging',
    runMode: 'FCAS响应',
    todayProfit: 42150.80,
    totalProfit: 3850000.00,
    brand: 'Tesla',
    model: 'Megapack 2',
    fcasEnabled: true,
  },
  {
    id: 'AU0003',
    name: 'Victorian Big Battery',
    region: 'VIC',
    capacity: 45,
    power: 32.0,
    soc: 45,
    commStatus: 'online',
    runStatus: 'charging',
    runMode: '套利模式',
    todayProfit: 28900.50,
    totalProfit: 2150000.00,
    brand: 'Tesla',
    model: 'Megapack 2',
    fcasEnabled: false,
  },
  {
    id: 'AU0004',
    name: 'Wandoan BESS',
    region: 'QLD',
    capacity: 40,
    power: -25.3,
    soc: 61,
    commStatus: 'online',
    runStatus: 'discharging',
    runMode: 'VPP调度',
    todayProfit: 18500.00,
    totalProfit: 1620000.00,
    brand: 'Fluence',
    model: 'Gridstack',
    fcasEnabled: true,
  },
  {
    id: 'AU0005',
    name: 'Torrens Island BESS',
    region: 'SA',
    capacity: 35,
    power: 0,
    soc: 88,
    commStatus: 'online',
    runStatus: 'idle',
    runMode: '备用待命',
    todayProfit: 8200.30,
    totalProfit: 980000.00,
    brand: 'BYD',
    model: 'Cube Pro',
    fcasEnabled: false,
  },
  {
    id: 'AU0006',
    name: 'Capital Battery',
    region: 'ACT',
    capacity: 20,
    power: 15.8,
    soc: 33,
    commStatus: 'online',
    runStatus: 'charging',
    runMode: '套利模式',
    todayProfit: 12750.00,
    totalProfit: 1050000.00,
    brand: 'Samsung SDI',
    model: 'E3-R',
    fcasEnabled: false,
  },
  {
    id: 'AU0007',
    name: 'Kwinana BESS',
    region: 'WA',
    capacity: 30,
    power: -22.1,
    soc: 54,
    commStatus: 'online',
    runStatus: 'discharging',
    runMode: 'FCAS响应',
    todayProfit: 31200.00,
    totalProfit: 2780000.00,
    brand: 'LG Energy',
    model: 'RESU Prime',
    fcasEnabled: true,
  },
  {
    id: 'AU0008',
    name: 'Broken Hill Solar Farm',
    region: 'NSW',
    capacity: 25,
    power: 0,
    soc: 21,
    commStatus: 'offline',
    runStatus: 'idle',
    runMode: '维护模式',
    todayProfit: -2100.00,
    totalProfit: 890000.00,
    brand: 'Fluence',
    model: 'Gridstack',
    fcasEnabled: true,
  },
]

// === Operator 图表数据类型 ===

export interface MarketDataPoint {
  time: string                    // '00:00', '01:00', etc.
  historicalPrice: number | null  // $/MWh (当前时间之前)
  predictedPrice: number | null   // $/MWh (当前时间之后)
  demand: number | null           // MW (当前时间之前)
  predictedDemand: number | null  // MW (当前时间之后)
  isAnchor?: boolean  // 30分钟锚点
}

export interface PowerProfitDataPoint {
  time: string
  chargeEnergy: number     // MWh (负值表示充电)
  dischargeEnergy: number  // MWh (正值表示放电)
  chargeCost: number       // AUD (负值)
  dischargeRevenue: number // AUD (正值)
  netProfit: number        // AUD
}

export interface OperatorChartData {
  market: MarketDataPoint[]
  powerProfit: PowerProfitDataPoint[]
}

// AEMO 5-minute data imported from aemo-data.ts (288 real data points)

/**
 * 获取 Operator ECharts 大屏数据
 * 24小时时序数据，当前小时分割 historical / predicted
 */
export function getOperatorChartData(): OperatorChartData {
  const now = new Date()
  // 用澳洲东部时间 (UTC+10) 模拟
  const currentHour = (now.getUTCHours() + 10) % 24
  const currentIdx = currentHour * 12 + Math.floor(now.getUTCMinutes() / 5)

  const market: MarketDataPoint[] = []
  const powerProfit: PowerProfitDataPoint[] = []

  for (let i = 0; i < 288; i++) {
    const time = aemoTimeLabels[i]
    const price = aemoRealPriceData[i]
    const demand = aemoRealDemandData[i]
    const h = Math.floor(i / 12) // hour index

    // Market: 分割 historical / predicted
    if (i < currentIdx) {
      market.push({
        time,
        historicalPrice: price,
        predictedPrice: null,
        demand,
        predictedDemand: null,
      })
    } else if (i === currentIdx) {
      market.push({
        time,
        historicalPrice: price,
        predictedPrice: price,
        demand,
        predictedDemand: demand,
      })
    } else {
      // 预测数据：30分钟锚点用真实值，中间5分钟用线性插值填满
      const anchor = Math.floor(i / 6) * 6  // 最近的30分钟锚点
      const nextAnchor = Math.min(anchor + 6, 287)
      const frac = (i - anchor) / Math.max(nextAnchor - anchor, 1)
      const interpPrice = aemoRealPriceData[anchor] + (aemoRealPriceData[nextAnchor] - aemoRealPriceData[anchor]) * frac
      const interpDemand = aemoRealDemandData[anchor] + (aemoRealDemandData[nextAnchor] - aemoRealDemandData[anchor]) * frac
      const isAnchor = (i % 6 === 0)  // 30分钟锚点标记
      market.push({
        time,
        historicalPrice: null,
        predictedPrice: parseFloat(interpPrice.toFixed(2)),
        demand: null,
        predictedDemand: parseFloat(interpDemand.toFixed(0)),
        isAnchor,
      })
    }

    // Power & Profit: 充放电时段 (每5分钟数据缩比)
    let chgMWh = 0
    let dchMWh = 0

    // 充电时段: 01:00-05:00 (低价), 10:00-14:00 (太阳能过剩负电价)
    if (h >= 1 && h < 5) {
      chgMWh = (0.8 + (h * 0.1)) / 12
    } else if (h >= 10 && h < 14) {
      chgMWh = (0.5 + ((h - 10) * 0.15)) / 12
    }

    // 放电时段: 07:00-09:00 (早高峰), 16:00-21:00 (傍晚高峰)
    if (h >= 7 && h < 9) {
      dchMWh = (0.4 + ((h - 7) * 0.15)) / 12
    } else if (h >= 16 && h < 21) {
      dchMWh = (0.5 + ((h - 16) * 0.08)) / 12
    }

    const actualCost = chgMWh > 0 ? chgMWh * price : 0
    const actualRev = dchMWh > 0 ? dchMWh * price : 0

    powerProfit.push({
      time,
      chargeEnergy: parseFloat((-chgMWh).toFixed(4)),
      dischargeEnergy: parseFloat(dchMWh.toFixed(4)),
      chargeCost: parseFloat((-Math.abs(actualCost)).toFixed(2)),
      dischargeRevenue: parseFloat(actualRev.toFixed(2)),
      netProfit: parseFloat((actualRev - Math.abs(actualCost)).toFixed(2)),
    })
  }

  return { market, powerProfit }
}

// === 获取所有电站（供 StationView 使用）===

export function getAllStations(): Station[] {
  return allStations
}

// === 根据电站列表计算概览 ===

export function computeSummary(stations: Station[]): DashboardSummary {
  const onlineStations = stations.filter((s) => s.commStatus === 'online')

  const totalCapacity = stations.reduce((sum, s) => sum + s.capacity, 0)
  const totalPower = stations.reduce((sum, s) => sum + s.power, 0)
  const todayRevenue = stations.reduce((sum, s) => sum + s.todayProfit, 0)

  // 模拟各区域现货电价 $/MWh (AEMO 真实范围)
  const spotPrices: Record<string, number> = {
    NSW: 87.5,
    VIC: 72.3,
    QLD: 95.1,
    SA: 110.8,
    WA: 68.4,
    TAS: 55.2,
    ACT: 82.6,
  }

  // 用电站所在区域的价格加权平均
  const avgSpotPrice =
    stations.length > 0
      ? stations.reduce((sum, s) => sum + (spotPrices[s.region] ?? 80), 0) / stations.length
      : 0

  return {
    totalCapacity,
    totalPower: Math.round(totalPower * 10) / 10,
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    avgSpotPrice: Math.round(avgSpotPrice * 10) / 10,
    alertCount: 3,
    stationCount: stations.length,
    onlineCount: onlineStations.length,
  }
}

// === Period-specific Power & Profit data generators ===

/** Seeded random for deterministic mock data */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Generate Power & Profit data for Month view (daily aggregates) */
export function getPowerProfitMonthData(year: number, month: number): PowerProfitDataPoint[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const rand = seededRandom(year * 100 + month)
  const result: PowerProfitDataPoint[] = []
  const avgPrice = 85 // avg $/MWh

  for (let d = 1; d <= daysInMonth; d++) {
    const chgMWh = 4 + rand() * 3   // 4-7 MWh/day
    const dchMWh = 3 + rand() * 4   // 3-7 MWh/day
    // Charge happens at low prices (~$40-60), discharge at high prices (~$120-180)
    const chgPrice = 40 + rand() * 20
    const dchPrice = 120 + rand() * 60
    const cost = chgMWh * chgPrice
    const rev = dchMWh * dchPrice

    result.push({
      time: String(d),
      chargeEnergy: parseFloat((-chgMWh).toFixed(2)),
      dischargeEnergy: parseFloat(dchMWh.toFixed(2)),
      chargeCost: parseFloat((-cost).toFixed(2)),
      dischargeRevenue: parseFloat(rev.toFixed(2)),
      netProfit: parseFloat((rev - cost).toFixed(2)),
    })
  }
  return result
}

/** Generate Power & Profit data for Year view (monthly aggregates) */
export function getPowerProfitYearData(year: number): PowerProfitDataPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const rand = seededRandom(year)
  const result: PowerProfitDataPoint[] = []
  // Seasonal pattern: higher in summer (Dec-Feb in AU) and winter peaks (Jun-Aug)
  const seasonalFactor = [1.15, 1.10, 1.0, 0.90, 0.95, 1.05, 1.10, 1.05, 0.95, 0.90, 0.95, 1.10]

  for (let m = 0; m < 12; m++) {
    const sf = seasonalFactor[m]
    const chgMWh = (110 + rand() * 45) * sf   // 110-155 MWh/month with seasonal
    const dchMWh = (100 + rand() * 50) * sf   // 100-150 MWh/month with seasonal
    const avgChgPrice = 35 + rand() * 25
    const avgDchPrice = 110 + rand() * 70
    const cost = chgMWh * avgChgPrice
    const rev = dchMWh * avgDchPrice

    result.push({
      time: months[m],
      chargeEnergy: parseFloat((-chgMWh).toFixed(1)),
      dischargeEnergy: parseFloat(dchMWh.toFixed(1)),
      chargeCost: parseFloat((-cost).toFixed(0)),
      dischargeRevenue: parseFloat(rev.toFixed(0)),
      netProfit: parseFloat((rev - cost).toFixed(0)),
    })
  }
  return result
}

/** Generate Power & Profit data for Cumulative view (yearly totals) */
export function getPowerProfitCumulativeData(): PowerProfitDataPoint[] {
  const years = [2021, 2022, 2023, 2024, 2025]
  const rand = seededRandom(2021)
  const result: PowerProfitDataPoint[] = []
  let cumCharge = 0
  let cumDischarge = 0
  let cumCost = 0
  let cumRev = 0

  for (const year of years) {
    // Yearly totals grow as capacity comes online
    const growthFactor = 1 + (year - 2021) * 0.15
    const yearChg = (1200 + rand() * 400) * growthFactor
    const yearDch = (1100 + rand() * 450) * growthFactor
    const yearCost = yearChg * (40 + rand() * 15)
    const yearRev = yearDch * (115 + rand() * 50)

    cumCharge += yearChg
    cumDischarge += yearDch
    cumCost += yearCost
    cumRev += yearRev

    result.push({
      time: String(year),
      chargeEnergy: parseFloat((-cumCharge).toFixed(0)),
      dischargeEnergy: parseFloat(cumDischarge.toFixed(0)),
      chargeCost: parseFloat((-cumCost).toFixed(0)),
      dischargeRevenue: parseFloat(cumRev.toFixed(0)),
      netProfit: parseFloat((cumRev - cumCost).toFixed(0)),
    })
  }
  return result
}
