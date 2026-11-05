import type Lenis from 'lenis'

let lenis: Lenis | null = null

export function setLenis(l: Lenis | null) {
  lenis = l
}

export function scrollToId(id: string) {
  if (id === 'top') {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
