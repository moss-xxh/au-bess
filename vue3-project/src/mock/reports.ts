// ============================================
// AU-BESS v3 — Reports Mock Data
// Per-station reports with metric cards + chart time series
// ============================================

import { allStations } from './dashboard'

/** Seeded PRNG for deterministic data */
function makePrng(seed: number) {
  let s = seed
  return (min: number, max: number): number => {
    s = (s * 9301 + 49297) % 233280
    return +(min + (s / 233280) * (max - min)).toFixed(2)
  }
}

export type ReportPeriod = 'day' | 'month' | 'year' | 'cumulative'

export interface MetricCard {
  value: number
  unit: string
  changeValue: number
  changeUnit: string
  isPositive: boolean
}

export interface ReportMetrics {
  charge: MetricCard
  discharge: MetricCard
  avgBuyPrice: MetricCard
  avgSellPrice: MetricCard
  netProfit: MetricCard
}

export interface ReportTimePoint {
  time: string
  chargeMWh: number
  dischargeMWh: number
  cumulativeProfit: number
  avgBuyPrice: number
  avgSellPrice: number
  chargeCost: number
  dischargeRevenue: number
  netProfit: number
}

export interface ReportsData {
  metrics: ReportMetrics
  timeSeries: ReportTimePoint[]
}

function computeIdSeed(stationId: string): number {
  return parseInt(stationId.replace(/\D/g, '')) || 1
}

