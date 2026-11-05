import { useMemo } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ScanLine, Check, ChevronRight, Dices, Goal, Eye, Swords, Zap, Trophy, Clock } from 'lucide-react'
import { usePlayer } from '../../store/player'
import { PlayPassCard } from '../../components/ui/PlayPassCard'
import { Btn, Countdown, Counter, useNow, stagger } from '../../components/ui/kit'
import { RankEmblem } from '../../components/ui/RankEmblem'
import { PixelAvatar } from '../../components/ui/PixelAvatar'
import { CoinIcon, XpIcon } from '../../components/ui/icons'
import { ActivityList, QuestList, StreakMeter } from '../../components/hub/parts'
import { levelProgress, rankForLevel, RANKS, xpForLevel } from '../../data/ranks'
import { getEvents } from '../../data/events'
import { gameById } from '../../data/games'
import { MOCK_PLAYERS } from '../../data/players'
import { count } from '../../store/counters'
import { dayKey, doubleXpWindow, endOfDay, fmtCountdown } from '../../lib/time'
import { fmt } from '../../lib/format'
import { ACHIEVEMENTS } from '../../data/achievements'
import './hub-pages.css'
import './dashboard.css'

export default function Dashboard() {
  const s = usePlayer()
  const t = useNow(1000)
  const lp = levelProgress(s.xp)
  const rank = rankForLevel(lp.level)
  const nextRank = RANKS[RANKS.findIndex((r) => r.id === rank.id) + 1]
  const checkedIn = s.lastCheckinDay === dayKey(t)
  const dx = doubleXpWindow(t)
  const nextEvent = useMemo(() => getEvents()[0], [])
  const weekly = count(s, 'xp', 'week')
  const board = useMemo(() => {
    const list = [...MOCK_PLAYERS.map((p) => ({ tag: p.tag, seed: p.seed, xp: p.weeklyXp, me: false })), { tag: s.tag, seed: s.avatarSeed, xp: weekly, me: true }].sort((a, b) => b.xp - a.xp)
    const pos = list.findIndex((x) => x.me)
    return { pos: pos + 1, around: list.slice(Math.max(0, pos - 2), pos + 3), list }
  }, [weekly, s.tag, s.avatarSeed])
  const spinReady = s.lastSpinDay !== dayKey(t)
  const shotsLeft = s.penalty.day === dayKey(t) ? 5 - s.penalty.shots : 5
  const hour = new Date(t).getHours()
  const greet = hour < 5 ? 'Late night grind' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const unlocked = Object.keys(s.achievements).length

  return (
    <div className="dash">
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <span className="hud-label">{greet}</span>
            {s.demo && <span className="chip gold">Demo player</span>}
          </div>
          <h1 className="display page-title">
            Welcome back, <span className="grad-mint">{s.tag}</span>
          </h1>
        </div>
        <div className="dash-quick">
          <div className="dash-q">
            <CoinIcon size={22} />
            <div>
              <div className="hud-num dash-q-v">
                <Counter value={s.coins} />
              </div>
              <div className="dash-q-l">Coins</div>
            </div>
          </div>
          <div className="dash-q">
            <XpIcon size={20} />
            <div>
              <div className="hud-num dash-q-v">
                <Counter value={s.xp} />
              </div>
              <div className="dash-q-l">Total XP</div>
            </div>
          </div>
          <div className="dash-q">
            <Trophy size={20} className="t-gold" />
            <div>
              <div className="hud-num dash-q-v">
                {unlocked}/{ACHIEVEMENTS.length}
              </div>
              <div className="dash-q-l">Badges</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-12">
        {/* --- pass + level --- */}
        <motion.section className="span-7 hud brackets card dash-pass" {...stagger(0)}>
          <div className="dash-pass-card">
            <PlayPassCard p={s} />
          </div>
          <div className="dash-level">
            <div className="hud-label">Level progress</div>
            <div className="dash-level-row">
              <span className="display dash-lv">{lp.level}</span>
              <div>
                <div className="hud-label" style={{ color: rank.color }}>
                  {rank.name}
                </div>
                <div className="hud-num t-mint" style={{ fontSize: 13 }}>
                  {lp.need ? `${fmt(lp.toNext)} XP to level ${lp.level + 1}` : 'Max level reached'}
                </div>
              </div>
            </div>
            <div>
              <div className="bar" style={{ height: 12 }}>
                <i style={{ ['--p' as string]: lp.pct }} />
              </div>
              <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                <span className="hud-num mute" style={{ fontSize: 12 }}>
                  {fmt(lp.cur)} / {fmt(lp.need)} XP
                </span>
                <span className="hud-num mute" style={{ fontSize: 12 }}>
                  {Math.round(lp.pct * 100)}%
                </span>
              </div>
            </div>
            {nextRank && (
              <div className="dash-next">
                <RankEmblem rank={nextRank.id} size={54} />
                <div>
                  <div className="hud-label" style={{ color: nextRank.color }}>
                    Next rank · {nextRank.name}
                  </div>
                  <div className="dim" style={{ fontSize: 14 }}>
                    {fmt(Math.max(0, xpForLevel(nextRank.min) - s.xp))} XP away · unlocks {nextRank.perks[0].toLowerCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* --- check-in --- */}
        <motion.section className={`span-5 hud brackets card dash-checkin ${checkedIn ? 'done' : ''}`} {...stagger(1)}>
          <div className="card-h">
            <span className="hud-label">
              <ScanLine size={15} /> Daily check-in
            </span>
            {dx.active ? (
              <span className="chip">
                <Zap size={12} /> 2× XP · {fmtCountdown(dx.endsAt - t, false)}
              </span>
            ) : (
              <span className="chip ghost">
                <Zap size={12} /> 2× XP in {fmtCountdown(dx.startsAt - t)}
              </span>
            )}
          </div>
          {checkedIn ? (
            <div className="dash-ci-body">
              <motion.div className="dash-ci-ok" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
                <Check size={44} />
              </motion.div>
              <div className="display dash-ci-t">You’re in.</div>
              <p className="dim">Checked in today. Scan your station QR every hour you play to keep stacking XP.</p>
              <div className="row" style={{ gap: 10 }}>
                <span className="hud-label mute">Next check-in</span>
                <span className="hud-num t-mint">{fmtCountdown(endOfDay(t) - t, false)}</span>
              </div>
            </div>
          ) : (
            <div className="dash-ci-body">
              <Link to="/scan" className="dash-scan-btn" aria-label="Scan to check in">
                <span className="dash-scan-ring" />
                <span className="dash-scan-ring r2" />
                <ScanLine size={52} />
              </Link>
              <div className="display dash-ci-t">Scan to check in</div>
              <p className="dim">
                At the arena? Scan the crest QR at the entrance for <b className="t-mint">+100 XP</b> and <b className="t-gold">+50 coins</b>
                {dx.active ? ' — doubled right now.' : '.'}
              </p>
              <Btn to="/scan" icon={<ScanLine size={18} />}>
                Open scanner
              </Btn>
            </div>
          )}
        </motion.section>

        {/* --- daily quests --- */}
        <motion.section className="span-7 hud card" {...stagger(2)}>
          <div className="card-h">
            <span className="hud-label">Daily quests</span>
            <span className="row" style={{ gap: 10 }}>
              <span className="mute hud-num" style={{ fontSize: 12 }}>
                <Clock size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> resets in {fmtCountdown(endOfDay(t) - t, false)}
              </span>
              <Link to="/quests" className="card-link">
                All <ChevronRight size={14} />
              </Link>
            </span>
          </div>
          <QuestList period="day" />
        </motion.section>

        {/* --- streak --- */}
        <motion.section className="span-5 hud crimson brackets card" {...stagger(3)}>
          <div className="card-h">
            <span className="hud-label">Visit streak</span>
          </div>
          <StreakMeter weeks={s.weekStreak} best={s.bestStreak} />
        </motion.section>

        {/* --- arcade --- */}
        <motion.section className="span-4 hud card" {...stagger(4)}>
          <div className="card-h">
            <span className="hud-label">Arcade · daily</span>
            <Link to="/arcade" className="card-link">
              Play <ChevronRight size={14} />
            </Link>
          </div>
          <div className="dash-arcade">
            <Link to="/arcade?game=spin" className={`dash-arc ${spinReady ? 'ready' : ''}`}>
              <Dices size={22} />
              <span>
                <b>Lucky Spin</b>
                <small>{spinReady ? 'Ready to spin' : 'Back tomorrow'}</small>
              </span>
            </Link>
            <Link to="/arcade?game=penalty" className={`dash-arc ${shotsLeft > 0 ? 'ready' : ''}`}>
              <Goal size={22} />
              <span>
                <b>Penalty King</b>
                <small>{shotsLeft > 0 ? `${shotsLeft} shots left today` : 'All shots taken'}</small>
              </span>
            </Link>
            <Link to="/arcade?game=pronos" className="dash-arc ready">
              <Eye size={22} />
              <span>
                <b>Weekend Pronos</b>
                <small>{Object.keys(s.predictions).length} / 4 locked</small>
              </span>
            </Link>
          </div>
        </motion.section>

        {/* --- next event --- */}
        <motion.section className="span-4 hud card dash-event" {...stagger(5)} style={{ ['--ec' as string]: nextEvent.color }}>
          <div className="card-h">
            <span className="hud-label">
              <Swords size={14} /> Next up
            </span>
            <Link to="/events" className="card-link">
              Events <ChevronRight size={14} />
            </Link>
          </div>
          <div className="hud-label" style={{ color: gameById(nextEvent.game).c1 }}>
            {gameById(nextEvent.game).title}
          </div>
          <div className="display dash-ev-t">{nextEvent.title}</div>
          <Countdown to={nextEvent.when} />
          <div className="mute" style={{ fontSize: 13, marginTop: 10 }}>
            {nextEvent.taken}/{nextEvent.slots} signed up · {nextEvent.prize}
          </div>
        </motion.section>

        {/* --- weekly position --- */}
        <motion.section className="span-4 hud card" {...stagger(6)}>
          <div className="card-h">
            <span className="hud-label">This week</span>
            <Link to="/ranks" className="card-link">
              Board <ChevronRight size={14} />
            </Link>
          </div>
          <div className="dash-pos">
            <span className="display dash-pos-n">#{board.pos}</span>
            <span className="dim">of {board.list.length} players · {fmt(weekly)} XP</span>
          </div>
          <div className="dash-around">
            {board.around.map((p) => {
              const pos = board.list.indexOf(p) + 1
              return (
                <div key={p.tag} className={`dash-around-row ${p.me ? 'me' : ''}`}>
                  <span className="hud-num mute">{pos}</span>
                  <PixelAvatar seed={p.seed} size={26} rounded={6} />
                  <span className="dash-around-tag">{p.me ? `${p.tag} (you)` : p.tag}</span>
                  <span className="hud-num">{fmt(p.xp)}</span>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* --- activity --- */}
        <motion.section className="span-12 hud card" {...stagger(7)}>
          <div className="card-h">
            <span className="hud-label">Recent activity</span>
            <Link to="/profile" className="card-link">
              History <ChevronRight size={14} />
            </Link>
          </div>
          <ActivityList items={s.activity} limit={6} />
        </motion.section>
      </div>
    </div>
  )
}
