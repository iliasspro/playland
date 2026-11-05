export interface Rank {
  id: RankId
  name: string
  min: number
  max: number
  color: string
  color2: string
  bonus: number
  perks: string[]
  tagline: string
}

export type RankId = 'rookie' | 'challenger' | 'pro' | 'elite' | 'master' | 'grandmaster' | 'club59'

export const MAX_LEVEL = 59

export const RANKS: Rank[] = [
  {
    id: 'rookie',
    name: 'Rookie',
    min: 1,
    max: 9,
    color: '#a9c4c0',
    color2: '#4f6b67',
    bonus: 0,
    perks: ['500 welcome coins', 'Daily Lucky Spin', 'Season Pass · free track'],
    tagline: 'Every legend starts at the spawn point.',
  },
  {
    id: 'challenger',
    name: 'Challenger',
    min: 10,
    max: 19,
    color: '#e8a061',
    color2: '#8a4b1e',
    bonus: 0.05,
    perks: ['+5% coins on every scan', 'Bronze profile frame', 'Tournament sign-ups'],
    tagline: 'You came back. That’s how it starts.',
  },
  {
    id: 'pro',
    name: 'Pro',
    min: 20,
    max: 29,
    color: '#e3f4f1',
    color2: '#7fa19c',
    bonus: 0.1,
    perks: ['+10% coins', '1 free coffee every month', 'Silver profile frame'],
    tagline: 'The regulars know your gamertag.',
  },
  {
    id: 'elite',
    name: 'Elite',
    min: 30,
    max: 39,
    color: '#ffc83d',
    color2: '#b7791f',
    bonus: 0.15,
    perks: ['+15% coins', 'Priority station booking', 'Free hour on your birthday'],
    tagline: 'Gold-tier reflexes. Gold-tier perks.',
  },
  {
    id: 'master',
    name: 'Master',
    min: 40,
    max: 49,
    color: '#5ff3da',
    color2: '#1e8f80',
    bonus: 0.2,
    perks: ['+20% coins', '1 free hour every month', 'Seeded in tournaments'],
    tagline: 'Glowing in the colors of the crest.',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    min: 50,
    max: 58,
    color: '#ff2d4e',
    color2: '#8e1430',
    bonus: 0.25,
    perks: ['+25% coins', '30 min of VIP room every month', 'Exclusive merch drops'],
    tagline: 'The Red Room bows when you walk in.',
  },
  {
    id: 'club59',
    name: 'Club 59',
    min: 59,
    max: 59,
    color: '#ffe48a',
    color2: '#ff2d4e',
    bonus: 0.3,
    perks: ['+30% coins', 'Your name on the Hall of Fame wall', '1 free VIP hour every week', 'The numbered Club 59 jersey'],
    tagline: 'Max level. The number on the crest is yours.',
  },
]

/** total XP needed to *reach* level L */
export const xpForLevel = (L: number) => (L <= 1 ? 0 : (L - 1) * 100 + 20 * (L - 1) * (L - 2))

export function levelFromXp(xp: number) {
  let L = 1
  while (L < MAX_LEVEL && xp >= xpForLevel(L + 1)) L++
  return L
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp)
  if (level >= MAX_LEVEL) return { level, cur: xp - xpForLevel(level), need: 0, pct: 1, toNext: 0 }
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return { level, cur: xp - base, need: next - base, pct: (xp - base) / (next - base), toNext: next - xp }
}

export const rankForLevel = (L: number) => RANKS.find((r) => L >= r.min && L <= r.max) ?? RANKS[0]
export const rankById = (id: string) => RANKS.find((r) => r.id === id) ?? RANKS[0]
export const rankForXp = (xp: number) => rankForLevel(levelFromXp(xp))
