import { Crown, Ghost, Skull, Waves, Flame, Anchor, type LucideIcon } from 'lucide-react'

export interface Squad {
  id: string
  name: string
  tag: string
  color: string
  icon: LucideIcon
  motto: string
  weeklyXp: number
  members: number
  wins: number
}

/* Named after Kénitra spots — the river, the beach, the street the arena is on. */
export const SQUADS: Squad[] = [
  { id: 'raiders', name: 'Red Room Raiders', tag: 'RRR', color: '#ff2d4e', icon: Skull, motto: 'Lights red. Hands steady.', weeklyXp: 48210, members: 14, wins: 7 },
  { id: 'sharks', name: 'Sebou Sharks', tag: 'SBS', color: '#5ff3da', icon: Anchor, motto: 'Smell the comeback.', weeklyXp: 45980, members: 12, wins: 9 },
  { id: 'lions', name: 'Atlas Lions', tag: 'ATL', color: '#ffc83d', icon: Crown, motto: 'Dima, until the final whistle.', weeklyXp: 43120, members: 16, wins: 6 },
  { id: 'phantoms', name: 'Chella Phantoms', tag: 'CHP', color: '#c46bff', icon: Ghost, motto: 'You never hear us spawn.', weeklyXp: 39870, members: 11, wins: 4 },
  { id: 'waves', name: 'Mehdia Waves', tag: 'MHW', color: '#6fa8ff', icon: Waves, motto: 'Wave after wave after wave.', weeklyXp: 36440, members: 13, wins: 5 },
  { id: 'kings', name: 'Ville Haute Kings', tag: 'VHK', color: '#ff9f43', icon: Flame, motto: 'Top of the hill, top of the board.', weeklyXp: 31290, members: 9, wins: 3 },
]

export const squadById = (id: string | null | undefined) => SQUADS.find((s) => s.id === id) ?? null
