import { Coffee, Timer, Popcorn, Gamepad2, Frame, Palette, UserPlus, Ticket, DoorClosed, Cake, Shirt, CreditCard, type LucideIcon } from 'lucide-react'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface Reward {
  id: string
  name: string
  desc: string
  cost: number
  rarity: Rarity
  icon: LucideIcon
  kind: 'venue' | 'digital' | 'merch'
  stock?: number
  minLevel?: number
  hot?: boolean
}

export const RARITY: Record<Rarity, { label: string; color: string }> = {
  common: { label: 'Common', color: 'var(--r-common)' },
  rare: { label: 'Rare', color: 'var(--r-rare)' },
  epic: { label: 'Epic', color: 'var(--r-epic)' },
  legendary: { label: 'Legendary', color: 'var(--r-legendary)' },
  mythic: { label: 'Mythic', color: 'var(--r-mythic)' },
}

export const REWARDS: Reward[] = [
  { id: 'coffee', name: 'Free Coffee', desc: 'Any drink from the coffee machine at the door. Fuel for overtime.', cost: 300, rarity: 'common', icon: Coffee, kind: 'venue', hot: true },
  { id: 'tagcolor', name: 'Crimson Gamertag', desc: 'Your tag glows red on every leaderboard and on the arena screens.', cost: 200, rarity: 'common', icon: Palette, kind: 'digital' },
  { id: 'snack', name: 'Snack Combo', desc: 'Chips + soda delivered to your station mid-match.', cost: 400, rarity: 'common', icon: Popcorn, kind: 'venue' },
  { id: 'plus30', name: '+30 Min Overtime', desc: 'Extend any session by 30 minutes. Finish that comeback.', cost: 450, rarity: 'common', icon: Timer, kind: 'venue' },
  { id: 'frame', name: 'Neon Profile Frame', desc: 'Animated mint frame around your avatar on the Play Pass.', cost: 250, rarity: 'rare', icon: Frame, kind: 'digital' },
  { id: 'hour', name: '1 Hour Free', desc: 'A full hour on any PS5 station, any game, any time.', cost: 900, rarity: 'rare', icon: Gamepad2, kind: 'venue', hot: true },
  { id: 'friend', name: 'Friend Pass', desc: 'Gift a free hour to a friend who has never visited. Grow the squad.', cost: 1200, rarity: 'rare', icon: UserPlus, kind: 'venue' },
  { id: 'ticket', name: 'Tournament Ticket', desc: 'Free entry to any weekly cup. Bring your A-game.', cost: 700, rarity: 'epic', icon: Ticket, kind: 'venue', minLevel: 10 },
  { id: 'vip', name: 'VIP Room · 1 Hour', desc: 'Private room, closed door, 4 controllers, your rules.', cost: 2000, rarity: 'epic', icon: DoorClosed, kind: 'venue', minLevel: 15, stock: 6 },
  { id: 'bday', name: 'Birthday Squad Pack', desc: '2 hours in the VIP room for 4, cake moment on the big screen.', cost: 4500, rarity: 'legendary', icon: Cake, kind: 'venue', minLevel: 20, stock: 3 },
  { id: 'jersey', name: 'Play Land “59” Jersey', desc: 'Limited drop. Your gamertag printed on the back.', cost: 6000, rarity: 'legendary', icon: Shirt, kind: 'merch', minLevel: 25, stock: 12 },
  { id: 'psn', name: 'PlayStation Store Card · 200 DH', desc: 'The ultimate grind reward. Top up your own library.', cost: 15000, rarity: 'mythic', icon: CreditCard, kind: 'merch', minLevel: 35, stock: 2 },
]

export const rewardById = (id: string) => REWARDS.find((r) => r.id === id)
