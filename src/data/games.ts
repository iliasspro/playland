export interface Game {
  id: string
  title: string
  short: string
  genre: string
  c1: string
  c2: string
  players: string
  hot?: boolean
}

/* Titles on rotation at the arena (PS5). Tiles are stylised — no cover art. */
export const GAMES: Game[] = [
  { id: 'fc26', title: 'EA SPORTS FC 26', short: 'FC 26', genre: 'Football', c1: '#5ff3da', c2: '#0b6b5e', players: '1–4', hot: true },
  { id: 'cod', title: 'Call of Duty', short: 'COD', genre: 'Shooter', c1: '#ff9f43', c2: '#5a1f05', players: '1–4', hot: true },
  { id: 'gta', title: 'Grand Theft Auto V', short: 'GTA V', genre: 'Open world', c1: '#7bd389', c2: '#14402a', players: '1' },
  { id: 'tekken', title: 'TEKKEN 8', short: 'TEKKEN', genre: 'Fighting', c1: '#ff2d4e', c2: '#4a0716', players: '1–2', hot: true },
  { id: 'mk1', title: 'Mortal Kombat 1', short: 'MK1', genre: 'Fighting', c1: '#ffc83d', c2: '#4b2c00', players: '1–2' },
  { id: 'nba', title: 'NBA 2K26', short: '2K26', genre: 'Basketball', c1: '#6fa8ff', c2: '#0d2a5c', players: '1–4' },
  { id: 'fortnite', title: 'Fortnite', short: 'FORTNITE', genre: 'Battle royale', c1: '#c46bff', c2: '#2c0a52', players: '1–4' },
  { id: 'rl', title: 'Rocket League', short: 'RL', genre: 'Car football', c1: '#4fc3ff', c2: '#08325a', players: '1–4' },
  { id: 'gt7', title: 'Gran Turismo 7', short: 'GT7', genre: 'Racing', c1: '#e3f4f1', c2: '#2a3a3d', players: '1–2' },
  { id: 'ufc', title: 'UFC 5', short: 'UFC 5', genre: 'Fighting', c1: '#ff6b6b', c2: '#3a0a0a', players: '1–2' },
  { id: 'spidey', title: 'Marvel’s Spider-Man 2', short: 'SPIDEY 2', genre: 'Action', c1: '#ff4d6d', c2: '#16204a', players: '1' },
  { id: 'tlou', title: 'The Last of Us Part II', short: 'TLOU II', genre: 'Story', c1: '#a3d9a5', c2: '#1d2b1d', players: '1' },
]

export const gameById = (id: string) => GAMES.find((g) => g.id === id) ?? GAMES[0]
