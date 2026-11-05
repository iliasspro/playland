import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router'
import { FlaskConical, ScanLine, Gamepad2, Coffee, Zap, Coins, FastForward, Trophy, RotateCcw, UserRound, X, Eye, KeyRound } from 'lucide-react'
import { usePlayer } from '../../store/player'
import { encodeCode, currentSlot } from '../../lib/qr'
import { fx } from '../../lib/fx'
import { sfx } from '../../lib/sfx'
import { dayKey, fmtDate, now } from '../../lib/time'
import { SECRETS } from '../../data/quests'

/* Overview helper: lets you trigger every loop of the ecosystem without being at the venue. */
export function DemoPanel() {
  const [open, setOpen] = useState(false)
  const s = usePlayer()
  const nav = useNavigate()

  const scan = (raw: string) => {
    nav(`/scan?code=${encodeURIComponent(raw)}&demo=1`)
    setOpen(false)
  }
  const nextSecret = SECRETS.find((x) => !s.secrets.includes(x.id))

  const actions = [
    { icon: ScanLine, label: 'Scan entrance', hint: 'Daily check-in', run: () => scan(encodeCode({ kind: 'checkin', spot: 'ENTRANCE', slot: currentSlot() })) },
    { icon: Gamepad2, label: 'Scan station R4', hint: '1h session', run: () => scan(encodeCode({ kind: 'session', station: 'R4' })) },
    { icon: Gamepad2, label: 'Scan VIP room', hint: '1h session', run: () => scan(encodeCode({ kind: 'session', station: 'VA' })) },
    { icon: Coffee, label: 'Scan coffee', hint: 'Machine bonus', run: () => scan(encodeCode({ kind: 'coffee' })) },
    { icon: KeyRound, label: 'Find a secret QR', hint: nextSecret ? `${s.secrets.length}/5 found` : 'All found', run: () => nextSecret && scan(encodeCode({ kind: 'secret', secretId: nextSecret.id })) },
    { icon: UserRound, label: 'Scan a friend', hint: 'Squad bonus', run: () => scan(encodeCode({ kind: 'friend', tag: ['Salma.exe', 'Reda_R9', 'ZakiZero', 'MehdiaWave'][Math.floor(Math.random() * 4)] })) },
    { icon: Zap, label: '+1,000 XP', hint: 'Crew bonus', run: () => s.grant(1000, 0, 'Demo · XP boost') },
    { icon: Coins, label: '+1,000 coins', hint: 'Crew bonus', run: () => s.grant(0, 1000, 'Demo · coin drop') },
    { icon: Eye, label: 'Settle predictions', hint: 'Pronos', run: () => { const o = s.settlePredictions(); fx.toast(o.title, o.ok ? `+${o.total.coins} coins` : o.error, o.ok ? 'gold' : 'crimson') } },
    { icon: Trophy, label: 'Win the Friday Cup', hint: '+2,000 coins', run: () => s.winCup() },
    { icon: FastForward, label: 'Skip to tomorrow', hint: 'Resets daily limits', run: () => { s.timeTravel(1); fx.toast('Time travel', `It is now ${fmtDate(now())}. Daily quests & check-in reset.`) } },
    { icon: RotateCcw, label: 'Fresh player', hint: 'Start from Lv 1', run: () => { s.resetAll(); nav('/join') } },
  ]

  return (
    <>
      <button className="demo-fab" onClick={() => { sfx.click(); setOpen((o) => !o) }} aria-label="Demo controls">
        <FlaskConical size={18} />
        <span>Demo</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="demo-panel hud brackets" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="hud-label">Demo controls</div>
                <div className="mute" style={{ fontSize: 12 }}>
                  Simulated day: {dayKey(now())}
                  {s.settings.timeOffset ? ' (time-travelled)' : ''}
                </div>
              </div>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="demo-grid">
              {actions.map((a) => (
                <button key={a.label} className="demo-act" onClick={() => { sfx.click(); a.run() }} onMouseEnter={() => sfx.hover()}>
                  <a.icon size={16} />
                  <span className="demo-act-l">{a.label}</span>
                  <span className="demo-act-h">{a.hint}</span>
                </button>
              ))}
            </div>
            <button className="demo-link" onClick={() => { s.loadDemo(); fx.toast('Veteran loaded', 'NeonNoor · Level 23 Pro · 90 XP from level 24') }}>
              Reload the veteran demo player
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
