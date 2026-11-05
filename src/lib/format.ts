export const fmt = (n: number) => Math.round(n).toLocaleString('en-US')
export const fmtCompact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 10_000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K` : fmt(n)
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const plural = (n: number, w: string, p = w + 's') => `${fmt(n)} ${n === 1 ? w : p}`
