import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Volume2, VolumeX, X } from 'lucide-react'
import { Crest } from '../../components/brand/Crest'
import { Wordmark } from '../../components/brand/Wordmark'
import { Btn, useNow } from '../../components/ui/kit'
import { usePlayer } from '../../store/player'
import { sfx } from '../../lib/sfx'
import { CoinIcon } from '../../components/ui/icons'
import { fmt } from '../../lib/format'
import { scrollToId } from './scroll'

export const LINKS = [
  { id: 'arena', label: 'Arena' },
  { id: 'pass', label: 'Play Pass' },
  { id: 'ranks', label: 'Ranks' },
  { id: 'loot', label: 'Rewards' },
  { id: 'events', label: 'Tournaments' },
  { id: 'visit', label: 'Visit' },
]

/** Open daily 10:00 → 02:00 (closing time from the Google listing; opening hour is a placeholder). */
export function openStatus(t: number) {
  const d = new Date(t)
  const h = d.getHours() + d.getMinutes() / 60
  const open = h >= 10 || h < 2
  return { open, label: open ? 'Open now · until 02:00' : 'Opens at 10:00' }
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const created = usePlayer((s) => s.created)
  const coins = usePlayer((s) => s.coins)
  const sound = usePlayer((s) => s.settings.sound)
  const toggleSound = usePlayer((s) => s.toggleSound)
  const t = useNow(30000)
  const st = openStatus(t)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const go = (id: string) => {
    setMenu(false)
    sfx.click()
    scrollToId(id)
  }

  return (
    <>
      <header className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="site-nav-in">
          <button className="site-brand" onClick={() => go('top')} onMouseEnter={() => sfx.hover()} aria-label="Play Land — back to top">
            <Crest size={40} mode="idle" />
            <Wordmark height={19} />
          </button>
          <nav className="site-links">
            {LINKS.map((l) => (
              <button key={l.id} onClick={() => go(l.id)} onMouseEnter={() => sfx.hover()} className="site-link">
                {l.label}
              </button>
            ))}
          </nav>
          <div className="site-nav-right">
            <span className={`site-status ${st.open ? '' : 'closed'}`}>
              <span className={`live-dot ${st.open ? 'mint' : ''}`} />
              {st.label}
            </span>
            <button className="icon-btn" onClick={toggleSound} aria-label={sound ? 'Mute sounds' : 'Enable sounds'}>
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            {created ? (
              <Link to="/hub" className="site-pass" onMouseEnter={() => sfx.hover()}>
                <CoinIcon size={18} />
                <span className="hud-num">{fmt(coins)}</span>
                <span className="site-pass-l">My Pass</span>
              </Link>
            ) : (
              <Btn to="/join" size="sm" className="site-cta">
                Get Play Pass
              </Btn>
            )}
            <button className="icon-btn site-burger" onClick={() => setMenu(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div className="site-menu" initial={{ clipPath: 'circle(0% at 100% 0%)' }} animate={{ clipPath: 'circle(150% at 100% 0%)' }} exit={{ clipPath: 'circle(0% at 100% 0%)' }} transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}>
            <button className="icon-btn site-menu-x" onClick={() => setMenu(false)} aria-label="Close menu">
              <X size={20} />
            </button>
            <div className="site-menu-links">
              {LINKS.map((l, i) => (
                <motion.button key={l.id} className="display site-menu-link" onClick={() => go(l.id)} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                  <span className="site-menu-i hud-num">0{i + 1}</span>
                  {l.label}
                </motion.button>
              ))}
            </div>
            <div className="site-menu-foot">
              <Btn to={created ? '/hub' : '/join'} block size="lg">
                {created ? 'Open my Play Pass' : 'Get your Play Pass'}
              </Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
