"use client"

import { useEffect, useRef, useState, useCallback } from "react"

type Station = {
  id: string
  x: number
  y: number
  w: number
  h: number
  title: string
  period: string
  body: string
  tag: string
  order: number
}

type Vec = { x: number; y: number }
type Scenery =
  | { type: "tree"; x: number; y: number; r: number }
  | { type: "building"; x: number; y: number; w: number; h: number; color: string }
  | { type: "bush"; x: number; y: number; r: number }

const WORLD_W = 1400
const WORLD_H = 760

const STATIONS: Station[] = [
  {
    id: "start",
    x: 60,
    y: 60,
    w: 240,
    h: 150,
    order: 1,
    tag: "01",
    title: "İlk Adımlar",
    period: "2018",
    body: "İlk kodları yazdığım dönem — HTML/CSS denemeleri, küçük statik siteler ve bitmeyen merak.",
  },
  {
    id: "edu",
    x: 1100,
    y: 60,
    w: 240,
    h: 150,
    order: 2,
    tag: "02",
    title: "Eğitim & Stajlar",
    period: "2019 — 2021",
    body: "Üniversite + yarı zamanlı stajlar. React'i keşfettim, ilk gerçek ürünlere ve takım çalışmasına dahil oldum.",
  },
  {
    id: "pro",
    x: 580,
    y: 305,
    w: 240,
    h: 150,
    order: 3,
    tag: "03",
    title: "Profesyonel Yolculuk",
    period: "2022 — 2024",
    body: "Full-stack rolünde Next.js, Node.js, PostgreSQL, AWS ile üretim ölçeğinde sistemler kurdum.",
  },
  {
    id: "ai",
    x: 60,
    y: 550,
    w: 240,
    h: 150,
    order: 4,
    tag: "04",
    title: "AI Yolculuğu",
    period: "2024 — Şimdi",
    body: "LLM entegrasyonları, agentic akışlar, retrieval-augmented uygulamalar. AI'ı arayüzlerle buluşturmak.",
  },
  {
    id: "now",
    x: 1100,
    y: 550,
    w: 240,
    h: 150,
    order: 5,
    tag: "05",
    title: "Şimdi",
    period: "2026",
    body: "3D arayüzler, kusursuz UX ve AI'ı bir araya getiren ürünler tasarlıyorum. Yeni projelere açığım.",
  },
]

// S-shaped route waypoints connecting the stations chronologically
const ROAD: Vec[] = [
  { x: 180, y: 220 },   // out of station 1
  { x: 180, y: 150 },
  { x: 1220, y: 150 },  // top horizontal
  { x: 1220, y: 305 },
  { x: 700, y: 305 },   // station 3 area
  { x: 700, y: 460 },
  { x: 180, y: 460 },
  { x: 180, y: 640 },   // down to bottom
  { x: 1220, y: 640 },  // bottom horizontal
]

// Pre-baked scenery so layout stays deterministic
const SCENERY: Scenery[] = [
  // top strip
  { type: "tree", x: 360, y: 50, r: 14 },
  { type: "tree", x: 440, y: 70, r: 12 },
  { type: "tree", x: 540, y: 50, r: 16 },
  { type: "tree", x: 680, y: 60, r: 13 },
  { type: "bush", x: 800, y: 80, r: 10 },
  { type: "tree", x: 900, y: 50, r: 15 },
  { type: "tree", x: 1000, y: 60, r: 12 },
  // upper middle decoration (between top and middle rows)
  { type: "building", x: 360, y: 220, w: 60, h: 50, color: "#e9dbb4" },
  { type: "building", x: 460, y: 220, w: 80, h: 50, color: "#dcc78c" },
  { type: "tree", x: 900, y: 240, r: 14 },
  { type: "bush", x: 980, y: 250, r: 9 },
  { type: "tree", x: 1040, y: 240, r: 12 },
  // sides of station 3
  { type: "tree", x: 450, y: 380, r: 13 },
  { type: "tree", x: 900, y: 380, r: 14 },
  { type: "bush", x: 960, y: 400, r: 10 },
  // lower middle
  { type: "building", x: 360, y: 530, w: 70, h: 60, color: "#e9dbb4" },
  { type: "building", x: 480, y: 530, w: 60, h: 60, color: "#f3e4ad" },
  { type: "tree", x: 900, y: 500, r: 14 },
  { type: "tree", x: 980, y: 510, r: 12 },
  { type: "bush", x: 1040, y: 510, r: 10 },
  // bottom strip
  { type: "tree", x: 380, y: 720, r: 14 },
  { type: "tree", x: 460, y: 730, r: 12 },
  { type: "bush", x: 560, y: 720, r: 9 },
  { type: "tree", x: 680, y: 720, r: 15 },
  { type: "tree", x: 880, y: 720, r: 13 },
  { type: "tree", x: 960, y: 730, r: 12 },
]

