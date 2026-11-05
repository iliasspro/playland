import { nextWeekday, now } from '../lib/time'

export interface PLEvent {
  id: string
  title: string
  short: string
  game: string
  kind: 'tournament' | 'party' | 'special'
  when: number
  durationH: number
  format: string
  entry: string
  prize: string
  coins: number
  xp: number
  slots: number
  taken: number
  color: string
  desc: string
  recurring?: string
}

function nextOct31() {
  const d = new Date(now())
  let t = new Date(d.getFullYear(), 9, 31, 20, 0).getTime()
  if (t < now()) t = new Date(d.getFullYear() + 1, 9, 31, 20, 0).getTime()
  return t
}

export function getEvents(): PLEvent[] {
  const list: PLEvent[] = [
    {
      id: 'friday-cup',
      title: 'FC 26 Friday Night Cup',
      short: 'Friday Cup',
      game: 'fc26',
      kind: 'tournament',
      when: nextWeekday(5, 21),
      durationH: 3,
      format: '16 players · 1v1 knockout · 6-min halves',
      entry: '30 DH',
      prize: '500 DH + 2,000 coins',
      coins: 100,
      xp: 200,
      slots: 16,
      taken: 13,
      color: '#5ff3da',
      desc: 'The weekly crown. Sixteen players, one champion, and the whole Red Room watching the final on the big screen.',
      recurring: 'Every Friday · 21:00',
    },
    {
      id: 'cod-showdown',
      title: 'COD Squad Showdown',
      short: 'Squad Showdown',
      game: 'cod',
      kind: 'tournament',
      when: nextWeekday(6, 22),
      durationH: 3,
      format: '8 squads · 4v4 · Search & Destroy',
      entry: '100 DH / squad',
      prize: '4 × VIP hour + 4,000 coins',
      coins: 100,
      xp: 200,
      slots: 8,
      taken: 6,
      color: '#ff9f43',
      desc: 'Bring your squad, claim a room, and fight for the Saturday night belt. Squad XP counts double.',
      recurring: 'Every Saturday · 22:00',
    },
    {
      id: 'tekken-koth',
      title: 'TEKKEN 8 · King of the Hill',
      short: 'King of the Hill',
      game: 'tekken',
      kind: 'tournament',
      when: nextWeekday(0, 18),
      durationH: 3,
      format: 'Winner stays on · 3-round sets',
      entry: 'Free',
      prize: '300 DH + 1,500 coins',
      coins: 100,
      xp: 200,
      slots: 32,
      taken: 19,
      color: '#ff2d4e',
      desc: 'One stick, one crown. Hold the throne longest and the hill is yours until next Sunday.',
      recurring: 'Every Sunday · 18:00',
    },
    {
      id: 'mk-monday',
      title: 'Mortal Kombat Monday',
      short: 'MK Monday',
      game: 'mk1',
      kind: 'tournament',
      when: nextWeekday(1, 21),
      durationH: 2,
      format: '1v1 · double elimination',
      entry: '20 DH',
      prize: '200 DH + 1,000 coins',
      coins: 100,
      xp: 200,
      slots: 16,
      taken: 9,
      color: '#ffc83d',
      desc: 'Start the week with a fatality. Double elimination, so one bad round won’t end your night.',
      recurring: 'Every Monday · 21:00',
    },
    {
      id: 'clasico',
      title: 'Clásico Night',
      short: 'Clásico Night',
      game: 'fc26',
      kind: 'party',
      when: nextWeekday(6, 20) + 7 * 86400000,
      durationH: 4,
      format: 'Live match on the big screen + FC 26 mini-cup',
      entry: 'Free with any session',
      prize: 'Exact-score prediction wins 1 hour free',
      coins: 150,
      xp: 250,
      slots: 40,
      taken: 27,
      color: '#6fa8ff',
      desc: 'Watch it together, then settle the argument on the pad. Predictions lock at kick-off.',
    },
    {
      id: 'after-dark',
      title: 'Red Room After Dark',
      short: 'After Dark',
      game: 'cod',
      kind: 'special',
      when: nextOct31(),
      durationH: 6,
      format: 'Halloween night · costume = double XP all night',
      entry: 'Regular prices',
      prize: 'Best costume: Birthday Squad Pack',
      coins: 200,
      xp: 400,
      slots: 60,
      taken: 22,
      color: '#c46bff',
      desc: 'Lights off, red on. Horror co-op marathon, secret QR hunt with bonus codes, and a costume contest.',
    },
  ]
  return list.sort((a, b) => a.when - b.when)
}

/* ---------- Friday Cup live bracket (mock) ---------- */
export interface Match {
  a: string
  b: string
  sa?: number
  sb?: number
  live?: boolean
}

export const FRIDAY_BRACKET: Match[][] = [
  [
    { a: 'KenitraKing', b: 'Rayane404', sa: 4, sb: 1 },
    { a: 'Reda_R9', b: 'Jad_Joystick', sa: 2, sb: 3 },
    { a: 'SebouSniper', b: 'Tarik_Tilt', sa: 5, sb: 2 },
    { a: 'AnasTheGoat', b: 'Ziad_Zero', sa: 3, sb: 3, live: true },
    { a: 'MehdiaWave', b: 'Omar_Overtime' },
    { a: 'Salma.exe', b: 'Badr_Blitz' },
    { a: 'Ghost_Chella', b: 'Amine_Aim' },
    { a: 'Marwane_MVP', b: 'Nizar_Nitro' },
  ],
  [
    { a: 'KenitraKing', b: 'Jad_Joystick' },
    { a: 'SebouSniper', b: '—' },
    { a: '—', b: '—' },
    { a: '—', b: '—' },
  ],
  [
    { a: '—', b: '—' },
    { a: '—', b: '—' },
  ],
  [{ a: '—', b: '—' }],
]
