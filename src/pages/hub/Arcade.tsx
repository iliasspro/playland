import { LayoutGroup, motion } from 'motion/react'
import { useSearchParams } from 'react-router'
import { Dices, Goal, Eye } from 'lucide-react'
import { Spin } from './arcade/Spin'
import { Penalty } from './arcade/Penalty'
import { Pronos } from './arcade/Pronos'
import { usePlayer } from '../../store/player'
import { dayKey } from '../../lib/time'
import { sfx } from '../../lib/sfx'
import './hub-pages.css'
import './arcade.css'

const GAMES = [
  { id: 'spin', label: 'Lucky Spin', icon: Dices },
  { id: 'penalty', label: 'Penalty King', icon: Goal },
  { id: 'pronos', label: 'Pronos', icon: Eye },
] as const
type GameId = (typeof GAMES)[number]['id']

export default function Arcade() {
  const [params, setParams] = useSearchParams()
  const game = (GAMES.find((g) => g.id === params.get('game'))?.id ?? 'spin') as GameId
  const s = usePlayer()
  const today = dayKey()
  const badge: Record<GameId, string | null> = {
    spin: s.lastSpinDay !== today ? '1' : null,
    penalty: (s.penalty.day === today ? 5 - s.penalty.shots : 5) > 0 ? String(s.penalty.day === today ? 5 - s.penalty.shots : 5) : null,
    pronos: Object.keys(s.predictions).length < 4 ? String(4 - Object.keys(s.predictions).length) : null,
  }
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <span className="hud-label">Arcade · play from anywhere</span>
          </div>
          <h1 className="display page-title">
            Daily <span className="grad-gold">side quests.</span>
          </h1>
          <p className="page-sub">Three mini-games that keep the coins coming between visits. They reset every day at midnight.</p>
        </div>
        <LayoutGroup>
          <div className="tabs">
            {GAMES.map((g) => (
              <button
                key={g.id}
                className={`tab ${game === g.id ? 'active' : ''}`}
                onClick={() => {
                  sfx.click()
                  setParams({ game: g.id }, { replace: true })
                }}
              >
                {game === g.id && <motion.span layoutId="arc-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span className="row" style={{ gap: 8 }}>
                  <g.icon size={15} /> {g.label}
                  {badge[g.id] && <span className="arc-badge">{badge[g.id]}</span>}
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>
      <motion.div key={game} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {game === 'spin' && <Spin />}
        {game === 'penalty' && <Penalty />}
        {game === 'pronos' && <Pronos />}
      </motion.div>
    </div>
  )
}
