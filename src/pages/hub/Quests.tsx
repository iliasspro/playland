import { useState } from 'react'
import { motion, LayoutGroup } from 'motion/react'
import { Clock, Lock } from 'lucide-react'
import { usePlayer, questKey } from '../../store/player'
import { QuestList } from '../../components/hub/parts'
import { ACHIEVEMENTS } from '../../data/achievements'
import { QUESTS } from '../../data/quests'
import { RARITY } from '../../data/rewards'
import { SEASON } from '../../data/season'
import { XpIcon } from '../../components/ui/icons'
import { useNow } from '../../components/ui/kit'
import { endOfDay, endOfWeek, fmtCountdown, fmtDate } from '../../lib/time'
import { fmt } from '../../lib/format'
import { sfx } from '../../lib/sfx'
import './hub-pages.css'
import './quests.css'

const TABS = [
  { id: 'day', label: 'Daily' },
  { id: 'week', label: 'Weekly' },
  { id: 'season', label: 'Season' },
  { id: 'ach', label: 'Achievements' },
] as const
type Tab = (typeof TABS)[number]['id']

export default function Quests() {
  const [tab, setTab] = useState<Tab>('day')
  const s = usePlayer()
  const t = useNow(1000)
  const ready = QUESTS.filter((q) => q.progress(s) >= q.target && !s.questClaims[questKey(q.id, q.period)])
  const resetAt = tab === 'day' ? endOfDay(t) : tab === 'week' ? endOfWeek(t) : SEASON.end
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).length

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <span className="hud-label">Quest log</span>
            {ready.length > 0 && <span className="chip">{ready.length} ready to claim</span>}
          </div>
          <h1 className="display page-title">
            Quests & <span className="grad-mint">badges</span>
          </h1>
          <p className="page-sub">Daily quests reset at midnight, weekly ones on Monday. Complete them, hit CLAIM, watch the coins fly.</p>
        </div>
        <LayoutGroup>
          <div className="tabs" role="tablist">
            {TABS.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                className={`tab ${tab === x.id ? 'active' : ''}`}
                onClick={() => {
                  sfx.click()
                  setTab(x.id)
                }}
              >
                {tab === x.id && <motion.span layoutId="quest-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span>{x.label}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>

      {tab !== 'ach' ? (
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="quests-reset">
            <Clock size={14} />
            <span className="hud-label mute">{tab === 'season' ? `Season ${SEASON.number} ends in` : 'Resets in'}</span>
            <span className="hud-num t-mint">{fmtCountdown(resetAt - t, tab !== 'day')}</span>
          </div>
          <QuestList period={tab} />
        </motion.div>
      ) : (
        <motion.div key="ach" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="ach-summary">
            <div className="display ach-count">
              {unlocked}
              <span>/{ACHIEVEMENTS.length}</span>
            </div>
            <div className="bar gold" style={{ flex: 1, height: 10 }}>
              <i style={{ ['--p' as string]: unlocked / ACHIEVEMENTS.length }} />
            </div>
          </div>
          <div className="ach-grid">
            {ACHIEVEMENTS.map((a, i) => {
              const got = s.achievements[a.id]
              const [cur, target] = a.progress(s)
              const color = RARITY[a.rarity].color
              return (
                <motion.div
                  key={a.id}
                  className={`ach ${got ? 'got' : ''}`}
                  style={{ ['--rc' as string]: color }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.025 }}
                  onMouseEnter={() => sfx.hover()}
                >
                  <div className="ach-hex">
                    <span className="ach-hex-bg" />
                    {got ? <a.icon size={30} /> : <Lock size={22} />}
                  </div>
                  <div className="ach-rarity hud-label">{RARITY[a.rarity].label}</div>
                  <div className="ach-name">{a.name}</div>
                  <div className="ach-desc">{a.desc}</div>
                  {got ? (
                    <div className="ach-date hud-num">Unlocked {fmtDate(got, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  ) : (
                    <div className="ach-prog">
                      <div className="bar" style={{ height: 5 }}>
                        <i style={{ ['--p' as string]: Math.min(1, cur / target) }} />
                      </div>
                      <span className="hud-num">
                        {fmt(Math.min(cur, target))}/{fmt(target)}
                      </span>
                    </div>
                  )}
                  <div className="ach-xp">
                    <XpIcon size={12} /> {fmt(a.xp)}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
