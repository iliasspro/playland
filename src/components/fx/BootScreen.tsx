import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Crest } from '../brand/Crest'
import { sfx, unlockAudio } from '../../lib/sfx'
import './boot.css'

const LINES = [
  'PLAY LAND OS v5.9 · KÉNITRA NODE',
  '> mounting arena ............ OK',
  '> 12 × PS5 stations ......... ONLINE',
  '> red room lighting ......... 100%',
  '> syncing leaderboard ....... OK',
  '> coffee machine ............ HOT',
]

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [lines, setLines] = useState(0)
  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const dur = 3000
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      // stepped, slightly irregular progress like a real loader
      const eased = p < 1 ? Math.floor((1 - Math.pow(1 - p, 2.2)) * 100 + Math.sin(t / 90) * 1.5) : 100
      setProgress(Math.max(0, Math.min(100, eased)))
      setLines(Math.min(LINES.length, Math.floor(p * (LINES.length + 1))))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setReady(true)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!ready) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    if (leaving) return
    unlockAudio()
    sfx.start()
    setLeaving(true)
    setTimeout(onDone, 1100)
  }

  return (
    <motion.div className={`boot ${leaving ? 'boot--leaving' : ''}`} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="boot-crt" />
      <div className="boot-lines hud-num">
        {LINES.slice(0, lines).map((l) => (
          <div key={l}>{l}</div>
        ))}
        {!ready && <span className="boot-caret">█</span>}
      </div>

      <div className="boot-center">
        <motion.div className="boot-crest" animate={leaving ? { scale: 9, opacity: 0, filter: 'blur(6px)' } : { scale: 1 }} transition={{ duration: 1, ease: [0.7, 0, 0.2, 1] }}>
          <Crest mode="boot" size={260} glow />
        </motion.div>

        <AnimatePresence mode="wait">
          {!ready ? (
            <motion.div key="bar" className="boot-bar-wrap" exit={{ opacity: 0, y: 10 }}>
              <div className="boot-bar">
                <i style={{ width: `${progress}%` }} />
              </div>
              <div className="boot-pct hud-num">
                LOADING WORLD <span>{String(progress).padStart(3, '0')}%</span>
              </div>
            </motion.div>
          ) : (
            !leaving && (
              <motion.button
                key="start"
                className="boot-start"
                onClick={start}
                onMouseEnter={() => sfx.hover()}
                initial={{ opacity: 0, scale: 0.8, letterSpacing: '0.8em' }}
                animate={{ opacity: 1, scale: 1, letterSpacing: '0.32em' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="boot-start-txt">PRESS START</span>
                <span className="boot-start-sub">tap · click · enter</span>
              </motion.button>
            )
          )}
        </AnimatePresence>
      </div>

      {!leaving && (
        <button className="boot-skip hud-label" onClick={start}>
          Skip intro ▸
        </button>
      )}
      <AnimatePresence>{leaving && <motion.div className="boot-flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0] }} transition={{ duration: 0.9, times: [0, 0.35, 1] }} />}</AnimatePresence>
      {leaving && (
        <>
          <motion.div className="boot-split boot-split--top" initial={{ y: 0 }} animate={{ y: '-100%' }} transition={{ duration: 0.7, delay: 0.35, ease: [0.7, 0, 0.2, 1] }} />
          <motion.div className="boot-split boot-split--bot" initial={{ y: 0 }} animate={{ y: '100%' }} transition={{ duration: 0.7, delay: 0.35, ease: [0.7, 0, 0.2, 1] }} />
        </>
      )}
    </motion.div>
  )
}
