import { dayKey, weekKey } from '../lib/time'
import type { PlayerData } from './types'

export type Period = 'day' | 'week' | 'season' | 'all'

export const SEASON_KEY = 'S1'

export function periodKey(p: Period, t?: number) {
  switch (p) {
    case 'day':
      return `d:${dayKey(t)}`
    case 'week':
      return `w:${weekKey(t)}`
    case 'season':
      return `s:${SEASON_KEY}`
    case 'all':
      return 'all'
  }
}

export function count(s: Pick<PlayerData, 'counters'>, key: string, p: Period) {
  return s.counters[`${key}@${periodKey(p)}`] ?? 0
}

/** returns a new counters object with key bumped in every period */
export function bumped(counters: Record<string, number>, key: string, by = 1, t?: number) {
  const next = { ...counters }
  for (const p of ['day', 'week', 'season', 'all'] as Period[]) {
    const k = `${key}@${periodKey(p, t)}`
    next[k] = (next[k] ?? 0) + by
  }
  return next
}

export function distinctRooms(s: Pick<PlayerData, 'counters'>) {
  return ['red', 'lounge', 'vip'].filter((r) => count(s, `room:${r}`, 'week') > 0).length
}
