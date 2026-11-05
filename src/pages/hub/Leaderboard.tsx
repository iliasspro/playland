import { useMemo, useState } from 'react'
import { LayoutGroup, motion } from 'motion/react'
import { Crown, Trophy, Users, Check } from 'lucide-react'
import { usePlayer } from '../../store/player'
import { MOCK_PLAYERS, HALL_OF_FAME, playerByTag } from '../../data/players'
import { SQUADS, squadById } from '../../data/squads'
import { rankForLevel, levelFromXp } from '../../data/ranks'
import { gameById } from '../../data/games'
import { PixelAvatar } from '../../components/ui/PixelAvatar'
import { RankEmblem } from '../../components/ui/RankEmblem'
import { Btn, Counter } from '../../components/ui/kit'
import { count } from '../../store/counters'
import { fmt } from '../../lib/format'
import { endOfWeek, fmtCountdown } from '../../lib/time'
import { useNow } from '../../components/ui/kit'
import { sfx } from '../../lib/sfx'
import { fx } from '../../lib/fx'
import './hub-pages.css'
import './leaderboard.css'

const TABS = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All-time' },
  { id: 'squads', label: 'Squads' },
  { id: 'fame', label: 'Hall of Fame' },
] as const
type Tab = (typeof TABS)[number]['id']

interface Row {
  tag: string
  seed: string
  level: number
  score: number
  squadId: string | null
  me?: boolean
  fav: string
}

