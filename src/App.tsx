import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { AnimatePresence } from 'motion/react'
import { BootScreen } from './components/fx/BootScreen'
import { PageWipe } from './components/fx/PageWipe'
import { FxLayer } from './components/fx/FxLayer'
import { Cursor } from './components/fx/Cursor'
import { Crest } from './components/brand/Crest'
import { HubLayout } from './components/layout/HubLayout'

const Landing = lazy(() => import('./pages/landing/Landing'))
const Onboarding = lazy(() => import('./pages/hub/Onboarding'))
const Dashboard = lazy(() => import('./pages/hub/Dashboard'))
const Scan = lazy(() => import('./pages/hub/Scan'))
const Quests = lazy(() => import('./pages/hub/Quests'))
const Rewards = lazy(() => import('./pages/hub/Rewards'))
const Leaderboard = lazy(() => import('./pages/hub/Leaderboard'))
const Season = lazy(() => import('./pages/hub/Season'))
const Events = lazy(() => import('./pages/hub/Events'))
const LiveMap = lazy(() => import('./pages/hub/LiveMap'))
const Arcade = lazy(() => import('./pages/hub/Arcade'))
const Profile = lazy(() => import('./pages/hub/Profile'))
const Staff = lazy(() => import('./pages/staff/Staff'))
const NotFound = lazy(() => import('./pages/NotFound'))

export function PageLoader() {
  return (
    <div className="page-loader">
      <Crest size={72} mode="none" />
    </div>
  )
}

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Shell() {
  const location = useLocation()
  const [booted, setBooted] = useState(() => reduced || location.pathname !== '/' || sessionStorage.getItem('pl-booted') === '1')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <div className="ambient" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing ready={booted} />} />
          <Route path="/join" element={<Onboarding />} />
          <Route element={<HubLayout />}>
            <Route path="/hub" element={<Dashboard />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/ranks" element={<Leaderboard />} />
            <Route path="/season" element={<Season />} />
            <Route path="/events" element={<Events />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/arcade" element={<Arcade />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/staff" element={<Staff />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <AnimatePresence>
        {!booted && (
          <BootScreen
            onDone={() => {
              sessionStorage.setItem('pl-booted', '1')
              setBooted(true)
            }}
          />
        )}
      </AnimatePresence>
      <PageWipe />
      <FxLayer />
      <Cursor />
      <div className="scanlines" />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
