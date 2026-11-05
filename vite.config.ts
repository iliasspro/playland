import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'node:os'

/** first LAN IPv4 — lets QR codes generated on localhost open on a phone on the same Wi-Fi */
function lanHost() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list ?? []) if (i.family === 'IPv4' && !i.internal) return i.address
  }
  return null
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // only used by `npm run dev` so phones on the same Wi-Fi can open QR links; production uses the real domain
  define: { __LAN_HOST__: JSON.stringify(command === 'serve' ? lanHost() : null) },
  server: { host: true, port: 5173 },
  optimizeDeps: {
    include: ['jsqr', 'qrcode', 'canvas-confetti', 'lenis', 'three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'react-dom/server', 'zustand', 'zustand/middleware', 'motion/react', 'lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'],
          motion: ['motion'],
        },
      },
    },
  },
}))
