import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { motion } from 'motion/react'
import { sfx } from '../../lib/sfx'
import { Crest } from '../brand/Crest'

/* Diagonal two-tone slash that sweeps across on every route change. */
export function PageWipe() {
  const { pathname } = useLocation()
  const prev = useRef(pathname)
  const [key, setKey] = useState(0)
  useEffect(() => {
    if (prev.current === pathname) return
    prev.current = pathname
    setKey((k) => k + 1)
    sfx.swipe()
  }, [pathname])
  if (key === 0) return null
  return (
    <div className="wipe" key={key} aria-hidden>
      <motion.div className="wipe-panel wipe-panel--a" initial={{ x: '-130%' }} animate={{ x: ['-130%', '0%', '130%'] }} transition={{ duration: 0.8, times: [0, 0.45, 1], ease: [0.7, 0, 0.2, 1] }} />
      <motion.div className="wipe-panel wipe-panel--b" initial={{ x: '-130%' }} animate={{ x: ['-130%', '0%', '130%'] }} transition={{ duration: 0.8, times: [0, 0.45, 1], ease: [0.7, 0, 0.2, 1], delay: 0.06 }}>
        <motion.div className="wipe-crest" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: [0.6, 1, 1], opacity: [0, 1, 0] }} transition={{ duration: 0.8, times: [0, 0.45, 0.8] }}>
          <Crest size={88} mode="none" />
        </motion.div>
      </motion.div>
    </div>
  )
}
