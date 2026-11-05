import { useId, type SVGProps } from 'react'
import { GLYPHS } from '../brand/glyphs'

type P = { size?: number; className?: string } & Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>

const useGid = (n: string) => `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-${n}`

/** Arcade token stamped with the crest "P". */
export function CoinIcon({ size = 18, className = '', ...rest }: P) {
  const g = useGid('coin')
  const e = useGid('edge')
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`coin-icon ${className}`} {...rest}>
      <defs>
        <linearGradient id={g} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.35" stopColor="#ffd45c" />
          <stop offset="0.7" stopColor="#ffb422" />
          <stop offset="1" stopColor="#c27c12" />
        </linearGradient>
        <linearGradient id={e} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe48a" />
          <stop offset="1" stopColor="#8a5208" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12.6" r="10.6" fill="#7a4a06" />
      <circle cx="12" cy="12" r="10.6" fill={`url(#${e})`} />
      <circle cx="12" cy="12" r="8.9" fill={`url(#${g})`} />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#b7791f" strokeOpacity=".55" strokeWidth=".9" strokeDasharray="1.2 1.1" />
      <path d={GLYPHS.P.d} transform="translate(8.1 7.2) scale(0.106)" fill="#8a5208" fillRule="evenodd" />
      <path d={GLYPHS.P.d} transform="translate(8.1 6.7) scale(0.106)" fill="#fff8dc" fillRule="evenodd" opacity=".95" />
    </svg>
  )
}

/** XP gem — a mint diamond with a level-up chevron. */
export function XpIcon({ size = 18, className = '', ...rest }: P) {
  const g = useGid('xp')
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`xp-icon ${className}`} {...rest}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6fffb" />
          <stop offset="0.45" stopColor="#5ff3da" />
          <stop offset="1" stopColor="#1e8f80" />
        </linearGradient>
      </defs>
      <path d="M12 1.5 L22.5 12 L12 22.5 L1.5 12 Z" fill="#0b3b37" />
      <path d="M12 1.5 L22.5 12 L12 21 L1.5 12 Z" fill={`url(#${g})`} />
      <path d="M12 4.5 L19.5 12 L12 12 Z" fill="#fff" opacity=".35" />
      <path d="M7.5 13.6 L12 9.2 L16.5 13.6" fill="none" stroke="#04211f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FlameIcon({ size = 18, className = '', ...rest }: P) {
  const g = useGid('fl')
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} {...rest}>
      <defs>
        <linearGradient id={g} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff2d4e" />
          <stop offset="0.6" stopColor="#ff7a45" />
          <stop offset="1" stopColor="#ffd45c" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.8c.8 3.4-1.4 5.1-3 7-1.7 2-2.9 3.9-2.9 6.4A5.9 5.9 0 0 0 12 21.6a5.9 5.9 0 0 0 5.9-6.4c-.2-2.4-1.3-3.9-2.4-5.3.1 1.6-.4 2.8-1.6 3.4.4-3.9-.4-8.4-1.9-11.5Z"
        fill={`url(#${g})`}
      />
      <path d="M12 13.2c-1.4 1.3-2.4 2.4-2.4 4a2.4 2.4 0 0 0 4.8 0c0-1.5-1-2.6-2.4-4Z" fill="#fff6d6" opacity=".9" />
    </svg>
  )
}

export function InstagramIcon({ size = 18, className = '' }: P) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* controller face-button shapes */
export function ShapeIcon({ shape, size = 18, className = '', stroke = 2.6 }: { shape: 'tri' | 'cir' | 'crs' | 'sqr'; size?: number; className?: string; stroke?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {shape === 'tri' && <path d="M12 4 L20.5 19 H3.5 Z" />}
      {shape === 'cir' && <circle cx="12" cy="12" r="8" />}
      {shape === 'crs' && <path d="M5.5 5.5 L18.5 18.5 M18.5 5.5 L5.5 18.5" />}
      {shape === 'sqr' && <rect x="4.5" y="4.5" width="15" height="15" rx="1" />}
    </svg>
  )
}
