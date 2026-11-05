import { useEffect } from 'react'
import Lenis from 'lenis'
import { SiteNav } from './SiteNav'
import { Hero } from './Hero'
import { Arena, Ticker } from './Arena'
import { HowItWorks } from './HowItWorks'
import { Ladder, LiveBoard, Loot } from './Progression'
import { EventsTeaser, Footer, Gallery, LiveStations, Modes, Visit } from './World'
import { setLenis } from './scroll'
import './landing.css'

export default function Landing({ ready = true }: { ready?: boolean }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true })
    setLenis(lenis)
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <div className="landing">
      <SiteNav />
      <Hero ready={ready} />
      <Ticker />
      <Arena />
      <HowItWorks />
      <Ladder />
      <Loot />
      <LiveBoard />
      <EventsTeaser />
      <LiveStations />
      <Modes />
      <Gallery />
      <Visit />
      <Footer />
    </div>
  )
}
