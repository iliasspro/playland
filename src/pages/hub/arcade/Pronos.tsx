import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Lock, Minus, Plus, Pencil, Eye } from 'lucide-react'
import { usePlayer } from '../../../store/player'
import { getFixtures, type Fixture } from '../../../data/fixtures'
import { Btn, Countdown } from '../../../components/ui/kit'
import { CoinIcon } from '../../../components/ui/icons'
import { fmtDate, fmtTime } from '../../../lib/time'
import { sfx } from '../../../lib/sfx'
import { fx } from '../../../lib/fx'

export function Pronos() {
  const fixtures = useMemo(() => getFixtures().sort((a, b) => a.kickoff - b.kickoff), [])
  const preds = usePlayer((s) => s.predictions)
  const settle = usePlayer((s) => s.settlePredictions)
  const locked = Object.keys(preds).length
  return (
    <div className="pronos">
      <div className="pronos-head">
        <div>
          <div className="display" style={{ fontSize: 32 }}>
            Weekend <span className="grad-mint">Pronos</span>
          </div>
          <p className="dim">Call the scores before kick-off. Right result <b className="t-gold">+50 coins</b>, exact score <b className="t-gold">+200 coins</b> and the Oracle badge.</p>
        </div>
        <div className="pronos-count">
          <span className="display">{locked}</span>
          <span className="mute hud-num">/ {fixtures.length} locked</span>
        </div>
      </div>
      <div className="fixtures">
        {fixtures.map((f, i) => (
          <FixtureCard key={f.id} f={f} i={i} />
        ))}
      </div>
      <div className="pronos-foot">
        <span className="mute" style={{ fontSize: 13 }}>
          Results settle automatically after the final whistle. Big matches are shown live on the Red Room screens.
        </span>
        <Btn
          variant="ghost"
          size="sm"
          icon={<Eye size={14} />}
          disabled={!locked}
          onClick={() => {
            const o = settle()
            if (o.ok) {
              sfx.success()
              fx.toast(o.title, o.lines.map((l) => l.label).join(' · '), 'gold')
            }
          }}
        >
          Settle results (demo)
        </Btn>
      </div>
    </div>
  )
}

function Team({ name, short, color, side }: { name: string; short: string; color: string; side: 'home' | 'away' }) {
  return (
    <div className={`team team--${side}`}>
      <span className="team-badge" style={{ ['--tc' as string]: color }}>
        {short}
      </span>
      <span className="team-name">{name}</span>
    </div>
  )
}

function Stepper({ v, set, disabled }: { v: number; set: (n: number) => void; disabled?: boolean }) {
  return (
    <div className={`stepper ${disabled ? 'disabled' : ''}`}>
      <button onClick={() => { sfx.tick(); set(Math.min(9, v + 1)) }} disabled={disabled} aria-label="Increase">
        <Plus size={14} />
      </button>
      <motion.span key={v} className="display stepper-v" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {v}
      </motion.span>
      <button onClick={() => { sfx.tick(); set(Math.max(0, v - 1)) }} disabled={disabled} aria-label="Decrease">
        <Minus size={14} />
      </button>
    </div>
  )
}

function FixtureCard({ f, i }: { f: Fixture; i: number }) {
  const pred = usePlayer((s) => s.predictions[f.id])
  const predict = usePlayer((s) => s.predict)
  const [edit, setEdit] = useState(!pred)
  const [h, setH] = useState(pred?.home ?? 1)
  const [a, setA] = useState(pred?.away ?? 1)
  const lockedView = !!pred && !edit
  const [hp, dp, ap] = f.community
  return (
    <motion.article className={`fixture hud ${lockedView ? 'locked' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
      <div className="fixture-top">
        <span className="hud-label">
          {f.comp}
          {f.label ? ` · ${f.label}` : ''}
        </span>
        <span className="mute hud-num" style={{ fontSize: 12 }}>
          {fmtDate(f.kickoff)} · {fmtTime(f.kickoff)}
        </span>
      </div>
      <div className="fixture-mid">
        <Team name={f.home} short={f.homeShort} color={f.homeColor} side="home" />
        <div className="fixture-score">
          {lockedView ? (
            <div className="fixture-locked display">
              {pred.home}
              <span>–</span>
              {pred.away}
            </div>
          ) : (
            <>
              <Stepper v={h} set={setH} />
              <span className="fixture-dash display">–</span>
              <Stepper v={a} set={setA} />
            </>
          )}
        </div>
        <Team name={f.away} short={f.awayShort} color={f.awayColor} side="away" />
      </div>
      <div className="community">
        <div className="community-bar">
          <i style={{ width: `${hp}%`, background: f.homeColor }} />
          <i style={{ width: `${dp}%`, background: '#5f7d79' }} />
          <i style={{ width: `${ap}%`, background: f.awayColor }} />
        </div>
        <div className="community-l hud-num">
          <span>{f.homeShort} {hp}%</span>
          <span>Draw {dp}%</span>
          <span>{f.awayShort} {ap}%</span>
        </div>
      </div>
      <div className="fixture-foot">
        <span className="row mute" style={{ gap: 8, fontSize: 12 }}>
          Kick-off <Countdown to={f.kickoff} size="sm" />
        </span>
        {lockedView ? (
          <button className="card-link" onClick={() => { sfx.click(); setEdit(true) }}>
            <Pencil size={13} /> Edit
          </button>
        ) : (
          <Btn
            size="sm"
            icon={<Lock size={14} />}
            onClick={() => {
              predict(f.id, h, a)
              setEdit(false)
              sfx.success()
              fx.toast('Prediction locked', `${f.homeShort} ${h}–${a} ${f.awayShort} · up to +200 coins`, 'mint')
            }}
          >
            Lock {h}–{a}
          </Btn>
        )}
      </div>
      {lockedView && (
        <div className="fixture-win cur gold">
          <CoinIcon size={14} /> up to +200
        </div>
      )}
    </motion.article>
  )
}
