/* Global celebration bus — the store emits, the FX layer renders. */

export type FxTone = 'mint' | 'crimson' | 'gold'

export type FxEvent =
  | { type: 'xp'; amount: number; x?: number; y?: number }
  | { type: 'coins'; amount: number; x?: number; y?: number }
  | { type: 'levelup'; level: number; rankId: string; rankUp: boolean }
  | { type: 'achievement'; id: string }
  | { type: 'toast'; title: string; body?: string; tone?: FxTone; icon?: string }
  | { type: 'confetti'; colors?: string[] }
  | { type: 'shake' }

type Listener = (e: FxEvent) => void
const listeners = new Set<Listener>()

let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (e) => {
      lastPointer = { x: e.clientX, y: e.clientY }
    },
    { capture: true, passive: true },
  )
}

export const fx = {
  emit(e: FxEvent) {
    listeners.forEach((l) => l(e))
  },
  on(l: Listener) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
  pointer() {
    return lastPointer
  },
  toast(title: string, body?: string, tone: FxTone = 'mint', icon?: string) {
    fx.emit({ type: 'toast', title, body, tone, icon })
  },
}
