import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimate } from 'motion/react'
import { Goal, RotateCcw } from 'lucide-react'
import { usePlayer } from '../../../store/player'
import { Btn, useNow } from '../../../components/ui/kit'
import { CoinIcon } from '../../../components/ui/icons'
import { dayKey, endOfDay, fmtCountdown } from '../../../lib/time'
import { sfx } from '../../../lib/sfx'
import { fx } from '../../../lib/fx'
import { seeded } from '../../../lib/rng'

type Res = 'goal' | 'save' | 'miss'
const SPOT = { x: 400, y: 440 }
const SHOTS = 5

export function Penalty() {
  const penaltyShot = usePlayer((s) => s.penaltyShot)
  const pen = usePlayer((s) => s.penalty)
  const t = useNow(1000)
  const today = dayKey(t)
  const shots = pen.day === today ? pen.shots : 0
  const goals = pen.day === today ? pen.goals : 0
  const [log, setLog] = useState<Res[]>([])
  const [phase, setPhase] = useState<'aim' | 'flight' | 'result'>('aim')
  const [result, setResult] = useState<Res | null>(null)
  const reticle = useRef<SVGGElement>(null)
  const aim = useRef({ x: 400, y: 200 })
  const [scope, animate] = useAnimate()
  const done = shots >= SHOTS && phase === 'aim'

  // crowd + flashes (static, seeded)
  const crowd = useMemo(() => {
    const r = seeded('crowd')
    return Array.from({ length: 260 }, () => ({ x: r.int(0, 800), y: r.int(8, 92), c: r.pick(['#5ff3da', '#ff2d4e', '#8ad0c7', '#ffffff', '#ffc83d']), o: 0.15 + r.next() * 0.35, s: 1 + r.next() * 1.6 }))
  }, [])

  // reticle sweep
  useEffect(() => {
    if (phase !== 'aim' || done) return
    let raf = 0
    const t0 = performance.now()
    const sx = 1.5 + shots * 0.28
    const sy = 2.05 + shots * 0.33
    const loop = (now: number) => {
      const k = (now - t0) / 1000
      const x = 400 + 222 * Math.sin(k * sx)
      const y = 205 + 102 * Math.sin(k * sy + 1.3)
      aim.current = { x, y }
      reticle.current?.setAttribute('transform', `translate(${x} ${y})`)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase, shots, done])

  const shoot = useCallback(async () => {
    if (phase !== 'aim' || done) return
    setPhase('flight')
    const { x: tx, y: ty } = aim.current
    sfx.kick()
    // ---- decide outcome
    let res: Res
    const wide = tx < 214 || tx > 586 || ty < 124
    const zone = tx < 333 ? 'L' : tx > 466 ? 'R' : 'C'
    const zones = ['L', 'C', 'R']
    const guess = Math.random() < 0.42 ? zone : zones.filter((z) => z !== zone)[Math.floor(Math.random() * 2)]
    if (wide) res = 'miss'
    else if (guess === zone) {
      const corner = zone !== 'C' && ty < 185
      res = Math.random() < (corner ? 0.3 : zone === 'C' ? 0.88 : 0.72) ? 'save' : 'goal'
    } else res = 'goal'
    // ---- animate keeper + ball
    const dx = guess === 'L' ? -150 : guess === 'R' ? 150 : 0
    const rot = guess === 'L' ? -68 : guess === 'R' ? 68 : 0
    animate('.pk-keeper', { x: dx, y: guess === 'C' ? -34 : 6, rotate: rot }, { duration: 0.38, ease: [0.2, 0.8, 0.3, 1], delay: 0.06 })
    await animate('.pk-ball', { x: tx - SPOT.x, y: ty - SPOT.y, scale: 0.52 }, { duration: 0.42, ease: [0.25, 0.7, 0.4, 1] })
    if (res === 'save') {
      sfx.save()
      animate('.pk-ball', { x: tx - SPOT.x + (tx < 400 ? -90 : 90), y: ty - SPOT.y + 120, scale: 0.6, opacity: 0.2 }, { duration: 0.5 })
      fx.emit({ type: 'shake' })
    } else if (res === 'goal') {
      sfx.goal()
      animate('.pk-net', { scale: [1, 1.035, 1] }, { duration: 0.5 })
      animate('.pk-ball', { y: ty - SPOT.y + 16, scale: 0.48 }, { duration: 0.25 })
    } else {
      sfx.error()
      animate('.pk-ball', { x: (tx - SPOT.x) * 1.35, y: ty - SPOT.y - 60, scale: 0.35, opacity: 0 }, { duration: 0.4 })
    }
    setResult(res)
    setPhase('result')
    setLog((l) => [...l, res])
    const r = penaltyShot(res === 'goal')
    if (r.done && r.goals === SHOTS) setTimeout(() => fx.emit({ type: 'confetti' }), 500)
    setTimeout(() => {
      animate('.pk-ball', { x: 0, y: 0, scale: 1, opacity: 1 }, { duration: 0 })
      animate('.pk-keeper', { x: 0, y: 0, rotate: 0 }, { duration: 0.35 })
      setResult(null)
      setPhase('aim')
    }, 1600)
  }, [phase, done, animate, penaltyShot])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault()
        void shoot()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shoot])

  // dots: session log first, then fill from stored counts
  const dots: (Res | null)[] = Array.from({ length: SHOTS }, (_, i) => {
    if (i < shots) {
      const offset = shots - log.length
      if (i >= offset) return log[i - offset]
      return i < goals ? 'goal' : 'save'
    }
    return null
  })

  return (
    <div className="pk">
      <div className="pk-hud">
        <div className="pk-dots">
          {dots.map((d, i) => (
            <span key={i} className={`pk-dot ${d ?? ''}`}>
              {d === 'goal' ? '●' : d ? '✕' : ''}
            </span>
          ))}
        </div>
        <div className="pk-score">
          <span className="display">{goals}</span>
          <span className="mute hud-num">/ {SHOTS}</span>
        </div>
        <div className="pk-earn cur gold">
          <CoinIcon size={18} /> +10 / goal · +50 perfect
        </div>
      </div>

      <div className={`pk-stage ${phase === 'aim' && !done ? 'can-shoot' : ''}`} ref={scope} onClick={() => void shoot()} data-cursor={phase === 'aim' && !done ? 'SHOOT' : undefined}>
        <svg viewBox="0 0 800 500" className="pk-svg">
          <defs>
            <linearGradient id="pk-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#020a0d" />
              <stop offset="1" stopColor="#0b2227" />
            </linearGradient>
            <linearGradient id="pk-grass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0f3d33" />
              <stop offset="1" stopColor="#072019" />
            </linearGradient>
            <radialGradient id="pk-flood" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#c4f2eb" stopOpacity="0.55" />
              <stop offset="1" stopColor="#c4f2eb" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="pk-ball" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#b9c9c6" />
            </radialGradient>
          </defs>
          <rect width="800" height="500" fill="url(#pk-sky)" />
          {/* crowd */}
          <rect y="0" width="800" height="100" fill="#06161a" />
          {crowd.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.s} fill={c.c} opacity={c.o} className={i % 37 === 0 ? 'pk-flash' : undefined} style={i % 37 === 0 ? { animationDelay: `${(i % 7) * 0.7}s` } : undefined} />
          ))}
          <rect y="96" width="800" height="8" fill="#ff2d4e" opacity="0.8" />
          <text x="400" y="103" textAnchor="middle" className="pk-board">
            PLAY LAND · KÉNITRA · PLAY LAND · KÉNITRA
          </text>
          <ellipse cx="80" cy="20" rx="180" ry="120" fill="url(#pk-flood)" />
          <ellipse cx="720" cy="20" rx="180" ry="120" fill="url(#pk-flood)" />
          {/* pitch */}
          <rect y="104" width="800" height="396" fill="url(#pk-grass)" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} y={300 + i * 34} width="800" height="17" fill="#ffffff" opacity="0.025" />
          ))}
          <path d="M0 300 H800" stroke="#c4f2eb" strokeOpacity="0.7" strokeWidth="2" />
          <path d="M150 300 L110 380 H690 L650 300" fill="none" stroke="#c4f2eb" strokeOpacity="0.4" strokeWidth="2" />
          <path d="M60 300 L-40 470 H840 L740 300" fill="none" stroke="#c4f2eb" strokeOpacity="0.3" strokeWidth="2" />
          <ellipse cx={SPOT.x} cy={SPOT.y + 4} rx="6" ry="3" fill="#c4f2eb" opacity="0.6" />
          {/* goal */}
          <g className="pk-net" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <path d="M210 120 L240 140 L560 140 L590 120 Z" fill="rgba(255,255,255,0.04)" />
            <path d="M240 140 L240 288 M560 140 L560 288" stroke="rgba(255,255,255,0.18)" />
            {Array.from({ length: 17 }, (_, i) => (
              <path key={`v${i}`} d={`M${240 + i * 20} 140 V290`} stroke="rgba(255,255,255,0.13)" />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <path key={`h${i}`} d={`M240 ${140 + i * 20} H560`} stroke="rgba(255,255,255,0.13)" />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <path key={`sl${i}`} d={`M${210 + i * 0} ${120 + i * 20} L240 ${140 + i * 18}`} stroke="rgba(255,255,255,0.12)" />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <path key={`sr${i}`} d={`M590 ${120 + i * 20} L560 ${140 + i * 18}`} stroke="rgba(255,255,255,0.12)" />
            ))}
          </g>
          <rect x="204" y="114" width="392" height="7" rx="3" fill="#ffffff" />
          <rect x="204" y="114" width="7" height="188" rx="3" fill="#ffffff" />
          <rect x="589" y="114" width="7" height="188" rx="3" fill="#ffffff" />
          {/* keeper */}
          <g className="pk-keeper" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
            <ellipse cx="400" cy="302" rx="34" ry="6" fill="#000" opacity="0.35" />
            <rect x="386" y="262" width="11" height="38" rx="4" fill="#0a1a1f" />
            <rect x="403" y="262" width="11" height="38" rx="4" fill="#0a1a1f" />
            <rect x="380" y="212" width="40" height="54" rx="10" fill="#ff2d4e" />
            <rect x="380" y="212" width="40" height="8" rx="4" fill="#5ff3da" />
            <text x="400" y="250" textAnchor="middle" className="pk-num">
              1
            </text>
            <rect x="352" y="214" width="30" height="10" rx="5" fill="#ff2d4e" transform="rotate(-35 382 219)" />
            <rect x="418" y="214" width="30" height="10" rx="5" fill="#ff2d4e" transform="rotate(35 418 219)" />
            <circle cx="350" cy="198" r="9" fill="#5ff3da" />
            <circle cx="450" cy="198" r="9" fill="#5ff3da" />
            <circle cx="400" cy="198" r="15" fill="#c98a6a" />
            <path d="M385 192 Q400 176 415 192" fill="#0a1a1f" />
          </g>
          {/* ball */}
          <g className="pk-ball" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <ellipse cx={SPOT.x} cy={SPOT.y + 15} rx="14" ry="4" fill="#000" opacity="0.4" />
            <circle cx={SPOT.x} cy={SPOT.y} r="15" fill="url(#pk-ball)" />
            <path d={`M${SPOT.x} ${SPOT.y - 6} l5.5 4 -2 6.5 h-7 l-2 -6.5 z`} fill="#0a1a1f" />
            <path d={`M${SPOT.x - 13} ${SPOT.y - 3} l5 2 M${SPOT.x + 13} ${SPOT.y - 3} l-5 2 M${SPOT.x - 6} ${SPOT.y + 12} l2 -5 M${SPOT.x + 6} ${SPOT.y + 12} l-2 -5`} stroke="#0a1a1f" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          {/* reticle */}
          {phase === 'aim' && !done && (
            <g ref={reticle} className="pk-reticle" transform="translate(400 200)">
              <circle r="22" fill="rgba(95,243,218,0.12)" stroke="#5ff3da" strokeWidth="2.5" />
              <circle r="4" fill="#5ff3da" />
              <path d="M-34 0 H-26 M26 0 H34 M0 -34 V-26 M0 26 V34" stroke="#5ff3da" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}
        </svg>
        <AnimatePresence>
          {result && (
            <motion.div key={result + log.length} className={`pk-banner pk-banner--${result}`} initial={{ scale: 2.4, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: -4 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
              {result === 'goal' ? 'GOAL!' : result === 'save' ? 'SAVED!' : 'WIDE!'}
            </motion.div>
          )}
        </AnimatePresence>
        {done && (
          <motion.div className="pk-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Goal size={40} className="t-mint" />
            <div className="display" style={{ fontSize: 34 }}>
              {goals === SHOTS ? (
                <span className="grad-gold">Perfect 5/5!</span>
              ) : (
                <>
                  {goals}/{SHOTS} today
                </>
              )}
            </div>
            <div className="dim">
              You earned <b className="t-gold">{goals * 10 + (goals === SHOTS ? 50 : 0)} coins</b>. New shots in <span className="hud-num t-mint">{fmtCountdown(endOfDay(t) - t, false)}</span>
            </div>
            <div className="mute" style={{ fontSize: 13 }}>
              Best ever: {pen.best}/5 · score 5/5 to unlock the Penalty King badge
            </div>
          </motion.div>
        )}
        {phase === 'aim' && !done && <div className="pk-hint hud-label">Click · tap · space — time your shot</div>}
      </div>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <span className="mute" style={{ fontSize: 13 }}>
          The keeper guesses right ~40% of the time. Top corners are almost unstoppable — if you can hit them.
        </span>
        {done && (
          <Btn variant="ghost" size="sm" icon={<RotateCcw size={14} />} to="/arcade?game=spin">
            Try the Lucky Spin
          </Btn>
        )}
      </div>
    </div>
  )
}
