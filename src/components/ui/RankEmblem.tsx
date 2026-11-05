import { useId } from 'react'
import { rankById, type RankId } from '../../data/ranks'
import { GLYPHS } from '../brand/glyphs'

/* Parametric rank emblems — hex core, chevrons, wings and crowns stack up as you climb. */

const HEX = (r: number, cx = 60, cy = 60) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')

const CONFIG: Record<RankId, { chevrons: number; wings: 0 | 1 | 2; crown: boolean; star: boolean; num?: boolean }> = {
  rookie: { chevrons: 1, wings: 0, crown: false, star: false },
  challenger: { chevrons: 2, wings: 0, crown: false, star: false },
  pro: { chevrons: 3, wings: 0, crown: false, star: false },
  elite: { chevrons: 2, wings: 1, crown: false, star: true },
  master: { chevrons: 3, wings: 1, crown: true, star: false },
  grandmaster: { chevrons: 3, wings: 2, crown: true, star: true },
  club59: { chevrons: 0, wings: 2, crown: true, star: false, num: true },
}

export function RankEmblem({ rank, size = 64, className = '', glow = true }: { rank: RankId; size?: number; className?: string; glow?: boolean }) {
  const R = rankById(rank)
  const cfg = CONFIG[rank]
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const g = `${raw}-g`
  const gi = `${raw}-gi`
  const holo = rank === 'club59'
  const wing = (flip: boolean) => {
    const s = flip ? -1 : 1
    const tx = flip ? 120 : 0
    return (
      <g transform={`translate(${tx} 0) scale(${s} 1)`}>
        <path d="M28 44 L4 30 L12 44 L0 48 L14 56 L4 64 L22 62 L16 72 L30 66 Z" fill={`url(#${g})`} stroke="#03161a" strokeWidth="2" strokeLinejoin="round" />
        {cfg.wings === 2 && (
          <path d="M26 66 L8 80 L20 80 L12 90 L30 80 Z" fill={`url(#${g})`} stroke="#03161a" strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
        )}
      </g>
    )
  }
  const fifty = [
    { d: GLYPHS['5'].d, x: 0 },
    { d: GLYPHS['9'].d, x: 74 },
  ]
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`rank-emblem ${holo ? 'rank-emblem--holo' : ''} ${className}`}
      style={glow ? { filter: `drop-shadow(0 0 ${size / 8}px ${R.color}66)` } : undefined}
      role="img"
      aria-label={`${R.name} rank`}
    >
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0.3" y2="1">
          {holo ? (
            <>
              <stop offset="0" stopColor="#fff6c9" />
              <stop offset="0.3" stopColor="#ffc83d" />
              <stop offset="0.65" stopColor="#ff5a74" />
              <stop offset="1" stopColor="#8e1430" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.25" stopColor={R.color} />
              <stop offset="1" stopColor={R.color2} />
            </>
          )}
        </linearGradient>
        <linearGradient id={gi} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f2a2f" />
          <stop offset="1" stopColor="#03161a" />
        </linearGradient>
      </defs>
      {cfg.wings > 0 && (
        <>
          {wing(false)}
          {wing(true)}
        </>
      )}
      {cfg.crown && <path d="M40 26 L44 8 L52 20 L60 4 L68 20 L76 8 L80 26 Z" fill={`url(#${g})`} stroke="#03161a" strokeWidth="2.5" strokeLinejoin="round" />}
      <polygon points={HEX(44)} fill="#03161a" />
      <polygon points={HEX(41)} fill={`url(#${g})`} />
      <polygon points={HEX(31)} fill={`url(#${gi})`} stroke={R.color} strokeOpacity="0.5" strokeWidth="1.5" />
      <polygon points={HEX(41)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
      {cfg.star && (
        <path
          d="M60 38 L63.6 46.4 L72.6 47.2 L65.8 53.2 L67.8 62 L60 57.4 L52.2 62 L54.2 53.2 L47.4 47.2 L56.4 46.4 Z"
          fill={`url(#${g})`}
          transform={cfg.chevrons ? 'translate(0 -4)' : undefined}
        />
      )}
      {Array.from({ length: cfg.chevrons }, (_, i) => {
        const base = cfg.star ? 66 : 50 + (3 - cfg.chevrons) * 5
        const y = base + i * 10
        return <path key={i} d={`M45 ${y + 7} L60 ${y} L75 ${y + 7}`} fill="none" stroke={`url(#${g})`} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      })}
      {cfg.num && (
        <g transform="translate(43.5 47) scale(0.236)" fill={`url(#${g})`}>
          {fifty.map((p, i) => (
            <path key={i} d={p.d} transform={`translate(${p.x} 0)`} fillRule="evenodd" />
          ))}
        </g>
      )}
    </svg>
  )
}
