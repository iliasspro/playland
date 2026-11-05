import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Calendar, Users, Trophy, Swords, Check, ScanLine, Ticket } from 'lucide-react'
import { getEvents, FRIDAY_BRACKET, type PLEvent } from '../../data/events'
import { gameById } from '../../data/games'
import { Btn, Countdown, stagger } from '../../components/ui/kit'
import { PixelAvatar } from '../../components/ui/PixelAvatar'
import { usePlayer } from '../../store/player'
import { fmtDate, fmtTime } from '../../lib/time'
import { sfx } from '../../lib/sfx'
import { fx } from '../../lib/fx'
import { encodeCode } from '../../lib/qr'
import { useNavigate } from 'react-router'
import './hub-pages.css'
import './events.css'

export default function Events() {
  const events = useMemo(() => getEvents(), [])
  const [joined, setJoined] = useState<string[]>([])
  const tag = usePlayer((s) => s.tag)
  const nav = useNavigate()
  const cup = events.find((e) => e.id === 'friday-cup')!

  const join = (e: PLEvent) => {
    if (joined.includes(e.id)) return
    sfx.success()
    setJoined((j) => [...j, e.id])
    fx.toast(`You’re on the list · ${e.short}`, `Scan the event QR at the arena on ${fmtDate(e.when)} for +${e.xp} XP.`, 'mint')
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <span className="hud-label">Tournaments & nights</span>
          </div>
          <h1 className="display page-title">
            Enter the <span className="grad-crimson">bracket.</span>
          </h1>
          <p className="page-sub">Weekly cups with real prizes. Sign up here, then scan the event QR when you arrive — participation alone pays XP.</p>
        </div>
      </div>

      <section className="bracket-wrap hud brackets crimson">
        <div className="bracket-head">
          <div>
            <div className="hud-label" style={{ color: 'var(--crimson-hi)' }}>
              <span className="live-dot" style={{ display: 'inline-block', marginRight: 8 }} />
              Last week’s cup · replay
            </div>
            <div className="display" style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}>
              {cup.title} · #12
            </div>
          </div>
          <div className="bracket-next">
            <span className="hud-label mute">Next cup in</span>
            <Countdown to={cup.when} size="sm" />
          </div>
        </div>
        <div className="bracket">
          {FRIDAY_BRACKET.map((round, ri) => (
            <div key={ri} className="b-round" style={{ ['--n' as string]: round.length }}>
              <div className="b-round-t hud-label">{['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'][ri]}</div>
              <div className="b-matches">
                {round.map((m, mi) => {
                  const done = m.sa != null && m.sb != null && !m.live
                  const aWin = done && m.sa! > m.sb!
                  const bWin = done && m.sb! > m.sa!
                  return (
                    <motion.div key={mi} className={`b-match ${m.live ? 'live' : ''}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ri * 0.15 + mi * 0.04 }}>
                      {m.live && <span className="b-live hud-label">Live</span>}
                      <div className={`b-p ${aWin ? 'win' : bWin ? 'lose' : ''}`}>
                        {m.a !== '—' ? <PixelAvatar seed={m.a} size={20} rounded={5} /> : <span className="b-empty" />}
                        <span className="b-tag">{m.a === tag ? `${m.a} (you)` : m.a}</span>
                        <span className="b-s hud-num">{m.sa ?? ''}</span>
                      </div>
                      <div className={`b-p ${bWin ? 'win' : aWin ? 'lose' : ''}`}>
                        {m.b !== '—' ? <PixelAvatar seed={m.b} size={20} rounded={5} /> : <span className="b-empty" />}
                        <span className="b-tag">{m.b}</span>
                        <span className="b-s hud-num">{m.sb ?? ''}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="b-round b-champ">
            <div className="b-round-t hud-label">Champion</div>
            <div className="b-matches">
              <div className="b-trophy">
                <Trophy size={40} />
                <span className="hud-label">500 DH</span>
                <span className="mute" style={{ fontSize: 12 }}>
                  + 2,000 coins
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ev-cards">
        {events.map((e, i) => {
          const g = gameById(e.game)
          const isIn = joined.includes(e.id)
          const full = e.taken >= e.slots
          return (
            <motion.article key={e.id} className="evc hud" style={{ ['--ec' as string]: e.color }} {...stagger(i, 0.06)}>
              <div className="evc-top" style={{ background: `linear-gradient(135deg, ${g.c1}55, ${g.c2}aa)` }}>
                <span className="evc-short display">{g.short}</span>
                <span className="chip ghost evc-kind">{e.kind === 'tournament' ? 'Tournament' : e.kind === 'party' ? 'Watch party' : 'Special night'}</span>
              </div>
              <div className="evc-body">
                <div className="evc-title">{e.title}</div>
                <div className="evc-meta">
                  <span>
                    <Calendar size={14} /> {fmtDate(e.when)} · {fmtTime(e.when)}
                  </span>
                  <span>
                    <Swords size={14} /> {e.format}
                  </span>
                  <span>
                    <Trophy size={14} /> {e.prize}
                  </span>
                  <span>
                    <Ticket size={14} /> Entry {e.entry}
                  </span>
                </div>
                <div className="evc-slots">
                  <div className="bar" style={{ height: 6, ['--c1' as string]: e.color, ['--c2' as string]: e.color } as React.CSSProperties}>
                    <i style={{ ['--p' as string]: (e.taken + (isIn ? 1 : 0)) / e.slots }} />
                  </div>
                  <span className="hud-num mute" style={{ fontSize: 12 }}>
                    <Users size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> {e.taken + (isIn ? 1 : 0)}/{e.slots}
                  </span>
                </div>
                <Countdown to={e.when} size="sm" />
                <div className="evc-actions">
                  {isIn ? (
                    <span className="chip">
                      <Check size={12} /> Registered
                    </span>
                  ) : (
                    <Btn size="sm" onClick={() => join(e)} disabled={full}>
                      {full ? 'Full' : 'Sign up'}
                    </Btn>
                  )}
                  <button className="card-link" onClick={() => nav(`/scan?code=${encodeURIComponent(encodeCode({ kind: 'event', eventId: e.id }))}&demo=1`)}>
                    <ScanLine size={13} /> Demo check-in
                  </button>
                </div>
                <div className="evc-xp hud-num">
                  +{e.xp} XP · +{e.coins} coins for checking in
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}
