/* All time flows through now() so the demo panel can "time travel". */

let offsetMs = 0
export function setTimeOffset(ms: number) {
  offsetMs = ms
}
export function now() {
  return Date.now() + offsetMs
}
export function nowDate() {
  return new Date(now())
}

const pad = (n: number) => String(n).padStart(2, '0')

export function dayKey(t = now()) {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** ISO week key, e.g. W2026-41 */
export function weekKey(t = now()) {
  const d = new Date(t)
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `W${date.getUTCFullYear()}-${pad(week)}`
}

export function prevWeekKey(t = now()) {
  return weekKey(t - 7 * 86400000)
}

export function endOfDay(t = now()) {
  const d = new Date(t)
  d.setHours(24, 0, 0, 0)
  return d.getTime()
}

export function endOfWeek(t = now()) {
  const d = new Date(t)
  const day = d.getDay() || 7 // monday=1 .. sunday=7
  d.setDate(d.getDate() + (8 - day))
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function splitDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

export function fmtCountdown(ms: number, withDays = true) {
  const { d, h, m, s } = splitDuration(ms)
  if (withDays && d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`
  return `${pad(h + (withDays ? 0 : d * 24))}:${pad(m)}:${pad(s)}`
}

export function timeAgo(t: number) {
  const diff = Math.max(0, now() - t)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function fmtTime(t: number) {
  return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDate(t: number, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Date(t).toLocaleDateString('en-GB', opts)
}

/** Next occurrence of a weekday (0=Sun..6=Sat) at hh:mm, strictly in the future */
export function nextWeekday(weekday: number, hh: number, mm = 0, from = now()) {
  const d = new Date(from)
  const diff = (weekday - d.getDay() + 7) % 7
  d.setDate(d.getDate() + diff)
  d.setHours(hh, mm, 0, 0)
  if (d.getTime() <= from) d.setDate(d.getDate() + 7)
  return d.getTime()
}

/** Double XP happy hours: Mon–Thu 14:00–18:00 */
export function doubleXpWindow(t = now()) {
  const d = new Date(t)
  const day = d.getDay()
  const isWeekday = day >= 1 && day <= 4
  const start = new Date(d)
  start.setHours(14, 0, 0, 0)
  const end = new Date(d)
  end.setHours(18, 0, 0, 0)
  const active = isWeekday && t >= start.getTime() && t < end.getTime()
  if (active) return { active: true, endsAt: end.getTime(), startsAt: start.getTime() }
  // find the next window
  for (let i = 0; i < 8; i++) {
    const c = new Date(d)
    c.setDate(d.getDate() + i)
    c.setHours(14, 0, 0, 0)
    const cd = c.getDay()
    if (cd >= 1 && cd <= 4 && c.getTime() > t) return { active: false, startsAt: c.getTime(), endsAt: c.getTime() + 4 * 3600000 }
  }
  return { active: false, startsAt: t, endsAt: t }
}
