import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { Lock, Ticket, Check, QrCode as QrIcon, Sparkles } from 'lucide-react'
import { usePlayer } from '../../store/player'
import { REWARDS, RARITY, rewardById, type Reward } from '../../data/rewards'
import { Btn, Counter, Modal, Tilt } from '../../components/ui/kit'
import { CoinIcon } from '../../components/ui/icons'
import { QrCode } from '../../components/ui/QrCode'
import { levelFromXp } from '../../data/ranks'
import { fmt } from '../../lib/format'
import { fmtDate } from '../../lib/time'
import { sfx } from '../../lib/sfx'
import { fx } from '../../lib/fx'
import { encodeCode } from '../../lib/qr'
import { burstConfetti } from '../../components/fx/FxLayer'
import type { Voucher } from '../../store/types'
import './hub-pages.css'
import './rewards.css'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'venue', label: 'At the arena' },
  { id: 'digital', label: 'Cosmetics' },
  { id: 'merch', label: 'Merch & cards' },
] as const

export default function Rewards() {
  const s = usePlayer()
  const redeem = usePlayer((x) => x.redeem)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [confirm, setConfirm] = useState<Reward | null>(null)
  const [show, setShow] = useState<Voucher | null>(null)
  const level = levelFromXp(s.xp)
  const list = useMemo(() => REWARDS.filter((r) => filter === 'all' || r.kind === filter), [filter])
  const active = s.vouchers.filter((v) => v.status === 'active')
  const used = s.vouchers.filter((v) => v.status === 'used')
  const cheapestLocked = REWARDS.filter((r) => r.cost > s.coins).sort((a, b) => a.cost - b.cost)[0]

  const doRedeem = (r: Reward) => {
    const res = redeem(r.id)
    setConfirm(null)
    if (!res.ok || !res.voucher) {
      sfx.error()
      fx.toast('Can’t redeem', res.error, 'crimson')
      return
    }
    sfx.success()
    burstConfetti(['#ffc83d', '#5ff3da', '#ffffff'])
    if (r.kind === 'digital') fx.toast(`${r.name} equipped`, 'Check your Play Pass card — it’s already live.', 'gold')
    else setTimeout(() => setShow(res.voucher!), 350)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <span className="hud-label">Rewards shop</span>
          </div>
          <h1 className="display page-title">
            Spend the <span className="grad-gold">grind.</span>
          </h1>
          <p className="page-sub">Redeem coins for real perks. Arena rewards become a voucher QR — show it at the counter and the crew scans it.</p>
        </div>
        <div className="wallet hud brackets gold">
          <div className="hud-label">Wallet</div>
          <div className="wallet-v">
            <CoinIcon size={34} />
            <Counter value={s.coins} className="display grad-gold" />
          </div>
          {cheapestLocked && (
            <div className="mute" style={{ fontSize: 13 }}>
              {fmt(cheapestLocked.cost - s.coins)} more for {cheapestLocked.name}
            </div>
          )}
        </div>
      </div>

      {active.length > 0 && (
        <section className="vouchers">
          <div className="card-h">
            <span className="hud-label">
              <Ticket size={14} /> Your active vouchers · {active.length}
            </span>
          </div>
          <div className="voucher-row">
            {active.map((v) => {
              const r = rewardById(v.rewardId)
              const name = r?.name ?? v.rewardId.replace(/^season:/, '')
              const Icon = r?.icon ?? Sparkles
              return (
                <motion.button key={v.id} className="voucher" onClick={() => { sfx.click(); setShow(v) }} whileHover={{ y: -4 }} layout>
                  <span className="voucher-ic">
                    <Icon size={20} />
                  </span>
                  <span className="voucher-mid">
                    <b>{name}</b>
                    <small className="hud-num">{v.code}</small>
                  </span>
                  <QrIcon size={18} className="voucher-qr" />
                </motion.button>
              )
            })}
          </div>
        </section>
      )}

      <LayoutGroup>
        <div className="tabs" style={{ marginBottom: 18 }}>
          {FILTERS.map((f) => (
            <button key={f.id} className={`tab ${filter === f.id ? 'active' : ''}`} onClick={() => { sfx.click(); setFilter(f.id) }}>
              {filter === f.id && <motion.span layoutId="rw-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <motion.div className="shop" layout>
        <AnimatePresence mode="popLayout">
          {list.map((r, i) => {
            const locked = !!r.minLevel && level < r.minLevel
            const afford = s.coins >= r.cost
            const owned = r.kind === 'digital' && ((r.id === 'frame' && s.frame === 'neon') || (r.id === 'tagcolor' && s.tagColor === 'crimson'))
            const pct = Math.min(1, s.coins / r.cost)
            return (
              <motion.div key={r.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.03 }}>
                <Tilt max={10} className="shop-tilt">
                  <article className={`loot shop-item loot--${r.rarity} ${locked ? 'is-locked' : ''}`} style={{ ['--rc' as string]: RARITY[r.rarity].color }}>
                    <div className="loot-top">
                      <span className="loot-rarity hud-label">{RARITY[r.rarity].label}</span>
                      {r.stock && <span className="shop-stock hud-num">{r.stock} left</span>}
                    </div>
                    <div className="loot-icon">
                      <span className="loot-hex" />
                      {locked ? <Lock size={30} /> : <r.icon size={34} />}
                    </div>
                    <h3 className="loot-name">{r.name}</h3>
                    <p className="loot-desc">{r.desc}</p>
                    <div className="shop-foot">
                      <div className="loot-cost">
                        <CoinIcon size={18} />
                        <span className="hud-num">{fmt(r.cost)}</span>
                      </div>
                      {owned ? (
                        <span className="chip">
                          <Check size={12} /> Equipped
                        </span>
                      ) : locked ? (
                        <span className="chip ghost">
                          <Lock size={11} /> LV {r.minLevel}
                        </span>
                      ) : afford ? (
                        <button className="shop-buy" onClick={() => { sfx.click(); setConfirm(r) }}>
                          Redeem
                        </button>
                      ) : (
                        <span className="shop-need hud-num">
                          <span className="shop-need-bar">
                            <i style={{ width: `${pct * 100}%` }} />
                          </span>
                          {fmt(r.cost - s.coins)} to go
                        </span>
                      )}
                    </div>
                  </article>
                </Tilt>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {used.length > 0 && (
        <section style={{ marginTop: 34 }}>
          <div className="card-h">
            <span className="hud-label mute">Used vouchers</span>
          </div>
          <div className="voucher-row">
            {used.slice(0, 6).map((v) => {
              const r = rewardById(v.rewardId)
              const Icon = r?.icon ?? Sparkles
              return (
                <div key={v.id} className="voucher used">
                  <span className="voucher-ic">
                    <Icon size={20} />
                  </span>
                  <span className="voucher-mid">
                    <b>{r?.name ?? v.rewardId.replace(/^season:/, '')}</b>
                    <small>{fmtDate(v.at)}</small>
                  </span>
                  <span className="voucher-stamp">USED</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm redeem" tone="gold">
        {confirm && (
          <div className="confirm">
            <div className="confirm-ic" style={{ ['--rc' as string]: RARITY[confirm.rarity].color }}>
              <confirm.icon size={40} />
            </div>
            <div className="display" style={{ fontSize: 28 }}>
              {confirm.name}
            </div>
            <p className="dim">{confirm.desc}</p>
            <div className="confirm-math">
              <span className="cur gold">
                <CoinIcon size={18} /> {fmt(s.coins)}
              </span>
              <span className="mute">−</span>
              <span className="cur gold">{fmt(confirm.cost)}</span>
              <span className="mute">=</span>
              <span className="cur gold">{fmt(s.coins - confirm.cost)}</span>
            </div>
            <div className="row" style={{ gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn variant="ghost" onClick={() => setConfirm(null)}>
                Cancel
              </Btn>
              <Btn variant="gold" onClick={() => doRedeem(confirm)}>
                Redeem for {fmt(confirm.cost)}
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!show} onClose={() => setShow(null)} title="Voucher" tone="gold">
        {show && <VoucherView v={show} onClose={() => setShow(null)} />}
      </Modal>
    </div>
  )
}

function VoucherView({ v, onClose }: { v: Voucher; onClose: () => void }) {
  const r = rewardById(v.rewardId)
  const name = r?.name ?? v.rewardId.replace(/^season:/, '')
  return (
    <div className="vview">
      <motion.div className="vview-card" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
        <div className="vview-top">
          {r && (
            <span className="chip" style={{ color: RARITY[r.rarity].color, borderColor: RARITY[r.rarity].color }}>
              {RARITY[r.rarity].label}
            </span>
          )}
          <div className="display vview-t">{name}</div>
          <div className="mute" style={{ fontSize: 13 }}>
            Issued {fmtDate(v.at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="vview-cut" />
        <div className="vview-qr">
          <QrCode value={encodeCode({ kind: 'voucher', code: v.code })} size={210} />
          <div className="hud-num vview-code">{v.code}</div>
        </div>
      </motion.div>
      <p className="dim" style={{ textAlign: 'center', fontSize: 14 }}>
        Show this at the counter. The crew scans it in the staff console and it’s marked as used.
      </p>
      <Btn variant="ghost" block onClick={onClose}>
        Done
      </Btn>
    </div>
  )
}
