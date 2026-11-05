import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Activity, ActivityKind, Outcome, PlayerData, RewardLine, Settings, Voucher } from './types'
import { bumped, count, periodKey } from './counters'
import { dayKey, doubleXpWindow, now, prevWeekKey, setTimeOffset, weekKey } from '../lib/time'
import { uid, voucherCode } from '../lib/rng'
import { decodeCode, currentSlot } from '../lib/qr'
import { fx } from '../lib/fx'
import { setSoundEnabled } from '../lib/sfx'
import { levelFromXp, rankForLevel, xpForLevel } from '../data/ranks'
import { ACHIEVEMENTS } from '../data/achievements'
import { QUESTS } from '../data/quests'
import { REWARDS, rewardById } from '../data/rewards'
import { SECRETS } from '../data/quests'
import { STATIONS } from '../data/stations'
import { getEvents } from '../data/events'
import { ELITE_TRACK, FREE_TRACK, seasonTier } from '../data/season'
import { getFixtures } from '../data/fixtures'
import { squadById } from '../data/squads'

/* ------------------------------------------------------------------ */

export const SPIN_SEGMENTS = [
  { label: '15', unit: 'coins', coins: 15, weight: 24, color: '#0f2a2f' },
  { label: '50', unit: 'XP', xp: 50, weight: 20, color: '#1c5a55' },
  { label: '30', unit: 'coins', coins: 30, weight: 18, color: '#0f2a2f' },
  { label: '150', unit: 'XP', xp: 150, weight: 12, color: '#7a1029' },
  { label: '60', unit: 'coins', coins: 60, weight: 12, color: '#0f2a2f' },
  { label: 'FREE', unit: 'coffee', voucher: 'coffee', weight: 5, color: '#1c5a55' },
  { label: '100', unit: 'coins', coins: 100, weight: 7, color: '#0f2a2f' },
  { label: '500', unit: 'jackpot', coins: 500, weight: 2, color: '#b7791f' },
] as const

export type SpinSegment = (typeof SPIN_SEGMENTS)[number]

const PENALTY_SHOTS = 5

const blank = (): PlayerData => ({
  created: false,
  demo: false,
  id: '',
  tag: '',
  name: '',
  avatarSeed: 'player-one',
  favGame: 'fc26',
  squadId: null,
  frame: 'none',
  tagColor: 'default',
  joinedAt: 0,
  xp: 0,
  coins: 0,
  seasonXp: 0,
  coinsEarned: 0,
  coinsSpent: 0,
  counters: {},
  lastCheckinDay: null,
  weekStreak: 0,
  lastStreakWeek: null,
  bestStreak: 0,
  secrets: [],
  achievements: {},
  questClaims: {},
  vouchers: [],
  lastSpinDay: null,
  penalty: { day: null, shots: 0, goals: 0, best: 0 },
  predictions: {},
  seasonClaimed: [],
  eliteClaimed: [],
  elitePass: false,
  owned: [],
  activity: [],
})

