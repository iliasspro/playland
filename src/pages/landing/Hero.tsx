import { lazy, Suspense, useEffect, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { ArrowDownRight, Star } from 'lucide-react'
import { Btn, Counter, useNow } from '../../components/ui/kit'
import { Crest } from '../../components/brand/Crest'
import { usePlayer } from '../../store/player'
import { STATIONS, stationStatus } from '../../data/stations'
import { openStatus } from './SiteNav'
import { scrollToId } from './scroll'

const HeroScene = lazy(() => import('../../components/three/HeroScene'))

function webglOk() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const line: Variants = {
  hidden: { y: '110%', rotate: 4 },
  show: (i: number) => ({ y: '0%', rotate: 0, transition: { duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] } }),
}
const fade: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.55 + i * 0.1, ease: [0.16, 1, 0.3, 1] } }),
}

export function Hero({ ready }: { ready: boolean }) {
  const [three] = useState(() => webglOk() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const created = usePlayer((s) => s.created)
  const t = useNow(5000)
  const busy = STATIONS.filter((s) => stationStatus(s, t).state === 'busy').length
  const st = openStatus(t)
  const state = ready ? 'show' : 'hidden'
  const [mounted3d, setMounted3d] = useState(false)
  useEffect(() => {
    // give the boot animation the GPU first
    const id = setTimeout(() => setMounted3d(true), ready ? 50 : 1200)
    return () => clearTimeout(id)
  }, [ready])

  return (
    <section className="hero" id="top">
      {three && mounted3d ? (
        <Suspense fallback={<div className="hero-canvas" />}>
          <HeroScene />
        </Suspense>
      ) : (
        <div className="hero-canvas hero-fallback">
          <Crest size={420} glow />
        </div>
      )}
      <div className="hero-shade" />

      <div className="container hero-inner">
        <motion.div className="hero-chips" initial="hidden" animate={state} variants={fade} custom={0}>
          <span className="chip crimson">
            <span className="live-dot" /> Live · {busy}/{STATIONS.length} stations busy
          </span>
          <span className={`chip ${st.open ? '' : 'ghost'}`}>{st.label}</span>
        </motion.div>

        <h1 className="display hero-title" aria-label="Play. Scan. Level up.">
          {['PLAY.', 'SCAN.', 'LEVEL UP.'].map((w, i) => (
            <span key={w} className="hero-line">
              <motion.span className={`hero-word ${i === 2 ? 'hero-word--accent' : ''}`} initial="hidden" animate={state} variants={line} custom={i}>
                {i === 2 ? (
                  <span className="glitch grad-mint" data-text={w}>
                    {w}
                  </span>
                ) : (
                  w
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p className="hero-sub" initial="hidden" animate={state} variants={fade} custom={1}>
          Kénitra’s PS5 arena — 4K screens, red-velvet thrones, private VIP rooms and a loyalty game that turns <b>every visit into XP, coins and real rewards.</b>
        </motion.p>

        <motion.div className="hero-ctas" initial="hidden" animate={state} variants={fade} custom={2}>
          <Btn to={created ? '/hub' : '/join'} size="lg" magnetic iconRight={<ArrowDownRight size={18} />}>
            {created ? 'Open my Play Pass' : 'Get your Play Pass'}
          </Btn>
          <Btn variant="ghost" size="lg" onClick={() => scrollToId('arena')}>
            See the arena
          </Btn>
        </motion.div>

        <motion.div className="hero-stats" initial="hidden" animate={state} variants={fade} custom={3}>
          <div className="hero-stat">
            <div className="hero-stat-v hud-num">
              <Counter value={5} onView format={(n) => n.toFixed(1)} /> <Star size={16} fill="currentColor" />
            </div>
            <div className="hero-stat-l">Google rating</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-v hud-num">
              <Counter value={14} onView />
            </div>
            <div className="hero-stat-l">PS5 stations</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-v hud-num">02:00</div>
            <div className="hero-stat-l">Open till, daily</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-v hud-num">
              <Counter value={59} onView />
            </div>
            <div className="hero-stat-l">Levels to climb</div>
          </div>
        </motion.div>
      </div>

      <div className="hero-foot container">
        <button className="hero-scroll" onClick={() => scrollToId('arena')}>
          <span className="hero-scroll-line" />
          <span className="hud-label">Scroll to spawn</span>
        </button>
        <span className="hero-coords hud-num">34.2625° N · 6.5888° W · KÉNITRA</span>
      </div>
    </section>
  )
}
