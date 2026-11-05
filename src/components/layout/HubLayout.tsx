import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  LayoutDashboard,
  ScanLine,
  ListChecks,
  Gift,
  Gem,
  Trophy,
  Swords,
  Map as MapIcon,
  Gamepad2,
  User,
  Volume2,
  VolumeX,
  Grid2x2,
  MonitorCog,
  ArrowLeft,
  Zap,
  X,
} from 'lucide-react'
import { usePlayer } from '../../store/player'
import { levelProgress, rankForLevel } from '../../data/ranks'
import { Crest } from '../brand/Crest'
import { Wordmark } from '../brand/Wordmark'
import { CoinIcon, FlameIcon, XpIcon } from '../ui/icons'
import { Counter, PlayerAvatar, Btn, useNow } from '../ui/kit'
import { doubleXpWindow, fmtCountdown } from '../../lib/time'
import { sfx } from '../../lib/sfx'
import { DemoPanel } from './DemoPanel'
import './hub.css'

export const NAV = [
  { to: '/hub', label: 'Home', icon: LayoutDashboard },
  { to: '/scan', label: 'Scan', icon: ScanLine },
  { to: '/quests', label: 'Quests', icon: ListChecks },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/season', label: 'Season Pass', icon: Gem },
  { to: '/ranks', label: 'Leaderboard', icon: Trophy },
  { to: '/events', label: 'Tournaments', icon: Swords },
  { to: '/map', label: 'Live Map', icon: MapIcon },
  { to: '/arcade', label: 'Arcade', icon: Gamepad2 },
  { to: '/profile', label: 'Profile', icon: User },
]

const TITLES: Record<string, string> = Object.fromEntries(NAV.map((n) => [n.to, n.label]))