/* A veteran profile so every screen has something to show. */
function demoPlayer(): PlayerData {
  const t = now()
  const D = 86400000
  let counters: Record<string, number> = {}
  const set = (key: string, period: 'day' | 'week' | 'season' | 'all', v: number) => {
    counters[`${key}@${periodKey(period)}`] = v
  }
  set('checkin', 'all', 64)
  set('checkin', 'season', 19)
  set('checkin', 'week', 2)
  set('session', 'all', 131)
  set('session', 'season', 14)
  set('session', 'week', 3)
  set('room:red', 'week', 2)
  set('room:red', 'all', 96)
  set('room:lounge', 'all', 31)
  set('room:vip', 'all', 4)
  set('coffee', 'all', 17)
  set('coffee', 'week', 1)
  set('friend', 'all', 2)
  set('night', 'all', 5)
  set('morning', 'all', 1)
  set('spin', 'all', 41)
  set('event', 'all', 3)
  set('xp', 'week', 1960)
  set('xp', 'season', 4630)
  counters = { ...counters }
  const xp = xpForLevel(23) + 890 // 90 XP short of level 24 — first scan levels up
  return {
    ...blank(),
    created: true,
    demo: true,
    id: 'demo-noor',
    tag: 'NeonNoor',
    name: 'Noor',
    avatarSeed: 'NeonNoor',
    favGame: 'fc26',
    squadId: 'sharks',
    frame: 'neon',
    tagColor: 'default',
    joinedAt: t - 182 * D,
    xp,
    coins: 1840,
    seasonXp: 4630,
    coinsEarned: 7420,
    coinsSpent: 5580,
    counters,
    lastCheckinDay: dayKey(t - D),
    weekStreak: 6,
    lastStreakWeek: weekKey(t),
    bestStreak: 9,
    secrets: ['ghost', 'brew'],
    achievements: {
      'first-spawn': t - 180 * D,
      regular: t - 150 * D,
      loyalist: t - 30 * D,
      'night-owl': t - 120 * D,
      'early-bird': t - 90 * D,
      'on-fire': t - 70 * D,
      'squad-goals': t - 160 * D,
      'going-pro': t - 40 * D,
      vip: t - 20 * D,
      'high-roller': t - 9 * D,
    },
    questClaims: {},
    vouchers: [
      { id: uid('v'), rewardId: 'coffee', code: 'PL-7KQ2-M9XD', at: t - 1 * D, status: 'active' },
      { id: uid('v'), rewardId: 'hour', code: 'PL-3TRB-WN4P', at: t - 12 * D, status: 'used' },
    ],
    lastSpinDay: dayKey(t - D),
    penalty: { day: dayKey(t - D), shots: 5, goals: 4, best: 4 },
    seasonClaimed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    owned: ['frame:neon'],
    activity: [
      { id: uid('a'), kind: 'checkin', title: 'Checked in · Red Room', xp: 100, coins: 62, at: t - D - 3 * 3600000 },
      { id: uid('a'), kind: 'session', title: '2h session · R4 · FC 26', xp: 120, coins: 74, at: t - D - 1 * 3600000 },
      { id: uid('a'), kind: 'coffee', title: 'Coffee scanned', xp: 15, coins: 12, at: t - D - 2 * 3600000 },
      { id: uid('a'), kind: 'redeem', title: 'Redeemed · Free Coffee', coins: -300, at: t - D - 30 * 60000 },
      { id: uid('a'), kind: 'quest', title: 'Quest · Caffeine Combo', xp: 100, coins: 80, at: t - 2 * D },
      { id: uid('a'), kind: 'spin', title: 'Lucky Spin · +60 coins', coins: 60, at: t - 2 * D - 3600000 },
      { id: uid('a'), kind: 'achievement', title: 'Achievement · High Roller', xp: 700, at: t - 9 * D },
    ],
  }
}

/* ------------------------------------------------------------------ */

interface Store extends PlayerData {
  settings: Settings
  createPlayer: (p: { tag: string; name?: string; avatarSeed: string; favGame: string; squadId: string | null }) => void
  loadDemo: () => void
  resetAll: () => void
  scan: (raw: string) => Outcome
  claimQuest: (id: string) => Outcome | null
  redeem: (rewardId: string) => { ok: boolean; voucher?: Voucher; error?: string }
  markVoucherUsed: (id: string) => void
  spin: () => { index: number; segment: SpinSegment } | null
  penaltyShot: (goal: boolean) => { shots: number; goals: number; done: boolean }
  predict: (fixtureId: string, home: number, away: number) => void
  settlePredictions: () => Outcome
  claimSeason: (track: 'free' | 'elite', tier: number) => boolean
  buyElite: () => void
  joinSquad: (id: string | null) => void
  updateProfile: (p: Partial<Pick<PlayerData, 'tag' | 'name' | 'avatarSeed' | 'favGame' | 'frame' | 'tagColor'>>) => void
  toggleSound: () => void
  timeTravel: (days: number) => void
  grant: (xp: number, coins: number, label?: string) => void
  winCup: () => void
}

