import { motion } from 'motion/react'
import { Armchair, DoorClosed, Flame, Tv } from 'lucide-react'
import { Marquee, SectionHead, Tilt } from '../../components/ui/kit'
import { GAMES } from '../../data/games'
import { ShapeIcon } from '../../components/ui/icons'

export function Ticker() {
  const games = GAMES.map((g) => g.title.toUpperCase())
  const promos = ['OPEN TILL 2AM', 'VIP ROOMS', 'FRIDAY NIGHT CUP', 'SCAN · EARN · REDEEM', 'COFFEE ON TAP', 'DOUBLE XP MON–THU 14–18H', 'BIRTHDAY SQUAD PACKS']
  const shapes = ['tri', 'cir', 'crs', 'sqr'] as const
  return (
    <section className="ticker" aria-label="Games and highlights">
      <div className="ticker-band ticker-band--mint">
        <Marquee speed={46}>
          {games.map((g, i) => (
            <span key={g} className="ticker-item">
              {g}
              <ShapeIcon shape={shapes[i % 4]} size={22} className="ticker-shape" />
            </span>
          ))}
        </Marquee>
      </div>
      <div className="ticker-band ticker-band--crimson">
        <Marquee speed={38} reverse>
          {promos.map((p) => (
            <span key={p} className="ticker-item ticker-item--outline">
              {p}
              <span className="ticker-star">✦</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}

const ROOMS = [
  {
    id: 'red',
    name: 'The Red Room',
    kicker: 'Main arena',
    img: '/media/red-room.webp',
    desc: '8 PS5 stations under red light. 55" 4K screens, velvet thrones, and the loudest FC 26 rivalries in Kénitra.',
    stats: [
      ['Intensity', 0.95],
      ['Comfort', 0.8],
      ['Privacy', 0.25],
      ['Squad size', 0.7],
    ] as [string, number][],
    meta: [
      { icon: Tv, t: '8 stations' },
      { icon: Flame, t: 'Tournament floor' },
    ],
    price: '20 DH / h',
    color: 'var(--crimson)',
  },
  {
    id: 'lounge',
    name: 'The Lounge',
    kicker: 'Chill zone',
    img: '/media/lounge.webp',
    desc: 'Poster wall, deep red sofas, softer light. Story games, co-op nights and the “one more match” crowd.',
    stats: [
      ['Intensity', 0.55],
      ['Comfort', 0.95],
      ['Privacy', 0.45],
      ['Squad size', 0.6],
    ] as [string, number][],
    meta: [
      { icon: Tv, t: '4 stations' },
      { icon: Armchair, t: 'Sofa seating' },
    ],
    price: '15 DH / h',
    color: 'var(--mint-hi)',
  },
  {
    id: 'vip',
    name: 'VIP Rooms',
    kicker: 'Private',
    img: '/media/vip-room.webp',
    desc: 'Your squad, your door, your rules. 65" screen, sofa for four and zero spectators — book it from the Play Pass.',
    stats: [
      ['Intensity', 0.7],
      ['Comfort', 1],
      ['Privacy', 1],
      ['Squad size', 0.85],
    ] as [string, number][],
    meta: [
      { icon: DoorClosed, t: '2 private rooms' },
      { icon: Armchair, t: 'Up to 4 players' },
    ],
    price: '50 DH / h',
    color: 'var(--gold)',
  },
]

export function Arena() {
  return (
    <section className="section" id="arena">
      <div className="container">
        <SectionHead
          index="01"
          kicker="Select your arena"
          title={
            <>
              Three rooms. <span className="grad-crimson">One red glow.</span>
            </>
          }
          sub="Pick your vibe like you’d pick a character. Every room runs PS5 with the latest titles, and every hour you play feeds your Play Pass."
        />
        <div className="rooms">
          {ROOMS.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <Tilt className="room-tilt" max={9}>
                <article className="room hud brackets" style={{ ['--rc' as string]: r.color }} data-cursor="PLAY">
                  <div className="room-img">
                    <img src={r.img} alt={r.name} loading="lazy" />
                    <span className="room-num display">0{i + 1}</span>
                    <span className="room-kicker chip">{r.kicker}</span>
                  </div>
                  <div className="room-body">
                    <h3 className="display room-name">{r.name}</h3>
                    <p className="dim room-desc">{r.desc}</p>
                    <div className="room-stats">
                      {r.stats.map(([l, v]) => (
                        <div key={l} className="room-stat">
                          <span className="hud-label">{l}</span>
                          <span className="room-stat-bar">
                            {Array.from({ length: 10 }, (_, k) => (
                              <i key={k} className={k < Math.round(v * 10) ? 'on' : ''} style={{ transitionDelay: `${k * 30}ms` }} />
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="room-foot">
                      {r.meta.map((m) => (
                        <span key={m.t} className="room-meta">
                          <m.icon size={15} /> {m.t}
                        </span>
                      ))}
                      <span className="room-price hud-num">{r.price}</span>
                    </div>
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