export default function Leaderboard() {
  const s = usePlayer()
  const joinSquad = usePlayer((x) => x.joinSquad)
  const [tab, setTab] = useState<Tab>('week')
  const t = useNow(1000)

  const rows: Row[] = useMemo(() => {
    const me: Row = {
      tag: s.tag,
      seed: s.avatarSeed,
      level: levelFromXp(s.xp),
      score: tab === 'week' ? count(s, 'xp', 'week') : tab === 'month' ? count(s, 'xp', 'week') * 3 + 1200 : s.xp,
      squadId: s.squadId,
      me: true,
      fav: s.favGame,
    }
    const others: Row[] = MOCK_PLAYERS.map((p) => ({ tag: p.tag, seed: p.seed, level: p.level, score: tab === 'week' ? p.weeklyXp : tab === 'month' ? p.monthlyXp : p.xp, squadId: p.squadId, fav: p.favGame }))
    return [...others, me].sort((a, b) => b.score - a.score)
  }, [s, tab])

  const myPos = rows.findIndex((r) => r.me) + 1
  const top3 = rows.slice(0, 3)
  const podium = [top3[1], top3[0], top3[2]]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <span className="hud-label">Leaderboards</span>
            <span className="chip crimson">
              <span className="live-dot" /> Live
            </span>
          </div>
          <h1 className="display page-title">
            Climb the <span className="grad-crimson">board.</span>
          </h1>
          <p className="page-sub">Weekly board resets Monday 00:00 — top 3 win a free hour. The all-time board is forever.</p>
        </div>
        <LayoutGroup>
          <div className="tabs">
            {TABS.map((x) => (
              <button key={x.id} className={`tab ${tab === x.id ? 'active' : ''}`} onClick={() => { sfx.click(); setTab(x.id) }}>
                {tab === x.id && <motion.span layoutId="lb-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span>{x.label}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>

      {(tab === 'week' || tab === 'month' || tab === 'all') && (
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {tab === 'week' && (
            <div className="lb-reset hud-label mute">
              Resets in <span className="t-mint hud-num">{fmtCountdown(endOfWeek(t) - t)}</span>
            </div>
          )}
          <div className="lb-podium">
            {podium.map((p, i) => {
              const place = i === 1 ? 1 : i === 0 ? 2 : 3
              const rank = rankForLevel(p.level)
              return (
                <motion.div key={p.tag + tab} className={`lbp lbp--${place} ${p.me ? 'me' : ''}`} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (3 - place) * 0.12, type: 'spring', stiffness: 140, damping: 16 }}>
                  {place === 1 && <Crown className="lbp-crown" size={30} />}
                  <PixelAvatar seed={p.seed} size={place === 1 ? 96 : 76} rounded={18} />
                  <div className="lbp-tag">{p.tag}</div>
                  <div className="lbp-rank hud-num" style={{ color: rank.color }}>
                    LV {p.level} · {rank.name}
                  </div>
                  <div className="lbp-score hud-num">
                    <Counter value={p.score} onView /> XP
                  </div>
                  <div className="lbp-base">
                    <span className="display">{place}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <div className="lb-table hud">
            {rows.slice(3, 30).map((r, i) => (
              <LbRow key={r.tag} r={r} pos={i + 4} max={rows[0].score} i={i} />
            ))}
            {myPos > 30 && (
              <>
                <div className="lb-gap">· · ·</div>
                <LbRow r={rows[myPos - 1]} pos={myPos} max={rows[0].score} i={0} />
              </>
            )}
          </div>
          <div className="lb-me-bar">
            <span className="hud-label">Your position</span>
            <span className="display t-mint">#{myPos}</span>
            <span className="dim">{fmt(rows[myPos - 1].score)} XP</span>
            {myPos > 1 && <span className="mute">· {fmt(rows[myPos - 2].score - rows[myPos - 1].score + 1)} XP to pass {rows[myPos - 2].tag}</span>}
          </div>
        </motion.div>
      )}

      {tab === 'squads' && (
        <motion.div className="squad-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {[...SQUADS]
            .sort((a, b) => b.weeklyXp - a.weeklyXp)
            .map((sq, i) => {
              const mine = s.squadId === sq.id
              const members = MOCK_PLAYERS.filter((p) => p.squadId === sq.id).slice(0, 5)
              return (
                <motion.article key={sq.id} className={`squad-card hud brackets ${mine ? 'mine' : ''}`} style={{ ['--c' as string]: sq.color, ['--sc' as string]: sq.color }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="squad-card-top">
                    <span className="squad-badge">
                      <sq.icon size={30} />
                    </span>
                    <span className="display squad-pos">#{i + 1}</span>
                  </div>
                  <div className="display squad-card-name">{sq.name}</div>
                  <div className="mute" style={{ fontStyle: 'italic' }}>
                    “{sq.motto}”
                  </div>
                  <div className="squad-stats">
                    <span>
                      <b className="hud-num">{(sq.weeklyXp / 1000).toFixed(1)}K</b> weekly XP
                    </span>
                    <span>
                      <b className="hud-num">{sq.members}</b> members
                    </span>
                    <span>
                      <b className="hud-num">{sq.wins}</b> cups
                    </span>
                  </div>
                  <div className="squad-members">
                    {members.map((m) => (
                      <PixelAvatar key={m.tag} seed={m.seed} size={30} rounded={8} />
                    ))}
                    <span className="mute hud-num" style={{ fontSize: 12 }}>
                      +{Math.max(0, sq.members - members.length)}
                    </span>
                  </div>
                  {mine ? (
                    <span className="chip" style={{ alignSelf: 'flex-start' }}>
                      <Check size={12} /> Your squad
                    </span>
                  ) : (
                    <Btn
                      size="sm"
                      variant="ghost"
                      icon={<Users size={14} />}
                      onClick={() => {
                        joinSquad(sq.id)
                        sfx.success()
                        fx.toast(`Joined ${sq.name}`, 'Your XP now counts for the Squad Cup.', 'mint')
                      }}
                    >
                      Join squad
                    </Btn>
                  )}
                </motion.article>
              )
            })}
        </motion.div>
      )}

      {tab === 'fame' && (
        <motion.div className="fame" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="fame-wall hud brackets gold">
            <div className="fame-head">
              <Trophy size={26} className="t-gold" />
              <div>
                <div className="display" style={{ fontSize: 26 }}>
                  Hall of Fame
                </div>
                <div className="mute">Every champion gets their tag on the wall by the counter — forever.</div>
              </div>
            </div>
            {HALL_OF_FAME.map((h, i) => {
              const p = playerByTag(h.tag)
              const lvl = p?.level ?? 20
              return (
                <motion.div key={h.title} className="fame-row" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <span className="hud-num mute fame-date">{h.date}</span>
                  <PixelAvatar seed={h.tag} size={40} rounded={10} />
                  <div className="fame-mid">
                    <div className="fame-tag">{h.tag}</div>
                    <div className="mute" style={{ fontSize: 13 }}>
                      {h.title}
                    </div>
                  </div>
                  <RankEmblem rank={rankForLevel(lvl).id} size={36} />
                  <span className="chip gold">{h.prize}</span>
                </motion.div>
              )
            })}
          </div>
          <div className="fame-club hud brackets">
            <RankEmblem rank="club59" size={110} />
            <div className="display grad-holo" style={{ fontSize: 30 }}>
              Club 59
            </div>
            <p className="dim">Nobody has reached level 59 yet. The first one gets the numbered jersey #01 and their name engraved under the crest.</p>
            <div className="hud-label mute">Closest: KenitraKing · LV 57</div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function LbRow({ r, pos, max, i }: { r: Row; pos: number; max: number; i: number }) {
  const rank = rankForLevel(r.level)
  const sq = squadById(r.squadId)
  return (
    <motion.div className={`lb-row ${r.me ? 'me' : ''}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 15) * 0.025 }}>
      <span className="lb-pos hud-num">{pos}</span>
      <PixelAvatar seed={r.seed} size={36} rounded={9} />
      <div className="lb-who">
        <div className="lb-tag">
          {r.tag} {r.me && <span className="chip" style={{ height: 20, fontSize: 10 }}>You</span>}
        </div>
        <div className="lb-sub">
          <span style={{ color: rank.color }}>LV {r.level} · {rank.name}</span>
          {sq && <span className="mute"> · {sq.tag}</span>}
          <span className="mute"> · {gameById(r.fav).short}</span>
        </div>
      </div>
      <RankEmblem rank={rank.id} size={30} glow={false} />
      <div className="lb-bar">
        <i style={{ width: `${(r.score / max) * 100}%` }} />
      </div>
      <span className="lb-score hud-num">{fmt(r.score)}</span>
    </motion.div>
  )
}
