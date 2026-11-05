import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { Lock, Check, Crown } from 'lucide-react'
import { SectionHead, Tilt, Counter, stagger } from '../../components/ui/kit'
import { RankEmblem } from '../../components/ui/RankEmblem'
import { PixelAvatar } from '../../components/ui/PixelAvatar'
import { CoinIcon } from '../../components/ui/icons'
import { RANKS, type RankId } from '../../data/ranks'
import { REWARDS, RARITY } from '../../data/rewards'
import { MOCK_PLAYERS } from '../../data/players'
import { SQUADS } from '../../data/squads'
import { fmt } from '../../lib/format'
import { sfx } from '../../lib/sfx'

/* ------------------------------------------------------------------ Ranks ladder */

export function Ladder() {
  const [sel, setSel] = useState<RankId>('pro')
  const rank = RANKS.find((r) => r.id === sel)!
  return (
    <section className="section ladder-sec" id="ranks">
      <div className="container">
        <SectionHead
          index="03"
          kicker="Climb the ladder"
          title={
            <>
              59 levels. 7 ranks. <span className="grad-gold">One crest.</span>
            </>
          }
          sub="Your rank is permanent and public — it glows next to your gamertag on every leaderboard and on the arena screens. The higher you climb, the better the perks."
        />
        <div className="ladder">
          {RANKS.map((r, i) => (
            <motion.button
              key={r.id}
              className={`ladder-step ${sel === r.id ? 'active' : ''} ${r.id === 'club59' ? 'is-59' : ''}`}
              style={{ ['--rc' as string]: r.color, ['--h' as string]: `${16 + i * 9.5}%` }}
              onClick={() => {
                sfx.click()
                setSel(r.id)
              }}
              onMouseEnter={() => {
                sfx.hover()
                setSel(r.id)
              }}
              {...stagger(i, 0.07)}
            >
              <span className="ladder-emblem">
                <RankEmblem rank={r.id} size={i === 6 ? 92 : 64 + i * 3} />
              </span>
              <span className="ladder-bar">
                <span className="ladder-name">{r.name}</span>
                <span className="ladder-lv hud-num">{r.min === r.max ? `LV ${r.min}` : `LV ${r.min}–${r.max}`}</span>
              </span>
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={rank.id} className="ladder-detail hud brackets" style={{ ['--c' as string]: rank.color }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
            <div className="ladder-detail-l">
              <div className={`display ladder-detail-name ${rank.id === 'club59' ? 'grad-holo' : ''}`} style={rank.id === 'club59' ? undefined : { color: rank.color }}>
                {rank.name}
              </div>
              <p className="dim">{rank.tagline}</p>
            </div>
            <div className="ladder-perks">
              {rank.perks.map((p) => (
                <span key={p} className="ladder-perk">
                  <Check size={14} /> {p}
                </span>
              ))}
              {rank.bonus > 0 && <span className="ladder-perk ladder-perk--big hud-num">+{Math.round(rank.bonus * 100)}% coins</span>}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Loot */

export function Loot() {
  const items = REWARDS.filter((r) => ['coffee', 'plus30', 'hour', 'frame', 'ticket', 'vip', 'jersey', 'psn'].includes(r.id))
  return (
    <section className="section" id="loot">
      <div className="container">
        <div className="loot-head">
          <SectionHead
            index="04"
            kicker="Rewards shop"
            title={
              <>
                Loot worth <span className="grad-gold">the grind.</span>
              </>
            }
            sub="Coins never expire. Spend them on real things at the counter — or save up for the legendary drops."
          />
          <div className="loot-rate hud brackets gold">
            <div className="hud-label">Exchange rate</div>
            <div className="loot-rate-v">
              <CoinIcon size={26} />
              <span className="display grad-gold">900</span>
              <span className="dim">=</span>
              <span className="display">1h free</span>
            </div>
            <div className="mute" style={{ fontSize: 13 }}>
              ≈ one free hour every 6 visits
            </div>
          </div>
        </div>
        <div className="loot-grid">
          {items.map((r, i) => (
            <motion.div key={r.id} {...stagger(i, 0.06)}>
              <Tilt max={14} className="loot-tilt">
                <article className={`loot loot--${r.rarity}`} style={{ ['--rc' as string]: RARITY[r.rarity].color }}>
                  <div className="loot-top">
                    <span className="loot-rarity hud-label">{RARITY[r.rarity].label}</span>
                    {r.minLevel && (
                      <span className="loot-lock">
                        <Lock size={12} /> LV {r.minLevel}
                      </span>
                    )}
                  </div>
                  <div className="loot-icon">
                    <span className="loot-hex" />
                    <r.icon size={34} />
                  </div>
                  <h3 className="loot-name">{r.name}</h3>
                  <p className="loot-desc">{r.desc}</p>
                  <div className="loot-cost">
                    <CoinIcon size={18} />
                    <span className="hud-num">{fmt(r.cost)}</span>
                  </div>
                </article>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Live leaderboard */

export function LiveBoard() {
  const base = useMemo(() => [...MOCK_PLAYERS].sort((a, b) => b.weeklyXp - a.weeklyXp).slice(0, 8), [])
  const [xp, setXp] = useState<Record<string, number>>(() => Object.fromEntries(base.map((p) => [p.id, p.weeklyXp])))
  const [flash, setFlash] = useState<{ id: string; v: number } | null>(null)
  useEffect(() => {
    const id = setInterval(() => {
      const p = base[Math.floor(Math.random() * base.length)]
      const v = [60, 100, 120, 160, 200][Math.floor(Math.random() * 5)]
      setXp((x) => ({ ...x, [p.id]: x[p.id] + v }))
      setFlash({ id: p.id, v })
    }, 2600)
    return () => clearInterval(id)
  }, [base])
  const sorted = [...base].sort((a, b) => xp[b.id] - xp[a.id])
  const top = sorted.slice(0, 3)
  const rest = sorted.slice(3)
  const max = xp[sorted[0].id]
  const podium = [top[1], top[0], top[2]]
  const squadMax = Math.max(...SQUADS.map((s) => s.weeklyXp))
  return (
    <section className="section board-sec" id="board">
      <div className="container">
        <SectionHead
          index="05"
          kicker="This week’s legends"
          title={
            <>
              The board <span className="grad-crimson">never sleeps.</span>
            </>
          }
          sub="Weekly XP resets every Monday at 00:00. Top 3 win free hours, and the top squad takes the Squad Cup."
        />
        <div className="board">
          <div className="board-main hud brackets">
            <div className="hud-title">
              <span className="live-dot" />
              <span className="hud-label">Live · weekly XP</span>
            </div>
            <LayoutGroup>
              <div className="podium">
                {podium.map((p, i) => {
                  const place = i === 1 ? 1 : i === 0 ? 2 : 3
                  return (
                    <motion.div layout key={p.id} className={`podium-col podium-col--${place}`} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                      <div className="podium-av">
                        {place === 1 && <Crown className="podium-crown" size={26} />}
                        <PixelAvatar seed={p.seed} size={place === 1 ? 84 : 66} rounded={14} />
                      </div>
                      <div className="podium-tag">{p.tag}</div>
                      <div className="podium-xp hud-num">
                        <Counter value={xp[p.id]} /> XP
                      </div>
                      <div className="podium-block">
                        <span className="display">{place}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              <div className="board-rows">
                {rest.map((p, i) => (
                  <motion.div layout key={p.id} className="board-row" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                    <span className="board-pos hud-num">{i + 4}</span>
                    <PixelAvatar seed={p.seed} size={34} rounded={8} />
                    <span className="board-tag">{p.tag}</span>
                    <span className="board-bar">
                      <i style={{ width: `${(xp[p.id] / max) * 100}%` }} />
                    </span>
                    <span className="board-xp hud-num">
                      <Counter value={xp[p.id]} />
                    </span>
                    <AnimatePresence>
                      {flash?.id === p.id && (
                        <motion.span key={xp[p.id]} className="board-flash hud-num" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: -14 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                          +{flash.v}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </LayoutGroup>
          </div>
          <div className="board-side hud brackets crimson">
            <div className="hud-title">
              <span className="hud-label">Squad Cup · week 41</span>
            </div>
            <div className="squads">
              {[...SQUADS]
                .sort((a, b) => b.weeklyXp - a.weeklyXp)
                .map((s, i) => (
                  <motion.div key={s.id} className="squad-row" {...stagger(i, 0.08)}>
                    <span className="squad-ic" style={{ color: s.color, borderColor: s.color }}>
                      <s.icon size={16} />
                    </span>
                    <div className="squad-mid">
                      <div className="squad-name">
                        {s.name} <span className="mute hud-num">[{s.tag}]</span>
                      </div>
                      <div className="squad-bar">
                        <motion.i style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }} initial={{ width: 0 }} whileInView={{ width: `${(s.weeklyXp / squadMax) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }} />
                      </div>
                    </div>
                    <span className="squad-xp hud-num">{(s.weeklyXp / 1000).toFixed(1)}K</span>
                  </motion.div>
                ))}
            </div>
            <p className="mute" style={{ fontSize: 13, padding: '0 18px 18px' }}>
              Join a squad from your Play Pass. Squad XP = every member’s XP combined.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
