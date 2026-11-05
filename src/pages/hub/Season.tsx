import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Check, Lock, Crown, Gem, Sparkles } from 'lucide-react'
import { usePlayer } from '../../store/player'
import { SEASON, FREE_TRACK, ELITE_TRACK, seasonTier, type TierReward } from '../../data/season'
import { Btn, Countdown } from '../../components/ui/kit'
import { PixelAvatar } from '../../components/ui/PixelAvatar'
import { fmt } from '../../lib/format'
import { sfx } from '../../lib/sfx'
import { fx } from '../../lib/fx'
import './hub-pages.css'
import './season.css'

export default function Season() {
  const s = usePlayer()
  const claim = usePlayer((x) => x.claimSeason)
  const buyElite = usePlayer((x) => x.buyElite)
  const tier = seasonTier(s.seasonXp)
  const inTier = s.seasonXp - tier * SEASON.xpPerTier
  const track = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })

  useEffect(() => {
    const el = track.current
    if (!el) return
    const col = el.querySelector<HTMLElement>(`[data-tier="${Math.max(1, tier)}"]`)
    if (col) el.scrollTo({ left: col.offsetLeft - el.clientWidth / 2 + col.clientWidth / 2, behavior: 'smooth' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const claimable = Array.from({ length: tier }, (_, i) => i + 1).filter((t) => !s.seasonClaimed.includes(t))
  const eliteClaimable = s.elitePass ? Array.from({ length: tier }, (_, i) => i + 1).filter((t) => !s.eliteClaimed.includes(t)) : []

  const doClaim = (trackId: 'free' | 'elite', t: number, r: TierReward) => {
    if (claim(trackId, t)) {
      sfx.success()
      if (r.special) fx.toast(`Tier ${t} · ${r.label}`, 'Added to your vouchers in the Rewards tab.', trackId === 'elite' ? 'gold' : 'mint')
    }
  }
  const claimAll = () => {
    let n = 0
    claimable.forEach((t, i) =>
      setTimeout(() => {
        claim('free', t)
        sfx.coin()
      }, i * 160),
    )
    eliteClaimable.forEach((t, i) =>
      setTimeout(() => {
        claim('elite', t)
        sfx.coin()
      }, (claimable.length + i) * 160),
    )
    n = claimable.length + eliteClaimable.length
    if (n) fx.toast(`${n} rewards claimed`, 'Season loot added to your wallet & vouchers.', 'gold')
  }

  const onDown = (e: React.PointerEvent) => {
    const el = track.current
    if (!el || e.pointerType === 'touch') return
    drag.current = { down: true, x: e.clientX, left: el.scrollLeft, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const el = track.current
    if (!el || !drag.current.down) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.left - dx
  }
  const onUp = () => {
    drag.current.down = false
  }

  return (
    <div>
      <section className="season-hero hud brackets crimson">
        <div className="season-hero-bg" />
        <div className="season-hero-in">
          <div>
            <div className="hud-label" style={{ color: 'var(--crimson-hi)' }}>
              Season {String(SEASON.number).padStart(2, '0')} · now live
            </div>
            <h1 className="display season-title">
              <span className="grad-crimson">{SEASON.name}</span>
            </h1>
            <p className="dim">{SEASON.tagline} 30 tiers, two tracks, one jersey at the top.</p>
            <div className="season-ends">
              <span className="hud-label mute">Season ends in</span>
              <Countdown to={SEASON.end} />
            </div>
          </div>
          <div className="season-progress">
            <div className="season-tier">
              <span className="hud-label">Tier</span>
              <span className="display">{tier}</span>
              <span className="mute hud-num">/ {SEASON.tiers}</span>
            </div>
            <div className="bar crimson" style={{ height: 12 }}>
              <i style={{ ['--p' as string]: tier >= SEASON.tiers ? 1 : inTier / SEASON.xpPerTier }} />
            </div>
            <div className="hud-num mute" style={{ fontSize: 12 }}>
              {tier >= SEASON.tiers ? 'Track complete' : `${fmt(inTier)} / ${SEASON.xpPerTier} season XP to tier ${tier + 1}`}
            </div>
            {claimable.length + eliteClaimable.length > 0 && (
              <Btn variant="crimson" onClick={claimAll} icon={<Sparkles size={16} />}>
                Claim all ({claimable.length + eliteClaimable.length})
              </Btn>
            )}
          </div>
        </div>
      </section>

      {!s.elitePass && (
        <motion.section className="elite-cta hud brackets gold" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Crown size={32} className="t-gold" />
          <div style={{ flex: 1 }}>
            <div className="display" style={{ fontSize: 22 }}>
              Unlock the <span className="grad-gold">Elite track</span>
            </div>
            <div className="dim" style={{ fontSize: 14 }}>
              VIP room time, 2 free hours, the animated holo frame and the Red Room jersey. {SEASON.elitePrice} at the counter — every tier you already reached unlocks instantly.
            </div>
          </div>
          <Btn
            variant="gold"
            onClick={() => {
              sfx.levelUp()
              buyElite()
            }}
            icon={<Gem size={16} />}
          >
            Unlock · {SEASON.elitePrice}
          </Btn>
        </motion.section>
      )}

      <div className="track-legend">
        <span className="hud-label">Free track</span>
        <span className="hud-label t-gold">Elite track</span>
      </div>
      <div className="track" ref={track} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        <div className="track-in">
          <div className="track-line">
            <i style={{ width: `${(Math.min(tier, SEASON.tiers) / SEASON.tiers) * 100}%` }} />
          </div>
          {FREE_TRACK.map((fr, i) => {
            const t = i + 1
            const er = ELITE_TRACK[i]
            const reached = t <= tier
            const isCur = t === Math.min(SEASON.tiers, tier + 1)
            return (
              <div key={t} className={`tcol ${reached ? 'reached' : ''} ${t % 5 === 0 ? 'milestone' : ''}`} data-tier={t}>
                <Node r={fr} state={s.seasonClaimed.includes(t) ? 'claimed' : reached ? 'ready' : 'locked'} onClaim={() => !drag.current.moved && doClaim('free', t, fr)} />
                <div className={`tnum hud-num ${isCur ? 'cur' : ''}`} title={isCur ? 'You are here' : `Tier ${t}`}>
                  {isCur ? (
                    <span className="tme">
                      <PixelAvatar seed={s.avatarSeed} size={30} rounded={6} bg={false} />
                    </span>
                  ) : (
                    <span>{t}</span>
                  )}
                </div>
                <Node elite r={er} state={!s.elitePass ? 'elite-locked' : s.eliteClaimed.includes(t) ? 'claimed' : reached ? 'ready' : 'locked'} onClaim={() => !drag.current.moved && doClaim('elite', t, er)} />
              </div>
            )
          })}
        </div>
      </div>
      <p className="mute" style={{ fontSize: 13, marginTop: 12 }}>
        Every XP you earn this season also counts as season XP. Drag the track to explore · claimed rewards land in your wallet or vouchers.
      </p>
    </div>
  )
}

function Node({ r, state, elite, onClaim }: { r: TierReward; state: 'claimed' | 'ready' | 'locked' | 'elite-locked'; elite?: boolean; onClaim: () => void }) {
  const Icon = r.icon
  return (
    <button
      className={`node node--${state} ${elite ? 'node--elite' : ''} ${r.special ? 'node--special' : ''}`}
      onClick={() => state === 'ready' && onClaim()}
      onMouseEnter={() => sfx.hover()}
      disabled={state !== 'ready'}
      title={r.label}
    >
      <Icon size={r.special ? 24 : 20} />
      <span className="node-l">{r.label}</span>
      {state === 'claimed' && (
        <span className="node-badge ok">
          <Check size={12} />
        </span>
      )}
      {(state === 'locked' || state === 'elite-locked') && (
        <span className="node-badge">
          <Lock size={11} />
        </span>
      )}
      {state === 'ready' && <span className="node-claim hud-label">Claim</span>}
    </button>
  )
}
