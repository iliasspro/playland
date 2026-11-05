import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { fx, type FxEvent, type FxTone } from '../../lib/fx'
import { sfx } from '../../lib/sfx'
import { fmt } from '../../lib/format'
import { CoinIcon, XpIcon } from '../ui/icons'
import { RankEmblem } from '../ui/RankEmblem'
import { achievementById } from '../../data/achievements'
import { RARITY } from '../../data/rewards'
import { rankById, type RankId } from '../../data/ranks'
import { Btn } from '../ui/kit'
import './fx.css'

type Particle = { id: number; kind: 'coin' | 'xp'; x0: number; y0: number; x1: number; y1: number; mx: number; my: number; delay: number; last: boolean }
type Floater = { id: number; text: string; x: number; y: number; tone: 'gold' | 'mint' }
type Toast = { id: number; title: string; body?: string; tone: FxTone; kind: 'toast' | 'achievement'; achId?: string }
type LevelUp = { level: number; rankId: string; rankUp: boolean }

let pid = 0
const BRAND = ['#5ff3da', '#8ad0c7', '#ff2d4e', '#ffc83d', '#ffffff']

function targetOf(id: string) {
  const el = document.getElementById(id)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 || r.bottom < 0 || r.top > window.innerHeight) return null
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, el }
}

function bump(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.classList.remove('bump')
  void el.offsetWidth
  el.classList.add('bump')
}

export function burstConfetti(colors = BRAND, origin = { x: 0.5, y: 0.55 }) {
  const opts = { colors, disableForReducedMotion: true, zIndex: 1000 }
  confetti({ ...opts, particleCount: 90, spread: 80, startVelocity: 48, origin, scalar: 1.05, ticks: 260 })
  setTimeout(() => confetti({ ...opts, particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, startVelocity: 60 }), 180)
  setTimeout(() => confetti({ ...opts, particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, startVelocity: 60 }), 260)
}