export function getReportsData(stationId: string, period: ReportPeriod): ReportsData {
  const idNum = computeIdSeed(stationId)
  const periodSeed = period === 'day' ? 1 : period === 'month' ? 2 : period === 'year' ? 3 : 4
  const rnd = makePrng(idNum * 17 + periodSeed * 31)

  const timeSeries: ReportTimePoint[] = []
  let cumProfit = 0

  if (period === 'day') {
    for (let h = 0; h < 24; h++) {
      const time = String(h).padStart(2, '0') + ':00'
      const isLowPrice = h >= 1 && h <= 6
      const isHighPrice = h >= 14 && h <= 20
      const chg = isLowPrice ? +rnd(0.008, 0.035).toFixed(3) : +rnd(0, 0.005).toFixed(3)
      const dch = isHighPrice ? +rnd(0.006, 0.028).toFixed(3) : +rnd(0, 0.003).toFixed(3)
      const buyP = isLowPrice ? +rnd(25, 50).toFixed(0) : +rnd(50, 80).toFixed(0)
      const sellP = isHighPrice ? +rnd(180, 400).toFixed(0) : +rnd(60, 120).toFixed(0)
      const cost = +(chg * buyP).toFixed(2)
      const rev = +(dch * sellP).toFixed(2)
      const net = +(rev - cost).toFixed(2)
      cumProfit += net
      timeSeries.push({
        time, chargeMWh: chg, dischargeMWh: dch, cumulativeProfit: +cumProfit.toFixed(2),
        avgBuyPrice: buyP, avgSellPrice: sellP, chargeCost: cost, dischargeRevenue: rev, netProfit: net,
      })
    }
  } else if (period === 'month') {
    for (let d = 1; d <= 30; d++) {
      const time = String(d)
      const chg = +rnd(0.15, 0.45).toFixed(2)
      const dch = +rnd(0.12, 0.38).toFixed(2)
      const buyP = +rnd(32, 58).toFixed(0)
      const sellP = +rnd(160, 340).toFixed(0)
      const cost = +(chg * buyP).toFixed(2)
      const rev = +(dch * sellP).toFixed(2)
      const net = +(rev - cost).toFixed(2)
      cumProfit += net
      timeSeries.push({
        time, chargeMWh: chg, dischargeMWh: dch, cumulativeProfit: +cumProfit.toFixed(2),
        avgBuyPrice: buyP, avgSellPrice: sellP, chargeCost: cost, dischargeRevenue: rev, netProfit: net,
      })
    }
  } else if (period === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for (let m = 0; m < 12; m++) {
      const chg = +rnd(3, 12).toFixed(1)
      const dch = +rnd(2.5, 10).toFixed(1)
      const buyP = +rnd(38, 65).toFixed(0)
      const sellP = +rnd(150, 310).toFixed(0)
      const cost = +(chg * buyP).toFixed(0)
      const rev = +(dch * sellP).toFixed(0)
      const net = +(rev - cost).toFixed(0)
      cumProfit += net
      timeSeries.push({
        time: months[m], chargeMWh: chg, dischargeMWh: dch, cumulativeProfit: +cumProfit.toFixed(0),
        avgBuyPrice: buyP, avgSellPrice: sellP, chargeCost: +cost, dischargeRevenue: +rev, netProfit: +net,
      })
    }
  } else {
    for (let y = 2021; y <= 2026; y++) {
      const chg = +rnd(40, 120).toFixed(0)
      const dch = +rnd(35, 100).toFixed(0)
      const buyP = +rnd(42, 68).toFixed(0)
      const sellP = +rnd(155, 280).toFixed(0)
      const cost = +(chg * buyP).toFixed(0)
      const rev = +(dch * sellP).toFixed(0)
      const net = +(rev - cost).toFixed(0)
      cumProfit += net
      timeSeries.push({
        time: String(y), chargeMWh: chg, dischargeMWh: dch, cumulativeProfit: +cumProfit.toFixed(0),
        avgBuyPrice: buyP, avgSellPrice: sellP, chargeCost: +cost, dischargeRevenue: +rev, netProfit: +net,
      })
    }
  }

  const totalCharge = timeSeries.reduce((s, p) => s + p.chargeMWh, 0)
  const totalDischarge = timeSeries.reduce((s, p) => s + p.dischargeMWh, 0)
  const chargePoints = timeSeries.filter(p => p.chargeMWh > 0)
  const dischargePoints = timeSeries.filter(p => p.dischargeMWh > 0)
  const wAvgBuy = chargePoints.length
    ? chargePoints.reduce((s, p) => s + p.avgBuyPrice * p.chargeMWh, 0) / totalCharge
    : 0
  const wAvgSell = dischargePoints.length
    ? dischargePoints.reduce((s, p) => s + p.avgSellPrice * p.dischargeMWh, 0) / totalDischarge
    : 0
  const totalNetProfit = timeSeries.reduce((s, p) => s + p.netProfit, 0)

  const rndC = makePrng(idNum * 7 + periodSeed * 11)
  const metrics: ReportMetrics = {
    charge: {
      value: +totalCharge.toFixed(period === 'day' ? 1 : 0),
      unit: 'MWh',
      changeValue: +rndC(0.05, 0.3).toFixed(2),
      changeUnit: 'MWh',
      isPositive: rndC(0, 1) > 0.4,
    },
    discharge: {
      value: +totalDischarge.toFixed(period === 'day' ? 1 : 0),
      unit: 'MWh',
      changeValue: +rndC(0.03, 0.25).toFixed(2),
      changeUnit: 'MWh',
      isPositive: rndC(0, 1) > 0.4,
    },
    avgBuyPrice: {
      value: +wAvgBuy.toFixed(0),
      unit: '$/MWh',
      changeValue: +rndC(1, 8).toFixed(0),
      changeUnit: '$',
      isPositive: rndC(0, 1) < 0.5,
    },
    avgSellPrice: {
      value: +wAvgSell.toFixed(0),
      unit: '$/MWh',
      changeValue: +rndC(5, 20).toFixed(0),
      changeUnit: '$',
      isPositive: rndC(0, 1) > 0.4,
    },
    netProfit: {
      value: +totalNetProfit.toFixed(0),
      unit: '$',
      changeValue: +rndC(10, 80).toFixed(0),
      changeUnit: '$',
      isPositive: totalNetProfit > 0,
    },
  }

  return { metrics, timeSeries }
}

export function getReportStations() {
  return allStations.map(s => ({ id: s.id, name: s.name }))
}
