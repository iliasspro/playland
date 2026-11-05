import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { fmt } from '../../lib/format'

/* Chart kit for the staff console.
   Palette validated with the dataviz validator against the panel surface #0a1c21:
   series  #189e88 (returning) / #c98500 (new)  — all six checks pass (CVD ΔE 11.7)
   heatmap #1f6a62 → #9cf5e7 (5 steps)          — ordinal checks pass               */
export const VIZ = {
  s1: '#189e88',
  s2: '#c98500',
  ramp: ['#1f6a62', '#25887d', '#2eaa9b', '#4fd6c3', '#9cf5e7'],
  grid: 'rgba(138, 208, 199, 0.12)',
  axis: '#7f9a96',
  surface: '#0a1c21',
}

/** render charts at their real pixel width so tick labels stay 11px */
function useWidth(ref: React.RefObject<HTMLDivElement | null>, fallback = 720) {
  const [w, setW] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return w
}

/* ---------------------------------------------------------------- tooltip */

type Tip = { x: number; y: number; title: string; rows: { v: string; l: string; c?: string }[] } | null

function Tooltip({ tip }: { tip: Tip }) {
  if (!tip) return null
  return (
    <div className="viz-tip" style={{ left: tip.x, top: tip.y }} role="status">
      <div className="viz-tip-t">{tip.title}</div>
      {tip.rows.map((r) => (
        <div key={r.l} className="viz-tip-r">
          {r.c && <span className="viz-key" style={{ background: r.c }} />}
          <b>{r.v}</b>
          <span>{r.l}</span>
        </div>
      ))}
    </div>
  )
}

export function ChartCard({ title, sub, legend, table, children, className = '' }: { title: string; sub?: string; legend?: ReactNode; table: ReactNode; children: ReactNode; className?: string }) {
  const [asTable, setAsTable] = useState(false)
  return (
    <section className={`viz-card hud ${className}`}>
      <div className="viz-head">
        <div>
          <div className="viz-title">{title}</div>
          {sub && <div className="viz-sub">{sub}</div>}
        </div>
        <button className="viz-toggle" onClick={() => setAsTable((t) => !t)} aria-pressed={asTable}>
          {asTable ? 'Chart' : 'Table'}
        </button>
      </div>
      {legend && !asTable && <div className="viz-legend">{legend}</div>}
      {asTable ? <div className="viz-table-wrap">{table}</div> : children}
    </section>
  )
}

export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="viz-leg">
      <span className="viz-sw" style={{ background: color }} />
      {label}
    </span>
  )
}

/* ---------------------------------------------------------------- stacked columns */

export function StackedColumns({ data, height = 240 }: { data: { label: string; a: number; b: number }[]; height?: number }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<Tip>(null)
  const [hover, setHover] = useState<number | null>(null)
  const W = useWidth(wrap)
  const pad = { l: 34, r: 8, t: 10, b: 26 }
  const ih = height - pad.t - pad.b
  const iw = W - pad.l - pad.r
  const max = Math.max(...data.map((d) => d.a + d.b))
  const top = Math.ceil(max / 25) * 25
  const ticks = [0, top / 4, top / 2, (top * 3) / 4, top]
  const band = iw / data.length
  const bw = Math.min(20, band * 0.62)
  const y = (v: number) => pad.t + ih - (v / top) * ih
  const R = 3

  const move = (i: number, e: React.PointerEvent | React.FocusEvent) => {
    const r = wrap.current!.getBoundingClientRect()
    const cx = 'clientX' in e ? e.clientX - r.left : ((pad.l + band * i + band / 2) / W) * r.width
    const d = data[i]
    setHover(i)
    setTip({
      x: Math.min(r.width - 150, Math.max(0, cx + 12)),
      y: 6,
      title: d.label,
      rows: [
        { v: fmt(d.a + d.b), l: 'check-ins' },
        { v: fmt(d.a), l: 'returning', c: VIZ.s1 },
        { v: fmt(d.b), l: 'new', c: VIZ.s2 },
      ],
    })
  }

  return (
    <div className="viz-wrap" ref={wrap} onPointerLeave={() => { setTip(null); setHover(null) }}>
      <svg viewBox={`0 0 ${W} ${height}`} width={W} height={height} className="viz-svg" role="img" aria-label="Daily check-ins, returning vs new players, last 30 days">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={VIZ.grid} strokeWidth="1" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="viz-tick">
              {fmt(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + band * i + (band - bw) / 2
          const ya = y(d.a)
          const yb = y(d.a + d.b)
          const hb = ya - yb - 2 // 2px surface gap between segments
          const dim = hover != null && hover !== i
          return (
            <g key={i} opacity={dim ? 0.45 : 1}>
              <rect x={x} y={ya} width={bw} height={pad.t + ih - ya} fill={VIZ.s1} />
              {hb > 0 && <path d={`M${x} ${ya - 2} V${yb + R} Q${x} ${yb} ${x + R} ${yb} H${x + bw - R} Q${x + bw} ${yb} ${x + bw} ${yb + R} V${ya - 2} Z`} fill={VIZ.s2} />}
              {i % 5 === 0 || i === data.length - 1 ? (
                <text x={x + bw / 2} y={height - 8} textAnchor="middle" className="viz-tick">
                  {d.label.replace(/^\w+ /, '')}
                </text>
              ) : null}
              <rect
                x={pad.l + band * i}
                y={pad.t}
                width={band}
                height={ih}
                fill="transparent"
                tabIndex={0}
                onPointerMove={(e) => move(i, e)}
                onFocus={(e) => move(i, e)}
                onBlur={() => setTip(null)}
                aria-label={`${d.label}: ${d.a + d.b} check-ins`}
              />
            </g>
          )
        })}
        <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih} y2={pad.t + ih} stroke={VIZ.axis} strokeOpacity="0.5" strokeWidth="1" />
      </svg>
      <Tooltip tip={tip} />
    </div>
  )
}

