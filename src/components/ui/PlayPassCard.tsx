import { useRef, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { RotateCw } from 'lucide-react'
import { Crest } from '../brand/Crest'
import { PixelAvatar } from './PixelAvatar'
import { RankEmblem } from './RankEmblem'
import { QrCode } from './QrCode'
import { rankForLevel, levelProgress } from '../../data/ranks'
import { squadById } from '../../data/squads'
import { gameById } from '../../data/games'
import { codeUrl } from '../../lib/qr'
import { sfx } from '../../lib/sfx'
import type { FrameId, TagColor } from '../../store/types'
import './playpass.css'

export interface PassData {
  tag: string
  avatarSeed: string
  xp: number
  squadId: string | null
  favGame: string
  joinedAt: number
  frame?: FrameId
  tagColor?: TagColor
  id?: string
}

/* Holographic membership card: pointer-tracked tilt + foil sheen, flips to the friend QR. */
export function PlayPassCard({ p, size = 'md', flippable = true, style }: { p: PassData; size?: 'sm' | 'md' | 'lg'; flippable?: boolean; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  const lp = levelProgress(p.xp)
  const rank = rankForLevel(lp.level)
  const squad = squadById(p.squadId)
  const game = gameById(p.favGame)
  const number = `PL59 ${String(Math.abs(hash(p.tag)) % 10000).padStart(4, '0')} ${String(Math.abs(hash(p.tag + 'x')) % 10000).padStart(4, '0')}`

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--rx', `${(0.5 - y) * 16}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * 22}deg`)
    el.style.setProperty('--o', '1')
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--o', '0.35')
  }

  return (
    <div ref={ref} className={`pass pass--${size}`} style={{ ...style, ['--rank' as string]: rank.color }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div className="pass-flip" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
        {/* front */}
        <div className="pass-face pass-front">
          <div className="pass-bg" />
          <Crest className="pass-watermark" size={260} mode="none" />
          <div className="pass-holo" />
          <div className="pass-glare" />
          <div className="pass-top">
            <div className="row" style={{ gap: 8 }}>
              <Crest size={30} mode="none" />
              <div>
                <div className="pass-brand">PLAY PASS</div>
                <div className="pass-sub hud-num">KÉNITRA · S01</div>
              </div>
            </div>
            <RankEmblem rank={rank.id} size={size === 'sm' ? 38 : 50} />
          </div>
          <div className="pass-mid">
            <span className={`pass-av frame-${p.frame ?? 'none'}`}>
              <PixelAvatar seed={p.avatarSeed} size={size === 'sm' ? 46 : size === 'lg' ? 74 : 60} rounded={12} />
            </span>
            <div className="pass-who">
              <div className={`pass-tag tag-${p.tagColor ?? 'default'} ${(p.tag || '').length > 10 ? 'long' : ''}`}>{p.tag || 'Player One'}</div>
              <div className="pass-rank hud-num" style={{ color: rank.color }}>
                LV {lp.level} · {rank.name.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="pass-bottom">
            <div className="pass-xp">
              <i style={{ width: `${Math.max(3, lp.pct * 100)}%` }} />
            </div>
            <div className="pass-meta hud-num">
              <span>{number}</span>
              <span>{squad ? squad.tag : game.short}</span>
            </div>
          </div>
          <div className="pass-chip" />
        </div>
        {/* back */}
        <div className="pass-face pass-back">
          <div className="pass-bg" />
          <div className="pass-holo" />
          <div className="pass-back-in">
            <QrCode value={codeUrl({ kind: 'friend', tag: p.tag || 'PlayerOne' })} size={size === 'sm' ? 92 : 124} />
            <div>
              <div className="hud-label">Squad-up QR</div>
              <p className="pass-back-t">A friend scans this while you’re both at the arena — you each get +150 XP and +100 coins.</p>
              <div className="pass-meta hud-num" style={{ marginTop: 8 }}>
                <span>{p.tag}</span>
                <span>since {new Date(p.joinedAt || Date.now()).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {flippable && (
        <button
          className="pass-flip-btn icon-btn"
          onClick={() => {
            sfx.swipe()
            setFlipped((f) => !f)
          }}
          aria-label="Flip card"
        >
          <RotateCw size={16} />
        </button>
      )}
    </div>
  )
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}