type Draft = PlayerData

const pctLabel = (m: number) => `+${Math.round((m - 1) * 100)}%`

export function streakMultiplier(weeks: number) {
  if (weeks >= 8) return 1.5
  if (weeks >= 4) return 1.25
  if (weeks >= 2) return 1.1
  return 1
}

function log(d: Draft, kind: ActivityKind, title: string, xp?: number, coins?: number) {
  const a: Activity = { id: uid('a'), kind, title, xp, coins, at: now() }
  d.activity = [a, ...d.activity].slice(0, 80)
}

/** apply multipliers & produce receipt lines */
function boosted(d: Draft, base: { xp: number; coins: number }, label: string, opts: { doubleXp?: boolean; streak?: boolean; rank?: boolean }) {
  const lines: RewardLine[] = [{ label, xp: base.xp, coins: base.coins }]
  let xp = base.xp
  let coins = base.coins
  if (opts.doubleXp && doubleXpWindow().active) {
    lines.push({ label: 'Double XP hours ×2', xp: base.xp, tone: 'mint' })
    xp += base.xp
  }
  if (opts.streak) {
    const m = streakMultiplier(d.weekStreak)
    if (m > 1) {
      const extra = Math.round(base.coins * (m - 1))
      lines.push({ label: `${d.weekStreak}-week streak ${pctLabel(m)}`, coins: extra, tone: 'crimson' })
      coins += extra
    }
  }
  if (opts.rank) {
    const rank = rankForLevel(levelFromXp(d.xp))
    if (rank.bonus > 0) {
      const extra = Math.max(1, Math.round(base.coins * rank.bonus))
      lines.push({ label: `${rank.name} rank bonus +${Math.round(rank.bonus * 100)}%`, coins: extra, tone: 'gold' })
      coins += extra
    }
  }
  return { xp, coins, lines }
}

function addXp(d: Draft, xp: number) {
  d.xp += xp
  d.seasonXp += xp
  d.counters = bumped(d.counters, 'xp', xp)
}
function addCoins(d: Draft, coins: number) {
  d.coins += coins
  if (coins > 0) d.coinsEarned += coins
}

const fail = (kind: string, title: string, error: string): Outcome => ({ ok: false, kind, title, error, lines: [], total: { xp: 0, coins: 0 } })

