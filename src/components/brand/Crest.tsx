import { useId, type CSSProperties } from 'react'
import { layoutWord } from './glyphs'
import './crest.css'

/* Vector rebuild of the Play Land "59" crest (controller + shield + ribbon).
   Parts carry class names so they can be animated independently. */

export const CONTROLLER =
  'M150 52 C185 38 226 42 250 58 L350 58 C374 42 415 38 450 52 C502 68 538 116 550 176 C562 236 556 296 518 322 C488 342 452 326 438 292 L420 252 L180 252 L162 292 C148 326 112 342 82 322 C44 296 38 236 50 176 C62 116 98 68 150 52 Z'
export const SHIELD = 'M92 236 L508 236 L506 470 L300 598 L94 470 Z'
export const RIBBON =
  'M66 494 L118 494 L118 484 L482 484 L482 494 L534 494 L512 518 L534 544 L466 544 L466 536 L134 536 L134 544 L66 544 L88 518 Z'
const BUMPERS =
  'M150 52 C185 38 226 42 250 58 L350 58 C374 42 415 38 450 52 C478 60 500 76 516 96 C470 80 420 76 380 82 L220 82 C180 76 130 80 84 96 C100 76 122 60 150 52 Z'
const HORN_L = 'M60 168 C46 240 74 304 156 334 C118 298 106 252 118 194 C100 184 80 175 60 168 Z'
const HORN_R = 'M540 168 C554 240 526 304 444 334 C482 298 494 252 482 194 C500 184 520 175 540 168 Z'
const DPAD = 'M216 150 h24 v24 h24 v24 h-24 v24 h-24 v-24 h-24 v-24 h24 Z'

const PLAY = layoutWord('PLAY')
const LAND = layoutWord('LAND')
const FIFTY_NINE = layoutWord('59', 8)

export interface CrestProps {
  size?: number | string
  className?: string
  style?: CSSProperties
  /** idle: buttons blink softly · boot: assemble sequence · none: static */
  mode?: 'idle' | 'boot' | 'none'
  glow?: boolean
  title?: string
}

