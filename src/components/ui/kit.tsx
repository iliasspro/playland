import { forwardRef, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { animate, AnimatePresence, motion, useInView } from 'motion/react'
import { X } from 'lucide-react'
import { sfx } from '../../lib/sfx'
import { fmt } from '../../lib/format'
import { now, splitDuration } from '../../lib/time'
import { PixelAvatar } from './PixelAvatar'
import type { FrameId } from '../../store/types'
import './kit.css'

/* ------------------------------------------------------------------ Button */

type BtnProps = {
  to?: string
  href?: string
  onClick?: (e: React.MouseEvent) => void
  variant?: 'primary' | 'crimson' | 'gold' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconRight?: ReactNode
  block?: boolean
  disabled?: boolean
  magnetic?: boolean
  className?: string
  children?: ReactNode
  type?: 'button' | 'submit'
  silent?: boolean
  target?: string
}

export function Btn({ to, href, onClick, variant = 'primary', size = 'md', icon, iconRight, block, disabled, magnetic, className = '', children, type = 'button', silent, target }: BtnProps) {
  const wrap = useRef<HTMLSpanElement>(null)
  const cls = `btn ${variant === 'primary' ? '' : variant} ${size === 'md' ? '' : size} ${block ? 'block' : ''} ${className}`
  const inner = (
    <span className="btn-in">
      {icon}
      {children && <span>{children}</span>}
      {iconRight}
    </span>
  )
  const handlers = {
    onMouseEnter: () => !silent && sfx.hover(),
    onClick: (e: React.MouseEvent) => {
      if (disabled) {
        e.preventDefault()
        sfx.error()
        return
      }
      if (!silent) sfx.click()
      onClick?.(e)
    },
  }
  const onMove = (e: React.PointerEvent) => {
    if (!magnetic || !wrap.current) return
    const r = wrap.current.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.22
    const y = (e.clientY - r.top - r.height / 2) * 0.3
    wrap.current.style.transform = `translate(${x}px, ${y}px)`
  }
  const onLeave = () => {
    if (wrap.current) wrap.current.style.transform = ''
  }
  let el: ReactNode
  if (to)
    el = (
      <Link to={to} className={cls} aria-disabled={disabled} {...handlers}>
        {inner}
      </Link>
    )
  else if (href)
    el = (
      <a href={href} className={cls} target={target} rel={target ? 'noreferrer' : undefined} {...handlers}>
        {inner}
      </a>
    )
  else
    el = (
      <button type={type} className={cls} disabled={disabled} {...handlers}>
        {inner}
      </button>
    )
  return (
    <span ref={wrap} className={`btn-wrap ${block ? 'block' : ''} ${magnetic ? 'magnetic' : ''}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {el}
    </span>
  )
}

/* ------------------------------------------------------------------ Counter */

export function Counter({ value, from, duration = 1.1, format = fmt, className, style, onView = false }: { value: number; from?: number; duration?: number; format?: (n: number) => string; className?: string; style?: CSSProperties; onView?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const prev = useRef<number | null>(from ?? (onView ? 0 : null))
  useEffect(() => {
    if (onView && !inView) return
    const start = prev.current ?? value
    prev.current = value
    if (start === value) {
      if (ref.current) ref.current.textContent = format(value)
      return
    }
    const c = animate(start, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v)
      },
    })
    return () => c.stop()
  }, [value, inView]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span ref={ref} className={className} style={style}>
      {format(onView ? (from ?? 0) : (prev.current ?? value))}
    </span>
  )
}

/* ------------------------------------------------------------------ Scramble */

const GLYPH_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$▲●■✕<>/\\'

export function Scramble({ text, className, style, delay = 0, speed = 32, as: Tag = 'span' }: { text: string; className?: string; style?: CSSProperties; delay?: number; speed?: number; as?: 'span' | 'div' | 'h2' | 'h3' | 'p' }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-5% 0px' })
  const [out, setOut] = useState(text.replace(/[^\s]/g, ' '))
  useEffect(() => {
    if (!inView) return
    let frame = 0
    let raf = 0
    const startAt = performance.now() + delay
    const tick = (t: number) => {
      if (t < startAt) {
        raf = requestAnimationFrame(tick)
        return
      }
      const elapsed = t - startAt
      const resolved = Math.floor(elapsed / speed)
      frame++
      let s = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch === ' ' || i < resolved) s += ch
        else if (i < resolved + 6) s += GLYPH_SET[(i * 7 + frame) % GLYPH_SET.length]
        else s += ' '
      }
      setOut(s)
      if (resolved < text.length) raf = requestAnimationFrame(tick)
      else setOut(text)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, text, delay, speed])
  const T = Tag as 'span'
  return (
    <T ref={ref as React.Ref<HTMLSpanElement>} className={className} style={style} aria-label={text}>
      <span aria-hidden>{out}</span>
    </T>
  )
}

/* ------------------------------------------------------------------ Countdown */

export function useNow(interval = 1000) {
  const [t, setT] = useState(now())
  useEffect(() => {
    const id = setInterval(() => setT(now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return t
}

export function Countdown({ to, className = '', size = 'md' }: { to: number; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const t = useNow(1000)
  const { d, h, m, s } = splitDuration(to - t)
  const seg = (v: number, l: string) => (
    <span className="cd-seg">
      <span className="cd-num hud-num">{String(v).padStart(2, '0')}</span>
      <span className="cd-lab">{l}</span>
    </span>
  )
  return (
    <span className={`countdown countdown--${size} ${className}`}>
      {d > 0 && seg(d, 'd')}
      {seg(h, 'h')}
      {seg(m, 'm')}
      {seg(s, 's')}
    </span>
  )
}

/* ------------------------------------------------------------------ Marquee */

export function Marquee({ children, speed = 40, reverse = false, className = '' }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string }) {
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track" style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Section head */

export function SectionHead({ index, kicker, title, sub, align = 'left', className = '' }: { index?: string; kicker: string; title: ReactNode; sub?: ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <div className={`section-head section-head--${align} ${className}`}>
      <div className="section-kicker">
        {index && <span className="section-index hud-num">{index}</span>}
        <span className="section-line" />
        <Scramble text={kicker} className="hud-label" />
      </div>
      <motion.h2
        className="display section-title"
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {title}
      </motion.h2>
      {sub && (
        <motion.p
          className="section-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {sub}
        </motion.p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Tilt */

export const Tilt = forwardRef<HTMLDivElement, { children: ReactNode; max?: number; className?: string; style?: CSSProperties; glare?: boolean; scale?: number; onClick?: () => void }>(function Tilt(
  { children, max = 12, className = '', style, glare = true, scale = 1.02, onClick },
  fwd,
) {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const setRefs = (el: HTMLDivElement | null) => {
    ref.current = el
    if (typeof fwd === 'function') fwd(el)
    else if (fwd) fwd.current = el
  }
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(0.5 - py) * max}deg`)
      el.style.setProperty('--ry', `${(px - 0.5) * max}deg`)
      el.style.setProperty('--px', `${px * 100}%`)
      el.style.setProperty('--py', `${py * 100}%`)
      el.style.setProperty('--ts', String(scale))
      el.style.setProperty('--glare', '1')
    })
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--ts', '1')
    el.style.setProperty('--glare', '0')
  }
  return (
    <div ref={setRefs} className={`tilt ${className}`} style={style} onPointerMove={onMove} onPointerLeave={onLeave} onClick={onClick}>
      <div className="tilt-inner">
        {children}
        {glare && <div className="tilt-glare" />}
      </div>
    </div>
  )
})

