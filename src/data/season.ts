import { Coins, Zap, Coffee, Frame, Gamepad2, Ticket, DoorClosed, Shirt, Sparkles, Palette, Timer, Popcorn, Award, Crown, type LucideIcon } from 'lucide-react'

export interface TierReward {
  label: string
  icon: LucideIcon
  coins?: number
  xp?: number
  special?: boolean
}

export const SEASON = {
  id: 'S1',
  number: 1,
  name: 'Red Room',
  tagline: 'The lights go red. The ladder goes up.',
  start: new Date(2026, 8, 15).getTime(),
  end: new Date(2026, 11, 15, 23, 59).getTime(),
  tiers: 30,
  xpPerTier: 400,
  elitePrice: '79 DH',
}

const coins = (n: number): TierReward => ({ label: `${n} coins`, icon: Coins, coins: n })
const xp = (n: number): TierReward => ({ label: `${n} XP`, icon: Zap, xp: n })

export const FREE_TRACK: TierReward[] = [
  coins(50), xp(100), coins(75), xp(150),
  { label: 'Free coffee', icon: Coffee, special: true },
  coins(100), xp(200), coins(100), xp(200),
  { label: 'Red Room frame', icon: Frame, special: true },
  coins(150), xp(250), coins(150), xp(250),
  { label: '+30 min overtime', icon: Timer, special: true },
  coins(200), xp(300), coins(200), xp(300),
  { label: '1 hour free', icon: Gamepad2, special: true },
  coins(250), xp(350), coins(250), xp(350),
  { label: 'Tournament ticket', icon: Ticket, special: true },
  coins(300), xp(400), coins(300), xp(400),
  { label: 'S1 Veteran badge', icon: Award, special: true },
]

export const ELITE_TRACK: TierReward[] = [
  coins(150), { label: 'Crimson gamertag', icon: Palette, special: true }, coins(200), xp(400),
  { label: 'Snack combo', icon: Popcorn, special: true },
  coins(250), xp(500), coins(250), { label: 'Free coffee', icon: Coffee, special: true },
  { label: '1 hour free', icon: Gamepad2, special: true },
  coins(300), xp(600), coins(300), { label: 'Animated holo frame', icon: Sparkles, special: true },
  { label: 'VIP room · 30 min', icon: DoorClosed, special: true },
  coins(400), xp(700), coins(400), xp(700),
  { label: '2 hours free', icon: Gamepad2, special: true },
  coins(500), xp(800), coins(500), { label: 'Friend pass', icon: Ticket, special: true },
  { label: 'VIP room · 1 hour', icon: DoorClosed, special: true },
  coins(600), xp(900), coins(600), xp(900),
  { label: 'Red Room jersey', icon: Shirt, special: true },
]

export const seasonTier = (seasonXp: number) => Math.min(SEASON.tiers, Math.floor(seasonXp / SEASON.xpPerTier))

export const SEASON_CROWN: LucideIcon = Crown
