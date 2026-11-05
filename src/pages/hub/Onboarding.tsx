import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Dices, Shuffle, Sparkles, UserRound } from 'lucide-react'
import { usePlayer } from '../../store/player'
import { PlayPassCard } from '../../components/ui/PlayPassCard'
import { PixelAvatar } from '../../components/ui/PixelAvatar'
import { Btn } from '../../components/ui/kit'
import { CoinIcon } from '../../components/ui/icons'
import { Crest } from '../../components/brand/Crest'
import { GAMES } from '../../data/games'
import { SQUADS } from '../../data/squads'
import { MOCK_PLAYERS } from '../../data/players'
import { sfx } from '../../lib/sfx'
import { fx } from '../../lib/fx'
import { burstConfetti } from '../../components/fx/FxLayer'
import './hub-pages.css'

const A = ['Neon', 'Red', 'Atlas', 'Sebou', 'Chella', 'Mehdia', 'Ghost', 'Turbo', 'Pixel', 'Nova', 'Night', 'Velvet', 'Hex', 'Blitz']
const B = ['Rider', 'Sniper', 'King', 'Wave', 'Fox', 'Boss', 'Ace', 'Viper', 'Lion', 'Shark', 'Ninja', 'Combo', 'Striker']
const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
const suggest = () => `${rnd(A)}${rnd(B)}${Math.random() < 0.5 ? '_' + Math.floor(Math.random() * 99) : ''}`

const STEPS = ['Gamertag', 'Avatar', 'Main game', 'Squad']