export function HubLayout() {
  const created = usePlayer((s) => s.created)
  const { pathname, search } = useLocation()
  const [more, setMore] = useState(false)
  useEffect(() => setMore(false), [pathname])

  const pendingScan = pathname === '/scan' && new URLSearchParams(search).get('code')

  return (
    <div className="hub">
      <aside className="hub-side">
        <Link to="/" className="hub-brand" onMouseEnter={() => sfx.hover()}>
          <Crest size={44} mode="none" />
          <Wordmark height={20} />
        </Link>
        <nav className="hub-nav">
          {NAV.map((n, i) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `hub-nav-item ${isActive ? 'active' : ''} ${n.to === '/scan' ? 'scan' : ''}`} onMouseEnter={() => sfx.hover()}>
              <n.icon size={18} />
              <span>{n.label}</span>
              {i === 1 && <span className="hub-nav-kbd">QR</span>}
            </NavLink>
          ))}
        </nav>
        <div className="hub-side-foot">
          <NavLink to="/staff" className="hub-nav-item" onMouseEnter={() => sfx.hover()}>
            <MonitorCog size={18} />
            <span>Staff console</span>
          </NavLink>
          <Link to="/" className="hub-nav-item" onMouseEnter={() => sfx.hover()}>
            <ArrowLeft size={18} />
            <span>Back to site</span>
          </Link>
        </div>
      </aside>

      <div className="hub-main">
        {created && <HudBar title={TITLES[pathname] ?? 'Play Pass'} />}
        <main className="hub-content">
          {created ? (
            <motion.div key={pathname} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}>
              <Outlet />
            </motion.div>
          ) : (
            <NoPass pendingScan={!!pendingScan} />
          )}
        </main>
      </div>

      {created && (
        <nav className="hub-tabs">
          {[NAV[0], NAV[2]].map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `hub-tab ${isActive ? 'active' : ''}`}>
              <n.icon size={20} />
              <span>{n.label}</span>
            </NavLink>
          ))}
          <NavLink to="/scan" className={({ isActive }) => `hub-tab-scan ${isActive ? 'active' : ''}`} aria-label="Scan QR">
            <span className="hub-tab-scan-ring" />
            <ScanLine size={28} />
          </NavLink>
          <NavLink to="/rewards" className={({ isActive }) => `hub-tab ${isActive ? 'active' : ''}`}>
            <Gift size={20} />
            <span>Rewards</span>
          </NavLink>
          <button className={`hub-tab ${more ? 'active' : ''}`} onClick={() => setMore((m) => !m)}>
            <Grid2x2 size={20} />
            <span>More</span>
          </button>
        </nav>
      )}

      <AnimatePresence>
        {more && (
          <motion.div className="hub-more-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMore(false)}>
            <motion.div
              className="hub-more hud brackets"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="hud-label">Menu</span>
                <button className="icon-btn" onClick={() => setMore(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="hub-more-grid">
                {[...NAV.slice(4), { to: '/staff', label: 'Staff', icon: MonitorCog }, { to: '/', label: 'Website', icon: ArrowLeft }].map((n) => (
                  <Link key={n.to} to={n.to} className="hub-more-item">
                    <n.icon size={22} />
                    <span>{n.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {created && <DemoPanel />}
    </div>
  )
}

function HudBar({ title }: { title: string }) {
  const s = usePlayer()
  const lp = levelProgress(s.xp)
  const rank = rankForLevel(lp.level)
  const t = useNow(1000)
  const dx = doubleXpWindow(t)
  return (
    <header className="hud-bar">
      <Link to="/profile" className="hud-bar-player" onMouseEnter={() => sfx.hover()}>
        <PlayerAvatar seed={s.avatarSeed} size={44} pct={lp.pct} frame={s.frame} />
        <div className="hud-bar-id">
          <div className={`hud-bar-tag tag-${s.tagColor}`}>{s.tag}</div>
          <div className="hud-bar-rank" style={{ color: rank.color }}>
            LV {lp.level} · {rank.name}
          </div>
        </div>
      </Link>
      <div className="hud-bar-title">
        <span className="hud-label">{title}</span>
      </div>
      <div className="hud-bar-xp" id="hud-xp">
        <XpIcon size={16} />
        <div className="hud-bar-xp-track">
          <div className="bar">
            <i style={{ ['--p' as string]: lp.pct }} />
          </div>
          <div className="hud-bar-xp-lab hud-num">
            {lp.need ? (
              <>
                <Counter value={lp.cur} /> / {lp.need.toLocaleString('en-US')} XP
              </>
            ) : (
              'MAX LEVEL'
            )}
          </div>
        </div>
      </div>
      <div className="spacer" />
      {dx.active && (
        <Link to="/quests" className="hud-dxp">
          <Zap size={14} /> 2× XP · {fmtCountdown(dx.endsAt - t, false)}
        </Link>
      )}
      <div className="hud-pill hud-streak" title={`${s.weekStreak}-week visit streak`}>
        <FlameIcon size={18} />
        <span className="hud-num">{s.weekStreak}W</span>
      </div>
      <Link to="/rewards" className="hud-pill hud-coins" id="hud-coins" onMouseEnter={() => sfx.hover()}>
        <CoinIcon size={20} />
        <Counter value={s.coins} className="hud-num" />
      </Link>
      <button className="icon-btn hud-sound" onClick={() => s.toggleSound()} aria-label={s.settings.sound ? 'Mute' : 'Unmute'}>
        {s.settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </header>
  )
}

function NoPass({ pendingScan }: { pendingScan: boolean }) {
  const loadDemo = usePlayer((s) => s.loadDemo)
  const nav = useNavigate()
  const { pathname, search } = useLocation()
  return (
    <div className="nopass">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
        <Crest size={150} glow />
      </motion.div>
      <h1 className="display nopass-title">
        {pendingScan ? (
          <>
            Scanned! <span className="grad-mint">Now claim it.</span>
          </>
        ) : (
          <>
            Insert <span className="grad-mint">Play Pass</span>
          </>
        )}
      </h1>
      <p className="dim nopass-sub">
        {pendingScan
          ? 'Create your free player in 20 seconds and this scan counts — XP, coins and your first achievement.'
          : 'Your Play Pass holds your level, coins, streak and rewards. No password, no email — just your gamertag.'}
      </p>
      <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
        <Btn to={`/join${pendingScan ? `?next=${encodeURIComponent(pathname + search)}` : ''}`} size="lg" magnetic>
          Create my player
        </Btn>
        <Btn
          variant="ghost"
          size="lg"
          onClick={() => {
            loadDemo()
            if (!pendingScan && pathname === '/hub') nav('/hub')
          }}
        >
          Load demo player
        </Btn>
      </div>
    </div>
  )
}