/* ---------------------------------------------------------------- heatmap */

export function Heatmap({ rows, cols, values, fmtCell }: { rows: string[]; cols: string[]; values: (number | null)[][]; fmtCell: (v: number) => string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<Tip>(null)
  const W = useWidth(wrap)
  const lw = 40
  const th = 22
  const cw = (W - lw) / cols.length
  const ch = W < 500 ? 22 : 30
  const H = th + rows.length * ch + 4
  const flat = values.flat().filter((v): v is number => v != null)
  const max = Math.max(...flat)
  const bucket = (v: number) => Math.min(4, Math.floor((v / (max + 0.0001)) * 5))
  const show = (ri: number, ci: number, e: React.PointerEvent | React.FocusEvent) => {
    const v = values[ri][ci]
    if (v == null) return
    const r = wrap.current!.getBoundingClientRect()
    const px = 'clientX' in e ? e.clientX - r.left : ((lw + ci * cw) / W) * r.width
    const py = 'clientY' in e ? e.clientY - r.top : ((th + ri * ch) / H) * r.height
    setTip({ x: Math.min(r.width - 150, px + 12), y: Math.max(0, py - 60), title: `${rows[ri]} · ${cols[ci]}`, rows: [{ v: fmtCell(v), l: 'stations busy' }] })
  }
  return (
    <div className="viz-wrap" ref={wrap} onPointerLeave={() => setTip(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="viz-svg" role="img" aria-label="Station occupancy by weekday and hour">
        {cols.map((c, ci) =>
          ci % 2 === 0 ? (
            <text key={c} x={lw + ci * cw + cw / 2} y={14} textAnchor="middle" className="viz-tick">
              {c}
            </text>
          ) : null,
        )}
        {rows.map((r, ri) => (
          <g key={r}>
            <text x={lw - 8} y={th + ri * ch + ch / 2 + 4} textAnchor="end" className="viz-tick">
              {r}
            </text>
            {cols.map((_, ci) => {
              const v = values[ri][ci]
              return (
                <rect
                  key={ci}
                  x={lw + ci * cw + 1}
                  y={th + ri * ch + 1}
                  width={cw - 2}
                  height={ch - 2}
                  rx="3"
                  fill={v == null ? 'transparent' : VIZ.ramp[bucket(v)]}
                  stroke={v == null ? VIZ.grid : 'none'}
                  className={v == null ? undefined : 'viz-cell'}
                  tabIndex={v == null ? undefined : 0}
                  onPointerMove={(e) => show(ri, ci, e)}
                  onFocus={(e) => show(ri, ci, e)}
                  onBlur={() => setTip(null)}
                  aria-label={v == null ? undefined : `${rows[ri]} ${cols[ci]}: ${fmtCell(v)}`}
                />
              )
            })}
          </g>
        ))}
      </svg>
      <div className="viz-scale">
        <span>Quiet</span>
        {VIZ.ramp.map((c) => (
          <i key={c} style={{ background: c }} />
        ))}
        <span>Packed</span>
      </div>
      <Tooltip tip={tip} />
    </div>
  )
}

/* ---------------------------------------------------------------- horizontal bars (single series) */

export function HBars({ data, unit = '', color = VIZ.s1 }: { data: { label: string; v: number }[]; unit?: string; color?: string }) {
  const max = Math.max(...data.map((d) => d.v))
  const [hover, setHover] = useState<number | null>(null)
  return (
    <div className="hbars" onPointerLeave={() => setHover(null)}>
      {data.map((d, i) => (
        <div key={d.label} className={`hbar ${hover != null && hover !== i ? 'dim' : ''}`} onPointerEnter={() => setHover(i)} tabIndex={0} onFocus={() => setHover(i)} aria-label={`${d.label}: ${d.v}${unit}`}>
          <span className="hbar-l">{d.label}</span>
          <span className="hbar-track">
            <i style={{ width: `${(d.v / max) * 100}%`, background: color }} />
            <b className="hbar-v">
              {fmt(d.v)}
              {unit}
            </b>
          </span>
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- stat tile + sparkline */

export function Sparkline({ values, w = 120, h = 30 }: { values: number[]; w?: number; h?: number }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 6) + 3, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="spark" aria-hidden>
      <path d={d} fill="none" stroke="#5f7d79" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill={VIZ.s1} stroke={VIZ.surface} strokeWidth="2" />
    </svg>
  )
}

export function StatTile({ label, value, delta, good = true, trend, suffix }: { label: string; value: string; delta?: string; good?: boolean; trend?: number[]; suffix?: string }) {
  return (
    <div className="stat hud">
      <div className="stat-l">{label}</div>
      <div className="stat-v">
        {value}
        {suffix && <span className="stat-suf">{suffix}</span>}
      </div>
      <div className="stat-foot">
        {delta && <span className={`stat-d ${good ? 'up' : 'down'}`}>{delta}</span>}
        {trend && <Sparkline values={trend} />}
      </div>
    </div>
  )
}

export function Meter({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="meter">
      <div className="meter-track">
        <i style={{ width: `${pct * 100}%` }} />
      </div>
      <div className="meter-l">{label}</div>
    </div>
  )
}

export function useSeries<T>(fn: () => T, deps: unknown[] = []) {
  return useMemo(fn, deps) // eslint-disable-line react-hooks/exhaustive-deps
}
