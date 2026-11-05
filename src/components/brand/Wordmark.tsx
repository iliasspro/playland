import { useId } from 'react'
import { layoutWord } from './glyphs'

const PLAY = layoutWord('PLAY')
const LAND = layoutWord('LAND')
const GAP = 34
const TOTAL = PLAY.width + GAP + LAND.width

export function Wordmark({ height = 26, className = '', flat = false }: { height?: number; className?: string; flat?: boolean }) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const gid = `${raw}-wm`
  const word = (
    <>
      {PLAY.parts.map((p, i) => (
        <path key={`p${i}`} d={p.d} transform={`translate(${p.x} 0)`} fillRule="evenodd" />
      ))}
      {LAND.parts.map((p, i) => (
        <path key={`l${i}`} d={p.d} transform={`translate(${PLAY.width + GAP + p.x} 0)`} fillRule="evenodd" />
      ))}
    </>
  )
  const pad = 16
  const vw = TOTAL + pad * 2
  const vh = 100 + pad * 2 + 6
  return (
    <svg className={`wordmark ${className}`} viewBox={`${-pad} ${-pad} ${vw} ${vh}`} height={height} width={(height * vw) / vh} role="img" aria-label="Play Land">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#f2fffc" />
          <stop offset="0.52" stopColor="#c4f2eb" />
          <stop offset="1" stopColor="#8ad0c7" />
        </linearGradient>
      </defs>
      {!flat && (
        <>
          <g fill="#8ad0c7" stroke="#8ad0c7" strokeWidth="20" strokeLinejoin="round" opacity="0.9">
            {word}
          </g>
          <g fill="#031619" stroke="#031619" strokeWidth="11" strokeLinejoin="round" transform="translate(0 6)">
            {word}
          </g>
          <g fill="#031619" stroke="#031619" strokeWidth="11" strokeLinejoin="round">
            {word}
          </g>
        </>
      )}
      <g fill={`url(#${gid})`}>{word}</g>
    </svg>
  )
}