export function FxLayer() {
  const [parts, setParts] = useState<Particle[]>([])
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [level, setLevel] = useState<LevelUp | null>(null)
  const coinSoundAt = useRef(0)

  useEffect(() => {
    const off = fx.on((e: FxEvent) => {
      switch (e.type) {
        case 'coins':
        case 'xp': {
          const isCoin = e.type === 'coins'
          const x0 = e.x ?? window.innerWidth / 2
          const y0 = e.y ?? window.innerHeight / 2
          const id = ++pid
          setFloaters((f) => [...f, { id, text: `+${fmt(e.amount)}${isCoin ? '' : ' XP'}`, x: x0, y: y0 - (isCoin ? 0 : 34), tone: isCoin ? 'gold' : 'mint' }])
          setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1600)
          const t = targetOf(isCoin ? 'hud-coins' : 'hud-xp')
          const n = Math.min(isCoin ? 14 : 8, Math.max(isCoin ? 5 : 4, Math.round(e.amount / (isCoin ? 12 : 30))))
          const batch: Particle[] = Array.from({ length: n }, (_, i) => {
            const ang = Math.random() * Math.PI * 2
            const spread = 60 + Math.random() * 70
            const mx = x0 + Math.cos(ang) * spread
            const my = y0 + Math.sin(ang) * spread - 40
            return {
              id: ++pid,
              kind: isCoin ? 'coin' : 'xp',
              x0,
              y0,
              mx,
              my,
              x1: t ? t.x : mx + Math.cos(ang) * 40,
              y1: t ? t.y : my + 120,
              delay: i * 0.035,
              last: i === n - 1,
            }
          })
          setParts((p) => [...p, ...batch])
          if (isCoin) sfx.coins(Math.min(6, n))
          else sfx.xp()
          break
        }
        case 'achievement': {
          const a = achievementById(e.id)
          if (!a) return
          const id = ++pid
          sfx.achievement()
          setToasts((t) => [...t, { id, title: a.name, body: a.desc, tone: 'gold', kind: 'achievement', achId: a.id }])
          setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4600)
          break
        }
        case 'toast': {
          const id = ++pid
          setToasts((t) => [...t.slice(-2), { id, title: e.title, body: e.body, tone: e.tone ?? 'mint', kind: 'toast' }])
          setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
          break
        }
        case 'levelup': {
          setLevel({ level: e.level, rankId: e.rankId, rankUp: e.rankUp })
          sfx.levelUp()
          setTimeout(() => burstConfetti(), 350)
          break
        }
        case 'confetti':
          burstConfetti(e.colors)
          break
        case 'shake':
          document.body.classList.remove('shake')
          void document.body.offsetWidth
          document.body.classList.add('shake')
          break
      }
    })
    return off
  }, [])

  const done = (p: Particle) => {
    setParts((list) => list.filter((x) => x.id !== p.id))
    bump(p.kind === 'coin' ? 'hud-coins' : 'hud-xp')
    if (p.kind === 'coin') {
      const t = performance.now()
      if (t - coinSoundAt.current > 70) {
        coinSoundAt.current = t
        sfx.tick()
      }
    }
  }

  return (
    <>
      <div className="fx-layer" aria-hidden>
        {parts.map((p) => (
          <motion.div
            key={p.id}
            className={`fx-p fx-p--${p.kind}`}
            initial={{ x: p.x0, y: p.y0, scale: 0, opacity: 1 }}
            animate={{ x: [p.x0, p.mx, p.x1], y: [p.y0, p.my, p.y1], scale: [0, 1.25, 0.55], opacity: [1, 1, 0.9] }}
            transition={{ duration: 0.95, delay: p.delay, ease: [0.5, 0, 0.2, 1], times: [0, 0.38, 1] }}
            onAnimationComplete={() => done(p)}
          >
            {p.kind === 'coin' ? <CoinIcon size={22} /> : <XpIcon size={16} />}
          </motion.div>
        ))}
        <AnimatePresence>
          {floaters.map((f) => (
            <motion.div
              key={f.id}
              className={`fx-float fx-float--${f.tone}`}
              style={{ left: f.x, top: f.y }}
              initial={{ opacity: 0, y: 10, scale: 0.6 }}
              animate={{ opacity: 1, y: -46, scale: 1 }}
              exit={{ opacity: 0, y: -80 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="fx-toasts" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (t.kind === 'achievement' ? <AchievementToast key={t.id} id={t.achId!} /> : <PlainToast key={t.id} t={t} />))}
        </AnimatePresence>
      </div>

      <AnimatePresence>{level && <LevelUpOverlay data={level} onClose={() => setLevel(null)} />}</AnimatePresence>
    </>
  )
}

function PlainToast({ t }: { t: Toast }) {
  return (
    <motion.div
      layout
      className={`fx-toast fx-toast--${t.tone}`}
      initial={{ opacity: 0, y: -30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      <span className="fx-toast-bar" />
      <div>
        <div className="fx-toast-title">{t.title}</div>
        {t.body && <div className="fx-toast-body">{t.body}</div>}
      </div>
    </motion.div>
  )
}

function AchievementToast({ id }: { id: string }) {
  const a = achievementById(id)!
  const Icon = a.icon
  const color = RARITY[a.rarity].color
  return (
    <motion.div
      layout
      className="fx-ach"
      style={{ ['--rc' as string]: color }}
      initial={{ opacity: 0, y: -40, scaleX: 0.3 }}
      animate={{ opacity: 1, y: 0, scaleX: 1 }}
      exit={{ opacity: 0, y: -30, scaleX: 0.4, transition: { duration: 0.3 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <motion.span className="fx-ach-icon" initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}>
        <Icon size={22} />
      </motion.span>
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
        <div className="fx-ach-kicker">
          Achievement unlocked · <span style={{ color }}>{RARITY[a.rarity].label}</span>
        </div>
        <div className="fx-ach-name">{a.name}</div>
      </motion.div>
      <motion.div className="fx-ach-xp" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}>
        <XpIcon size={14} /> +{fmt(a.xp)}
      </motion.div>
      <span className="fx-ach-shine" />
    </motion.div>
  )
}

function LevelUpOverlay({ data, onClose }: { data: LevelUp; onClose: () => void }) {
  const rank = rankById(data.rankId)
  useEffect(() => {
    const t = setTimeout(onClose, data.rankUp ? 6500 : 4800)
    return () => clearTimeout(t)
  }, [data, onClose])
  return (
    <motion.div className="lvl-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }} onClick={onClose}>
      <div className="lvl-rays" />
      <motion.div className="lvl-ring" initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: [0.2, 1.3, 1], opacity: [0, 1, 0.9] }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      <div className="lvl-content">
        <motion.div className="hud-label lvl-kicker" initial={{ opacity: 0, letterSpacing: '1em' }} animate={{ opacity: 1, letterSpacing: '0.4em' }} transition={{ duration: 0.8 }}>
          {data.rankUp ? 'New rank unlocked' : 'Level up'}
        </motion.div>
        <motion.div className="lvl-number display" initial={{ scale: 3, opacity: 0, filter: 'blur(20px)' }} animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1], delay: 0.15 }}>
          <span className="lvl-lv">LV</span>
          <span className="grad-mint">{data.level}</span>
        </motion.div>
        {data.rankUp ? (
          <motion.div className="lvl-rank" initial={{ opacity: 0, y: 30, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.7, type: 'spring', stiffness: 160, damping: 14 }}>
            <RankEmblem rank={rank.id as RankId} size={120} />
            <div>
              <div className="display lvl-rank-name" style={{ color: rank.color }}>
                {rank.name}
              </div>
              <div className="dim">{rank.tagline}</div>
              <div className="lvl-perks">
                {rank.perks.map((p) => (
                  <span key={p} className="chip">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.p className="dim lvl-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            {rank.name} · {rank.max >= 59 ? 'max level' : `${Math.max(0, rank.max - data.level + 1)} level${rank.max - data.level + 1 === 1 ? '' : 's'} to the next rank`}
          </motion.p>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <Btn onClick={onClose} variant="ghost" size="sm">
            Continue
          </Btn>
        </motion.div>
      </div>
    </motion.div>
  )
}
