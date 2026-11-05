import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import jsQR from 'jsqr'
import { Camera, CameraOff, Keyboard, ScanLine, Gamepad2, Coffee, KeyRound, UserRound, Trophy, DoorClosed, RotateCcw, ArrowRight, AlertTriangle, Info } from 'lucide-react'
import { usePlayer } from '../../store/player'
import { Btn, Counter } from '../../components/ui/kit'
import { QrCode } from '../../components/ui/QrCode'
import { CoinIcon, XpIcon } from '../../components/ui/icons'
import { encodeCode, currentSlot, codeUrl, type ScanCode } from '../../lib/qr'
import { sfx } from '../../lib/sfx'
import { fx } from '../../lib/fx'
import { fmt } from '../../lib/format'
import { SECRETS } from '../../data/quests'
import type { Outcome } from '../../store/types'
import './hub-pages.css'
import './scan.css'

type CamState = 'idle' | 'starting' | 'on' | 'denied' | 'unsupported'

const DEMO: { label: string; hint: string; icon: typeof ScanLine; code: () => ScanCode }[] = [
  { label: 'Entrance', hint: 'Daily check-in', icon: ScanLine, code: () => ({ kind: 'checkin', spot: 'ENTRANCE', slot: currentSlot() }) },
  { label: 'Station R4', hint: '1h session', icon: Gamepad2, code: () => ({ kind: 'session', station: 'R4' }) },
  { label: 'Lounge L2', hint: '1h session', icon: Gamepad2, code: () => ({ kind: 'session', station: 'L2' }) },
  { label: 'VIP room A', hint: '1h session', icon: DoorClosed, code: () => ({ kind: 'session', station: 'VA' }) },
  { label: 'Coffee machine', hint: '+10 coins', icon: Coffee, code: () => ({ kind: 'coffee' }) },
  { label: 'Friday Cup', hint: 'Event check-in', icon: Trophy, code: () => ({ kind: 'event', eventId: 'friday-cup' }) },
  { label: 'Friend’s pass', hint: 'Squad bonus', icon: UserRound, code: () => ({ kind: 'friend', tag: 'Salma.exe' }) },
  { label: 'Secret QR', hint: '??? ', icon: KeyRound, code: () => ({ kind: 'secret', secretId: SECRETS[Math.floor(Math.random() * SECRETS.length)].id }) },
]

