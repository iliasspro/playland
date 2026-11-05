/* Tiny chiptune synth — every sound is generated with WebAudio, no assets. */

type Wave = OscillatorType

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = true
let lastHover = 0

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.32
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.ratio.value = 4
    master.connect(comp)
    comp.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function setSoundEnabled(on: boolean) {
  enabled = on
}
export function unlockAudio() {
  ac()
}

function tone(freq: number, dur: number, opts: { type?: Wave; vol?: number; delay?: number; slideTo?: number; attack?: number } = {}) {
  if (!enabled) return
  const a = ac()
  if (!a || !master) return
  const { type = 'square', vol = 0.25, delay = 0, slideTo, attack = 0.004 } = opts
  const t0 = a.currentTime + delay
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(master)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

function noise(dur: number, opts: { vol?: number; delay?: number; from?: number; to?: number; q?: number } = {}) {
  if (!enabled) return
  const a = ac()
  if (!a || !master) return
  const { vol = 0.2, delay = 0, from = 400, to = 4000, q = 1.2 } = opts
  const t0 = a.currentTime + delay
  const len = Math.max(1, Math.floor(a.sampleRate * dur))
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = a.createBufferSource()
  src.buffer = buf
  const f = a.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = q
  f.frequency.setValueAtTime(from, t0)
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.3)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(f)
  f.connect(g)
  g.connect(master)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
}

const N = (n: number) => 440 * Math.pow(2, (n - 69) / 12) // midi -> hz

export const sfx = {
  hover() {
    const t = performance.now()
    if (t - lastHover < 60) return
    lastHover = t
    tone(1760, 0.035, { type: 'square', vol: 0.035 })
  },
  click() {
    tone(N(84), 0.05, { type: 'square', vol: 0.09 })
    tone(N(91), 0.07, { type: 'square', vol: 0.07, delay: 0.035 })
  },
  back() {
    tone(N(79), 0.06, { type: 'square', vol: 0.08 })
    tone(N(72), 0.08, { type: 'square', vol: 0.07, delay: 0.04 })
  },
  tick() {
    tone(2400, 0.018, { type: 'square', vol: 0.06 })
  },
  coin() {
    tone(N(83), 0.07, { type: 'square', vol: 0.12 })
    tone(N(88), 0.32, { type: 'square', vol: 0.12, delay: 0.07 })
  },
  coins(count = 5) {
    for (let i = 0; i < count; i++) {
      tone(N(88 + (i % 3) * 2), 0.09, { type: 'square', vol: 0.06, delay: i * 0.055 })
    }
  },
  xp() {
    tone(N(76), 0.08, { type: 'triangle', vol: 0.18 })
    tone(N(83), 0.08, { type: 'triangle', vol: 0.18, delay: 0.06 })
    tone(N(88), 0.18, { type: 'triangle', vol: 0.18, delay: 0.12 })
  },
  scan() {
    tone(1568, 0.09, { type: 'square', vol: 0.12 })
    tone(2093, 0.14, { type: 'square', vol: 0.1, delay: 0.09 })
  },
  success() {
    ;[72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.16, { type: 'square', vol: 0.1, delay: i * 0.07 }))
    tone(N(88), 0.4, { type: 'triangle', vol: 0.16, delay: 0.3 })
  },
  levelUp() {
    const seq = [60, 64, 67, 72, 76, 79, 84]
    seq.forEach((n, i) => {
      tone(N(n), 0.14, { type: 'square', vol: 0.09, delay: i * 0.065 })
      tone(N(n + 12), 0.1, { type: 'triangle', vol: 0.06, delay: i * 0.065 + 0.02 })
    })
    ;[72, 76, 79].forEach((n) => tone(N(n), 0.9, { type: 'triangle', vol: 0.12, delay: 0.5, attack: 0.02 }))
    tone(N(36), 0.7, { type: 'sine', vol: 0.4, delay: 0.48, slideTo: N(24) })
    noise(0.8, { vol: 0.08, delay: 0.46, from: 8000, to: 600 })
  },
  achievement() {
    tone(N(79), 0.12, { type: 'triangle', vol: 0.18 })
    tone(N(84), 0.12, { type: 'triangle', vol: 0.18, delay: 0.1 })
    tone(N(91), 0.5, { type: 'triangle', vol: 0.16, delay: 0.2 })
    tone(N(96), 0.5, { type: 'sine', vol: 0.08, delay: 0.2 })
  },
  error() {
    tone(140, 0.14, { type: 'sawtooth', vol: 0.12 })
    tone(110, 0.22, { type: 'sawtooth', vol: 0.12, delay: 0.12 })
  },
  whoosh() {
    noise(0.45, { vol: 0.16, from: 300, to: 5000, q: 0.8 })
  },
  swipe() {
    noise(0.25, { vol: 0.1, from: 3000, to: 600, q: 0.7 })
  },
  start() {
    tone(N(48), 0.5, { type: 'sine', vol: 0.45, slideTo: N(36) })
    ;[67, 72, 79, 84].forEach((n, i) => tone(N(n), 0.22, { type: 'square', vol: 0.08, delay: 0.05 + i * 0.06 }))
    noise(0.6, { vol: 0.12, delay: 0.02, from: 6000, to: 300 })
  },
  boot(i: number) {
    tone(N(60 + i * 5), 0.06, { type: 'square', vol: 0.05 })
  },
  powerUp() {
    tone(N(55), 0.5, { type: 'square', vol: 0.06, slideTo: N(91) })
    tone(N(43), 0.5, { type: 'triangle', vol: 0.12, slideTo: N(79), delay: 0.02 })
  },
  kick() {
    tone(N(40), 0.12, { type: 'sine', vol: 0.5, slideTo: N(28) })
    noise(0.08, { vol: 0.12, from: 1200, to: 200 })
  },
  goal() {
    noise(1.2, { vol: 0.14, from: 500, to: 2600, q: 0.4 })
    ;[72, 76, 79, 84, 88].forEach((n, i) => tone(N(n), 0.18, { type: 'square', vol: 0.08, delay: 0.1 + i * 0.07 }))
  },
  save() {
    tone(N(52), 0.2, { type: 'sawtooth', vol: 0.1, slideTo: N(40) })
    noise(0.3, { vol: 0.08, from: 2000, to: 300 })
  },
  spinStop() {
    tone(N(84), 0.1, { type: 'square', vol: 0.1 })
    tone(N(91), 0.3, { type: 'square', vol: 0.1, delay: 0.09 })
  },
}

export type SfxName = keyof typeof sfx