const ROAD_WIDTH = 56
const KERB_WIDTH = 64

const initialCar = () => ({
  x: 380,
  y: 220,
  angle: 0,
  speed: 0,
})

type CarState = ReturnType<typeof initialCar>

const ExperienceArcade = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const carRef = useRef<CarState>(initialCar())
  const keysRef = useRef<Record<string, boolean>>({})
  const activeIdRef = useRef<string | null>(null)
  const visitedRef = useRef<Set<string>>(new Set())
  const rafRef = useRef<number | null>(null)
  const hasMovedRef = useRef(false)
  const startTimeRef = useRef<number>(performance.now())

  const [activeStation, setActiveStation] = useState<Station | null>(null)
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [hasMoved, setHasMoved] = useState(false)

  const resetCar = useCallback(() => {
    carRef.current = initialCar()
    activeIdRef.current = null
    setActiveStation(null)
  }, [])

  const resetAll = useCallback(() => {
    visitedRef.current = new Set()
    setVisited(new Set())
    resetCar()
  }, [resetCar])

  const setKey = useCallback((key: string, value: boolean) => {
    keysRef.current[key] = value
    if (value && !hasMovedRef.current) {
      hasMovedRef.current = true
      setHasMoved(true)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }
    resize()
    window.addEventListener("resize", resize)

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === "r") { resetCar(); return }
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        e.preventDefault()
        setKey(k, true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k in keysRef.current) setKey(k, false)
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    // -------- Renderers --------
    const drawGround = () => {
      ctx.fillStyle = "#eef0e6"
      ctx.fillRect(0, 0, WORLD_W, WORLD_H)
      // subtle grass texture
      ctx.fillStyle = "rgba(150, 175, 110, 0.06)"
      for (let i = 0; i < 220; i++) {
        const gx = (i * 137) % WORLD_W
        const gy = (i * 263) % WORLD_H
        ctx.fillRect(gx, gy, 18, 4)
      }
    }

    const tracePath = () => {
      ctx.beginPath()
      ctx.moveTo(ROAD[0].x, ROAD[0].y)
      for (let i = 1; i < ROAD.length - 1; i++) {
        const cur = ROAD[i]
        const nxt = ROAD[i + 1]
        const mx = (cur.x + nxt.x) / 2
        const my = (cur.y + nxt.y) / 2
        ctx.quadraticCurveTo(cur.x, cur.y, mx, my)
      }
      const last = ROAD[ROAD.length - 1]
      ctx.lineTo(last.x, last.y)
    }

    const drawRoad = () => {
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // kerb / sidewalk
      ctx.strokeStyle = "#cbb069"
      ctx.lineWidth = KERB_WIDTH
      tracePath()
      ctx.stroke()

      // asphalt
      ctx.strokeStyle = "#3d3a36"
      ctx.lineWidth = ROAD_WIDTH
      tracePath()
      ctx.stroke()

      // edge lines (white)
      ctx.strokeStyle = "rgba(255,255,255,0.55)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([])
      tracePath()
      ctx.stroke()

      // center dashed yellow
      ctx.strokeStyle = "rgba(255, 215, 100, 0.9)"
      ctx.lineWidth = 2.5
      ctx.setLineDash([14, 18])
      tracePath()
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawScenery = () => {
      for (const s of SCENERY) {
        if (s.type === "tree") {
          // shadow
          ctx.fillStyle = "rgba(0,0,0,0.12)"
          ctx.beginPath()
          ctx.ellipse(s.x + 2, s.y + s.r * 0.7, s.r * 0.9, s.r * 0.35, 0, 0, Math.PI * 2)
          ctx.fill()
          // foliage
          ctx.fillStyle = "#5e7a3a"
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = "rgba(120, 160, 70, 0.9)"
          ctx.beginPath()
          ctx.arc(s.x - s.r * 0.25, s.y - s.r * 0.25, s.r * 0.6, 0, Math.PI * 2)
          ctx.fill()
        } else if (s.type === "bush") {
          ctx.fillStyle = "#7a9a4a"
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.arc(s.x + s.r * 0.7, s.y, s.r * 0.8, 0, Math.PI * 2)
          ctx.arc(s.x - s.r * 0.7, s.y, s.r * 0.8, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // building
          ctx.fillStyle = "rgba(0,0,0,0.08)"
          ctx.fillRect(s.x + 3, s.y + 3, s.w, s.h)
          ctx.fillStyle = s.color
          ctx.fillRect(s.x, s.y, s.w, s.h)
          // roof
          ctx.fillStyle = "#a98438"
          ctx.fillRect(s.x - 2, s.y - 6, s.w + 4, 8)
          // windows
          ctx.fillStyle = "rgba(255,255,255,0.7)"
          const cols = Math.max(1, Math.floor(s.w / 18))
          const rows = Math.max(1, Math.floor(s.h / 18))
          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              ctx.fillRect(s.x + 6 + i * 18, s.y + 8 + j * 18, 6, 6)
            }
          }
        }
      }
    }

    const drawSignPost = (s: Station) => {
      // a small flag pointing at the station tag number
      const fx = s.x + s.w + 6
      const fy = s.y - 2
      ctx.fillStyle = "#84682d"
      ctx.fillRect(fx, fy, 3, 26)
      ctx.fillStyle = "#c9a44b"
      ctx.beginPath()
      ctx.moveTo(fx + 3, fy)
      ctx.lineTo(fx + 22, fy + 6)
      ctx.lineTo(fx + 3, fy + 12)
      ctx.closePath()
      ctx.fill()
    }

    const drawStation = (s: Station) => {
      const isActive = activeIdRef.current === s.id
      const isVisited = visitedRef.current.has(s.id)

      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.10)"
      ctx.fillRect(s.x + 4, s.y + 6, s.w, s.h)

      // card
      ctx.fillStyle = isActive ? "#fdfaf1" : "#ffffff"
      ctx.strokeStyle = isActive ? "#a98438" : isVisited ? "#84682d" : "#c9a44b"
      ctx.lineWidth = isActive ? 3.5 : 2
      const r = 16
      ctx.beginPath()
      ctx.moveTo(s.x + r, s.y)
      ctx.lineTo(s.x + s.w - r, s.y)
      ctx.quadraticCurveTo(s.x + s.w, s.y, s.x + s.w, s.y + r)
      ctx.lineTo(s.x + s.w, s.y + s.h - r)
      ctx.quadraticCurveTo(s.x + s.w, s.y + s.h, s.x + s.w - r, s.y + s.h)
      ctx.lineTo(s.x + r, s.y + s.h)
      ctx.quadraticCurveTo(s.x, s.y + s.h, s.x, s.y + s.h - r)
      ctx.lineTo(s.x, s.y + r)
      ctx.quadraticCurveTo(s.x, s.y, s.x + r, s.y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // tag pill
      ctx.fillStyle = isActive ? "#c9a44b" : isVisited ? "#84682d" : "#dbb74f"
      const pillX = s.x + 14
      const pillY = s.y + 14
      ctx.beginPath()
      ctx.roundRect(pillX, pillY, 36, 22, 11)
      ctx.fill()
      ctx.fillStyle = "#ffffff"
      ctx.font = "800 12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(s.tag, pillX + 18, pillY + 11)

      // period
      ctx.fillStyle = "#84682d"
      ctx.font = "700 10px Inter, system-ui, sans-serif"
      ctx.textAlign = "right"
      ctx.textBaseline = "top"
      ctx.fillText(s.period.toUpperCase(), s.x + s.w - 14, s.y + 18)

      // title
      ctx.fillStyle = "#1c1917"
      ctx.font = "800 21px Outfit, Inter, sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillText(s.title, s.x + 16, s.y + 50)

      // hint
      ctx.fillStyle = isActive ? "#a98438" : "#78716c"
      ctx.font = isActive ? "700 11px Inter, system-ui, sans-serif" : "500 11px Inter, system-ui, sans-serif"
      ctx.fillText(
        isActive ? "▸ Detayları okuyorsun" : isVisited ? "✓ Ziyaret edildi — tekrar gel" : "Yaklaş, kartı aç",
        s.x + 16,
        s.y + s.h - 22
      )

      drawSignPost(s)
    }

    const drawCar = (car: CarState) => {
      ctx.save()
      ctx.translate(car.x, car.y)
      ctx.rotate(car.angle)

      // shadow
      ctx.shadowColor = "rgba(0,0,0,0.30)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 4

      const w = 36
      const h = 20
      // body
      ctx.fillStyle = "#1c1917"
      ctx.beginPath()
      ctx.roundRect(-w / 2, -h / 2, w, h, 4)
      ctx.fill()

      ctx.shadowColor = "transparent"

      // roof / window
      ctx.fillStyle = "#dbb74f"
      ctx.beginPath()
      ctx.roundRect(-w / 2 + 6, -h / 2 + 3, w - 16, h - 6, 2)
      ctx.fill()

      // windshield
      ctx.fillStyle = "rgba(255,255,255,0.6)"
      ctx.fillRect(w / 2 - 12, -h / 2 + 4, 4, h - 8)

      // headlights
      ctx.fillStyle = "#fff6c4"
      ctx.beginPath()
      ctx.arc(w / 2 - 1, -h / 2 + 3, 1.6, 0, Math.PI * 2)
      ctx.arc(w / 2 - 1, h / 2 - 3, 1.6, 0, Math.PI * 2)
      ctx.fill()

      // wheels
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(-w / 2 + 4, -h / 2 - 2, 6, 4)
      ctx.fillRect(-w / 2 + 4, h / 2 - 2, 6, 4)
      ctx.fillRect(w / 2 - 10, -h / 2 - 2, 6, 4)
      ctx.fillRect(w / 2 - 10, h / 2 - 2, 6, 4)

      ctx.restore()
    }

    const drawStartArrow = (car: CarState, t: number) => {
      if (hasMovedRef.current) return
      const pulse = 0.5 + 0.5 * Math.sin(t / 280)
      ctx.save()
      ctx.translate(car.x, car.y - 50 - pulse * 6)
      ctx.fillStyle = `rgba(201, 164, 75, ${0.7 + pulse * 0.3})`
      ctx.beginPath()
      ctx.moveTo(0, 22)
      ctx.lineTo(-14, 0)
      ctx.lineTo(-6, 0)
      ctx.lineTo(-6, -16)
      ctx.lineTo(6, -16)
      ctx.lineTo(6, 0)
      ctx.lineTo(14, 0)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = "#84682d"
      ctx.font = "800 12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText("BURADAN BAŞLA", 0, -22)
      ctx.restore()
    }

    const carHitsStation = (car: CarState, s: Station) =>
      car.x > s.x && car.x < s.x + s.w && car.y > s.y && car.y < s.y + s.h

    let lastTs = performance.now()

    const tick = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.05)
      lastTs = ts

      const car = carRef.current
      const keys = keysRef.current
      const accel = 420
      const friction = 2.4
      const maxSpeed = 320
      const turnSpeed = 3.0

      const forward = keys["arrowup"] || keys["w"]
      const back = keys["arrowdown"] || keys["s"]
      const left = keys["arrowleft"] || keys["a"]
      const right = keys["arrowright"] || keys["d"]

      if (forward) car.speed += accel * dt
      if (back) car.speed -= accel * dt
      if (!forward && !back) {
        car.speed -= car.speed * Math.min(1, friction * dt)
        if (Math.abs(car.speed) < 4) car.speed = 0
      }
      car.speed = Math.max(-maxSpeed * 0.55, Math.min(maxSpeed, car.speed))

      const turn = (car.speed / maxSpeed) * turnSpeed * dt
      if (left) car.angle -= turn
      if (right) car.angle += turn

      car.x += Math.cos(car.angle) * car.speed * dt
      car.y += Math.sin(car.angle) * car.speed * dt

      const margin = 12
      if (car.x < margin) { car.x = margin; car.speed *= -0.3 }
      if (car.x > WORLD_W - margin) { car.x = WORLD_W - margin; car.speed *= -0.3 }
      if (car.y < margin) { car.y = margin; car.speed *= -0.3 }
      if (car.y > WORLD_H - margin) { car.y = WORLD_H - margin; car.speed *= -0.3 }

      let hit: Station | null = null
      for (const s of STATIONS) {
        if (carHitsStation(car, s)) { hit = s; break }
      }
      const hitId = hit?.id ?? null
      if (hitId !== activeIdRef.current) {
        activeIdRef.current = hitId
        setActiveStation(hit)
        if (hit && !visitedRef.current.has(hit.id)) {
          visitedRef.current.add(hit.id)
          setVisited(new Set(visitedRef.current))
        }
      }

      const container = containerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        const scaleX = rect.width / WORLD_W
        const scaleY = rect.height / WORLD_H
        ctx.setTransform(dpr * scaleX, 0, 0, dpr * scaleY, 0, 0)
      }
      drawGround()
      drawRoad()
      drawScenery()
      for (const s of STATIONS) drawStation(s)
      drawCar(car)
      drawStartArrow(car, ts - startTimeRef.current)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [resetCar, setKey])

  const TouchBtn = ({
    label,
    keyName,
    className,
  }: {
    label: string
    keyName: string
    className?: string
  }) => (
    <button
      type="button"
      onPointerDown={(e) => { e.preventDefault(); setKey(keyName, true) }}
      onPointerUp={() => setKey(keyName, false)}
      onPointerLeave={() => setKey(keyName, false)}
      onPointerCancel={() => setKey(keyName, false)}
      className={`select-none touch-none w-12 h-12 rounded-xl bg-white/95 border border-stone-300 text-stone-800 font-bold text-lg active:bg-gold-300 active:scale-95 transition ${className ?? ""}`}
      aria-label={label}
    >
      {label}
    </button>
  )

  return (
    <div className="relative w-full">
      {/* HUD bar above canvas */}
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-widest font-black text-gold-700">İlerleme</span>
          <div className="flex gap-1 ml-1">
            {STATIONS.map((s) => (
              <span
                key={s.id}
                className={`h-2 w-6 rounded-full transition-colors ${
                  visited.has(s.id) ? "bg-gold-500" : "bg-stone-200"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm font-black text-stone-800">{visited.size}<span className="text-stone-400">/{STATIONS.length}</span></span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-widest font-black text-stone-500">Kontroller</span>
          <Kbd>W</Kbd><Kbd>A</Kbd><Kbd>S</Kbd><Kbd>D</Kbd>
          <span className="text-stone-300">/</span>
          <Kbd>↑</Kbd><Kbd>←</Kbd><Kbd>↓</Kbd><Kbd>→</Kbd>
          <span className="text-stone-300">·</span>
          <Kbd>R</Kbd>
          <span className="text-[10px] text-stone-500 font-bold ml-1">sıfırla</span>
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="px-3 py-2 rounded-xl bg-white border border-stone-300 hover:border-gold-400 text-stone-700 text-[10px] font-bold uppercase tracking-widest shadow-sm transition"
        >
          Pisti yeniden başlat
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[1400/760] rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-[#eef0e6]"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Big call-to-action until user moves */}
        {!hasMoved && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
            <div className="px-5 py-3 rounded-full bg-stone-900/90 backdrop-blur text-white text-sm md:text-base font-bold shadow-lg flex items-center gap-3 animate-pulse-slow">
              <span className="text-gold-300">⌨</span>
              <span>Klavyenden bir tuşa bas — pist hazır</span>
            </div>
          </div>
        )}

        {/* Permanent mini hint badge (always visible top-left) */}
        <div className="hidden md:flex absolute top-3 left-3 items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/85 backdrop-blur border border-stone-200 text-[10px] font-bold text-stone-600 shadow-sm">
          <Kbd small>W</Kbd>
          <Kbd small>A</Kbd>
          <Kbd small>S</Kbd>
          <Kbd small>D</Kbd>
          <span className="text-stone-500 uppercase tracking-widest ml-1">sür</span>
        </div>

        {/* Active station detail card — centered, prominent */}
        {activeStation && (
          <>
            <div
              key={`${activeStation.id}-bg`}
              className="absolute inset-0 bg-stone-900/25 backdrop-blur-[2px] pointer-events-none"
              style={{ animation: "fadeIn 200ms ease-out" }}
            />
            <div
              key={activeStation.id}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md md:max-w-lg pointer-events-none z-10"
            >
              <div className="arcade-card-anim relative rounded-3xl bg-white border-2 border-gold-500 shadow-[0_25px_60px_-15px_rgba(132,104,45,0.55)] overflow-hidden">
                <div className="absolute inset-0 rounded-3xl arcade-card-ring pointer-events-none" />
                <div className="relative p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-gold-500 text-white text-[11px] font-black tracking-widest shadow-sm">
                      {activeStation.tag}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-gold-700 font-black">
                      {activeStation.period}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Buradasın
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-stone-900 mb-3 leading-tight">
                    {activeStation.title}
                  </h3>
                  <p className="text-base md:text-lg text-stone-700 leading-relaxed">
                    {activeStation.body}
                  </p>

                  {activeStation.id === "now" ? (
                    <div className="mt-6 pointer-events-auto">
                      <div className="rounded-2xl bg-gradient-to-br from-gold-100 via-cream-100 to-white border border-gold-300 p-4 mb-3">
                        <div className="text-[10px] uppercase tracking-widest text-gold-700 font-black mb-1">
                          Son durak · Yolculuk burada birleşiyor
                        </div>
                        <p className="text-sm text-stone-700 leading-relaxed">
                          Hikaye burada bitmiyor — sıradaki sayfayı birlikte yazalım. Sayfayı kaydır ya da doğrudan iletişime geç:
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("contact")
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-gold-700/20 transition active:scale-[0.98]"
                      >
                        İletişime git
                        <span aria-hidden>↓</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] uppercase tracking-widest font-bold text-stone-500">
                      <span>Devam etmek için sürmeye devam et</span>
                      <span className="text-gold-700">{activeStation.tag} / 05</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile touch controls */}
      <div className="md:hidden mt-4 flex items-center justify-between max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-2">
          <TouchBtn label="↑" keyName="arrowup" />
          <div className="flex gap-2">
            <TouchBtn label="←" keyName="arrowleft" />
            <TouchBtn label="↓" keyName="arrowdown" />
            <TouchBtn label="→" keyName="arrowright" />
          </div>
        </div>
        <button
          type="button"
          onClick={resetCar}
          className="self-end px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-widest active:bg-cream-100"
        >
          Sıfırla
        </button>
      </div>
    </div>
  )
}

const Kbd = ({ children, small }: { children: React.ReactNode; small?: boolean }) => (
  <kbd
    className={`inline-flex items-center justify-center rounded border border-stone-300 bg-stone-50 font-mono font-bold text-stone-700 ${
      small ? "text-[9px] px-1 py-0.5 min-w-[16px]" : "text-[10px] px-1.5 py-0.5 min-w-[18px]"
    }`}
  >
    {children}
  </kbd>
)

export { ExperienceArcade }
