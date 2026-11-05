import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router'
import { Bell, CalendarClock, Check, Coffee, DoorOpen, Gamepad2, ScanLine, Timer, X } from 'lucide-react'
import { ROOMS, STATIONS, stationStatus, type Station, type StationStatus } from '../../data/stations'
import { gameById } from '../../data/games'
import { Btn, Modal, useNow } from '../../components/ui/kit'
import { PixelAvatar } from '../../components/ui/PixelAvatar'
import { Crest } from '../../components/brand/Crest'
import { encodeCode } from '../../lib/qr'
import { sfx } from '../../lib/sfx'
import { fx } from '../../lib/fx'
import './hub-pages.css'
import './livemap.css'

/* floor plan geometry (SVG units, viewBox 1000×620) */
type Spot = { x: number; y: number; w: number; h: number; tv: 'top' | 'bottom' | 'left' }
const SPOTS: Record<string, Spot> = {
  R1: { x: 452, y: 46, w: 108, h: 92, tv: 'top' },
  R2: { x: 580, y: 46, w: 108, h: 92, tv: 'top' },
  R3: { x: 708, y: 46, w: 108, h: 92, tv: 'top' },
  R4: { x: 836, y: 46, w: 108, h: 92, tv: 'top' },
  R5: { x: 452, y: 482, w: 108, h: 92, tv: 'bottom' },
  R6: { x: 580, y: 482, w: 108, h: 92, tv: 'bottom' },
  R7: { x: 708, y: 482, w: 108, h: 92, tv: 'bottom' },
  R8: { x: 836, y: 482, w: 108, h: 92, tv: 'bottom' },
  L1: { x: 44, y: 46, w: 80, h: 84, tv: 'top' },
  L2: { x: 136, y: 46, w: 80, h: 84, tv: 'top' },
  L3: { x: 228, y: 46, w: 80, h: 84, tv: 'top' },
  L4: { x: 320, y: 46, w: 80, h: 84, tv: 'top' },
  VA: { x: 44, y: 318, w: 160, h: 110, tv: 'left' },
  VB: { x: 236, y: 318, w: 160, h: 110, tv: 'left' },
}

const COLORS = { free: '#5ff3da', busy: '#ff2d4e', reserved: '#ffc83d' }

