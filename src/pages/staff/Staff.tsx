import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Maximize2, Printer, ShieldCheck, Ticket, Zap, Coins, Send, CheckCircle2, XCircle, Radio, KeyRound } from 'lucide-react'
import { Crest } from '../../components/brand/Crest'
import { Wordmark } from '../../components/brand/Wordmark'
import { QrCode } from '../../components/ui/QrCode'
import { PixelAvatar } from '../../components/ui/PixelAvatar'
import { Btn, useNow } from '../../components/ui/kit'
import { usePlayer } from '../../store/player'
import { codeUrl, currentSlot, SLOT_MS, type ScanCode } from '../../lib/qr'
import { seeded } from '../../lib/rng'
import { fmt } from '../../lib/format'
import { fmtTime, now } from '../../lib/time'
import { sfx } from '../../lib/sfx'
import { fx } from '../../lib/fx'
import { STATIONS, stationStatus } from '../../data/stations'
import { MOCK_PLAYERS } from '../../data/players'
import { rewardById } from '../../data/rewards'
import { SECRETS } from '../../data/quests'
import { ChartCard, HBars, Heatmap, LegendItem, Meter, StackedColumns, StatTile, VIZ } from './charts'
import '../hub/hub-pages.css'
import './staff.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '00', '01']

export default function Staff() {
  const t = useNow(1000)
  const slot = currentSlot(t)
  const left = SLOT_MS - (t % SLOT_MS)
  const entrance = useRef<HTMLDivElement>(null)

  // ---------- mock analytics (seeded so numbers stay stable)
  const series = useMemo(() => {
    const r = seeded('checkins-30')
    const out: { label: string; a: number; b: number }[] = []
    const today = new Date(now())
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dow = d.getDay()
      const base = 38 + (29 - i) * 0.75 + (dow === 5 || dow === 6 ? 22 : dow === 0 ? 12 : 0) + r.int(-6, 6)
      const share = 0.46 + ((29 - i) / 29) * 0.22 + (r.next() - 0.5) * 0.06
      const a = Math.round(base * share)
      out.push({ label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }), a, b: Math.round(base) - a })
    }
    return out
  }, [])
  const heat = useMemo(() => {
    const r = seeded('heat')
    const hourBase = [12, 15, 22, 28, 30, 33, 38, 52, 68, 80, 92, 96, 90, 74, 52, 30]
    return DAYS.map((_, di) =>
      hourBase.map((h, hi) => {
        const weekend = di >= 4 ? 1.18 : 1
        const midweekAfternoon = di >= 1 && di <= 3 && hi >= 4 && hi <= 7 ? 0.72 : 1
        return Math.round(Math.min(14, ((h * weekend * midweekAfternoon) / 100) * 14 + r.int(-1, 1)))
      }),
    )
  }, [])
  const today = series[series.length - 1]
  const lastWeek = series[series.length - 8]
  const todayTotal = today.a + today.b
  const deltaPct = Math.round(((todayTotal - (lastWeek.a + lastWeek.b)) / (lastWeek.a + lastWeek.b)) * 100)
  const busy = STATIONS.filter((st) => stationStatus(st, t).state === 'busy').length
  const totals = series.reduce((acc, d) => ({ a: acc.a + d.a, b: acc.b + d.b }), { a: 0, b: 0 })
  const returningRate = totals.a / (totals.a + totals.b)

  return (
    <div className="staff">
      <header className="staff-top">
        <Link to="/" className="row" style={{ gap: 10 }} onMouseEnter={() => sfx.hover()}>
          <ArrowLeft size={16} />
          <Crest size={40} mode="none" />
          <Wordmark height={18} />
        </Link>
        <div className="staff-title">
          <span className="hud-label">Game Master console</span>
          <span className="chip crimson">
            <span className="live-dot" /> Live
          </span>
        </div>
        <div className="staff-clock hud-num">{new Date(t).toLocaleTimeString('en-GB')}</div>
        <Btn to="/hub" size="sm" variant="ghost">
          Player view
        </Btn>
      </header>

      <main className="staff-main">
        {/* ---------------- entrance + kpis */}
        <div className="staff-row">
          <section className="entrance hud brackets" ref={entrance}>
            <div className="entrance-head">
              <div>
                <div className="hud-label">Counter screen · entrance QR</div>
                <div className="display entrance-t">Scan to check in</div>
              </div>
              <button
                className="icon-btn"
                aria-label="Fullscreen"
                onClick={() => {
                  sfx.click()
                  entrance.current?.requestFullscreen?.()
                }}
              >
                <Maximize2 size={18} />
              </button>
            </div>
            <div className="entrance-qr">
              <AnimatePresence mode="wait">
                <motion.div key={slot} initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.35 }}>
                  <QrCode value={codeUrl({ kind: 'checkin', spot: 'ENTRANCE', slot })} size={250} />
                </motion.div>
              </AnimatePresence>
              <svg className="entrance-ring" viewBox="0 0 290 290" aria-hidden>
                <rect x="3" y="3" width="284" height="284" rx="22" fill="none" stroke="rgba(138,208,199,.15)" strokeWidth="3" />
                <rect x="3" y="3" width="284" height="284" rx="22" fill="none" stroke="#5ff3da" strokeWidth="4" pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - left / SLOT_MS)} strokeLinecap="round" />
              </svg>
            </div>
            <div className="entrance-foot">
              <span className="hud-num t-mint">{Math.ceil(left / 1000)}s</span>
              <span className="mute">Rotates every 30 s so it only works in the room — a photo of it expires before anyone gets home.</span>
            </div>
          </section>

          <div className="kpis">
            <StatTile label="Check-ins today" value={fmt(todayTotal)} delta={`${deltaPct >= 0 ? '+' : ''}${deltaPct}% vs last ${new Date(now()).toLocaleDateString('en-GB', { weekday: 'long' })}`} good={deltaPct >= 0} trend={series.slice(-12).map((d) => d.a + d.b)} />
            <StatTile label="Players in the arena" value={fmt(busy * 2 + 3)} suffix={` · ${busy}/${STATIONS.length} stations`} />
            <StatTile label="New Play Passes this week" value="34" delta="+9 vs last week" trend={[12, 15, 14, 18, 17, 21, 22, 20, 25, 27, 30, 34]} />
            <StatTile label="Coins issued today" value="4,820" delta="≈ 54 DH of rewards" good />
            <StatTile label="Vouchers redeemed today" value="12" delta="7 coffees · 3 hours · 2 snacks" good />
            <div className="stat hud">
              <div className="stat-l">Returning players · 30 days</div>
              <div className="stat-v">{Math.round(returningRate * 100)}%</div>
              <Meter pct={returningRate} label="Share of check-ins from players who already had a Play Pass" />
            </div>
          </div>
        </div>

        {/* ---------------- charts */}
        <div className="staff-charts">
          <ChartCard
            className="span-2"
            title="Daily check-ins · last 30 days"
            sub="Returning players are climbing since the Play Pass launched — that’s the loyalty loop working."
            legend={
              <>
                <LegendItem color={VIZ.s1} label="Returning" />
                <LegendItem color={VIZ.s2} label="New" />
              </>
            }
            table={
              <table className="viz-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Returning</th>
                    <th>New</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((d) => (
                    <tr key={d.label}>
                      <td>{d.label}</td>
                      <td>{d.a}</td>
                      <td>{d.b}</td>
                      <td>{d.a + d.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          >
            <StackedColumns data={series} />
          </ChartCard>

          <ChartCard
            className="span-2"
            title="When the arena fills up"
            sub="Busy stations by weekday and hour (avg. of the last 4 weeks). Tue–Thu afternoons are the gap — Double XP runs 14–18h to fill them."
            table={
              <table className="viz-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    {HOURS.map((h) => (
                      <th key={h}>{h}h</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((d, i) => (
                    <tr key={d}>
                      <td>{d}</td>
                      {heat[i].map((v, j) => (
                        <td key={j}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          >
            <Heatmap rows={DAYS} cols={HOURS.map((h) => `${h}h`)} values={heat} fmtCell={(v) => `${v}/14`} />
          </ChartCard>

          <ChartCard
            title="Rewards redeemed · 30 days"
            sub="Coffee is the gateway reward; hours drive repeat visits."
            table={
              <table className="viz-table">
                <tbody>
                  {REDEEMED.map((d) => (
                    <tr key={d.label}>
                      <td>{d.label}</td>
                      <td>{d.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          >
            <HBars data={REDEEMED} />
          </ChartCard>

          <ChartCard
            title="Hours played by game · 30 days"
            sub="Scanned station sessions."
            table={
              <table className="viz-table">
                <tbody>
                  {GAME_HOURS.map((d) => (
                    <tr key={d.label}>
                      <td>{d.label}</td>
                      <td>{d.v} h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          >
            <HBars data={GAME_HOURS} unit=" h" />
          </ChartCard>
        </div>

        {/* ---------------- tools */}
        <div className="staff-tools">
          <VoucherDesk />
          <LiveFeed />
          <AwardBonus />
        </div>

        {/* ---------------- posters */}
        <Posters />
        <p className="mute staff-note">All figures on this console are mock data for the preview. In production they come from the Play Pass backend.</p>
      </main>
    </div>
  )
}

const REDEEMED = [
  { label: 'Free Coffee', v: 64 },
  { label: '+30 Min Overtime', v: 38 },
  { label: '1 Hour Free', v: 27 },
  { label: 'Snack Combo', v: 21 },
  { label: 'Neon Profile Frame', v: 19 },
  { label: 'Friend Pass', v: 11 },
  { label: 'Tournament Ticket', v: 9 },
  { label: 'VIP Room · 1h', v: 6 },
]
const GAME_HOURS = [
  { label: 'EA SPORTS FC 26', v: 412 },
  { label: 'Call of Duty', v: 233 },
  { label: 'TEKKEN 8', v: 158 },
  { label: 'GTA V', v: 121 },
  { label: 'NBA 2K26', v: 77 },
  { label: 'Mortal Kombat 1', v: 64 },
  { label: 'Fortnite', v: 51 },
  { label: 'Rocket League', v: 38 },
]

/* ---------------------------------------------------------------- voucher desk */

function VoucherDesk() {
  const vouchers = usePlayer((s) => s.vouchers)
  const tag = usePlayer((s) => s.tag)
  const markUsed = usePlayer((s) => s.markVoucherUsed)
  const [code, setCode] = useState('')
  const [res, setRes] = useState<{ ok: boolean; title: string; body: string; id?: string } | null>(null)
  const check = (c: string) => {
    const v = vouchers.find((x) => x.code.toUpperCase() === c.trim().toUpperCase().replace(/^VOUCHER-/, ''))
    if (!v) {
      sfx.error()
      setRes({ ok: false, title: 'Unknown voucher', body: 'No Play Pass voucher matches this code.' })
      return
    }
    const r = rewardById(v.rewardId)
    const name = r?.name ?? v.rewardId.replace(/^season:/, '')
    if (v.status === 'used') {
      sfx.error()
      setRes({ ok: false, title: 'Already used', body: `${name} · redeemed by ${tag}` })
      return
    }
    sfx.success()
    setRes({ ok: true, title: name, body: `Valid · issued to ${tag}`, id: v.id })
  }
  const active = vouchers.filter((v) => v.status === 'active')
  return (
    <section className="hud card tool">
      <div className="card-h">
        <span className="hud-label">
          <Ticket size={14} /> Voucher desk
        </span>
      </div>
      <form
        className="row"
        style={{ gap: 8 }}
        onSubmit={(e) => {
          e.preventDefault()
          check(code)
        }}
      >
        <input className="input" style={{ height: 44 }} placeholder="PL-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value)} />
        <Btn size="sm" type="submit" icon={<ShieldCheck size={14} />}>
          Check
        </Btn>
      </form>
      {active.length > 0 && (
        <div className="tool-chips">
          <span className="mute" style={{ fontSize: 12 }}>
            Waiting at the counter:
          </span>
          {active.slice(0, 4).map((v) => (
            <button key={v.id} className="chip ghost" onClick={() => { setCode(v.code); check(v.code) }}>
              {v.code}
            </button>
          ))}
        </div>
      )}
      <AnimatePresence mode="wait">
        {res && (
          <motion.div key={res.title + res.body} className={`tool-res ${res.ok ? 'ok' : 'bad'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {res.ok ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
            <div style={{ flex: 1 }}>
              <b>{res.title}</b>
              <div className="mute" style={{ fontSize: 13 }}>
                {res.body}
              </div>
            </div>
            {res.ok && res.id && (
              <Btn
                size="sm"
                onClick={() => {
                  markUsed(res.id!)
                  setRes({ ok: true, title: 'Marked as used', body: 'Enjoy! The player’s Play Pass updates instantly.' })
                  fx.toast('Voucher redeemed', 'Logged at the counter.', 'gold')
                }}
              >
                Mark used
              </Btn>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ---------------------------------------------------------------- live feed */

const ACTIONS = ['checked in', 'started a session on R4', 'scanned a coffee', 'redeemed Free Coffee', 'reached level 21', 'joined the Friday Cup', 'found a secret QR', 'started a session on VIP A', 'unlocked Night Owl', 'checked in with a friend']

function LiveFeed() {
  const [items, setItems] = useState(() => {
    const r = seeded('feed')
    return Array.from({ length: 6 }, (_, i) => ({ id: i, tag: r.pick(MOCK_PLAYERS).tag, a: r.pick(ACTIONS), at: now() - (i + 1) * 97000 }))
  })
  useEffect(() => {
    let id = 100
    const iv = setInterval(() => {
      const p = MOCK_PLAYERS[Math.floor(Math.random() * MOCK_PLAYERS.length)]
      setItems((list) => [{ id: id++, tag: p.tag, a: ACTIONS[Math.floor(Math.random() * ACTIONS.length)], at: now() }, ...list].slice(0, 7))
    }, 3800)
    return () => clearInterval(iv)
  }, [])
  return (
    <section className="hud card tool">
      <div className="card-h">
        <span className="hud-label">
          <Radio size={14} /> Live feed
        </span>
        <span className="live-dot" />
      </div>
      <div className="feed">
        <AnimatePresence initial={false}>
          {items.map((it) => (
            <motion.div key={it.id} className="feed-row" layout initial={{ opacity: 0, x: -20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0 }}>
              <PixelAvatar seed={it.tag} size={26} rounded={6} />
              <span className="feed-t">
                <b>{it.tag}</b> {it.a}
              </span>
              <span className="mute hud-num" style={{ fontSize: 11 }}>
                {fmtTime(it.at)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- award bonus */

function AwardBonus() {
  const me = usePlayer((s) => s.tag)
  const created = usePlayer((s) => s.created)
  const grant = usePlayer((s) => s.grant)
  const players = useMemo(() => [...(created ? [me] : []), ...MOCK_PLAYERS.slice(0, 12).map((p) => p.tag)], [me, created])
  const [who, setWho] = useState(players[0] ?? '')
  const [kind, setKind] = useState<'xp' | 'coins'>('coins')
  const [amount, setAmount] = useState(100)
  return (
    <section className="hud card tool">
      <div className="card-h">
        <span className="hud-label">
          <Zap size={14} /> Crew bonus
        </span>
      </div>
      <div className="col" style={{ gap: 10 }}>
        <select className="input" style={{ height: 44 }} value={who} onChange={(e) => setWho(e.target.value)}>
          {players.map((p) => (
            <option key={p} value={p}>
              {p === me ? `${p} (this device)` : p}
            </option>
          ))}
        </select>
        <div className="row" style={{ gap: 8 }}>
          <button className={`book-chip ${kind === 'coins' ? 'sel' : ''}`} onClick={() => setKind('coins')}>
            <Coins size={14} /> Coins
          </button>
          <button className={`book-chip ${kind === 'xp' ? 'sel' : ''}`} onClick={() => setKind('xp')}>
            <Zap size={14} /> XP
          </button>
          {[50, 100, 250].map((a) => (
            <button key={a} className={`book-chip ${amount === a ? 'sel' : ''}`} onClick={() => setAmount(a)}>
              {a}
            </button>
          ))}
        </div>
        <Btn
          size="sm"
          icon={<Send size={14} />}
          onClick={() => {
            if (who === me && created) grant(kind === 'xp' ? amount : 0, kind === 'coins' ? amount : 0, `Crew bonus · ${amount} ${kind}`)
            else {
              sfx.success()
              fx.toast(`Sent ${amount} ${kind} to ${who}`, 'They’ll see it pop on their Play Pass.', 'mint')
            }
          }}
        >
          Send {amount} {kind === 'xp' ? 'XP' : 'coins'}
        </Btn>
        <span className="mute" style={{ fontSize: 12 }}>
          For birthdays, clean-up heroes and tournament volunteers.
        </span>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- posters */

function Posters() {
  const posters: { code: ScanCode; title: string; sub: string; tone: 'mint' | 'crimson' | 'gold' }[] = [
    { code: { kind: 'checkin', spot: 'ENTRANCE' }, title: 'Check in', sub: 'Entrance · +100 XP · +50 coins', tone: 'mint' },
    { code: { kind: 'coffee' }, title: 'Coffee bonus', sub: 'Coffee machine · +10 coins', tone: 'gold' },
    { code: { kind: 'event', eventId: 'friday-cup' }, title: 'Friday Cup', sub: 'Event check-in · +200 XP', tone: 'crimson' },
    ...STATIONS.map((st) => ({ code: { kind: 'session', station: st.id } as ScanCode, title: `Station ${st.label}`, sub: 'Scan every hour you play · +60 XP', tone: (st.room === 'red' ? 'crimson' : st.room === 'vip' ? 'gold' : 'mint') as 'mint' | 'crimson' | 'gold' })),
  ]
  return (
    <section className="posters-sec">
      <div className="posters-head">
        <div>
          <div className="hud-label">Print kit</div>
          <div className="display" style={{ fontSize: 30 }}>
            QR posters
          </div>
          <p className="mute" style={{ maxWidth: 640 }}>
            Every code opens the Play Pass when scanned with a phone camera. Print them, stick them on each station, the coffee machine and the door. Use the live counter screen above for the anti-cheat entrance code.
          </p>
        </div>
        <Btn
          icon={<Printer size={16} />}
          onClick={() => {
            sfx.click()
            window.print()
          }}
        >
          Print all posters
        </Btn>
      </div>
      <div className="posters">
        {posters.map((p) => (
          <article key={p.title} className={`poster poster--${p.tone}`}>
            <div className="poster-top">
              <Crest size={46} mode="none" />
              <div>
                <div className="poster-brand">PLAY PASS</div>
                <div className="poster-sub">Play Land · Kénitra</div>
              </div>
            </div>
            <div className="poster-t">{p.title}</div>
            <QrCode value={codeUrl(p.code)} size={190} />
            <div className="poster-s">{p.sub}</div>
            <div className="poster-foot">Scan with your phone camera — no app needed</div>
          </article>
        ))}
      </div>
      <div className="secrets">
        <div className="hud-label">
          <KeyRound size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> Secret QR hunt · staff eyes only
        </div>
        <div className="secrets-grid">
          {SECRETS.map((sc) => (
            <div key={sc.id} className="secret">
              <QrCode value={codeUrl({ kind: 'secret', secretId: sc.id })} size={96} logo={false} />
              <div>
                <b>{sc.id.toUpperCase()}</b>
                <div className="mute" style={{ fontSize: 12 }}>
                  Hide: {sc.hint}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
