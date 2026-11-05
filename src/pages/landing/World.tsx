import { useMemo } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Calendar, Clock, MapPin, Navigation, Phone, Swords, Trophy, Users, Coffee, Gamepad2, DoorClosed, Zap, ArrowUpRight } from 'lucide-react'
import { Btn, Countdown, SectionHead, Tilt, stagger, useNow } from '../../components/ui/kit'
import { InstagramIcon, XpIcon } from '../../components/ui/icons'
import { Crest } from '../../components/brand/Crest'
import { Wordmark } from '../../components/brand/Wordmark'
import { getEvents } from '../../data/events'
import { gameById } from '../../data/games'
import { ROOMS, STATIONS, stationStatus } from '../../data/stations'
import { fmtDate, fmtTime } from '../../lib/time'
import { usePlayer } from '../../store/player'
import { openStatus } from './SiteNav'

/* ------------------------------------------------------------------ Events */

export function EventsTeaser() {
  const events = useMemo(() => getEvents(), [])
  const [feat, ...rest] = events.filter((e) => e.kind === 'tournament').concat(events.filter((e) => e.kind !== 'tournament'))
  const g = gameById(feat.game)
  return (
    <section className="section" id="events">
      <div className="container">
        <SectionHead
          index="06"
          kicker="Tournaments & nights"
          title={
            <>
              Every week has <span className="grad-crimson">a final.</span>
            </>
          }
          sub="Weekly cups with real prizes, seeded by rank. Check in to any event with your Play Pass for bonus XP — even if you get knocked out in round one."
        />
        <div className="ev-grid">
          <motion.div {...stagger(0)} className="ev-feat-wrap">
            <Tilt max={6} className="ev-feat-tilt">
              <article className="ev-feat hud brackets" style={{ ['--ec' as string]: feat.color }}>
                <div className="ev-feat-bg" style={{ background: `radial-gradient(circle at 80% 20%, ${g.c1}40, transparent 55%), radial-gradient(circle at 10% 90%, #ff2d4e33, transparent 50%)` }} />
                <div className="ev-feat-top">
                  <span className="chip crimson">
                    <span className="live-dot" /> Sign-ups open
                  </span>
                  <span className="chip ghost">{feat.recurring}</span>
                </div>
                <div className="ev-feat-game hud-label" style={{ color: g.c1 }}>
                  {g.title}
                </div>
                <h3 className="display ev-feat-title">{feat.title}</h3>
                <p className="dim ev-feat-desc">{feat.desc}</p>
                <div className="ev-feat-cd">
                  <div className="hud-label mute">Kick-off in</div>
                  <Countdown to={feat.when} size="lg" />
                </div>
                <div className="ev-feat-meta">
                  <span>
                    <Users size={15} /> {feat.taken}/{feat.slots} players
                  </span>
                  <span>
                    <Trophy size={15} /> {feat.prize}
                  </span>
                  <span>
                    <Swords size={15} /> Entry {feat.entry}
                  </span>
                </div>
                <div className="ev-slots">
                  {Array.from({ length: feat.slots }, (_, i) => (
                    <i key={i} className={i < feat.taken ? 'on' : ''} />
                  ))}
                </div>
                <Btn to="/events" variant="crimson" iconRight={<ArrowUpRight size={16} />}>
                  See the bracket
                </Btn>
              </article>
            </Tilt>
          </motion.div>
          <div className="ev-list">
            {rest.slice(0, 4).map((e, i) => {
              const gg = gameById(e.game)
              return (
                <motion.article key={e.id} className="ev-card hud" style={{ ['--ec' as string]: e.color }} {...stagger(i + 1)}>
                  <div className="ev-date">
                    <span className="hud-num ev-date-d">{new Date(e.when).getDate()}</span>
                    <span className="hud-label">{new Date(e.when).toLocaleDateString('en-GB', { month: 'short' })}</span>
                  </div>
                  <div className="ev-card-mid">
                    <div className="hud-label" style={{ color: gg.c1 }}>
                      {e.kind === 'tournament' ? gg.short : e.kind === 'party' ? 'Watch party' : 'Special night'}
                    </div>
                    <div className="ev-card-title">{e.title}</div>
                    <div className="mute ev-card-sub">
                      <Calendar size={13} /> {fmtDate(e.when)} · {fmtTime(e.when)} &nbsp;·&nbsp; {e.prize}
                    </div>
                  </div>
                  <Countdown to={e.when} size="sm" />
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Live stations */

export function LiveStations() {
  const t = useNow(4000)
  const statuses = STATIONS.map((s) => ({ s, st: stationStatus(s, t) }))
  const free = statuses.filter((x) => x.st.state === 'free').length
  return (
    <section className="section" id="live">
      <div className="container live-grid">
        <div>
          <SectionHead
            index="07"
            kicker="Live arena status"
            title={
              <>
                <span className="grad-mint">{free}</span> stations free right now.
              </>
            }
            sub="No more showing up to a full house. The live map in your Play Pass shows every station, what’s being played and when it frees up — and lets you reserve one."
          />
          <div className="live-legend">
            <span>
              <i className="lg-free" /> Free
            </span>
            <span>
              <i className="lg-busy" /> In a match
            </span>
            <span>
              <i className="lg-res" /> Reserved
            </span>
          </div>
          <Btn to="/map" variant="ghost" iconRight={<ArrowUpRight size={16} />}>
            Open the live map
          </Btn>
        </div>
        <div className="live-map hud brackets">
          {ROOMS.map((room) => (
            <div key={room.id} className={`live-room live-room--${room.id}`}>
              <div className="live-room-h">
                <span className="hud-label" style={{ color: room.color }}>
                  {room.name}
                </span>
                <span className="mute hud-num" style={{ fontSize: 12 }}>
                  {room.price}
                </span>
              </div>
              <div className="live-stations">
                {statuses
                  .filter((x) => x.s.room === room.id)
                  .map(({ s, st }) => (
                    <motion.div key={s.id} layout className={`live-st live-st--${st.state}`} title={s.label}>
                      <span className="live-st-id hud-num">{s.label}</span>
                      {st.state === 'busy' && (
                        <>
                          <span className="live-st-game">{gameById(st.game).short}</span>
                          <span className="live-st-time hud-num">{st.minsLeft}m</span>
                        </>
                      )}
                      {st.state === 'reserved' && <span className="live-st-game">@{st.at}</span>}
                      {st.state === 'free' && <span className="live-st-game">Free</span>}
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Game modes (pricing) */

const MODES = [
  { icon: Gamepad2, name: 'Quick Match', price: '10', unit: 'DH / match', perks: ['One FC 26 match', 'Any station', 'Counts for quests'], xp: '+30 XP', tone: '' },
  { icon: Clock, name: 'Solo Hour', price: '20', unit: 'DH / hour', perks: ['Any game, any station', '2 controllers', 'Scan station for XP'], xp: '+60 XP / h', tone: 'pop' },
  { icon: Users, name: 'Squad Night', price: '70', unit: 'DH / 4 players / h', perks: ['Side-by-side stations', 'Squad XP ×2 on Saturdays', 'Free coffee round'], xp: '+60 XP / h each', tone: '' },
  { icon: DoorClosed, name: 'VIP Room', price: '50', unit: 'DH / hour', perks: ['Private room for 4', '65" screen', 'Book from the Play Pass'], xp: '+80 XP / h', tone: 'gold' },
]

export function Modes() {
  return (
    <section className="section" id="modes">
      <div className="container">
        <SectionHead
          index="08"
          kicker="Game modes"
          title={
            <>
              Pick a mode. <span className="grad-mint">Press start.</span>
            </>
          }
          sub="Simple pricing, no membership fee. The Play Pass is free — it just makes every dirham count twice."
          align="center"
        />
        <div className="modes">
          {MODES.map((m, i) => (
            <motion.div key={m.name} {...stagger(i, 0.08)}>
              <Tilt max={10} className="mode-tilt">
                <article className={`mode hud brackets ${m.tone}`}>
                  {m.tone === 'pop' && <span className="mode-pop chip crimson">Most played</span>}
                  <m.icon size={28} className="mode-ic" />
                  <div className="mode-name hud-label">{m.name}</div>
                  <div className="mode-price">
                    <span className="display">{m.price}</span>
                    <span className="mute">{m.unit}</span>
                  </div>
                  <ul className="mode-perks">
                    {m.perks.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className="mode-xp">
                    <XpIcon size={14} /> {m.xp}
                  </div>
                </article>
              </Tilt>
            </motion.div>
          ))}
        </div>
        <p className="mute modes-note">
          <Coffee size={14} /> Coffee machine at the door · <Zap size={14} /> Double XP Mon–Thu 14:00–18:00 · Prices shown are placeholders for this preview.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Gallery */

const SHOTS = [
  { src: '/media/red-room-wide.webp', cap: 'The Red Room · FC 26 night', cls: 'g-wide' },
  { src: '/media/storefront.webp', cap: 'The door on Rue de Chella', cls: 'g-tall' },
  { src: '/media/lounge.webp', cap: 'The Lounge · poster wall', cls: 'g-tall' },
  { src: '/media/vip-room.webp', cap: 'VIP room · door closed', cls: 'g-sq' },
  { src: '/media/red-room.webp', cap: 'Velvet thrones', cls: 'g-sq' },
]

export function Gallery() {
  return (
    <section className="section" id="gallery">
      <div className="container">
        <SectionHead
          index="09"
          kicker="Inside the arena"
          title={
            <>
              Lights red. <span className="grad-mint">Screens on.</span>
            </>
          }
        />
        <div className="gallery">
          {SHOTS.map((s, i) => (
            <motion.figure key={s.src} className={`shot ${s.cls}`} data-cursor="VIEW" {...stagger(i, 0.07)}>
              <img src={s.src} alt={s.cap} loading="lazy" />
              <span className="shot-rec hud-num">
                <span className="live-dot" /> REC
              </span>
              <span className="shot-corner tl" />
              <span className="shot-corner br" />
              <figcaption className="hud-label">{s.cap}</figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Visit */

export function Visit() {
  const t = useNow(30000)
  const st = openStatus(t)
  const today = new Date(t).getDay()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return (
    <section className="section" id="visit">
      <div className="container visit">
        <div className="visit-info">
          <SectionHead
            index="10"
            kicker="Spawn point"
            title={
              <>
                Rue de Chella, <span className="grad-mint">Kénitra.</span>
              </>
            }
          />
          <div className="visit-cards">
            <div className="visit-card hud">
              <MapPin size={18} />
              <div>
                <div className="hud-label">Address</div>
                <div>7C76+2F2, Rue de Chella, Kénitra</div>
                <div className="mute" style={{ fontSize: 13 }}>
                  Ville Haute — next to Pharmacie de la Ville Haute
                </div>
              </div>
            </div>
            <div className="visit-card hud">
              <Clock size={18} />
              <div style={{ flex: 1 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="hud-label">Hours</span>
                  <span className={`chip ${st.open ? '' : 'ghost'}`}>
                    <span className={`live-dot ${st.open ? 'mint' : ''}`} /> {st.open ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="visit-days">
                  {days.map((d, i) => (
                    <span key={d} className={i === today ? 'today' : ''}>
                      <b>{d}</b> 10:00–02:00
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <a className="visit-card hud visit-link" href="tel:+212625804805">
              <Phone size={18} />
              <div>
                <div className="hud-label">Call / WhatsApp</div>
                <div className="hud-num">06 25 80 48 05</div>
              </div>
              <ArrowUpRight size={18} className="visit-arrow" />
            </a>
            <a className="visit-card hud visit-link" href="https://www.instagram.com/playlandkenitra/" target="_blank" rel="noreferrer">
              <InstagramIcon size={18} />
              <div>
                <div className="hud-label">Instagram</div>
                <div>@playlandkenitra</div>
              </div>
              <ArrowUpRight size={18} className="visit-arrow" />
            </a>
          </div>
          <Btn href="https://www.google.com/maps/dir/?api=1&destination=34.26252,-6.588872" target="_blank" iconRight={<Navigation size={16} />}>
            Get directions
          </Btn>
        </div>
        <Radar />
      </div>
    </section>
  )
}

function Radar() {
  const blips = [
    { x: 30, y: 38, l: 'Ville Haute' },
    { x: 72, y: 30, l: 'Rue de Chella' },
    { x: 66, y: 70, l: 'Pharmacie' },
    { x: 24, y: 72, l: '' },
    { x: 80, y: 52, l: '' },
  ]
  return (
    <div className="radar-wrap">
      <div className="radar">
        <div className="radar-grid" />
        <div className="radar-sweep" />
        {[1, 2, 3, 4].map((r) => (
          <span key={r} className="radar-ring" style={{ inset: `${r * 10}%` }} />
        ))}
        <span className="radar-cross radar-cross--h" />
        <span className="radar-cross radar-cross--v" />
        {blips.map((b, i) => (
          <span key={i} className="radar-blip" style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${i * 0.6}s` }}>
            {b.l && <span className="radar-blip-l hud-label">{b.l}</span>}
          </span>
        ))}
        <div className="radar-center">
          <span className="radar-pulse" />
          <Crest size={64} mode="idle" />
          <span className="radar-you hud-label">Play Land</span>
        </div>
      </div>
      <div className="radar-coords hud-num">
        <span>LAT 34.26252</span>
        <span>LNG −6.58887</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Footer */

export function Footer() {
  const created = usePlayer((s) => s.created)
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-cta hud brackets">
          <div>
            <div className="hud-label">Player 1, ready?</div>
            <h2 className="display footer-cta-t">
              Your next level starts <span className="grad-mint">at the door.</span>
            </h2>
          </div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 14 }}>
            <Btn to={created ? '/hub' : '/join'} size="lg" magnetic>
              {created ? 'Open my Play Pass' : 'Get your Play Pass'}
            </Btn>
            <Btn to="/staff" variant="ghost" size="lg">
              Staff console
            </Btn>
          </div>
        </div>
        <div className="footer-mark">
          <Wordmark height={120} flat />
        </div>
        <div className="footer-cols">
          <div className="footer-brand">
            <Crest size={56} mode="idle" />
            <p className="mute">
              Kénitra’s PS5 arena on Rue de Chella. Open daily until 2 AM.
              <br />
              <span dir="rtl" lang="ar" className="footer-ar">
                العب. امسح. ارتقِ.
              </span>
            </p>
          </div>
          <div>
            <div className="hud-label">Play Pass</div>
            <Link to="/join">Create player</Link>
            <Link to="/scan">Scan a QR</Link>
            <Link to="/rewards">Rewards</Link>
            <Link to="/ranks">Leaderboard</Link>
          </div>
          <div>
            <div className="hud-label">Arena</div>
            <Link to="/map">Live map</Link>
            <Link to="/events">Tournaments</Link>
            <Link to="/arcade">Arcade</Link>
            <Link to="/staff">Staff console</Link>
          </div>
          <div>
            <div className="hud-label">Contact</div>
            <a href="tel:+212625804805">06 25 80 48 05</a>
            <a href="https://www.instagram.com/playlandkenitra/" target="_blank" rel="noreferrer">
              @playlandkenitra
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=34.26252,-6.588872" target="_blank" rel="noreferrer">
              Directions
            </a>
          </div>
        </div>
        <div className="footer-bottom mute">
          <span>© {new Date().getFullYear()} Play Land 59 · Kénitra</span>
          <span className="hud-num">GG · WP · SEE YOU AT THE DOOR</span>
        </div>
      </div>
    </footer>
  )
}
