/* Hand-drawn letterforms matching the crest lettering (Λ-style A, chunky stems).
   Every glyph sits on a 100-unit cap height. */

export const GLYPHS: Record<string, { w: number; d: string }> = {
  P: { w: 74, d: 'M0 0 H50 C66 0 74 10 74 26 V44 C74 60 66 70 50 70 H28 V100 H0 Z M28 22 V48 H42 C46 48 47 46 47 42 V28 C47 24 46 22 42 22 Z' },
  L: { w: 66, d: 'M0 0 H28 V74 H66 V100 H0 Z' },
  A: { w: 88, d: 'M27 0 H61 L88 100 H59 L44 44 L29 100 H0 Z' },
  Y: { w: 82, d: 'M0 0 H30 L41 26 L52 0 H82 L55 58 V100 H27 V58 Z' },
  N: { w: 80, d: 'M0 0 H27 L53 52 V0 H80 V100 H53 L27 48 V100 H0 Z' },
  D: { w: 78, d: 'M0 0 H44 C66 0 78 14 78 36 V64 C78 86 66 100 44 100 H0 Z M28 24 V76 H40 C48 76 51 72 51 64 V36 C51 28 48 24 40 24 Z' },
  '5': { w: 66, d: 'M0 0 H64 V24 H26 V38 H42 C56 38 66 48 66 62 V76 C66 90 56 100 42 100 H0 V76 H36 C39 76 40 75 40 72 V66 C40 63 39 62 36 62 H0 Z' },
  '9': { w: 66, d: 'M24 0 H42 C56 0 66 10 66 24 V76 C66 90 56 100 42 100 H2 V76 H38 C40 76 40 75 40 72 V64 H24 C10 64 0 54 0 40 V24 C0 10 10 0 24 0 Z M26 26 V38 C26 40 27 40 28 40 H40 V28 C40 26 39 26 38 26 Z' },
}

export function layoutWord(word: string, spacing = 6) {
  let x = 0
  const parts: { d: string; x: number }[] = []
  for (const ch of word) {
    const g = GLYPHS[ch]
    if (!g) {
      x += 40
      continue
    }
    parts.push({ d: g.d, x })
    x += g.w + spacing
  }
  return { parts, width: x - spacing }
}
