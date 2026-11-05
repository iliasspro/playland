import QRCode from 'qrcode'
import { now } from './time'

export type QrMatrix = { size: number; get: (x: number, y: number) => boolean }

export function qrMatrix(text: string, ecl: 'L' | 'M' | 'Q' | 'H' = 'Q'): QrMatrix {
  const qr = QRCode.create(text, { errorCorrectionLevel: ecl })
  const size = qr.modules.size
  const data = qr.modules.data
  return { size, get: (x, y) => x >= 0 && y >= 0 && x < size && y < size && data[y * size + x] === 1 }
}

/* ---------- Play Land code format ----------
   Every QR is a URL so a phone's native camera opens the Play Pass directly:
     <origin>/scan?code=CHECKIN-ENTRANCE
   The in-app scanner also accepts the bare code. */

export type ScanCode =
  | { kind: 'checkin'; spot: string; slot?: number }
  | { kind: 'session'; station: string }
  | { kind: 'coffee' }
  | { kind: 'event'; eventId: string }
  | { kind: 'secret'; secretId: string }
  | { kind: 'friend'; tag: string }
  | { kind: 'voucher'; code: string }

export function encodeCode(c: ScanCode): string {
  switch (c.kind) {
    case 'checkin':
      return `CHECKIN-${c.spot}${c.slot != null ? `-${c.slot}` : ''}`
    case 'session':
      return `SESSION-${c.station}`
    case 'coffee':
      return 'COFFEE'
    case 'event':
      return `EVENT-${c.eventId}`
    case 'secret':
      return `SECRET-${c.secretId}`
    case 'friend':
      return `FRIEND-${c.tag}`
    case 'voucher':
      return `VOUCHER-${c.code}`
  }
}

/** On localhost, point QR links at the machine's LAN address so a phone can open them. */
export function shareOrigin() {
  const { protocol, hostname, port, origin } = window.location
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && __LAN_HOST__) return `${protocol}//${__LAN_HOST__}${port ? `:${port}` : ''}`
  return origin
}

export function codeUrl(c: ScanCode, origin = shareOrigin()) {
  return `${origin}/scan?code=${encodeURIComponent(encodeCode(c))}`
}

export function decodeCode(raw: string): ScanCode | null {
  let s = raw.trim()
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s)
      s = u.searchParams.get('code') ?? ''
    }
  } catch {
    return null
  }
  s = decodeURIComponent(s).toUpperCase()
  const [head, ...rest] = s.split('-')
  const tail = rest.join('-')
  switch (head) {
    case 'CHECKIN': {
      const [spot, slot] = rest
      if (!spot) return null
      return { kind: 'checkin', spot, slot: slot ? Number(slot) : undefined }
    }
    case 'SESSION':
      return tail ? { kind: 'session', station: tail } : null
    case 'COFFEE':
      return { kind: 'coffee' }
    case 'EVENT':
      return tail ? { kind: 'event', eventId: tail.toLowerCase() } : null
    case 'SECRET':
      return tail ? { kind: 'secret', secretId: tail.toLowerCase() } : null
    case 'FRIEND':
      return tail ? { kind: 'friend', tag: rest.join('-') } : null
    case 'VOUCHER':
      return tail ? { kind: 'voucher', code: s.replace(/^VOUCHER-/, '') } : null
  }
  return null
}

/** rotating entrance code: a new slot every 30 s */
export const SLOT_MS = 30_000
export const currentSlot = (t = now()) => Math.floor(t / SLOT_MS)
