import { seeded } from '../lib/rng'
import { xpForLevel } from './ranks'
import { GAMES } from './games'
import { SQUADS } from './squads'

export interface MockPlayer {
  id: string
  tag: string
  name: string
  level: number
  xp: number
  weeklyXp: number
  monthlyXp: number
  squadId: string
  favGame: string
  streak: number
  wins: number
  checkins: number
  seed: string
}

const ROSTER: [string, string][] = [
  ['KenitraKing', 'Yassine B.'],
  ['SebouSniper', 'Hamza E.'],
  ['Ghost_Chella', 'Othmane R.'],
  ['Salma.exe', 'Salma A.'],
  ['AnasTheGoat', 'Anas M.'],
  ['MehdiaWave', 'Ilyas K.'],
  ['Reda_R9', 'Reda T.'],
  ['Imane_GG', 'Imane L.'],
  ['ZakiZero', 'Zakaria H.'],
  ['AyoubNoScope', 'Ayoub F.'],
  ['RedVelvet', 'Kawtar S.'],
  ['Mehdi_KO', 'Mehdi O.'],
  ['NoraNova', 'Nora B.'],
  ['Adam_Atlas', 'Adam C.'],
  ['Rayane404', 'Rayane D.'],
  ['YoussefYK', 'Youssef K.'],
  ['Nizar_Nitro', 'Nizar E.'],
  ['Badr_Blitz', 'Badr Z.'],
  ['Walid_Wiz', 'Walid N.'],
  ['SoufianeX', 'Soufiane I.'],
  ['Aya_Arcade', 'Aya R.'],
  ['TahaTurbo', 'Taha M.'],
  ['Hiba_HP', 'Hiba J.'],
  ['Marwane_MVP', 'Marwane A.'],
  ['Karim_Kombat', 'Karim B.'],
  ['Lina_Loot', 'Lina E.'],
  ['Omar_Overtime', 'Omar T.'],
  ['Jad_Joystick', 'Jad L.'],
  ['Rim_Respawn', 'Rim H.'],
  ['Nassim_Nade', 'Nassim F.'],
  ['Achraf_Ace', 'Achraf O.'],
  ['Ghita_GG', 'Ghita M.'],
  ['Bilal_Boss', 'Bilal S.'],
  ['Sami_Spin', 'Sami K.'],
  ['Ismail_Ice', 'Ismail D.'],
  ['Ziad_Zero', 'Ziad A.'],
  ['Kenza_KO', 'Kenza B.'],
  ['Tarik_Tilt', 'Tarik R.'],
  ['Houda_Hex', 'Houda C.'],
  ['Amine_Aim', 'Amine Y.'],
]

const LEVELS = [57, 54, 52, 49, 47, 45, 44, 41, 39, 38, 36, 35, 33, 31, 30, 29, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4]

export const MOCK_PLAYERS: MockPlayer[] = ROSTER.map(([tag, name], i) => {
  const r = seeded(tag)
  const level = LEVELS[i]
  const xp = xpForLevel(level) + r.int(0, Math.max(50, (xpForLevel(level + 1) - xpForLevel(level)) * 0.9))
  const weeklyXp = Math.round(2600 - i * 48 + r.int(-380, 380) + (level > 40 ? 300 : 0))
  return {
    id: `p${i}`,
    tag,
    name,
    level,
    xp,
    weeklyXp: Math.max(220, weeklyXp),
    monthlyXp: Math.max(900, weeklyXp * 4 + r.int(-1500, 1500)),
    squadId: SQUADS[(i * 7 + r.int(0, 5)) % SQUADS.length].id,
    favGame: r.pick(GAMES.slice(0, 8)).id,
    streak: Math.max(1, Math.round(level / 5) + r.int(-2, 4)),
    wins: Math.max(0, Math.round(level / 6) + r.int(-2, 3)),
    checkins: Math.round(level * 3.6 + r.int(0, 20)),
    seed: tag,
  }
})

export const playerByTag = (tag: string) => MOCK_PLAYERS.find((p) => p.tag.toLowerCase() === tag.toLowerCase())

/* Hall of fame: past cup winners */
export const HALL_OF_FAME = [
  { title: 'FC 26 Friday Night Cup #12', tag: 'SebouSniper', date: 'Oct 2', prize: '500 DH' },
  { title: 'TEKKEN 8 King of the Hill', tag: 'Karim_Kombat', date: 'Sep 28', prize: '300 DH' },
  { title: 'FC 26 Friday Night Cup #11', tag: 'KenitraKing', date: 'Sep 25', prize: '500 DH' },
  { title: 'COD Squad Showdown', tag: 'Ghost_Chella', date: 'Sep 20', prize: '4 × VIP hour' },
  { title: 'FC 26 Friday Night Cup #10', tag: 'AnasTheGoat', date: 'Sep 18', prize: '500 DH' },
  { title: 'Mortal Kombat Monday', tag: 'Salma.exe', date: 'Sep 15', prize: '200 DH' },
]
