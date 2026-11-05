import { memo, useMemo } from 'react'
import { qrMatrix } from '../../lib/qr'
import { GLYPHS } from '../brand/glyphs'

/* Brand-styled QR: dot modules, rounded finder eyes, crest "P" in the middle. */
export const QrCode = memo(function QrCode({
  value,
  size = 220,
  fg = '#031619',
  bg = '#eafbf8',
  eye = '#031619',
  logo = true,
  className = '',
}: {
  value: string
  size?: number
  fg?: string
  bg?: string
  eye?: string
  logo?: boolean
  className?: string
}) {
  const m = useMemo(() => qrMatrix(value, logo ? 'H' : 'Q'), [value, logo])
  const n = m.size
  const q = 3 // quiet zone
  const total = n + q * 2
  const inFinder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
  const logoSize = Math.round(n * 0.2) | 1
  const lo = Math.floor((n - logoSize) / 2)
  const inLogo = (x: number, y: number) => logo && x >= lo - 1 && x <= lo + logoSize && y >= lo - 1 && y <= lo + logoSize
  const dots = useMemo(() => {
    const out: string[] = []
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        if (!m.get(x, y) || inFinder(x, y) || inLogo(x, y)) continue
        out.push(`M${x + q + 0.5} ${y + q + 0.5}m-0.42 0a0.42 0.42 0 1 0 0.84 0a0.42 0.42 0 1 0 -0.84 0`)
      }
    return out.join('')
  }, [m, n]) // eslint-disable-line react-hooks/exhaustive-deps
  const eyeAt = (x: number, y: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x + q} ${y + q})`}>
      <rect x="0.5" y="0.5" width="6" height="6" rx="1.8" fill="none" stroke={fg} strokeWidth="1" />
      <rect x="2" y="2" width="3" height="3" rx="0.9" fill={eye} />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${total} ${total}`} width={size} height={size} className={`qr ${className}`} shapeRendering="geometricPrecision" role="img" aria-label="QR code">
      <rect width={total} height={total} rx={2.4} fill={bg} />
      <path d={dots} fill={fg} />
      {eyeAt(0, 0)}
      {eyeAt(n - 7, 0)}
      {eyeAt(0, n - 7)}
      {logo && (
        <g transform={`translate(${lo + q} ${lo + q})`}>
          <rect x="0" y="0" width={logoSize} height={logoSize} rx={logoSize * 0.22} fill={fg} />
          <path d={GLYPHS.P.d} fillRule="evenodd" fill="#5ff3da" transform={`translate(${logoSize * 0.27} ${logoSize * 0.2}) scale(${(logoSize * 0.6) / 100})`} />
        </g>
      )}
    </svg>
  )
})
