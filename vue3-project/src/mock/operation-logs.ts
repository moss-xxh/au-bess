// ============================================
// AU-BESS v3 — Operation Logs Mock Data
// ============================================

import { allStations } from './dashboard'

export interface OperationLog {
  id: number
  date: string
  station: string
  stationId: string
  hasDispatch: boolean
  chargeKWh: number
  dischargeKWh: number
  operator: string
  type: string
}

export interface LogFilters {
  stationId: string
  dateStart: string
  dateEnd: string
  dispatchType: string
}

/** Seeded PRNG */
function makePrng(seed: number) {
  let s = seed
  return (min: number, max: number): number => {
    s = (s * 9301 + 49297) % 233280
    return +(min + (s / 233280) * (max - min)).toFixed(2)
  }
}

const dispatchTypes = ['auto', 'manual', 'fcas', 'vpp']
const operators = ['System', 'Admin', 'Operator-A', 'Operator-B']

/** Generate 60 mock operation log records */
function generateAllLogs(): OperationLog[] {
  const rnd = makePrng(20260305)
  const logs: OperationLog[] = []
  let id = 1

  // Generate records for last 10 days
  for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
    const date = new Date(2024, 1, 28 - dayOffset) // Feb 28 backwards
    const dateStr = date.toISOString().slice(0, 10)

    // Each station gets one record per day (some days)
    for (const station of allStations) {
      if (rnd(0, 1) < 0.15) continue // 15% chance to skip

      const hasDispatch = rnd(0, 1) > 0.2 // 80% have dispatch
      const typeIdx = Math.floor(rnd(0, dispatchTypes.length - 0.01))
      const opIdx = Math.floor(rnd(0, operators.length - 0.01))

      logs.push({
        id: id++,
        date: dateStr,
        station: station.name,
        stationId: station.id,
        hasDispatch,
        chargeKWh: hasDispatch ? +rnd(500, 3500).toFixed(0) : 0,
        dischargeKWh: hasDispatch ? +rnd(400, 3200).toFixed(0) : 0,
        operator: operators[opIdx],
        type: dispatchTypes[typeIdx],
      })
    }
  }

  return logs
}

const allLogs = generateAllLogs()

/** Get operation logs with optional filters (applied on query) */
export function getOperationLogs(filters: LogFilters): OperationLog[] {
  let result = [...allLogs]

  if (filters.stationId) {
    result = result.filter(l => l.stationId === filters.stationId)
  }
  if (filters.dateStart) {
    result = result.filter(l => l.date >= filters.dateStart)
  }
  if (filters.dateEnd) {
    result = result.filter(l => l.date <= filters.dateEnd)
  }
  if (filters.dispatchType === 'yes') {
    result = result.filter(l => l.hasDispatch)
  } else if (filters.dispatchType === 'no') {
    result = result.filter(l => !l.hasDispatch)
  }

  return result
}

export function getLogStations() {
  return allStations.map(s => ({ id: s.id, name: s.name }))
}
