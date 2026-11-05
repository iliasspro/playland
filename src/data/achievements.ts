import {
  Footprints,
  Repeat,
  HeartHandshake,
  Infinity as InfinityIcon,
  Moon,
  Sunrise,
  Flame,
  Rocket,
  Users,
  UserPlus,
  Coffee,
  Goal,
  Eye,
  Trophy,
  Map as MapIcon,
  Gem,
  Medal,
  Crown,
  DoorClosed,
  Dices,
  type LucideIcon,
} from 'lucide-react'
import type { Rarity } from './rewards'
import type { PlayerData } from '../store/types'
import { count } from '../store/counters'
import { levelFromXp } from './ranks'

export interface Achievement {
  id: string
  name: string
  desc: string
  rarity: Rarity
  icon: LucideIcon
  xp: number
  progress: (s: PlayerData) => [number, number]
}

const c = (key: string) => (s: PlayerData) => count(s, key, 'all')

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-spawn', name: 'First Spawn', desc: 'Check in at Play Land for the first time.', rarity: 'common', icon: Footprints, xp: 100, progress: (s) => [c('checkin')(s), 1] },
  { id: 'regular', name: 'Regular', desc: 'Check in 10 times.', rarity: 'common', icon: Repeat, xp: 250, progress: (s) => [c('checkin')(s), 10] },
  { id: 'loyalist', name: 'Loyalist', desc: 'Check in 50 times.', rarity: 'epic', icon: HeartHandshake, xp: 1000, progress: (s) => [c('checkin')(s), 50] },
  { id: 'centurion', name: 'Centurion', desc: 'Check in 100 times. Respect.', rarity: 'legendary', icon: InfinityIcon, xp: 2500, progress: (s) => [c('checkin')(s), 100] },
  { id: 'night-owl', name: 'Night Owl', desc: 'Check in after midnight.', rarity: 'rare', icon: Moon, xp: 200, progress: (s) => [c('night')(s), 1] },
  { id: 'early-bird', name: 'Early Bird', desc: 'Check in before noon.', rarity: 'rare', icon: Sunrise, xp: 200, progress: (s) => [c('morning')(s), 1] },
  { id: 'on-fire', name: 'On Fire', desc: 'Reach a 4-week visit streak.', rarity: 'rare', icon: Flame, xp: 400, progress: (s) => [s.bestStreak, 4] },
  { id: 'unstoppable', name: 'Unstoppable', desc: 'Reach a 12-week visit streak.', rarity: 'epic', icon: Rocket, xp: 1200, progress: (s) => [s.bestStreak, 12] },
  { id: 'squad-goals', name: 'Squad Goals', desc: 'Join a squad.', rarity: 'common', icon: Users, xp: 150, progress: (s) => [s.squadId ? 1 : 0, 1] },
  { id: 'recruiter', name: 'Recruiter', desc: 'Bring 3 friends to the arena.', rarity: 'epic', icon: UserPlus, xp: 900, progress: (s) => [c('friend')(s), 3] },
  { id: 'caffeine', name: 'Caffeine Engine', desc: 'Scan 20 coffees.', rarity: 'rare', icon: Coffee, xp: 300, progress: (s) => [c('coffee')(s), 20] },
  { id: 'penalty-king', name: 'Penalty King', desc: 'Score 5 out of 5 in Penalty King.', rarity: 'rare', icon: Goal, xp: 300, progress: (s) => [s.penalty.best, 5] },
  { id: 'oracle', name: 'Oracle', desc: 'Predict an exact final score.', rarity: 'epic', icon: Eye, xp: 800, progress: (s) => [c('prono-exact')(s), 1] },
  { id: 'champion', name: 'Champion', desc: 'Win a Play Land tournament.', rarity: 'legendary', icon: Trophy, xp: 2000, progress: (s) => [c('win')(s), 1] },
  { id: 'treasure', name: 'Treasure Hunter', desc: 'Find all 5 secret QR codes hidden in the arena.', rarity: 'legendary', icon: MapIcon, xp: 2000, progress: (s) => [s.secrets.length, 5] },
  { id: 'high-roller', name: 'High Roller', desc: 'Spend 5,000 coins in the shop.', rarity: 'epic', icon: Gem, xp: 700, progress: (s) => [s.coinsSpent, 5000] },
  { id: 'going-pro', name: 'Going Pro', desc: 'Reach the Pro rank (Level 20).', rarity: 'rare', icon: Medal, xp: 500, progress: (s) => [levelFromXp(s.xp), 20] },
  { id: 'club59', name: 'Club 59', desc: 'Reach Level 59. The number on the crest.', rarity: 'mythic', icon: Crown, xp: 5900, progress: (s) => [levelFromXp(s.xp), 59] },
  { id: 'vip', name: 'Behind Closed Doors', desc: 'Play a session in a VIP room.', rarity: 'common', icon: DoorClosed, xp: 150, progress: (s) => [c('room:vip')(s), 1] },
  { id: 'jackpot', name: 'Jackpot', desc: 'Land the 500-coin jackpot on the Lucky Spin.', rarity: 'epic', icon: Dices, xp: 600, progress: (s) => [c('jackpot')(s), 1] },
]

export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)