export function Crest({ size = 120, className = '', style, mode = 'idle', glow = false, title = 'Play Land 59 crest' }: CrestProps) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (n: string) => `${raw}-${n}`
  const u = (n: string) => `url(#${id(n)})`
  return (
    <svg
      className={`crest crest--${mode} ${glow ? 'crest--glow' : ''} ${className}`}
      viewBox="0 0 600 620"
      width={size}
      height={typeof size === 'number' ? size * (620 / 600) : undefined}
      style={style}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#173a3d" />
          <stop offset="0.55" stopColor="#0b2025" />
          <stop offset="1" stopColor="#051215" />
        </linearGradient>
        <linearGradient id={id('txt')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#f2fffc" />
          <stop offset="0.52" stopColor="#c4f2eb" />
          <stop offset="1" stopColor="#8ad0c7" />
        </linearGradient>
        <linearGradient id={id('mint')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4f2eb" />
          <stop offset="1" stopColor="#8ad0c7" />
        </linearGradient>
        <linearGradient id={id('ribbon')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bdeee6" />
          <stop offset="0.5" stopColor="#8ad0c7" />
          <stop offset="1" stopColor="#5fa79e" />
        </linearGradient>
        <linearGradient id={id('shine')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <g id={id('sil')}>
          <path d={CONTROLLER} />
          <path d={SHIELD} />
          <path d={RIBBON} />
        </g>
        <g id={id('play')}>
          {PLAY.parts.map((p, i) => (
            <path key={i} d={p.d} transform={`translate(${p.x} 0)`} fillRule="evenodd" />
          ))}
        </g>
        <g id={id('land')}>
          {LAND.parts.map((p, i) => (
            <path key={i} d={p.d} transform={`translate(${p.x} 0)`} fillRule="evenodd" />
          ))}
        </g>
        <clipPath id={id('clip')}>
          <use href={`#${id('sil')}`} />
        </clipPath>
      </defs>

      {/* outer sticker border */}
      <g className="cr-border">
        <use href={`#${id('sil')}`} fill="#badfdb" stroke="#badfdb" strokeWidth="30" strokeLinejoin="round" />
        <use href={`#${id('sil')}`} fill="#031619" stroke="#031619" strokeWidth="12" strokeLinejoin="round" />
      </g>
      {mode === 'boot' && (
        <g className="cr-draw" fill="none" stroke="#5ff3da" strokeWidth="6" strokeLinejoin="round">
          <path d={CONTROLLER} pathLength={1} />
          <path d={SHIELD} pathLength={1} />
          <path d={RIBBON} pathLength={1} />
        </g>
      )}

      <g className="cr-core">
        <path d={SHIELD} fill="#0a1a1f" />
        <path className="cr-chevron" d="M232 548 L300 590 L368 548" fill="none" stroke="#8ad0c7" strokeWidth="10" strokeLinejoin="round" />
        <path d={CONTROLLER} fill={u('body')} />
        <path d={BUMPERS} fill="#1e4a4b" opacity="0.9" />
        <path className="cr-horn" d={HORN_L} fill={u('mint')} />
        <path className="cr-horn cr-horn--r" d={HORN_R} fill={u('mint')} />

        <g className="cr-stick" style={{ transformOrigin: '168px 118px' }}>
          <circle cx="168" cy="118" r="30" fill="#8ad0c7" />
          <circle cx="168" cy="114" r="22" fill="#c4f2eb" opacity=".55" />
        </g>
        <path className="cr-dpad" d={DPAD} fill="#8ad0c7" />
        <circle cx="246" cy="112" r="6" fill="#2f6662" />
        <circle cx="354" cy="112" r="6" fill="#2f6662" />
        <circle className="cr-btn" style={{ ['--i' as string]: 0 }} cx="434" cy="88" r="14" fill="#8ad0c7" />
        <circle className="cr-btn" style={{ ['--i' as string]: 1 }} cx="464" cy="118" r="14" fill="#8ad0c7" />
        <circle className="cr-btn" style={{ ['--i' as string]: 2 }} cx="434" cy="148" r="14" fill="#8ad0c7" />
        <circle className="cr-btn" style={{ ['--i' as string]: 3 }} cx="404" cy="118" r="14" fill="#8ad0c7" />
        <g className="cr-stick cr-stick--r" style={{ transformOrigin: '362px 196px' }}>
          <circle cx="362" cy="196" r="32" fill="#8ad0c7" />
          <circle cx="362" cy="192" r="23" fill="#c4f2eb" opacity=".55" />
        </g>

        <g className="cr-word cr-word--play">
          <g transform="translate(198 262) scale(0.62)">
          <use href={`#${id('play')}`} fill="#badfdb" stroke="#badfdb" strokeWidth="40" strokeLinejoin="round" />
          <use href={`#${id('play')}`} fill="#031619" stroke="#031619" strokeWidth="22" strokeLinejoin="round" transform="translate(0 8)" />
          <use href={`#${id('play')}`} fill="#031619" stroke="#031619" strokeWidth="22" strokeLinejoin="round" />
          <use href={`#${id('play')}`} fill={u('txt')} />
          </g>
        </g>
        <g className="cr-word cr-word--land">
          <g transform="translate(122 346) scale(1.08)">
          <use href={`#${id('land')}`} fill="#badfdb" stroke="#badfdb" strokeWidth="26" strokeLinejoin="round" />
          <use href={`#${id('land')}`} fill="#031619" stroke="#031619" strokeWidth="14" strokeLinejoin="round" transform="translate(0 6)" />
          <use href={`#${id('land')}`} fill="#031619" stroke="#031619" strokeWidth="14" strokeLinejoin="round" />
          <use href={`#${id('land')}`} fill={u('txt')} />
          </g>
        </g>

        <g className="cr-ribbon">
          <path d="M66 494 L118 494 L118 536 L134 536 L134 544 L66 544 L88 518 Z" fill="#4f8681" />
          <path d="M534 494 L482 494 L482 536 L466 536 L466 544 L534 544 L512 518 Z" fill="#4f8681" />
          <rect x="112" y="484" width="376" height="52" fill={u('ribbon')} />
          <circle cx="146" cy="510" r="6" fill="#031619" />
          <circle cx="454" cy="510" r="6" fill="#031619" />
        </g>
        <g className="cr-59">
          <path d="M256 468 L344 468 L352 542 L248 542 Z" fill="#031619" />
          <g transform={`translate(${300 - (FIFTY_NINE.width * 0.42) / 2} 486) scale(0.42)`}>
            {FIFTY_NINE.parts.map((p, i) => (
              <path key={i} d={p.d} transform={`translate(${p.x} 0)`} fillRule="evenodd" fill="#c4f2eb" />
            ))}
          </g>
        </g>
      </g>

      {mode !== 'none' && (
        <g clipPath={u('clip')} className="cr-shine-wrap" style={{ pointerEvents: 'none' }}>
          <rect className="cr-shine" x="-300" y="0" width="300" height="620" fill={u('shine')} />
        </g>
      )}
    </svg>
  )
}
