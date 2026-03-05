// ============================================
// AU-BESS v3 — Dashboard API 封装层
// Mock 数据 → Promise 包装，按角色过滤
// ============================================

import { allStations, computeSummary } from '@/mock/dashboard'
import type { DashboardSummary, Station } from '@/mock/dashboard'

interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}

/**
 * 获取 Dashboard 概览数据
 * Owner 看全部 7 个电站的汇总，Operator 只看分配的 2 个
 */
export function getDashboardSummary(
  role: 'owner' | 'operator',
): Promise<ApiResponse<DashboardSummary>> {
  const stations = role === 'operator' ? allStations.slice(0, 2) : allStations
  const summary = computeSummary(stations)
  return Promise.resolve({ code: 0, data: summary, msg: 'ok' })
}

/**
 * 获取电站列表
 * Owner 返回全部 7 个，Operator 返回前 2 个
 */
export function getStationList(
  role: 'owner' | 'operator',
): Promise<ApiResponse<Station[]>> {
  const stations = role === 'operator' ? allStations.slice(0, 2) : allStations
  return Promise.resolve({ code: 0, data: stations, msg: 'ok' })
}