export default function Onboarding() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const createPlayer = usePlayer((s) => s.createPlayer)
  const loadDemo = usePlayer((s) => s.loadDemo)
  const [step, setStep] = useState(0)
  const [tag, setTag] = useState('')
  const [seed, setSeed] = useState(() => Math.random().toString(36).slice(2, 9))
  const [game, setGame] = useState('fc26')
  const [squad, setSquad] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [sugs, setSugs] = useState(() => Array.from({ length: 5 }, suggest))
  const avatarOptions = useMemo(() => Array.from({ length: 8 }, (_, i) => `${seed}-${i}`), [seed])

  const taken = MOCK_PLAYERS.some((p) => p.tag.toLowerCase() === tag.trim().toLowerCase())
  const tagOk = /^[A-Za-z0-9_.]{3,16}$/.test(tag.trim()) && !taken
  const next = params.get('next')

  const go = (d: number) => {
    if (d > 0 && step === 0 && !tagOk) {
      sfx.error()
      fx.emit({ type: 'shake' })
      return
    }
    sfx.click()
    if (d > 0 && step === STEPS.length - 1) return finish()
    setStep((s) => Math.max(0, Math.min(STEPS.length - 1, s + d)))
  }

  const finish = () => {
    createPlayer({ tag: tag.trim(), avatarSeed: seed, favGame: game, squadId: squad })
    setDone(true)
    sfx.levelUp()
    setTimeout(() => burstConfetti(), 250)
    setTimeout(() => fx.emit({ type: 'coins', amount: 500, x: window.innerWidth * 0.7, y: window.innerHeight * 0.55 }), 700)
  }

  const preview = { tag: tag.trim() || 'Player One', avatarSeed: seed, xp: 0, squadId: squad, favGame: game, joinedAt: Date.now() }

  return (
    <div className="join">
      <div className="join-left">
        <Link to="/" className="join-home" onMouseEnter={() => sfx.hover()}>
          <ArrowLeft size={16} />
          <Crest size={32} mode="none" />
        </Link>
        <div className="join-pedestal" />
        <motion.div className="join-card" initial={{ opacity: 0, y: 40, rotateX: 30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.2 }}>
          <motion.div animate={done ? { rotateY: [0, 360], scale: [1, 1.08, 1] } : {}} transition={{ duration: 1.2, ease: [0.7, 0, 0.2, 1] }}>
            <PlayPassCard p={preview} size="lg" flippable={false} />
          </motion.div>
        </motion.div>
        <div className="join-hint">Live preview · your Play Pass</div>
      </div>

      <div className="join-right">
        {!done ? (
          <>
            <div>
              <div className="join-steps">
                {STEPS.map((s, i) => (
                  <i key={s} className={i <= step ? 'on' : ''} />
                ))}
              </div>
              <div className="hud-label" style={{ marginTop: 14 }}>
                Create player · step {step + 1} / {STEPS.length} · {STEPS[step]}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step} className="join-body" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                {step === 0 && (
                  <div className="col" style={{ gap: 18 }}>
                    <h1 className="display join-title">
                      Choose your <span className="grad-mint">gamertag.</span>
                    </h1>
                    <p className="dim">This is how the arena screens, leaderboards and the crew will know you. No email, no password.</p>
                    <div>
                      <input
                        className="input"
                        autoFocus
                        maxLength={16}
                        placeholder="e.g. SebouSniper"
                        value={tag}
                        onChange={(e) => {
                          setTag(e.target.value.replace(/\s/g, ''))
                          sfx.tick()
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && go(1)}
                        aria-label="Gamertag"
                      />
                      <div className="mute" style={{ fontSize: 13, marginTop: 8, minHeight: 20 }}>
                        {taken ? <span className="t-crimson">Taken by a regular — try another.</span> : tag && !tagOk ? '3–16 characters: letters, numbers, _ and .' : tagOk ? <span className="t-mint">✓ Available</span> : ''}
                      </div>
                      <div className="join-sugs">
                        {sugs.map((s) => (
                          <button key={s} className="join-sug" onClick={() => { sfx.click(); setTag(s) }}>
                            {s}
                          </button>
                        ))}
                        <button className="join-sug" onClick={() => { sfx.click(); setSugs(Array.from({ length: 5 }, suggest)) }} aria-label="More suggestions">
                          <Shuffle size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div className="col" style={{ gap: 18 }}>
                    <h1 className="display join-title">
                      Pick your <span className="grad-mint">creature.</span>
                    </h1>
                    <p className="dim">Every Play Pass gets a one-of-one 8-bit avatar. Re-roll until it feels like you.</p>
                    <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
                      <motion.div key={seed} initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
                        <PixelAvatar seed={seed} size={120} rounded={20} />
                      </motion.div>
                      <Btn
                        variant="ghost"
                        icon={<Dices size={18} />}
                        onClick={() => {
                          sfx.powerUp()
                          setSeed(Math.random().toString(36).slice(2, 9))
                        }}
                      >
                        Re-roll
                      </Btn>
                    </div>
                    <div className="join-avatars">
                      {avatarOptions.map((s) => (
                        <button key={s} className={`join-av ${s === seed ? 'sel' : ''}`} onClick={() => { sfx.click(); setSeed(s) }} onMouseEnter={() => sfx.hover()}>
                          <PixelAvatar seed={s} size={64} rounded={10} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="col" style={{ gap: 18 }}>
                    <h1 className="display join-title">
                      Your <span className="grad-mint">main.</span>
                    </h1>
                    <p className="dim">We’ll ping you when there’s a cup for it.</p>
                    <div className="join-games">
                      {GAMES.slice(0, 9).map((g) => (
                        <button
                          key={g.id}
                          className={`game-tile ${game === g.id ? 'sel' : ''}`}
                          data-short={g.short}
                          style={{ ['--g1' as string]: g.c1, ['--g2' as string]: g.c2 }}
                          onClick={() => { sfx.click(); setGame(g.id) }}
                          onMouseEnter={() => sfx.hover()}
                        >
                          <span className="game-tile-t">{g.title}</span>
                          <span className="game-tile-g">{g.genre}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="col" style={{ gap: 18 }}>
                    <h1 className="display join-title">
                      Join a <span className="grad-crimson">squad.</span>
                    </h1>
                    <p className="dim">Squads race every week for the Squad Cup. Your XP counts for the whole crew.</p>
                    <div className="join-squads">
                      {SQUADS.map((s) => (
                        <button key={s.id} className={`squad-pick ${squad === s.id ? 'sel' : ''}`} style={{ ['--sc' as string]: s.color }} onClick={() => { sfx.click(); setSquad(s.id) }} onMouseEnter={() => sfx.hover()}>
                          <span className="squad-ic">
                            <s.icon size={16} />
                          </span>
                          <span>
                            <div className="squad-pick-n">{s.name}</div>
                            <div className="squad-pick-m">{s.members} members · {s.wins} cups</div>
                          </span>
                        </button>
                      ))}
                      <button className={`squad-pick ${squad === null ? 'sel' : ''}`} style={{ ['--sc' as string]: 'var(--text-dim)' }} onClick={() => { sfx.click(); setSquad(null) }}>
                        <span className="squad-ic">
                          <UserRound size={16} />
                        </span>
                        <span>
                          <div className="squad-pick-n">Solo for now</div>
                          <div className="squad-pick-m">Join one later</div>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="join-nav">
              {step > 0 && (
                <Btn variant="ghost" onClick={() => go(-1)} icon={<ArrowLeft size={16} />}>
                  Back
                </Btn>
              )}
              <Btn onClick={() => go(1)} iconRight={step === STEPS.length - 1 ? <Sparkles size={16} /> : <ArrowRight size={16} />} size="lg">
                {step === STEPS.length - 1 ? 'Press start' : 'Next'}
              </Btn>
              <button
                className="card-link"
                style={{ marginLeft: 'auto' }}
                onClick={() => {
                  loadDemo()
                  nav(next ?? '/hub')
                }}
              >
                Skip · load demo player
              </button>
            </div>
          </>
        ) : (
          <motion.div className="join-done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="hud-label t-mint">Player created · Play Pass activated</div>
            <h1 className="display join-title">
              Welcome to the arena, <span className="grad-mint">{tag}.</span>
            </h1>
            <div className="join-bonus">
              <CoinIcon size={44} />
              <div>
                <div className="display grad-gold">+500</div>
                <div className="dim">Welcome coins — already in your wallet</div>
              </div>
            </div>
            <p className="dim" style={{ maxWidth: 520 }}>
              Next time you’re at Play Land, scan the crest QR at the entrance for your first check-in: <b className="t-mint">+100 XP, +50 coins</b> and the <b>First Spawn</b> achievement.
            </p>
            <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
              <Btn size="lg" onClick={() => nav(next ?? '/hub')} iconRight={<ArrowRight size={18} />} magnetic>
                {next ? 'Claim my scan' : 'Enter the hub'}
              </Btn>
              <Btn variant="ghost" size="lg" to="/scan">
                Try a scan
              </Btn>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
