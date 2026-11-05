/* Deterministic randomness so mock data and avatars stay stable between reloads. */

export function hashString(str: string) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^= h >>> 16) >>> 0
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seeded(seed: string | number) {
  const r = mulberry32(typeof seed === 'number' ? seed : hashString(seed))
  return {
    next: r,
    int: (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min,
    pick: <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)],
    chance: (p: number) => r() < p,
  }
}

export function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4)
}

export function voucherCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += A[Math.floor(Math.random() * A.length)]
  return `PL-${s.slice(0, 4)}-${s.slice(4)}`
}
