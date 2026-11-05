import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ScanLine, Zap, TrendingUp, Gift, Wifi, BatteryFull, Signal } from 'lucide-react'
import { SectionHead } from '../../components/ui/kit'
import { QrCode } from '../../components/ui/QrCode'
import { CoinIcon, XpIcon, FlameIcon } from '../../components/ui/icons'
import { RankEmblem } from '../../components/ui/RankEmblem'
import { Crest } from '../../components/brand/Crest'

const STEPS = [
  { icon: ScanLine, title: 'Scan in', body: 'Point your phone at the crest QR at the entrance. No app to install — the camera opens your Play Pass and you’re checked in.', tag: '+100 XP · +50 coins' },
  { icon: Zap, title: 'Stack XP', body: 'Every hour on a station, every coffee, every quest pays out. Keep a weekly streak and your coins multiply — up to ×1.5.', tag: 'Double XP Mon–Thu, 14–18h' },
  { icon: TrendingUp, title: 'Rank up', body: '59 levels across 7 ranks, from Rookie to Club 59. Each rank unlocks permanent perks: bonus coins, free hours, VIP time.', tag: 'Rookie → Club 59' },
  { icon: Gift, title: 'Cash in', body: 'Spend coins on free hours, VIP rooms, snacks or the numbered 59 jersey. Show the voucher QR at the counter. Done.', tag: 'Free hour = 900 coins' },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => setStep(Math.min(3, Math.floor(p * 4.0001))))
  return (
    <section className="how" id="pass" ref={ref}>
      <div className="how-sticky">
        <div className="container how-grid">
          <div className="how-left">
            <SectionHead
              index="02"
              kicker="The Play Pass"
              title={
                <>
                  Every visit is <span className="grad-mint">XP.</span>
                </>
              }
            />
            <ol className="how-steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className={`how-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                  <span className="how-step-n hud-num">0{i + 1}</span>
                  <div>
                    <div className="how-step-t">
                      <s.icon size={18} /> {s.title}
                    </div>
                    <AnimatePresence initial={false}>
                      {i === step && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
                          <p className="dim how-step-b">{s.body}</p>
                          <span className="chip">{s.tag}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              ))}
            </ol>
            <div className="how-progress">
              <motion.i style={{ scaleX: scrollYProgress }} />
            </div>
          </div>

          <div className="how-phone-wrap">
            <div className="how-glow" />
            <Phone step={step} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Phone({ step }: { step: number }) {
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-status">
        <span className="hud-num">21:59</span>
        <span className="row" style={{ gap: 4 }}>
          <Signal size={12} />
          <Wifi size={12} />
          <BatteryFull size={14} />
        </span>
      </div>
      <div className="phone-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="phone-view"
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && <ScreenScan />}
            {step === 1 && <ScreenEarn />}
            {step === 2 && <ScreenRank />}
            {step === 3 && <ScreenRedeem />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="phone-home" />
    </div>
  )
}

function ScreenScan() {
  return (
    <div className="ps-scan">
      <div className="ps-cam" />
      <div className="ps-frame">
        <span className="c tl" />
        <span className="c tr" />
        <span className="c bl" />
        <span className="c br" />
        <div className="ps-poster">
          <Crest size={54} mode="none" />
          <QrCode value="https://playland.ma/scan?code=CHECKIN-ENTRANCE" size={120} logo />
          <div className="ps-poster-t hud-label">Scan to check in</div>
        </div>
        <div className="ps-laser" />
      </div>
      <div className="ps-hint hud-label">Point at the crest QR</div>
    </div>
  )
}

function ScreenEarn() {
  const rows = [
    { l: 'Daily check-in', xp: 100, c: 50 },
    { l: 'Double XP hours ×2', xp: 100 },
    { l: '6-week streak +25%', c: 13, flame: true },
    { l: 'Pro rank bonus +10%', c: 5 },
  ]
  return (
    <div className="ps-earn">
      <motion.div className="ps-earn-head" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
        <div className="display ps-earn-title grad-mint">CHECKED IN!</div>
        <div className="hud-label" style={{ color: '#ffb08a' }}>
          <FlameIcon size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> week streak · 6
        </div>
      </motion.div>
      <div className="ps-receipt">
        {rows.map((r, i) => (
          <motion.div key={r.l} className="ps-row" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.15 }}>
            <span>{r.l}</span>
            <span className="row" style={{ gap: 8 }}>
              {r.xp && (
                <span className="cur mint">
                  +{r.xp} <XpIcon size={12} />
                </span>
              )}
              {r.c && (
                <span className="cur gold">
                  +{r.c} <CoinIcon size={13} />
                </span>
              )}
            </span>
          </motion.div>
        ))}
        <motion.div className="ps-total" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}>
          <span className="hud-label">Total</span>
          <span className="row" style={{ gap: 10 }}>
            <span className="cur mint">
              +200 <XpIcon size={14} />
            </span>
            <span className="cur gold">
              +68 <CoinIcon size={15} />
            </span>
          </span>
        </motion.div>
      </div>
      {Array.from({ length: 7 }, (_, i) => (
        <motion.span
          key={i}
          className="ps-coin"
          initial={{ x: 0, y: 120, opacity: 0, scale: 0.4 }}
          animate={{ x: (i - 3) * 22, y: -150 - (i % 3) * 20, opacity: [0, 1, 0], scale: 1 }}
          transition={{ delay: 1.1 + i * 0.07, duration: 1.1, ease: 'easeOut' }}
        >
          <CoinIcon size={18} />
        </motion.span>
      ))}
    </div>
  )
}

function ScreenRank() {
  return (
    <div className="ps-rank">
      <div className="ps-rays" />
      <motion.div className="hud-label" initial={{ opacity: 0, letterSpacing: '0.8em' }} animate={{ opacity: 1, letterSpacing: '0.3em' }} transition={{ duration: 0.7 }} style={{ color: 'var(--mint-hi)' }}>
        New rank unlocked
      </motion.div>
      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 11, delay: 0.15 }}>
        <RankEmblem rank="pro" size={130} />
      </motion.div>
      <motion.div className="display ps-rank-name" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        PRO
      </motion.div>
      <div className="ps-rank-lv hud-num">LEVEL 20</div>
      <motion.div className="ps-perks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <span className="chip">+10% coins</span>
        <span className="chip">Free coffee / month</span>
      </motion.div>
    </div>
  )
}

function ScreenRedeem() {
  return (
    <div className="ps-redeem">
      <div className="hud-label">Voucher ready</div>
      <motion.div className="ps-voucher" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
        <div className="ps-voucher-top">
          <span className="chip gold">Rare</span>
          <div className="display ps-voucher-t">1 Hour Free</div>
          <div className="dim" style={{ fontSize: 12 }}>Any PS5 station · any game</div>
        </div>
        <div className="ps-voucher-cut" />
        <div className="ps-voucher-qr">
          <QrCode value="VOUCHER-PL-3TRB-WN4P" size={118} logo={false} />
          <div className="hud-num ps-voucher-code">PL-3TRB-WN4P</div>
        </div>
      </motion.div>
      <div className="ps-hint hud-label">Show it at the counter</div>
    </div>
  )
}
