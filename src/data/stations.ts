import { seeded } from '../lib/rng'
import { GAMES } from './games'
import { MOCK_PLAYERS } from './players'

export type RoomId = 'red' | 'lounge' | 'vip'

export interface Room {
  id: RoomId
  name: string
  desc: string
  color: string
  price: string
}

export const ROOMS: Room[] = [
  { id: 'red', name: 'The Red Room', desc: 'Main arena · 8 × PS5 · 55" 4K · red-velvet thrones', color: '#ff2d4e', price: '20 DH / h' },
  { id: 'lounge', name: 'The Lounge', desc: 'Chill zone · 4 × PS5 · 50" screens · poster wall', color: '#5ff3da', price: '15 DH / h' },
  { id: 'vip', name: 'VIP Rooms', desc: 'Private · closed door · 65" · sofa for 4', color: '#ffc83d', price: '50 DH / h' },
]

export interface Station {
  id: string
  room: RoomId
  label: string
}

export const STATIONS: Station[] = [
  ...Array.from({ length: 8 }, (_, i) => ({ id: `R${i + 1}`, room: 'red' as const, label: `R${i + 1}` })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `L${i + 1}`, room: 'lounge' as const, label: `L${i + 1}` })),
  { id: 'VA', room: 'vip', label: 'VIP A' },
  { id: 'VB', room: 'vip', label: 'VIP B' },
]

export type StationStatus =
  | { state: 'free' }
  | { state: 'busy'; game: string; minsLeft: number; players: string[] }
  | { state: 'reserved'; at: string; by: string }

/** Deterministic "live" status that shifts every 2 minutes so the map feels alive. */
export function stationStatus(st: Station, t: number): StationStatus {
  const slot = Math.floor(t / 120000)
  const r = seeded(`${st.id}:${Math.floor(slot / 8)}`)
  const hour = new Date(t).getHours()
  const busyBias = hour >= 17 || hour < 2 ? 0.72 : hour >= 12 ? 0.5 : 0.3
  const roll = r.next()
  if (roll < busyBias) {
    const game = r.pick(GAMES.slice(0, 8)).id
    const p1 = r.pick(MOCK_PLAYERS).tag
    const p2 = r.pick(MOCK_PLAYERS).tag
    const total = r.int(20, 90)
    const minsLeft = Math.max(1, total - (slot % 8) * 2)
    return { state: 'busy', game, minsLeft, players: st.room === 'vip' ? [p1, p2, r.pick(MOCK_PLAYERS).tag] : [p1, p2] }
  }
  if (roll < busyBias + 0.12) {
    const d = new Date(t + r.int(1, 3) * 3600000)
    return { state: 'reserved', at: `${String(d.getHours()).padStart(2, '0')}:00`, by: r.pick(MOCK_PLAYERS).tag }
  }
  return { state: 'free' }
}

export const stationRoom = (id: string): RoomId | null => STATIONS.find((s) => s.id === id)?.room ?? null
