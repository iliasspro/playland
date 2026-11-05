import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePlayer, SPIN_SEGMENTS } from '../../../store/player'
import { Btn, useNow } from '../../../components/ui/kit'
import { Crest } from '../../../components/brand/Crest'
import { CoinIcon, XpIcon } from '../../../components/ui/icons'
import { dayKey, endOfDay, fmtCountdown } from '../../../lib/time'
import { sfx } from '../../../lib/sfx'
import { Coffee, Dices } from 'lucide-react'

const N = SPIN_SEGMENTS.length
const SEG = 360 / N
const R = 200

function arc(i: number) {
  const a0 = ((i * SEG - 90) * Math.PI) / 180
  const a1 = (((i + 1) * SEG - 90) * Math.PI) / 180
  const x0 = R + R * Math.cos(a0)
  const y0 = R + R * Math.sin(a0)
  const x1 = R + R * Math.cos(a1)
  const y1 = R + R * Math.sin(a1)
  return `M${R} ${R} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`
}

export function Spin() {
  const spin = usePlayer((s) => s.spin)
  const lastSpinDay = usePlayer((s) => s.lastSpinDay)
  const t = useNow(1000)
  const wheel = useRef<SVGGElement>(null)
  const pointer = useRef<HTMLDivElement>(null)
  const [rot, setRot] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [won, setWon] = useState<(typeof SPIN_SEGMENTS)[number] | null>(null)
  const used = lastSpinDay === dayKey(t) && !spinning && !won

  // tick sound + pointer flick whenever a segment boundary passes
  useEffect(() => {
    if (!spinning) return
    let raf = 0
    let last = -1
    const loop = () => {
      const el = wheel.current
      if (el) {
        const m = getComputedStyle(el).transform
        if (m && m !== 'none') {
          const [a, b] = m.slice(7, -1).split(',').map(Number)
          const ang = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
          const seg = Math.floor(ang / SEG)
          if (seg !== last) {
            last = seg
            sfx.tick()
            pointer.current?.animate([{ transform: 'translateX(-50%) rotate(-18deg)' }, { transform: 'translateX(-50%) rotate(0deg)' }], { duration: 120 })
          }
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [spinning])

  const go = () => {
    if (spinning) return
    const res = spin()
    if (!res) {
      sfx.error()
      return
    }
    sfx.powerUp()
    const center = res.index * SEG + SEG / 2
    const jitter = (Math.random() - 0.5) * (SEG * 0.6)
    const base = rot - (rot % 360)
    const target = base + 360 * 6 + (360 - center) + jitter
    setRot(target)
    setSpinning(true)
    setWon(null)
    setTimeout(() => {
      setSpinning(false)
      setWon(res.segment)
      sfx.spinStop()
      if (res.segment.unit === 'jackpot') sfx.levelUp()
    }, 5200)
  }

  return (
    <div className="spin">
      <div className="spin-stage">
        <div className="spin-lights">
          {Array.from({ length: 28 }, (_, i) => (
            <span key={i} className={`bulb ${spinning ? 'fast' : ''}`} style={{ transform: `rotate(${(i * 360) / 28}deg) translateY(calc(var(--wr) * -1))`, animationDelay: `${(i % 2) * 0.4}s` }} />
          ))}
        </div>
        <div ref={pointer} className="spin-pointer" />
        <svg viewBox="-10 -10 420 420" className="spin-wheel">
          <defs>
            <radialGradient id="spin-shade" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.6" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.45" />
            </radialGradient>
          </defs>
          <circle cx={R} cy={R} r={R + 8} fill="#031216" stroke="#5ff3da" strokeWidth="3" />
          <g ref={wheel} style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${R}px ${R}px`, transition: spinning ? 'transform 5s cubic-bezier(0.12, 0.8, 0.1, 1)' : 'none' }}>
            {SPIN_SEGMENTS.map((s, i) => {
              const mid = i * SEG + SEG / 2
              const jack = s.unit === 'jackpot'
              return (
                <g key={i}>
                  <path d={arc(i)} fill={s.color} stroke="#5ff3da" strokeOpacity="0.35" strokeWidth="1.5" />
                  <g transform={`rotate(${mid} ${R} ${R})`}>
                    <text x={R} y={62} textAnchor="middle" className={`spin-val ${jack ? 'jack' : ''}`}>
                      {s.label}
                    </text>
                    <text x={R} y={84} textAnchor="middle" className="spin-unit">
                      {s.unit.toUpperCase()}
                    </text>
                  </g>
                </g>
              )
            })}
            <circle cx={R} cy={R} r={R} fill="url(#spin-shade)" />
          </g>
          <circle cx={R} cy={R} r="52" fill="#031216" stroke="#5ff3da" strokeWidth="3" />
        </svg>
        <button className={`spin-hub ${used ? 'used' : ''}`} onClick={go} disabled={spinning || used} aria-label="Spin">
          <Crest size={64} mode="none" />
        </button>
      </div>

      <div className="spin-side">
        <AnimatePresence mode="wait">
          {won ? (
            <motion.div key="won" className="spin-won" initial={{ scale: 0.4, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
              <div className="hud-label">{won.unit === 'jackpot' ? 'JACKPOT!!!' : 'You won'}</div>
              <div className={`display spin-won-v ${won.unit === 'jackpot' ? 'grad-gold' : won.unit === 'XP' ? 'grad-mint' : 'grad-gold'}`}>
                {'voucher' in won ? 'Free coffee' : `+${won.label}`}
              </div>
              <div className="row" style={{ gap: 8 }}>
                {'coins' in won && <CoinIcon size={26} />}
                {'xp' in won && <XpIcon size={24} />}
                {'voucher' in won && <Coffee size={24} className="t-gold" />}
                <span className="dim">{'voucher' in won ? 'Voucher added to Rewards' : won.unit === 'XP' ? 'XP added to your level' : 'Coins added to your wallet'}</span>
              </div>
              <div className="mute" style={{ fontSize: 13 }}>
                Next spin in <span className="hud-num t-mint">{fmtCountdown(endOfDay(t) - t, false)}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="idle" className="spin-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="display" style={{ fontSize: 34 }}>
                Lucky <span className="grad-gold">Spin</span>
              </div>
              <p className="dim">One free spin every day. 1-in-50 shot at the 500-coin jackpot (and the Jackpot achievement).</p>
              <ul className="spin-odds">
                {SPIN_SEGMENTS.map((s, i) => (
                  <li key={i}>
                    <span>
                      {'voucher' in s ? 'Free coffee' : `${s.label} ${s.unit === 'jackpot' ? 'coins · jackpot' : s.unit}`}
                    </span>
                    <span className="hud-num mute">{s.weight}%</span>
                  </li>
                ))}
              </ul>
              {used ? (
                <div className="spin-used">
                  <span className="hud-label">Next spin in</span>
                  <span className="display t-mint" style={{ fontSize: 28 }}>
                    {fmtCountdown(endOfDay(t) - t, false)}
                  </span>
                </div>
              ) : (
                <Btn variant="gold" size="lg" icon={<Dices size={18} />} onClick={go} disabled={spinning}>
                  {spinning ? 'Spinning…' : 'Spin the wheel'}
                </Btn>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
