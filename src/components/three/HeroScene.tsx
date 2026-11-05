import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, Lightformer, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { renderToStaticMarkup } from 'react-dom/server'
import { Crest, CONTROLLER, SHIELD, RIBBON } from '../brand/Crest'
import { CoinIcon } from '../ui/icons'

/* ------------------------------------------------------------------ textures */

function svgToTexture(markup: string, w: number, h: number) {
  return new Promise<THREE.CanvasTexture>((resolve) => {
    const svg = markup.includes('xmlns=') ? markup : markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      resolve(t)
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  })
}

function useTextures() {
  const [tex, setTex] = useState<{ crest: THREE.Texture; coin: THREE.Texture } | null>(null)
  useEffect(() => {
    let alive = true
    Promise.all([
      svgToTexture(renderToStaticMarkup(<Crest mode="none" size={600} />), 1200, 1240),
      svgToTexture(renderToStaticMarkup(<CoinIcon size={256} />), 512, 512),
    ]).then(([crest, coin]) => alive && setTex({ crest, coin }))
    return () => {
      alive = false
    }
  }, [])
  return tex
}

/* ------------------------------------------------------------------ crest plaque */

function useCrestGeometry() {
  return useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${CONTROLLER}"/><path d="${SHIELD}"/><path d="${RIBBON}"/></svg>`
    const data = new SVGLoader().parse(svg)
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p))
    const geos = shapes.map(
      (sh) =>
        new THREE.ExtrudeGeometry(sh, {
          depth: 46,
          bevelEnabled: true,
          bevelThickness: 7,
          bevelSize: 14,
          bevelSegments: 4,
          curveSegments: 28,
        }),
    )
    return geos
  }, [])
}

function CrestPlaque({ tex }: { tex: THREE.Texture }) {
  const geos = useCrestGeometry()
  const group = useRef<THREE.Group>(null)
  const { pointer, viewport } = useThree()
  const sideMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0d2a2f',
        metalness: 0.75,
        roughness: 0.28,
        side: THREE.DoubleSide,
        emissive: '#0b3b37',
        emissiveIntensity: 0.25,
      }),
    [],
  )
  const faceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.35,
        roughness: 0.38,
        metalness: 0.15,
        emissive: new THREE.Color('#ffffff'),
        emissiveMap: tex,
        emissiveIntensity: 0.1,
      }),
    [tex],
  )

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const sy = Math.min(1, window.scrollY / window.innerHeight)
    const tx = -pointer.y * 0.22 + sy * 0.6
    const ty = pointer.x * 0.42 + Math.sin(state.clock.elapsedTime * 0.5) * 0.08 + sy * 1.2
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 4, dt)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 4, dt)
    const wide = viewport.aspect > 1.15
    const targetX = wide ? Math.min(viewport.width * 0.27, 3.6) : 0
    const targetY = (wide ? 0.1 : 0.15) + sy * 1.6
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 3, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 3, dt)
  })

  const s = viewport.aspect > 1.15 ? 0.0053 : Math.min(0.0064, (viewport.height * 0.6) / 620)
  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
        <group scale={s}>
          <group position={[-300, 310, -46]} scale={[1, -1, 1]}>
            {geos.map((g, i) => (
              <mesh key={i} geometry={g} material={sideMat} />
            ))}
          </group>
          <mesh position={[0, 0, 8]} material={faceMat}>
            <planeGeometry args={[600, 620]} />
          </mesh>
        </group>
      </Float>
    </group>
  )
}

/* ------------------------------------------------------------------ neon shapes */

function ringShape(outer: THREE.Vector2[], inner: THREE.Vector2[]) {
  const s = new THREE.Shape(outer)
  s.holes.push(new THREE.Path(inner))
  return s
}

