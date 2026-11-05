import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Check, ChevronRight, Lock } from 'lucide-react'
import { usePlayer, questKey } from '../../store/player'
import { QUESTS, SHAPE_COLOR, type Quest } from '../../data/quests'
import { CoinIcon, FlameIcon, ShapeIcon, XpIcon } from '../ui/icons'
import { fmt } from '../../lib/format'
import { timeAgo } from '../../lib/time'
import { sfx } from '../../lib/sfx'
import { streakMultiplier } from '../../store/player'
import type { Activity, ActivityKind } from '../../store/types'
import { ScanLine, Gamepad2, Coffee, Trophy, KeyRound, Users, ListChecks, Medal, Dices, Goal, Eye, Gift, Gem, Zap, Sparkles, Crown } from 'lucide-react'
import './parts.css'

export function RewardPills({ xp, coins, size = 14 }: { xp?: number; coins?: number; size?: number }) {
  return (
    <span className="reward-pills">
      {!!coins && (
        <span className="cur gold">
          <CoinIcon size={size + 2} />
          {coins > 0 ? '+' : ''}
          {fmt(coins)}
        </span>
      )}
      {!!xp && (
        <span className="cur mint">
          <XpIcon size={size} />+{fmt(xp)}
        </span>
      )}
    </span>
  )
}

export function QuestCard({ q, i = 0, compact = false }: { q: Quest; i?: number; compact?: boolean }) {
  const s = usePlayer()
  const claimQuest = usePlayer((x) => x.claimQuest)
  const prog = Math.min(q.target, q.progress(s))
  const claimed = !!s.questClaims[questKey(q.id, q.period)]
  const ready = prog >= q.target && !claimed
  const color = SHAPE_COLOR[q.shape]
  return (
    <motion.div
      className={`quest ${ready ? 'quest--ready' : ''} ${claimed ? 'quest--done' : ''} ${compact ? 'quest--compact' : ''}`}
      style={{ ['--qc' as string]: color }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      layout
    >
      <span className="quest-ic">
        <ShapeIcon shape={q.shape} size={compact ? 16 : 18} className="quest-shape" />
        <q.icon size={compact ? 16 : 20} className="quest-icon" />
      </span>
      <div className="quest-mid">
        <div className="quest-t">
          {q.title}
          {claimed && <Check size={15} className="t-mint" />}
        </div>
        {!compact && <div className="quest-d">{q.desc}</div>}
        <div className="quest-prog">
          <div className="bar" style={{ ['--c1' as string]: color, ['--c2' as string]: color } as React.CSSProperties}>
            <i style={{ ['--p' as string]: prog / q.target }} />
          </div>
          <span className="hud-num quest-n">
            {prog}/{q.target}
          </span>
        </div>
      </div>
      <div className="quest-r">
        <RewardPills xp={q.reward.xp} coins={q.reward.coins} />
        {ready ? (
          <button
            className="claim-btn"
            onClick={() => {
              sfx.success()
              claimQuest(q.id)
            }}
          >
            Claim
          </button>
        ) : claimed ? (
          <span className="quest-claimed hud-label">Claimed</span>
        ) : q.cta ? (
          <Link to={q.cta.to} className="card-link" onClick={() => sfx.click()}>
            {q.cta.label} <ChevronRight size={14} />
          </Link>
        ) : null}
      </div>
    </motion.div>
  )
}

export function QuestList({ period, compact, limit }: { period: Quest['period']; compact?: boolean; limit?: number }) {
  const list = QUESTS.filter((q) => q.period === period).slice(0, limit)
  return (
    <div className="quest-list">
      {list.map((q, i) => (
        <QuestCard key={q.id} q={q} i={i} compact={compact} />
      ))}
    </div>
  )
}

const KIND_ICON: Record<ActivityKind, typeof ScanLine> = {
  welcome: Sparkles,
  checkin: ScanLine,
  session: Gamepad2,
  coffee: Coffee,
  event: Trophy,
  secret: KeyRound,
  friend: Users,
  quest: ListChecks,
  achievement: Medal,
  spin: Dices,
  penalty: Goal,
  prono: Eye,
  redeem: Gift,
  season: Gem,
  levelup: Crown,
  bonus: Zap,
}

export function ActivityList({ items, limit = 8 }: { items: Activity[]; limit?: number }) {
  if (!items.length) return <div className="empty">No activity yet — scan in at the arena to start your log.</div>
  return (
    <div className="activity">
      {items.slice(0, limit).map((a, i) => {
        const Icon = KIND_ICON[a.kind] ?? Zap
        return (
          <motion.div key={a.id} className={`act act--${a.kind}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
            <span className="act-ic">
              <Icon size={15} />
            </span>
            <div className="act-mid">
              <div className="act-t">{a.title}</div>
              <div className="act-time mute">{timeAgo(a.at)}</div>
            </div>
            <RewardPills xp={a.xp} coins={a.coins} size={12} />
          </motion.div>
        )
      })}
    </div>
  )
}

export function StreakMeter({ weeks, best }: { weeks: number; best: number }) {
  const m = streakMultiplier(weeks)
  const marks = [
    { w: 2, m: '×1.1' },
    { w: 4, m: '×1.25' },
    { w: 8, m: '×1.5' },
  ]
  return (
    <div className="streak">
      <div className="streak-top">
        <motion.div className="streak-flame" animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <FlameIcon size={58} />
        </motion.div>
        <div>
          <div className="display streak-n">
            {weeks}
            <span>-week streak</span>
          </div>
          <div className="dim" style={{ fontSize: 14 }}>
            Coin multiplier <b className="t-gold">×{m}</b> · best {best} weeks
          </div>
        </div>
      </div>
      <div className="streak-track">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={`streak-dot ${i < Math.min(weeks, 8) ? 'on' : ''}`}>
            {i < Math.min(weeks, 8) ? <FlameIcon size={14} /> : <Lock size={10} />}
          </span>
        ))}
      </div>
      <div className="streak-marks">
        {marks.map((x) => (
          <span key={x.w} className={weeks >= x.w ? 'on' : ''}>
            {x.w}W <b>{x.m}</b>
          </span>
        ))}
      </div>
      <p className="mute" style={{ fontSize: 13 }}>
        Visit at least once every week to keep the flame alive. Miss a week and it resets to 1.
      </p>
    </div>
  )
}
