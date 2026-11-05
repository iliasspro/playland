import { ScanLine, Dices, Goal, CalendarCheck, Shuffle, Users, Coffee, Zap, Eye, Map as MapIcon, Trophy, Hourglass, type LucideIcon } from 'lucide-react'
import type { PlayerData } from '../store/types'
import { count, distinctRooms } from '../store/counters'

export type QuestPeriod = 'day' | 'week' | 'season'
export type Shape = 'tri' | 'cir' | 'crs' | 'sqr'

export interface Quest {
  id: string
  period: QuestPeriod
  title: string
  desc: string
  icon: LucideIcon
  shape: Shape
  target: number
  progress: (s: PlayerData) => number
  reward: { coins: number; xp: number }
  cta?: { label: string; to: string }
}

export const QUESTS: Quest[] = [
  // ---- daily
  { id: 'd-checkin', period: 'day', title: 'Clock In', desc: 'Scan the entrance QR at Play Land.', icon: ScanLine, shape: 'tri', target: 1, progress: (s) => count(s, 'checkin', 'day'), reward: { coins: 40, xp: 60 }, cta: { label: 'Scan', to: '/scan' } },
  { id: 'd-spin', period: 'day', title: 'Feeling Lucky', desc: 'Spin the Lucky Wheel once.', icon: Dices, shape: 'cir', target: 1, progress: (s) => count(s, 'spin', 'day'), reward: { coins: 20, xp: 30 }, cta: { label: 'Spin', to: '/arcade?game=spin' } },
  { id: 'd-penalty', period: 'day', title: 'Warm-Up', desc: 'Take your 5 daily shots in Penalty King.', icon: Goal, shape: 'crs', target: 5, progress: (s) => count(s, 'penalty', 'day'), reward: { coins: 30, xp: 40 }, cta: { label: 'Play', to: '/arcade?game=penalty' } },
  // ---- weekly
  { id: 'w-regular', period: 'week', title: 'Regular', desc: 'Check in 3 different days this week.', icon: CalendarCheck, shape: 'tri', target: 3, progress: (s) => count(s, 'checkin', 'week'), reward: { coins: 200, xp: 300 } },
  { id: 'w-rooms', period: 'week', title: 'Room Hopper', desc: 'Play sessions in 2 different rooms.', icon: Shuffle, shape: 'sqr', target: 2, progress: (s) => distinctRooms(s), reward: { coins: 150, xp: 200 }, cta: { label: 'Live map', to: '/map' } },
  { id: 'w-squad', period: 'week', title: 'Squad Up', desc: 'Bring a friend — both of you scan in.', icon: Users, shape: 'cir', target: 1, progress: (s) => count(s, 'friend', 'week'), reward: { coins: 200, xp: 250 } },
  { id: 'w-coffee', period: 'week', title: 'Caffeine Combo', desc: 'Scan 2 coffees at the machine.', icon: Coffee, shape: 'sqr', target: 2, progress: (s) => count(s, 'coffee', 'week'), reward: { coins: 80, xp: 100 } },
  { id: 'w-offpeak', period: 'week', title: 'Off-Peak Hero', desc: 'Check in during Double XP hours (Mon–Thu, 14:00–18:00).', icon: Zap, shape: 'tri', target: 1, progress: (s) => count(s, 'offpeak', 'week'), reward: { coins: 120, xp: 150 } },
  { id: 'w-prono', period: 'week', title: 'Oracle in Training', desc: 'Lock in 3 weekend match predictions.', icon: Eye, shape: 'crs', target: 3, progress: (s) => count(s, 'prono', 'week'), reward: { coins: 60, xp: 90 }, cta: { label: 'Predict', to: '/arcade?game=pronos' } },
  // ---- season
  { id: 's-secrets', period: 'season', title: 'Secret Hunter', desc: 'Find 3 of the 5 secret QR codes hidden around the arena.', icon: MapIcon, shape: 'sqr', target: 3, progress: (s) => s.secrets.length, reward: { coins: 500, xp: 800 } },
  { id: 's-cup', period: 'season', title: 'Cup Contender', desc: 'Check in to any Play Land tournament.', icon: Trophy, shape: 'cir', target: 1, progress: (s) => count(s, 'event', 'season'), reward: { coins: 300, xp: 500 }, cta: { label: 'Events', to: '/events' } },
  { id: 's-grind', period: 'season', title: 'The Grind', desc: 'Log 20 play hours this season.', icon: Hourglass, shape: 'tri', target: 20, progress: (s) => count(s, 'session', 'season'), reward: { coins: 1000, xp: 1500 } },
]

export const SHAPE_COLOR: Record<Shape, string> = { tri: 'var(--tri)', cir: 'var(--cir)', crs: 'var(--crs)', sqr: 'var(--sqr)' }

export const SECRETS = [
  { id: 'ghost', hint: 'Where the soldier in the mask keeps watch.' },
  { id: 'throne', hint: 'Under the reddest throne in the Red Room.' },
  { id: 'brew', hint: 'The machine that never sleeps knows something.' },
  { id: 'door', hint: 'Behind closed doors, look up.' },
  { id: 'crest', hint: 'Right under the number 59.' },
]