/* ------------------------------------------------------------------ Level ring + avatar */

export function LevelRing({ pct, size = 64, stroke = 4, color = 'var(--mint-hi)', track = 'rgba(138,208,199,.14)', children }: { pct: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <span className="level-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.max(0.001, Math.min(1, pct))) }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      <span className="level-ring-in">{children}</span>
    </span>
  )
}

export function PlayerAvatar({ seed, size = 56, frame = 'none', level, pct, className = '' }: { seed: string; size?: number; frame?: FrameId; level?: number; pct?: number; className?: string }) {
  const inner = <PixelAvatar seed={seed} size={pct != null ? size - 12 : size} rounded={pct != null ? 999 : 12} />
  return (
    <span className={`player-avatar frame-${frame} ${className}`} style={{ width: size, height: size }}>
      {pct != null ? (
        <LevelRing pct={pct} size={size} stroke={3.5}>
          {inner}
        </LevelRing>
      ) : (
        inner
      )}
      {level != null && <span className="pa-level hud-num">{level}</span>}
    </span>
  )
}

/* ------------------------------------------------------------------ Modal */

export function Modal({ open, onClose, children, title, wide = false, tone = 'mint' }: { open: boolean; onClose: () => void; children: ReactNode; title?: ReactNode; wide?: boolean; tone?: 'mint' | 'crimson' | 'gold' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className={`modal hud brackets ${tone} ${wide ? 'modal--wide' : ''}`}
            initial={{ opacity: 0, y: 60, scale: 0.94, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {title && (
              <div className="modal-title">
                <div className="hud-label">{title}</div>
                <button className="icon-btn" onClick={onClose} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            )}
            {!title && (
              <button className="icon-btn modal-x" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            )}
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ Glitch title */

export function Glitch({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`glitch ${className}`} data-text={text}>
      {text}
    </span>
  )
}

/* ------------------------------------------------------------------ Stagger list helper */

export const stagger = (i: number, base = 0.06) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-5% 0px' },
  transition: { duration: 0.6, delay: i * base, ease: [0.16, 1, 0.3, 1] as const },
})

export function useStableRandom(seed: number, n: number) {
  return useMemo(() => Array.from({ length: n }, (_, i) => ((Math.sin(seed * 9301 + i * 49297) + 1) / 2) % 1), [seed, n])
}