export default function Scan() {
  const scan = usePlayer((s) => s.scan)
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const busy = useRef(false)
  const handled = useRef<string | null>(null)
  const [cam, setCam] = useState<CamState>('idle')
  const [locking, setLocking] = useState<string | null>(null)
  const [result, setResult] = useState<Outcome | null>(null)
  const [rid, setRid] = useState(0)
  const [manual, setManual] = useState('')
  const [showManual, setShowManual] = useState(false)

  const handle = useCallback(
    (raw: string) => {
      const o = scan(raw)
      setResult(o)
      setRid((r) => r + 1)
      if (o.ok) {
        sfx.scan()
        navigator.vibrate?.([30, 40, 60])
        setTimeout(() => sfx.success(), 180)
      } else {
        sfx.error()
        navigator.vibrate?.([120, 60, 120])
        fx.emit({ type: 'shake' })
      }
    },
    [scan],
  )

  /** plays the "lock-on" animation in the viewfinder before resolving */
  const simulate = useCallback(
    (raw: string) => {
      if (busy.current) return
      busy.current = true
      setResult(null)
      setLocking(raw)
      sfx.tick()
      setTimeout(() => {
        setLocking(null)
        handle(raw)
        busy.current = false
      }, 900)
    },
    [handle],
  )

  // ---- deep link: /scan?code=... (what the phone camera opens)
  useEffect(() => {
    const code = params.get('code')
    if (!code || handled.current === code) return
    const fromDemo = params.get('demo')
    const t = setTimeout(() => {
      if (handled.current === code) return
      handled.current = code
      if (fromDemo) simulate(code)
      else handle(code)
      setParams({}, { replace: true })
    }, 350)
    return () => clearTimeout(t)
  }, [params, handle, simulate, setParams])

  // ---- camera
  const stopCam = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    setCam((c) => (c === 'on' || c === 'starting' ? 'idle' : c))
  }, [])

  const startCam = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setCam('unsupported')
      return
    }
    setCam('starting')
    setResult(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      stream.current = s
      if (video.current) {
        video.current.srcObject = s
        await video.current.play()
      }
      setCam('on')
    } catch {
      setCam('denied')
    }
  }

  useEffect(() => {
    if (cam !== 'on') return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    let alive = true
    let last = ''
    const tick = () => {
      if (!alive) return
      const v = video.current
      if (v && v.readyState >= 2 && !busy.current) {
        const scale = Math.min(1, 640 / v.videoWidth)
        canvas.width = Math.floor(v.videoWidth * scale)
        canvas.height = Math.floor(v.videoHeight * scale)
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const found = jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' })
        if (found?.data && found.data !== last) {
          last = found.data
          busy.current = true
          setLocking(found.data)
          setTimeout(() => {
            setLocking(null)
            handle(found.data)
            busy.current = false
            setTimeout(() => (last = ''), 4000)
          }, 500)
        }
      }
      setTimeout(tick, 140)
    }
    tick()
    return () => {
      alive = false
    }
  }, [cam, handle])

  useEffect(() => () => stopCam(), [stopCam])

  return (
    <div className="scan-page">
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <span className="hud-label">Scanner</span>
          </div>
          <h1 className="display page-title">
            Scan. <span className="grad-mint">Earn.</span>
          </h1>
          <p className="page-sub">Point at any Play Land QR — the entrance, your station, the coffee machine, a friend’s pass… or one of the secret codes hidden around the arena.</p>
        </div>
      </div>

      <div className="scan-grid">
        <div className="scan-left">
          <div className={`viewfinder ${cam === 'on' ? 'live' : ''} ${locking ? 'locking' : ''} ${result ? (result.ok ? 'ok' : 'bad') : ''}`}>
            <video ref={video} playsInline muted className="vf-video" />
            {cam !== 'on' && (
              <div className="vf-idle">
                {locking ? (
                  <motion.div className="vf-target" initial={{ scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
                    <QrCode value={locking} size={170} />
                  </motion.div>
                ) : (
                  <div className="vf-ghost">
                    <ScanLine size={46} />
                    <span className="hud-label">{cam === 'starting' ? 'Starting camera…' : 'Camera off'}</span>
                  </div>
                )}
              </div>
            )}
            <span className="vf-c tl" />
            <span className="vf-c tr" />
            <span className="vf-c bl" />
            <span className="vf-c br" />
            <div className="vf-laser" />
            <div className="vf-status hud-label">
              {locking ? 'Code locked · reading…' : cam === 'on' ? 'Searching for a crest QR' : 'Ready'}
            </div>
          </div>

          <div className="scan-actions">
            {cam === 'on' ? (
              <Btn variant="ghost" icon={<CameraOff size={18} />} onClick={stopCam}>
                Stop camera
              </Btn>
            ) : (
              <Btn icon={<Camera size={18} />} onClick={startCam}>
                Start camera
              </Btn>
            )}
            <Btn variant="ghost" icon={<Keyboard size={18} />} onClick={() => setShowManual((m) => !m)}>
              Enter code
            </Btn>
          </div>
          {(cam === 'denied' || cam === 'unsupported') && (
            <div className="scan-note">
              <AlertTriangle size={16} />
              <span>
                {cam === 'denied'
                  ? 'Camera permission was blocked. Allow it in your browser settings — or just use your phone’s camera app: every Play Land QR opens this page and scans automatically.'
                  : 'The in-page camera needs HTTPS. On a phone, open your normal camera app and point it at the QR — it opens the Play Pass and checks you in automatically.'}
              </span>
            </div>
          )}
          <AnimatePresence>
            {showManual && (
              <motion.form
                className="scan-manual"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={(e) => {
                  e.preventDefault()
                  if (manual.trim()) simulate(manual.trim())
                }}
              >
                <input className="input" placeholder="e.g. CHECKIN-ENTRANCE or SESSION-R4" value={manual} onChange={(e) => setManual(e.target.value)} />
                <Btn type="submit">Scan</Btn>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="scan-right">
          <AnimatePresence mode="wait">
            {result ? (
              <Receipt key={rid} o={result} onAgain={() => setResult(null)} onHub={() => nav('/hub')} />
            ) : (
              <motion.div key="demo" className="hud card scan-demo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="card-h">
                  <span className="hud-label">
                    <Info size={14} /> Not at the arena? Try a code
                  </span>
                </div>
                <div className="scan-demo-grid">
                  {DEMO.map((d) => (
                    <button key={d.label} className="scan-demo-btn" onClick={() => simulate(encodeCode(d.code()))} onMouseEnter={() => sfx.hover()}>
                      <span className="scan-demo-ic">
                        <d.icon size={18} />
                      </span>
                      <span>
                        <b>{d.label}</b>
                        <small>{d.hint}</small>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="scan-howto">
                  <div className="hud-label mute">How codes work</div>
                  <p className="mute">
                    Every Play Land QR is a link like <code>{codeUrl({ kind: 'coffee' }).replace(/^https?:\/\//, '')}</code>. Scan it with any phone camera and the Play Pass opens and applies it — no app needed. The entrance code rotates every 30 seconds on the counter screen, so it only works when you’re actually here.
                  </p>
                  <Link to="/staff" className="card-link">
                    See the QR posters in the staff console <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Receipt({ o, onAgain, onHub }: { o: Outcome; onAgain: () => void; onHub: () => void }) {
  const totalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!o.ok) return
    const delay = 300 + o.lines.length * 160 + 200
    const id = setTimeout(() => {
      const r = totalRef.current?.getBoundingClientRect()
      const x = r ? r.left + r.width * 0.75 : innerWidth / 2
      const y = r ? r.top + r.height / 2 : innerHeight / 2
      if (o.total.coins) fx.emit({ type: 'coins', amount: o.total.coins, x, y })
      if (o.total.xp) setTimeout(() => fx.emit({ type: 'xp', amount: o.total.xp, x: x - 80, y }), 150)
    }, delay)
    return () => clearTimeout(id)
  }, [o])

  if (!o.ok)
    return (
      <motion.div className="receipt receipt--bad hud crimson brackets" initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
        <div className="receipt-ic bad">
          <AlertTriangle size={30} />
        </div>
        <div className="display receipt-title">{o.title}</div>
        <p className="dim">{o.error}</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Btn variant="ghost" icon={<RotateCcw size={16} />} onClick={onAgain}>
            Try another
          </Btn>
          {o.kind === 'nopass' && <Btn to="/join">Create player</Btn>}
        </div>
      </motion.div>
    )

  return (
    <motion.div className="receipt" initial={{ opacity: 0, y: 60, rotateX: 40 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
      <div className="receipt-paper">
        <div className="receipt-head">
          <motion.div className="receipt-ic" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}>
            <ScanLine size={30} />
          </motion.div>
          <motion.div className="display receipt-title grad-mint" initial={{ scale: 1.6, opacity: 0, filter: 'blur(8px)' }} animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }} transition={{ delay: 0.2, duration: 0.4 }}>
            {o.title}
          </motion.div>
          {o.subtitle && <div className="hud-label">{o.subtitle}</div>}
        </div>
        <div className="receipt-lines">
          {o.lines.map((l, i) => (
            <motion.div key={i} className={`receipt-line tone-${l.tone ?? 'base'}`} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.16 }}>
              <span>{l.label}</span>
              <span className="row" style={{ gap: 10 }}>
                {!!l.xp && (
                  <span className="cur mint">
                    +{fmt(l.xp)} <XpIcon size={13} />
                  </span>
                )}
                {!!l.coins && (
                  <span className="cur gold">
                    +{fmt(l.coins)} <CoinIcon size={15} />
                  </span>
                )}
              </span>
            </motion.div>
          ))}
        </div>
        <motion.div ref={totalRef} className="receipt-total" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + o.lines.length * 0.16 }}>
          <span className="hud-label">Total</span>
          <span className="row" style={{ gap: 16 }}>
            {!!o.total.xp && (
              <span className="cur mint receipt-big">
                <Counter value={o.total.xp} from={0} duration={0.9} format={(n) => `+${fmt(n)}`} /> <XpIcon size={18} />
              </span>
            )}
            {!!o.total.coins && (
              <span className="cur gold receipt-big">
                <Counter value={o.total.coins} from={0} duration={0.9} format={(n) => `+${fmt(n)}`} /> <CoinIcon size={20} />
              </span>
            )}
          </span>
        </motion.div>
        <div className="receipt-zig" />
      </div>
      <motion.div className="row receipt-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <Btn variant="ghost" icon={<RotateCcw size={16} />} onClick={onAgain}>
          Scan again
        </Btn>
        <Btn onClick={onHub} iconRight={<ArrowRight size={16} />}>
          Back to hub
        </Btn>
      </motion.div>
    </motion.div>
  )
}
