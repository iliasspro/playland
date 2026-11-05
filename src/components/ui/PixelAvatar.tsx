import { memo, useMemo } from 'react'
import { seeded } from '../../lib/rng'

/* Procedural 8-bit "invader" avatars — every gamertag gets its own creature. */

const PALETTES = [
  ['#5ff3da', '#1e8f80'],
  ['#ff2d4e', '#8e1430'],
  ['#ffc83d', '#b7791f'],
  ['#6fa8ff', '#24479a'],
  ['#e77bff', '#7a2a9a'],
  ['#ff9f43', '#9a4a0b'],
  ['#c4f2eb', '#4f8681'],
  ['#7bd389', '#2b6e3a'],
]

export function avatarColors(seed: string) {
  const r = seeded(seed + ':pal')
  return r.pick(PALETTES)
}

function buildGrid(seed: string) {
  const r = seeded(seed)
  const W = 9
  const H = 9
  const half = Math.ceil(W / 2)
  const grid: number[][] = Array.from({ length: H }, () => Array(W).fill(0))
  for (let y = 1; y < H - 1; y++) {
    for (let x = 0; x < half; x++) {
      const edgeBias = x === 0 ? 0.35 : 0.58
      const v = r.next() < edgeBias ? 1 : 0
      grid[y][x] = v
      grid[y][W - 1 - x] = v
    }
  }
  // guarantee a solid body core
  for (let y = 2; y < 7; y++) {
    grid[y][4] = 1
    grid[y][3] = grid[y][5] = r.next() < 0.85 ? 1 : grid[y][3]
  }
  // eyes (2 = eye pixel)
  const eyeRow = r.int(3, 4)
  const eyeX = r.int(2, 3)
  grid[eyeRow][eyeX] = 2
  grid[eyeRow][W - 1 - eyeX] = 2
  grid[eyeRow - 1][eyeX] = grid[eyeRow - 1][eyeX] || 1
  grid[eyeRow - 1][W - 1 - eyeX] = grid[eyeRow - 1][W - 1 - eyeX] || 1
  // antenna / legs flavour
  if (r.chance(0.5)) {
    grid[0][2] = grid[0][6] = 1
  }
  if (r.chance(0.6)) {
    grid[8][1] = grid[8][7] = 1
    grid[8][3] = grid[8][5] = r.chance(0.5) ? 1 : 0
  }
  return grid
}

export const PixelAvatar = memo(function PixelAvatar({ seed, size = 48, rounded = 10, className = '', bg = true }: { seed: string; size?: number; rounded?: number; className?: string; bg?: boolean }) {
  const grid = useMemo(() => buildGrid(seed), [seed])
  const [c1, c2] = useMemo(() => avatarColors(seed), [seed])
  const gid = useMemo(() => `pa-${seed.replace(/[^a-zA-Z0-9]/g, '')}-${Math.round(size)}`, [seed, size])
  const cell = 10
  const pad = 14
  const vb = 9 * cell + pad * 2
  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} width={size} height={size} className={`pixel-avatar ${className}`} style={{ borderRadius: rounded, flex: 'none' }}>
      <defs>
        <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`${gid}-bg`} cx="0.5" cy="0.35" r="0.8">
          <stop offset="0" stopColor={c2} stopOpacity="0.55" />
          <stop offset="1" stopColor="#031216" />
        </radialGradient>
      </defs>
      {bg && <rect width={vb} height={vb} fill={`url(#${gid}-bg)`} />}
      {bg &&
        Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x="0" y={i * 20 + 4} width={vb} height="1" fill="#fff" opacity="0.04" />
        ))}
      <g transform={`translate(${pad} ${pad})`}>
        {grid.map((row, y) =>
          row.map((v, x) =>
            v ? (
              <rect
                key={`${x}-${y}`}
                x={x * cell}
                y={y * cell}
                width={cell + 0.4}
                height={cell + 0.4}
                fill={v === 2 ? '#ffffff' : `url(#${gid}-g)`}
              />
            ) : null,
          ),
        )}
        {grid.map((row, y) =>
          row.map((v, x) => (v === 2 ? <rect key={`p${x}-${y}`} x={x * cell + 4} y={y * cell + 3} width="4" height="5" fill="#031216" /> : null)),
        )}
      </g>
    </svg>
  )
})