function useShapeGeos() {
  return useMemo(() => {
    const ex = { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }
    const tri = (r: number) => [0, 1, 2].map((i) => new THREE.Vector2(Math.cos((i / 3) * Math.PI * 2 + Math.PI / 2) * r, Math.sin((i / 3) * Math.PI * 2 + Math.PI / 2) * r))
    const sq = (r: number) => [new THREE.Vector2(-r, -r), new THREE.Vector2(r, -r), new THREE.Vector2(r, r), new THREE.Vector2(-r, r)]
    const triangle = new THREE.ExtrudeGeometry(ringShape(tri(0.62), tri(0.42).reverse()), ex)
    const square = new THREE.ExtrudeGeometry(ringShape(sq(0.46), sq(0.32).reverse()), ex)
    const circle = new THREE.TorusGeometry(0.42, 0.075, 20, 80)
    const bar = new THREE.BoxGeometry(1.0, 0.16, 0.16)
    return { triangle, square, circle, bar }
  }, [])
}

const SHAPES = [
  { k: 'triangle', c: '#5ff3da', p: [-1.2, 1.6, -3.4], s: 0.9, r: 0.3 },
  { k: 'circle', c: '#ff2d4e', p: [5.4, -1.9, -1.6], s: 1.05, r: -0.2 },
  { k: 'cross', c: '#6fa8ff', p: [-2.2, -2.3, -0.6], s: 0.8, r: 0.5 },
  { k: 'square', c: '#e77bff', p: [6.2, 1.6, -3.6], s: 0.8, r: 0.2 },
  { k: 'circle', c: '#5ff3da', p: [-5.6, -0.4, -4.5], s: 0.8, r: 0 },
  { k: 'triangle', c: '#ff2d4e', p: [1.6, -2.6, -5.5], s: 0.9, r: 0.8 },
  { k: 'square', c: '#5ff3da', p: [0.6, -3.4, -3.8], s: 0.7, r: 0.4 },
  { k: 'cross', c: '#ff2d4e', p: [6.8, 0.6, -5.8], s: 0.8, r: 0.1 },
] as const

