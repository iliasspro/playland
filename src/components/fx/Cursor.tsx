import { useEffect, useRef } from 'react'

/* Mint ring that trails the pointer and swells over anything clickable (desktop only). */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let x = innerWidth / 2
    let y = innerHeight / 2
    let rx = x
    let ry = y
    let raf = 0
    let hover = false
    let label = ''
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      const t = e.target as HTMLElement | null
      const hit = t?.closest?.('a, button, [data-cursor], input, select, label, .tilt') as HTMLElement | null
      hover = !!hit
      label = hit?.getAttribute?.('data-cursor') ?? ''
      if (ring.current) {
        ring.current.dataset.label = label
        ring.current.classList.toggle('is-hover', hover)
        ring.current.classList.toggle('has-label', !!label)
      }
      if (ring.current) ring.current.style.opacity = '1'
      if (dot.current) dot.current.style.opacity = '1'
    }
    const onDown = () => ring.current?.classList.add('is-down')
    const onUp = () => ring.current?.classList.remove('is-down')
    const onLeave = () => {
      if (ring.current) ring.current.style.opacity = '0'
      if (dot.current) dot.current.style.opacity = '0'
    }
    const loop = () => {
      rx += (x - rx) * 0.2
      ry += (y - ry) * 0.2
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  )
}