export const usePlayer = create<Store>()(
  persist(
    (set, get) => {
      /** run a mutation on a draft copy, then detect achievements + level ups and fire FX */
      const commit = (mutate: (d: Draft) => void, fxOpts: { xp?: number; coins?: number; quiet?: boolean; delayLevel?: number } = {}) => {
        const prev = get()
        const d: Draft = structuredClone(stripActions(prev))
        const levelBefore = levelFromXp(prev.xp)
        mutate(d)
        // achievements
        const unlocked: string[] = []
        for (const a of ACHIEVEMENTS) {
          if (d.achievements[a.id]) continue
          const [cur, target] = a.progress(d)
          if (cur >= target) {
            d.achievements = { ...d.achievements, [a.id]: now() }
            addXp(d, a.xp)
            log(d, 'achievement', `Achievement · ${a.name}`, a.xp)
            unlocked.push(a.id)
          }
        }
        const levelAfter = levelFromXp(d.xp)
        if (levelAfter > levelBefore) log(d, 'levelup', `Reached level ${levelAfter}`)
        set(d)
        // ---- fx
        if (!fxOpts.quiet) {
          const p = fx.pointer()
          if (fxOpts.coins && fxOpts.coins > 0) fx.emit({ type: 'coins', amount: fxOpts.coins, x: p.x, y: p.y })
          if (fxOpts.xp && fxOpts.xp > 0) fx.emit({ type: 'xp', amount: fxOpts.xp, x: p.x, y: p.y })
        }
        unlocked.forEach((id, i) => setTimeout(() => fx.emit({ type: 'achievement', id }), 700 + i * 900))
        if (levelAfter > levelBefore) {
          const rankUp = rankForLevel(levelAfter).id !== rankForLevel(levelBefore).id
          setTimeout(
            () => fx.emit({ type: 'levelup', level: levelAfter, rankId: rankForLevel(levelAfter).id, rankUp }),
            fxOpts.delayLevel ?? 900 + unlocked.length * 300,
          )
        }
      }

      return {
        ...blank(),
        settings: { sound: true, timeOffset: 0 },

        createPlayer: ({ tag, name, avatarSeed, favGame, squadId }) => {
          set({ ...blank() })
          commit(
            (d) => {
              d.created = true
              d.demo = false
              d.id = uid('p')
              d.tag = tag
              d.name = name ?? tag
              d.avatarSeed = avatarSeed
              d.favGame = favGame
              d.squadId = squadId
              d.joinedAt = now()
              addCoins(d, 500)
              log(d, 'welcome', 'Welcome bonus · Play Pass activated', 0, 500)
            },
            { quiet: true },
          )
        },

        loadDemo: () => set({ ...demoPlayer() }),

        resetAll: () => set({ ...blank() }),

        scan: (raw) => {
          const s = get()
          const code = decodeCode(raw)
          if (!code) return fail('unknown', 'Unknown code', 'That QR isn’t a Play Land code. Look for the crest.')
          if (!s.created) return fail('nopass', 'No Play Pass yet', 'Create your player first — it takes 20 seconds.')
          const t = now()
          const today = dayKey(t)
          const hour = new Date(t).getHours()

          if (code.kind === 'voucher') return fail('staff', 'Staff-only code', 'Vouchers are validated by the crew at the counter.')

          if (code.kind === 'checkin') {
            if (code.slot != null && Math.abs(currentSlot() - code.slot) > 20)
              return fail('expired', 'Code expired', 'This entrance code already rotated. Scan the live screen at the counter.')
            if (s.lastCheckinDay === today)
              return fail('already', 'Already checked in', 'One check-in per day. Scan your station to keep earning XP while you play.')
            let out: Outcome = fail('x', '', '')
            commit(
              (d) => {
                // weekly streak
                const wk = weekKey(t)
                if (d.lastStreakWeek !== wk) {
                  d.weekStreak = d.lastStreakWeek === prevWeekKey(t) ? d.weekStreak + 1 : 1
                  d.lastStreakWeek = wk
                  d.bestStreak = Math.max(d.bestStreak, d.weekStreak)
                }
                d.lastCheckinDay = today
                const r = boosted(d, { xp: 100, coins: 50 }, 'Daily check-in', { doubleXp: true, streak: true, rank: true })
                addXp(d, r.xp)
                addCoins(d, r.coins)
                d.counters = bumped(d.counters, 'checkin')
                if (doubleXpWindow(t).active) d.counters = bumped(d.counters, 'offpeak')
                if (hour < 5) d.counters = bumped(d.counters, 'night')
                if (hour >= 6 && hour < 12) d.counters = bumped(d.counters, 'morning')
                log(d, 'checkin', 'Checked in at the arena', r.xp, r.coins)
                out = {
                  ok: true,
                  kind: 'checkin',
                  title: 'Checked in!',
                  subtitle: `Week streak · ${d.weekStreak} 🔥`,
                  lines: r.lines,
                  total: { xp: r.xp, coins: r.coins },
                }
              },
              { delayLevel: 2900 },
            )
            return out
          }

          if (code.kind === 'session') {
            const st = STATIONS.find((x) => x.id === code.station)
            if (!st) return fail('unknown', 'Unknown station', `Station ${code.station} doesn’t exist.`)
            if (count(s, 'session', 'day') >= 6) return fail('cap', 'Daily cap reached', 'Six hours logged today — go touch some grass, champ.')
            let out: Outcome = fail('x', '', '')
            commit(
              (d) => {
                const r = boosted(d, { xp: 60, coins: 30 }, `1h session · ${st.label}`, { doubleXp: true, rank: true })
                addXp(d, r.xp)
                addCoins(d, r.coins)
                d.counters = bumped(d.counters, 'session')
                d.counters = bumped(d.counters, `room:${st.room}`)
                log(d, 'session', `1h session · ${st.label}`, r.xp, r.coins)
                out = { ok: true, kind: 'session', title: 'Session logged', subtitle: `Station ${st.label}`, lines: r.lines, total: { xp: r.xp, coins: r.coins } }
              },
              { delayLevel: 2900 },
            )
            return out
          }

          if (code.kind === 'coffee') {
            if (count(s, 'coffee', 'day') >= 3) return fail('cap', 'Easy there', 'Three coffees a day is the limit for coins. Hydrate!')
            let out: Outcome = fail('x', '', '')
            commit(
              (d) => {
                const r = boosted(d, { xp: 15, coins: 10 }, 'Coffee scanned', { rank: true })
                addXp(d, r.xp)
                addCoins(d, r.coins)
                d.counters = bumped(d.counters, 'coffee')
                log(d, 'coffee', 'Coffee scanned', r.xp, r.coins)
                out = { ok: true, kind: 'coffee', title: 'Fuel up!', subtitle: 'Coffee machine bonus', lines: r.lines, total: { xp: r.xp, coins: r.coins } }
              },
              { delayLevel: 2900 },
            )
            return out
          }

          if (code.kind === 'event') {
            const ev = getEvents().find((e) => e.id === code.eventId)
            if (!ev) return fail('unknown', 'Unknown event', 'This event code is not active.')
            if (count(s, `event:${ev.id}`, 'day') > 0) return fail('already', 'Already registered', `You’re checked in for ${ev.title}.`)
            let out: Outcome = fail('x', '', '')
            commit(
              (d) => {
                const r = boosted(d, { xp: ev.xp, coins: ev.coins }, `Event check-in · ${ev.short}`, { doubleXp: false, rank: true })
                addXp(d, r.xp)
                addCoins(d, r.coins)
                d.counters = bumped(d.counters, 'event')
                d.counters = bumped(d.counters, `event:${ev.id}`)
                log(d, 'event', `Event · ${ev.title}`, r.xp, r.coins)
                out = { ok: true, kind: 'event', title: 'You’re in!', subtitle: ev.title, lines: r.lines, total: { xp: r.xp, coins: r.coins } }
              },
              { delayLevel: 2900 },
            )
            return out
          }

          if (code.kind === 'secret') {
            const sec = SECRETS.find((x) => x.id === code.secretId)
            if (!sec) return fail('unknown', 'Nice try', 'That secret doesn’t exist… or does it?')
            if (s.secrets.includes(sec.id)) return fail('already', 'Already found', 'You already cracked this one. 4 more are hiding.')
            let out: Outcome = fail('x', '', '')
            commit(
              (d) => {
                d.secrets = [...d.secrets, sec.id]
                const r = { xp: 250, coins: 150 }
                addXp(d, r.xp)
                addCoins(d, r.coins)
                d.counters = bumped(d.counters, 'secret')
                log(d, 'secret', `Secret found · ${d.secrets.length}/5`, r.xp, r.coins)
                out = {
                  ok: true,
                  kind: 'secret',
                  title: 'Secret found!',
                  subtitle: `${d.secrets.length} of 5 hidden codes`,
                  lines: [{ label: 'Hidden QR discovered', xp: r.xp, coins: r.coins }],
                  total: r,
                }
              },
              { delayLevel: 2900 },
            )
            return out
          }

          if (code.kind === 'friend') {
            if (code.tag.toLowerCase() === s.tag.toLowerCase()) return fail('self', 'That’s you!', 'Scan a friend’s Play Pass, not your own.')
            if (count(s, `friend:${code.tag.toLowerCase()}`, 'week') > 0) return fail('already', 'Already squadded', `You and ${code.tag} already earned this week.`)
            let out: Outcome = fail('x', '', '')
            commit(
              (d) => {
                const r = { xp: 150, coins: 100 }
                addXp(d, r.xp)
                addCoins(d, r.coins)
                d.counters = bumped(d.counters, 'friend')
                d.counters = bumped(d.counters, `friend:${code.tag.toLowerCase()}`)
                log(d, 'friend', `Squad check-in with ${code.tag}`, r.xp, r.coins)
                out = { ok: true, kind: 'friend', title: 'Squad bonus!', subtitle: `You + ${code.tag}`, lines: [{ label: 'Played together', xp: r.xp, coins: r.coins }], total: r }
              },
              { delayLevel: 2900 },
            )
            return out
          }
          return fail('unknown', 'Unknown code', 'Unrecognised Play Land code.')
        },

        claimQuest: (id) => {
          const s = get()
          const q = QUESTS.find((x) => x.id === id)
          if (!q) return null
          const key = `${q.id}@${periodKey(q.period)}`
          if (s.questClaims[key]) return null
          if (q.progress(s) < q.target) return null
          commit(
            (d) => {
              d.questClaims = { ...d.questClaims, [key]: now() }
              addXp(d, q.reward.xp)
              addCoins(d, q.reward.coins)
              log(d, 'quest', `Quest · ${q.title}`, q.reward.xp, q.reward.coins)
            },
            { xp: q.reward.xp, coins: q.reward.coins },
          )
          return { ok: true, kind: 'quest', title: q.title, lines: [], total: q.reward }
        },

        redeem: (rewardId) => {
          const s = get()
          const r = rewardById(rewardId)
          if (!r) return { ok: false, error: 'Unknown reward' }
          if (r.minLevel && levelFromXp(s.xp) < r.minLevel) return { ok: false, error: `Unlocks at level ${r.minLevel}` }
          if (s.coins < r.cost) return { ok: false, error: `You need ${r.cost - s.coins} more coins` }
          const voucher: Voucher = { id: uid('v'), rewardId, code: voucherCode(), at: now(), status: 'active' }
          commit((d) => {
            d.coins -= r.cost
            d.coinsSpent += r.cost
            d.counters = bumped(d.counters, 'redeem')
            if (r.kind === 'digital') {
              voucher.status = 'used'
              if (rewardId === 'frame') {
                d.frame = 'neon'
                d.owned = [...new Set([...d.owned, 'frame:neon'])]
              }
              if (rewardId === 'tagcolor') {
                d.tagColor = 'crimson'
                d.owned = [...new Set([...d.owned, 'tag:crimson'])]
              }
            }
            d.vouchers = [voucher, ...d.vouchers]
            log(d, 'redeem', `Redeemed · ${r.name}`, undefined, -r.cost)
          })
          return { ok: true, voucher }
        },

        markVoucherUsed: (id) =>
          set((s) => ({ vouchers: s.vouchers.map((v) => (v.id === id ? { ...v, status: 'used' as const } : v)) })),

        spin: () => {
          const s = get()
          const today = dayKey()
          if (s.lastSpinDay === today) return null
          const total = SPIN_SEGMENTS.reduce((a, b) => a + b.weight, 0)
          let roll = Math.random() * total
          let index = 0
          for (let i = 0; i < SPIN_SEGMENTS.length; i++) {
            roll -= SPIN_SEGMENTS[i].weight
            if (roll <= 0) {
              index = i
              break
            }
          }
          const seg = SPIN_SEGMENTS[index]
          // reward is applied after the wheel animation via a timeout so the HUD doesn't spoil it
          set({ lastSpinDay: today })
          setTimeout(() => {
            commit(
              (d) => {
                d.counters = bumped(d.counters, 'spin')
                const sx = 'xp' in seg ? seg.xp : 0
                const sc = 'coins' in seg ? seg.coins : 0
                if (sx) addXp(d, sx)
                if (sc) addCoins(d, sc)
                if ('voucher' in seg) {
                  d.vouchers = [{ id: uid('v'), rewardId: seg.voucher, code: voucherCode(), at: now(), status: 'active' }, ...d.vouchers]
                }
                if (seg.unit === 'jackpot') d.counters = bumped(d.counters, 'jackpot')
                log(d, 'spin', `Lucky Spin · ${seg.label} ${seg.unit}`, sx || undefined, sc || undefined)
              },
              { xp: 'xp' in seg ? seg.xp : 0, coins: 'coins' in seg ? seg.coins : 0 },
            )
          }, 5200)
          return { index, segment: seg }
        },

        penaltyShot: (goal) => {
          const s = get()
          const today = dayKey()
          const p = s.penalty.day === today ? s.penalty : { ...s.penalty, day: today, shots: 0, goals: 0 }
          if (p.shots >= PENALTY_SHOTS) return { shots: p.shots, goals: p.goals, done: true }
          const shots = p.shots + 1
          const goals = p.goals + (goal ? 1 : 0)
          const done = shots >= PENALTY_SHOTS
          const perfect = done && goals === PENALTY_SHOTS
          const coins = (goal ? 10 : 0) + (perfect ? 50 : 0)
          commit(
            (d) => {
              d.penalty = { day: today, shots, goals, best: done ? Math.max(d.penalty.best, goals) : d.penalty.best }
              d.counters = bumped(d.counters, 'penalty')
              if (coins) addCoins(d, coins)
              if (done) log(d, 'penalty', `Penalty King · ${goals}/5${perfect ? ' · PERFECT' : ''}`, undefined, goals * 10 + (perfect ? 50 : 0))
            },
            { coins, quiet: !goal },
          )
          return { shots, goals, done }
        },

        predict: (fixtureId, home, away) => {
          const s = get()
          const first = !s.predictions[fixtureId]
          commit(
            (d) => {
              d.predictions = { ...d.predictions, [fixtureId]: { home, away, at: now() } }
              if (first) {
                d.counters = bumped(d.counters, 'prono')
                log(d, 'prono', `Prediction locked · ${home}–${away}`)
              }
            },
            { quiet: true },
          )
        },

        settlePredictions: () => {
          const s = get()
          const fixtures = getFixtures()
          const lines: RewardLine[] = []
          let coins = 0
          let exact = 0
          for (const f of fixtures) {
            const p = s.predictions[f.id]
            if (!p) continue
            // mock result: biased towards the user's pick so the demo feels rewarding
            const r = Math.random()
            const home = r < 0.35 ? p.home : Math.max(0, p.home + (Math.random() < 0.5 ? -1 : 1))
            const away = r < 0.35 ? p.away : Math.max(0, p.away + (Math.random() < 0.5 ? 0 : 1))
            const sign = (a: number, b: number) => Math.sign(a - b)
            if (home === p.home && away === p.away) {
              lines.push({ label: `${f.homeShort} ${home}–${away} ${f.awayShort} · exact score`, coins: 200, tone: 'gold' })
              coins += 200
              exact++
            } else if (sign(home, away) === sign(p.home, p.away)) {
              lines.push({ label: `${f.homeShort} ${home}–${away} ${f.awayShort} · right result`, coins: 50 })
              coins += 50
            } else {
              lines.push({ label: `${f.homeShort} ${home}–${away} ${f.awayShort} · missed`, coins: 0, tone: 'crimson' })
            }
          }
          if (!lines.length) return fail('none', 'No predictions', 'Lock in a prediction first.')
          commit(
            (d) => {
              d.predictions = {}
              addCoins(d, coins)
              if (exact) d.counters = bumped(d.counters, 'prono-exact', exact)
              log(d, 'prono', `Predictions settled · +${coins} coins`, undefined, coins)
            },
            { coins },
          )
          return { ok: true, kind: 'prono', title: 'Results are in', lines, total: { xp: 0, coins } }
        },

        claimSeason: (track, tier) => {
          const s = get()
          const reached = seasonTier(s.seasonXp)
          if (tier > reached) return false
          if (track === 'elite' && !s.elitePass) return false
          const claimed = track === 'free' ? s.seasonClaimed : s.eliteClaimed
          if (claimed.includes(tier)) return false
          const reward = (track === 'free' ? FREE_TRACK : ELITE_TRACK)[tier - 1]
          commit(
            (d) => {
              if (track === 'free') d.seasonClaimed = [...d.seasonClaimed, tier]
              else d.eliteClaimed = [...d.eliteClaimed, tier]
              if (reward.xp) addXp(d, reward.xp)
              if (reward.coins) addCoins(d, reward.coins)
              if (reward.special) {
                d.vouchers = [{ id: uid('v'), rewardId: `season:${reward.label}`, code: voucherCode(), at: now(), status: 'active' }, ...d.vouchers]
              }
              log(d, 'season', `Season tier ${tier} · ${reward.label}`, reward.xp, reward.coins)
            },
            { xp: reward.xp ?? 0, coins: reward.coins ?? 0 },
          )
          return true
        },

        buyElite: () => {
          set({ elitePass: true })
          fx.emit({ type: 'confetti', colors: ['#ffc83d', '#ff2d4e', '#5ff3da'] })
          fx.toast('Elite Pass unlocked', 'Every Elite reward you already reached is ready to claim.', 'gold')
        },

        joinSquad: (id) => {
          commit((d) => {
            d.squadId = id
            if (id) log(d, 'bonus', `Joined ${squadById(id)?.name ?? 'a squad'}`)
          })
        },

        updateProfile: (p) => set(p),

        toggleSound: () =>
          set((s) => {
            setSoundEnabled(!s.settings.sound)
            return { settings: { ...s.settings, sound: !s.settings.sound } }
          }),

        timeTravel: (days) =>
          set((s) => {
            const timeOffset = s.settings.timeOffset + days * 86400000
            setTimeOffset(timeOffset)
            return { settings: { ...s.settings, timeOffset } }
          }),

        grant: (xp, coins, label = 'Crew bonus') => {
          commit(
            (d) => {
              addXp(d, xp)
              addCoins(d, coins)
              log(d, 'bonus', label, xp || undefined, coins || undefined)
            },
            { xp, coins },
          )
        },

        winCup: () => {
          commit(
            (d) => {
              addXp(d, 1000)
              addCoins(d, 2000)
              d.counters = bumped(d.counters, 'win')
              log(d, 'event', 'Champion · FC 26 Friday Night Cup', 1000, 2000)
            },
            { xp: 1000, coins: 2000 },
          )
          fx.emit({ type: 'confetti' })
        },
      }
    },
    {
      name: 'playland-pass-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => stripActions(s),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeOffset(state.settings?.timeOffset ?? 0)
          setSoundEnabled(state.settings?.sound ?? true)
        }
      },
    },
  ),
)

function stripActions(s: Store): PlayerData & { settings: Settings } {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(s)) if (typeof v !== 'function') out[k] = v
  return out as unknown as PlayerData & { settings: Settings }
}

/* ---------- derived selectors ---------- */
export const useLevel = () => usePlayer((s) => levelFromXp(s.xp))
export const questKey = (id: string, period: Parameters<typeof periodKey>[0]) => `${id}@${periodKey(period)}`
export const REWARD_IDS = REWARDS.map((r) => r.id)