function NeonShapes() {
  const geos = useShapeGeos()
  const mats = useMemo(() => {
    const m: Record<string, THREE.MeshStandardMaterial> = {}
    for (const s of SHAPES) m[s.c] ??= new THREE.MeshStandardMaterial({ color: s.c, emissive: s.c, emissiveIntensity: 2.6, toneMapped: false, roughness: 0.4 })
    return m
  }, [])
  const group = useRef<THREE.Group>(null)
  const spinners = useRef<THREE.Group[]>([])
  const { pointer } = useThree()
  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    g.position.x = THREE.MathUtils.damp(g.position.x, pointer.x * 0.5, 2, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, pointer.y * 0.35 + Math.min(1, window.scrollY / innerHeight) * 1.2, 2, dt)
    spinners.current.forEach((c, i) => {
      if (c) c.rotation.z += dt * (0.25 + (i % 3) * 0.12) * (i % 2 ? 1 : -1)
    })
  })
  return (
    <group ref={group}>
      {SHAPES.map((s, i) => (
        <Float key={i} speed={1 + (i % 4) * 0.3} rotationIntensity={1.2} floatIntensity={1.4}>
          <group
            position={s.p as unknown as [number, number, number]}
            scale={s.s}
            rotation={[0.3, 0.4, s.r]}
            ref={(el) => {
              if (el) spinners.current[i] = el
            }}
          >
            {s.k === 'cross' ? (
              <>
                <mesh geometry={geos.bar} material={mats[s.c]} rotation={[0, 0, Math.PI / 4]} />
                <mesh geometry={geos.bar} material={mats[s.c]} rotation={[0, 0, -Math.PI / 4]} />
              </>
            ) : (
              <mesh geometry={geos[s.k]} material={mats[s.c]} />
            )}
          </group>
        </Float>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ coins */

function Coins({ tex }: { tex: THREE.Texture }) {
  const geo = useMemo(() => new THREE.CylinderGeometry(0.42, 0.42, 0.09, 56), [])
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#c98a12', metalness: 1, roughness: 0.25, emissive: '#5a3a00', emissiveIntensity: 0.4 })
    const face = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.55, roughness: 0.3, emissive: new THREE.Color('#ffb422'), emissiveMap: tex, emissiveIntensity: 0.45 })
    return [side, face, face]
  }, [tex])
  const refs = useRef<THREE.Group[]>([])
  const coins = [
    { p: [-1.6, 1.6, 0.6], s: 0.9 },
    { p: [4.0, 0.2, 0.4], s: 0.75 },
    { p: [-4.3, -1.8, -1.2], s: 0.7 },
    { p: [2.3, -2.6, -0.2], s: 0.6 },
  ]
  useFrame((state, dt) => {
    refs.current.forEach((g, i) => {
      if (!g) return
      g.rotation.y += dt * (1.6 + i * 0.3)
      g.position.y = coins[i].p[1] + Math.sin(state.clock.elapsedTime * 1.2 + i) * 0.18 + Math.min(1, window.scrollY / innerHeight) * 1.4
    })
  })
  return (
    <>
      {coins.map((c, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) refs.current[i] = g
          }}
          position={c.p as [number, number, number]}
          scale={c.s}
          rotation={[0, i * 0.8, 0.18 * (i % 2 ? 1 : -1)]}
        >
          <mesh geometry={geo} material={mats} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ grid floor */

function GridFloor() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; varying vec3 vPos; void main(){ vUv=uv; vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
        fragmentShader: `
          varying vec2 vUv; varying vec3 vPos; uniform float uTime;
          float line(float x, float w){ float d = abs(fract(x - 0.5) - 0.5) / fwidth(x); return 1.0 - min(d / w, 1.0); }
          void main(){
            vec2 p = vPos.xy * 0.9;
            p.y += uTime * 0.6;
            float g = max(line(p.x, 1.2), line(p.y, 1.2));
            float fade = smoothstep(14.0, 2.0, length(vPos.xy)) ;
            float horizon = smoothstep(-12.0, 4.0, vPos.y);
            vec3 mint = vec3(0.37, 0.95, 0.85);
            vec3 red = vec3(1.0, 0.18, 0.3);
            vec3 col = mix(red, mint, horizon);
            gl_FragColor = vec4(col * 1.4, g * fade * 0.55);
          }`,
      }),
    [],
  )
  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt
  })
  return (
    <mesh rotation={[-Math.PI / 2.15, 0, 0]} position={[0, -3.6, -2]} material={mat}>
      <planeGeometry args={[40, 30, 1, 1]} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ scene */

function Scene() {
  const tex = useTextures()
  return (
    <>
      <color attach="background" args={['#020a0d']} />
      <fog attach="fog" args={['#020a0d', 9, 22]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[-6, -3, 4]} intensity={60} color="#ff2d4e" distance={20} />
      <pointLight position={[6, 4, 5]} intensity={70} color="#5ff3da" distance={22} />
      <directionalLight position={[0, 5, 8]} intensity={1.1} color="#ffffff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#5ff3da" position={[5, 2, 3]} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={4} color="#ff2d4e" position={[-5, -2, 3]} scale={[4, 8, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 6, 4]} scale={4} />
      </Environment>
      <GridFloor />
      <NeonShapes />
      {tex && <CrestPlaque tex={tex.crest} />}
      {tex && <Coins tex={tex.coin} />}
      <Sparkles count={70} scale={[16, 9, 8]} size={3} speed={0.35} color="#5ff3da" opacity={0.6} />
      <Sparkles count={40} scale={[16, 9, 8]} size={2.5} speed={0.25} color="#ff2d4e" opacity={0.5} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.78} luminanceSmoothing={0.2} radius={0.72} />
        <Vignette darkness={0.65} offset={0.22} />
      </EffectComposer>
    </>
  )
}

export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={wrap} className="hero-canvas">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 10], fov: 38 }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
