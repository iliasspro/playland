import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { motion } from 'motion/react'
import { Dices, Lock, Pencil, Volume2, VolumeX, RotateCcw, UserRound, ChevronRight, Check } from 'lucide-react'
import { usePlayer } from '../../store/player'
import { PlayPassCard } from '../../components/ui/PlayPassCard'
import { Btn, Counter, Modal, stagger } from '../../components/ui/kit'
import { ActivityList } from '../../components/hub/parts'
import { levelFromXp, rankForLevel } from '../../data/ranks'
import { squadById } from '../../data/squads'
import { gameById, GAMES } from '../../data/games'
import { ACHIEVEMENTS } from '../../data/achievements'
import { count } from '../../store/counters'
import { fmtDate } from '../../lib/time'
import { sfx } from '../../lib/sfx'
import { fx } from '../../lib/fx'
import type { FrameId, TagColor } from '../../store/types'
import './hub-pages.css'
import './profile.css'

export default function Profile() {
  const s = usePlayer()
  const nav = useNavigate()
  const level = levelFromXp(s.xp)
  const rank = rankForLevel(level)
  const squad = squadById(s.squadId)
  const [editing, setEditing] = useState(false)
  const [tag, setTag] = useState(s.tag)
  const [confirmReset, setConfirmReset] = useState(false)

  const frames: { id: FrameId; label: string; ok: boolean; why?: string }[] = [
    { id: 'none', label: 'Classic', ok: true },
    { id: 'neon', label: 'Neon mint', ok: s.owned.includes('frame:neon'), why: 'Rewards shop · 250 coins' },
    { id: 'gold', label: 'Gold', ok: level >= 30, why: 'Unlocks at Elite (LV 30)' },
    { id: 'holo', label: 'Holo', ok: s.elitePass || level >= 59, why: 'Season Elite track' },
  ]
  const colors: { id: TagColor; label: string; ok: boolean; why?: string; c: string }[] = [
    { id: 'default', label: 'Ice', ok: true, c: '#eafbf8' },
    { id: 'crimson', label: 'Crimson', ok: s.owned.includes('tag:crimson') || s.elitePass, why: 'Rewards shop · 200 coins', c: '#ff5a74' },
    { id: 'gold', label: 'Gold', ok: level >= 30, why: 'Unlocks at Elite (LV 30)', c: '#ffc83d' },
  ]

  const stats = [
    { l: 'Total XP', v: s.xp },
    { l: 'Check-ins', v: count(s, 'checkin', 'all') },
    { l: 'Hours played', v: count(s, 'session', 'all') },
    { l: 'Coffees', v: count(s, 'coffee', 'all') },
    { l: 'Coins earned', v: s.coinsEarned },
    { l: 'Coins spent', v: s.coinsSpent },
    { l: 'Best streak', v: s.bestStreak, suffix: ' wk' },
    { l: 'Badges', v: Object.keys(s.achievements).length, suffix: `/${ACHIEVEMENTS.length}` },
  ]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <span className="hud-label">Player profile</span>
          </div>
          <h1 className="display page-title">
            <span className={`tag-${s.tagColor}`}>{s.tag}</span>
          </h1>
          <p className="page-sub">
            <span style={{ color: rank.color }}>
              Level {level} · {rank.name}
            </span>{' '}
            · member since {fmtDate(s.joinedAt, { month: 'long', year: 'numeric' })} · main: {gameById(s.favGame).title}
          </p>
        </div>
      </div>

      <div className="grid-12">
        <motion.section className="span-5 prof-card" {...stagger(0)}>
          <PlayPassCard p={s} size="lg" />
          <p className="mute" style={{ fontSize: 13, textAlign: 'center' }}>
            Tap ↻ to flip — the back is your squad-up QR for friends.
          </p>
        </motion.section>

        <motion.section className="span-7 hud brackets card" {...stagger(1)}>
          <div className="card-h">
            <span className="hud-label">Career stats</span>
          </div>
          <div className="prof-stats">
            {stats.map((x) => (
              <div key={x.l} className="prof-stat">
                <div className="hud-num prof-stat-v">
                  <Counter value={x.v} onView />
                  {x.suffix && <span className="mute">{x.suffix}</span>}
                </div>
                <div className="prof-stat-l">{x.l}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="span-7 hud card" {...stagger(2)}>
          <div className="card-h">
            <span className="hud-label">Customize</span>
          </div>
          <div className="prof-custom">
            <div className="prof-row">
              <div className="prof-row-l">Gamertag</div>
              {editing ? (
                <form
                  className="row"
                  style={{ gap: 8, flex: 1 }}
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!/^[A-Za-z0-9_.]{3,16}$/.test(tag)) {
                      sfx.error()
                      return
                    }
                    s.updateProfile({ tag, name: tag })
                    setEditing(false)
                    sfx.success()
                  }}
                >
                  <input className="input" style={{ height: 42 }} value={tag} maxLength={16} onChange={(e) => setTag(e.target.value.replace(/\s/g, ''))} autoFocus />
                  <Btn size="sm" type="submit" icon={<Check size={14} />}>
                    Save
                  </Btn>
                </form>
              ) : (
                <button className="prof-edit" onClick={() => { sfx.click(); setEditing(true) }}>
                  <span className={`tag-${s.tagColor}`}>{s.tag}</span>
                  <Pencil size={14} />
                </button>
              )}
            </div>
            <div className="prof-row">
              <div className="prof-row-l">Avatar</div>
              <Btn
                size="sm"
                variant="ghost"
                icon={<Dices size={14} />}
                onClick={() => {
                  sfx.powerUp()
                  s.updateProfile({ avatarSeed: Math.random().toString(36).slice(2, 9) })
                }}
              >
                Re-roll creature
              </Btn>
            </div>
            <div className="prof-row">
              <div className="prof-row-l">Frame</div>
              <div className="prof-opts">
                {frames.map((f) => (
                  <button
                    key={f.id}
                    className={`prof-opt ${s.frame === f.id ? 'sel' : ''}`}
                    disabled={!f.ok}
                    title={f.ok ? f.label : f.why}
                    onClick={() => {
                      sfx.click()
                      s.updateProfile({ frame: f.id })
                    }}
                  >
                    {!f.ok && <Lock size={11} />} {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="prof-row">
              <div className="prof-row-l">Tag color</div>
              <div className="prof-opts">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    className={`prof-opt ${s.tagColor === c.id ? 'sel' : ''}`}
                    disabled={!c.ok}
                    title={c.ok ? c.label : c.why}
                    onClick={() => {
                      sfx.click()
                      s.updateProfile({ tagColor: c.id })
                    }}
                  >
                    <span className="prof-swatch" style={{ background: c.c }} />
                    {!c.ok && <Lock size={11} />} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="prof-row">
              <div className="prof-row-l">Main game</div>
              <select className="input prof-select" value={s.favGame} onChange={(e) => { sfx.click(); s.updateProfile({ favGame: e.target.value }) }}>
                {GAMES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.section>

        <motion.section className="span-5 hud card" {...stagger(3)}>
          <div className="card-h">
            <span className="hud-label">Squad & settings</span>
          </div>
          <Link to="/ranks" className="prof-squad" style={{ ['--sc' as string]: squad?.color ?? 'var(--text-dim)' }} onClick={() => sfx.click()}>
            <span className="squad-ic" style={{ color: squad?.color, borderColor: squad?.color }}>
              {squad ? <squad.icon size={18} /> : <UserRound size={18} />}
            </span>
            <span style={{ flex: 1 }}>
              <b>{squad ? squad.name : 'No squad yet'}</b>
              <small className="mute">{squad ? `${squad.members} members · ${squad.wins} cups` : 'Join one in the Squads tab'}</small>
            </span>
            <ChevronRight size={16} />
          </Link>
          <div className="prof-settings">
            <button className="prof-setting" onClick={s.toggleSound}>
              {s.settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>Sound effects</span>
              <span className={`switch ${s.settings.sound ? 'on' : ''}`}>
                <i />
              </span>
            </button>
            <button
              className="prof-setting"
              onClick={() => {
                s.loadDemo()
                fx.toast('Veteran demo loaded', 'NeonNoor · Level 23 Pro', 'gold')
              }}
            >
              <UserRound size={18} />
              <span>Load the veteran demo player</span>
            </button>
            <button className="prof-setting danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={18} />
              <span>Reset Play Pass</span>
            </button>
          </div>
        </motion.section>

        <motion.section className="span-12 hud card" {...stagger(4)}>
          <div className="card-h">
            <span className="hud-label">Full history</span>
            <span className="mute hud-num" style={{ fontSize: 12 }}>
              {s.activity.length} events
            </span>
          </div>
          <ActivityList items={s.activity} limit={40} />
        </motion.section>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset Play Pass" tone="crimson">
        <div className="col" style={{ gap: 16, alignItems: 'center', textAlign: 'center' }}>
          <p className="dim">This wipes the local demo player (level, coins, vouchers). You can create a new player right after.</p>
          <div className="row" style={{ gap: 10 }}>
            <Btn variant="ghost" onClick={() => setConfirmReset(false)}>
              Keep it
            </Btn>
            <Btn
              variant="crimson"
              onClick={() => {
                s.resetAll()
                nav('/join')
              }}
            >
              Reset
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  )
}
