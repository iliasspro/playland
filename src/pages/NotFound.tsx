import { Crest } from '../components/brand/Crest'
import { Btn } from '../components/ui/kit'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <Crest size={130} glow />
        <div className="hud-label t-crimson">Error 404 · out of bounds</div>
        <h1 className="display glitch" data-text="GAME OVER" style={{ fontSize: 'clamp(48px, 10vw, 120px)' }}>
          GAME OVER
        </h1>
        <p className="dim">This level doesn’t exist. Respawn at the arena?</p>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Btn to="/">Respawn</Btn>
          <Btn to="/hub" variant="ghost">
            Open Play Pass
          </Btn>
        </div>
      </div>
    </div>
  )
}
