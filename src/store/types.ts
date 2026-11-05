export type ActivityKind =
  | 'welcome'
  | 'checkin'
  | 'session'
  | 'coffee'
  | 'event'
  | 'secret'
  | 'friend'
  | 'quest'
  | 'achievement'
  | 'spin'
  | 'penalty'
  | 'prono'
  | 'redeem'
  | 'season'
  | 'levelup'
  | 'bonus'

export interface Activity {
  id: string
  kind: ActivityKind
  title: string
  xp?: number
  coins?: number
  at: number
}

export interface Voucher {
  id: string
  rewardId: string
  code: string
  at: number
  status: 'active' | 'used'
}

export type FrameId = 'none' | 'bronze' | 'silver' | 'neon' | 'gold' | 'holo'
export type TagColor = 'default' | 'crimson' | 'gold' | 'holo'

export interface PlayerData {
  created: boolean
  demo: boolean
  id: string
  tag: string
  name: string
  avatarSeed: string
  favGame: string
  squadId: string | null
  frame: FrameId
  tagColor: TagColor
  joinedAt: number
  xp: number
  coins: number
  seasonXp: number
  coinsEarned: number
  coinsSpent: number
  counters: Record<string, number>
  lastCheckinDay: string | null
  weekStreak: number
  lastStreakWeek: string | null
  bestStreak: number
  secrets: string[]
  achievements: Record<string, number>
  questClaims: Record<string, number>
  vouchers: Voucher[]
  lastSpinDay: string | null
  penalty: { day: string | null; shots: number; goals: number; best: number }
  predictions: Record<string, { home: number; away: number; at: number }>
  seasonClaimed: number[]
  eliteClaimed: number[]
  elitePass: boolean
  owned: string[]
  activity: Activity[]
}

export interface Settings {
  sound: boolean
  timeOffset: number
}

export interface RewardLine {
  label: string
  xp?: number
  coins?: number
  tone?: 'mint' | 'gold' | 'crimson'
}

export interface Outcome {
  ok: boolean
  kind: string
  title: string
  subtitle?: string
  lines: RewardLine[]
  total: { xp: number; coins: number }
  error?: string
}