export default function LiveMap() {
  const t = useNow(3000)
  const nav = useNavigate()
  const [sel, setSel] = useState<string | null>('R4')
  const [book, setBook] = useState<Station | null>(null)
  const [notify, setNotify] = useState<string[]>([])
  const [mine, setMine] = useState<Record<string, string>>({})
  const statuses = useMemo(() => Object.fromEntries(STATIONS.map((s) => [s.id, stationStatus(s, t)])), [t])
  const counts = { free: 0, busy: 0, reserved: 0 }
  Object.values(statuses).forEach((st) => counts[st.state]++)
  const selSt = sel ? STATIONS.find((s) => s.id === sel)! : null
  const selStatus = sel ? statuses[sel] : null
  const busyForecast = [32, 38, 45, 58, 66, 78, 92, 96, 88, 74, 52, 30]
  const hours = ['12h', '14h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h', '00h', '01h']

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <span className="hud-label">Live map</span>
            <span className="chip crimson">
              <span className="live-dot" /> Updating live
            </span>
          </div>
          <h1 className="display page-title">
            <span className="grad-mint">{counts.free}</span> stations free.
          </h1>
          <p className="page-sub">Tap a station to see what’s being played, when it frees up, or to reserve it for later.</p>
        </div>
        <div className="lm-counts">
          {(['free', 'busy', 'reserved'] as const).map((k) => (
            <div key={k} className={`lm-count lm-count--${k}`}>
              <span className="display">{counts[k]}</span>
              <span className="hud-label">{k === 'busy' ? 'In a match' : k}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lm-grid">
        <div className="lm-map hud brackets">
          <svg viewBox="0 0 1000 620" className="floor" role="img" aria-label="Play Land floor plan">
            <defs>
              <pattern id="lm-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="rgba(138,208,199,0.06)" />
              </pattern>
              <filter id="lm-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect x="0" y="0" width="1000" height="620" fill="url(#lm-grid)" />
            {/* rooms */}
            <rect x="430" y="24" width="546" height="572" rx="10" className="room room--red" />
            <rect x="24" y="24" width="396" height="270" rx="10" className="room room--lounge" />
            <rect x="24" y="300" width="194" height="150" rx="10" className="room room--vip" />
            <rect x="222" y="300" width="198" height="150" rx="10" className="room room--vip" />
            <rect x="24" y="456" width="396" height="140" rx="10" className="room room--lobby" />
            <text x="703" y="300" className="room-label" textAnchor="middle">THE RED ROOM</text>
            <text x="703" y="326" className="room-sub" textAnchor="middle">8 × PS5 · 55&quot; 4K</text>
            <text x="222" y="200" className="room-label" textAnchor="middle">THE LOUNGE</text>
            <text x="121" y="445" className="room-sub" textAnchor="middle">VIP A</text>
            <text x="321" y="445" className="room-sub" textAnchor="middle">VIP B</text>
            {/* doors */}
            <path d="M218 380 v40" className="door" />
            <path d="M420 380 v40" className="door" />
            <path d="M430 520 v50" className="door" />
            <path d="M60 596 h80" className="door door--main" />
            {/* lobby furniture */}
            <g className="lobby">
              <rect x="44" y="476" width="54" height="70" rx="6" className="coffee" />
              <text x="71" y="566" className="room-sub" textAnchor="middle">COFFEE</text>
              <rect x="210" y="490" width="170" height="44" rx="8" className="counter" />
              <text x="295" y="556" className="room-sub" textAnchor="middle">COUNTER · STAFF</text>
              <g className="qr-spot" transform="translate(150 560)">
                <circle r="16" className="qr-pulse" />
                <circle r="9" className="qr-dot" />
              </g>
              <text x="100" y="612" className="room-sub qr-label">◀ ENTRANCE · SCAN HERE</text>
            </g>
            {/* stations */}
            {STATIONS.map((st) => {
              const sp = SPOTS[st.id]
              const status = statuses[st.id]
              const c = COLORS[status.state]
              const active = sel === st.id
              const tvY = sp.tv === 'top' ? sp.y : sp.tv === 'bottom' ? sp.y + sp.h - 8 : sp.y
              return (
                <g
                  key={st.id}
                  className={`st st--${status.state} ${active ? 'active' : ''}`}
                  onClick={() => {
                    sfx.click()
                    setSel(st.id)
                  }}
                  onMouseEnter={() => sfx.hover()}
                  style={{ ['--sc' as string]: c }}
                  role="button"
                  aria-label={`${st.label} ${status.state}`}
                >
                  <rect x={sp.x} y={sp.y} width={sp.w} height={sp.h} rx="8" className="st-bg" />
                  {sp.tv === 'left' ? <rect x={sp.x + 6} y={sp.y + 14} width="8" height={sp.h - 28} rx="2" className="st-tv" /> : <rect x={sp.x + 14} y={tvY + (sp.tv === 'top' ? 6 : -6)} width={sp.w - 28} height="8" rx="2" className="st-tv" />}
                  <rect
                    x={sp.tv === 'left' ? sp.x + sp.w - 46 : sp.x + 16}
                    y={sp.tv === 'top' ? sp.y + sp.h - 30 : sp.tv === 'bottom' ? sp.y + 12 : sp.y + 18}
                    width={sp.tv === 'left' ? 30 : sp.w - 32}
                    height={sp.tv === 'left' ? sp.h - 36 : 18}
                    rx="6"
                    className="st-sofa"
                  />
                  <text x={sp.x + sp.w / 2} y={sp.y + sp.h / 2 + 5} textAnchor="middle" className="st-id">
                    {st.label}
                  </text>
                  {status.state === 'busy' && (
                    <text x={sp.x + sp.w - 8} y={sp.y + (sp.tv === 'bottom' ? sp.h - 18 : 20)} textAnchor="end" className="st-min">
                      {status.minsLeft}m
                    </text>
                  )}
                  {mine[st.id] && (
                    <text x={sp.x + 10} y={sp.y + (sp.tv === 'bottom' ? sp.h - 18 : 20)} className="st-mine">
                      ★
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <aside className="lm-side">
          <AnimatePresence mode="wait">
            {selSt && selStatus && (
              <motion.div key={selSt.id + selStatus.state} className="lm-panel hud brackets" style={{ ['--c' as string]: COLORS[selStatus.state] }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div className="hud-label">{ROOMS.find((r) => r.id === selSt.room)?.name}</div>
                    <div className="display" style={{ fontSize: 40 }}>
                      {selSt.label}
                    </div>
                  </div>
                  <span className={`lm-state lm-state--${selStatus.state}`}>{selStatus.state === 'busy' ? 'In a match' : selStatus.state}</span>
                </div>
                <PanelBody
                  st={selSt}
                  status={selStatus}
                  mine={mine[selSt.id]}
                  notified={notify.includes(selSt.id)}
                  onBook={() => setBook(selSt)}
                  onNotify={() => {
                    sfx.success()
                    setNotify((n) => [...n, selSt.id])
                    fx.toast(`We’ll ping you`, `You’ll get a notification when ${selSt.label} frees up.`, 'mint')
                  }}
                  onScan={() => nav(`/scan?code=${encodeURIComponent(encodeCode({ kind: 'session', station: selSt.id }))}&demo=1`)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="lm-forecast hud">
            <div className="hud-label">Tonight’s rush forecast</div>
            <div className="lm-bars">
              {busyForecast.map((v, i) => (
                <div key={i} className="lm-bar-col">
                  <motion.span className={`lm-bar ${v > 85 ? 'hot' : ''}`} initial={{ height: 0 }} animate={{ height: `${v}%` }} transition={{ delay: i * 0.04, duration: 0.6 }} />
                  <span className="lm-bar-l">{hours[i]}</span>
                </div>
              ))}
            </div>
            <div className="mute" style={{ fontSize: 12.5 }}>
              Peak around 20:00–22:00. Come before 18:00 Mon–Thu for <b className="t-mint">Double XP</b>.
            </div>
          </div>
        </aside>
      </div>

      <Modal open={!!book} onClose={() => setBook(null)} title={`Reserve ${book?.label ?? ''}`}>
        {book && (
          <BookFlow
            st={book}
            onDone={(slot) => {
              setMine((m) => ({ ...m, [book.id]: slot }))
              setBook(null)
              sfx.success()
              fx.emit({ type: 'confetti', colors: ['#5ff3da', '#ffffff'] })
              fx.toast(`${book.label} reserved · ${slot}`, 'Show your Play Pass at the counter. Held for 10 minutes.', 'mint')
            }}
          />
        )}
      </Modal>
    </div>
  )
}

function PanelBody({ st, status, mine, notified, onBook, onNotify, onScan }: { st: Station; status: StationStatus; mine?: string; notified: boolean; onBook: () => void; onNotify: () => void; onScan: () => void }) {
  const room = ROOMS.find((r) => r.id === st.room)!
  if (status.state === 'busy') {
    const g = gameById(status.game)
    const pct = Math.min(1, status.minsLeft / 90)
    return (
      <div className="lm-body">
        <div className="lm-game" style={{ background: `linear-gradient(135deg, ${g.c1}40, ${g.c2})` }}>
          <Gamepad2 size={18} />
          <span>{g.title}</span>
        </div>
        <div className="lm-timer">
          <Timer size={18} />
          <div style={{ flex: 1 }}>
            <div className="bar crimson" style={{ height: 8 }}>
              <i style={{ ['--p' as string]: 1 - pct }} />
            </div>
          </div>
          <span className="hud-num">{status.minsLeft} min left</span>
        </div>
        <div className="lm-players">
          {status.players.map((p) => (
            <span key={p} className="lm-player">
              <PixelAvatar seed={p} size={26} rounded={7} />
              {p}
            </span>
          ))}
        </div>
        {notified ? (
          <span className="chip">
            <Check size={12} /> Notification set
          </span>
        ) : (
          <Btn variant="ghost" icon={<Bell size={16} />} onClick={onNotify}>
            Notify me when free
          </Btn>
        )}
      </div>
    )
  }
  if (status.state === 'reserved')
    return (
      <div className="lm-body">
        <div className="lm-line">
          <CalendarClock size={18} /> Reserved for <b className="hud-num">{status.at}</b>
        </div>
        <div className="lm-line">
          <PixelAvatar seed={status.by} size={24} rounded={6} /> by {status.by}
        </div>
        <p className="mute" style={{ fontSize: 13 }}>
          Free to play until 10 minutes before the reservation.
        </p>
        <Btn icon={<ScanLine size={16} />} onClick={onScan}>
          Scan station · start session
        </Btn>
      </div>
    )
  return (
    <div className="lm-body">
      <div className="lm-line">
        <DoorOpen size={18} /> Free right now · {room.price}
      </div>
      {mine && (
        <div className="lm-line t-mint">
          <Check size={18} /> You reserved it for {mine}
        </div>
      )}
      <p className="mute" style={{ fontSize: 13 }}>
        {room.desc}. Walk in and scan the QR on the station to start earning XP.
      </p>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <Btn icon={<ScanLine size={16} />} onClick={onScan}>
          Scan & play
        </Btn>
        <Btn variant="ghost" icon={<CalendarClock size={16} />} onClick={onBook}>
          Reserve
        </Btn>
      </div>
      <div className="lm-line mute" style={{ fontSize: 13 }}>
        <Coffee size={15} /> Coffee machine is 8 steps from the door.
      </div>
    </div>
  )
}

function BookFlow({ st, onDone }: { st: Station; onDone: (slot: string) => void }) {
  const now = new Date()
  const slots = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now)
    d.setMinutes(0, 0, 0)
    d.setHours(d.getHours() + i + 1)
    return `${String(d.getHours()).padStart(2, '0')}:00`
  })
  const taken = new Set([slots[2], slots[5]])
  const [pick, setPick] = useState<string | null>(null)
  const [dur, setDur] = useState(1)
  const room = ROOMS.find((r) => r.id === st.room)!
  return (
    <div className="book">
      <div className="row" style={{ gap: 14 }}>
        <Crest size={44} mode="none" />
        <div>
          <div className="display" style={{ fontSize: 24 }}>
            {st.label} · {room.name}
          </div>
          <div className="mute">{room.price} · pay at the counter</div>
        </div>
      </div>
      <div className="hud-label">Start time · today</div>
      <div className="book-slots">
        {slots.map((s) => (
          <button key={s} className={`book-slot ${pick === s ? 'sel' : ''}`} disabled={taken.has(s)} onClick={() => { sfx.click(); setPick(s) }}>
            {taken.has(s) ? <X size={12} /> : null}
            {s}
          </button>
        ))}
      </div>
      <div className="hud-label">Duration</div>
      <div className="row" style={{ gap: 8 }}>
        {[1, 2, 3].map((d) => (
          <button key={d} className={`book-slot ${dur === d ? 'sel' : ''}`} onClick={() => { sfx.click(); setDur(d) }}>
            {d}h
          </button>
        ))}
      </div>
      <Btn block disabled={!pick} onClick={() => pick && onDone(`${pick} · ${dur}h`)}>
        {pick ? `Reserve ${pick} for ${dur}h` : 'Pick a time'}
      </Btn>
      <p className="mute" style={{ fontSize: 12.5, textAlign: 'center' }}>
        Elite rank and above get priority booking 24h ahead.
      </p>
    </div>
  )
}
