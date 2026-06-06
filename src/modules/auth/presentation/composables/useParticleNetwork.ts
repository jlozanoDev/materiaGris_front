import { ref, watch, onUnmounted, type Ref } from "vue"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseColor: string
  firing: boolean
  fireTimer: number
  maxFireTimer: number
}

interface Signal {
  fromIdx: number
  toIdx: number
  progress: number
  speed: number
  color: string
}

interface ParticleNetworkOptions {
  particleCount?: number
  connectionDistance?: number
  particleRadiusMin?: number
  particleRadiusMax?: number
  driftSpeed?: number
  colors?: string[]
  fireColors?: string[]
  baseLineOpacity?: number
  baseLineWidth?: number
  fireDuration?: number
  signalSpeed?: number
  fireChance?: number
}

interface UseParticleNetworkReturn {
  isRunning: Ref<boolean>
  start: () => void
  stop: () => void
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function useParticleNetwork(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: ParticleNetworkOptions = {}
): UseParticleNetworkReturn {
  const {
    particleCount = 70,
    connectionDistance = 150,
    particleRadiusMin = 1.5,
    particleRadiusMax = 3,
    driftSpeed = 0.05,
    colors = ["#7c3aed", "#06b6d4"],
    fireColors = ["#ffffff", "#e0e7ff", "#c4b5fd", "#a5f3fc"],
    baseLineOpacity = 0.12,
    baseLineWidth = 0.6,
    fireDuration = 50,
    signalSpeed = 0.025,
    fireChance = 0.008,
  } = options

  const isRunning = ref(false)
  let animId: number | null = null
  let particles: Particle[] = []
  let signals: Signal[] = []
  let reducedMotion = false
  let w = 0
  let h = 0
  let frameCount = 0

  function resize(): void {
    const canvas = canvasRef.value
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    w = parent.clientWidth
    h = parent.clientHeight
    canvas.width = w
    canvas.height = h
  }

  function createParticles(): void {
    particles = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * driftSpeed,
        vy: (Math.random() - 0.5) * driftSpeed,
        radius: particleRadiusMin + Math.random() * (particleRadiusMax - particleRadiusMin),
        baseColor: colors[Math.floor(Math.random() * colors.length)],
        firing: false,
        fireTimer: 0,
        maxFireTimer: fireDuration,
      })
    }
  }

  function triggerFire(idx: number): void {
    const p = particles[idx]
    if (!p || p.firing) return

    p.firing = true
    p.fireTimer = fireDuration
    p.maxFireTimer = fireDuration

    if (signals.length >= 15) return

    const color = fireColors[Math.floor(Math.random() * fireColors.length)]

    for (let j = 0; j < particles.length; j++) {
      if (j === idx) continue
      if (signals.length >= 15) break
      const q = particles[j]
      const dx = p.x - q.x
      const dy = p.y - q.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < connectionDistance) {
        signals.push({
          fromIdx: idx,
          toIdx: j,
          progress: 0,
          speed: signalSpeed * (0.6 + Math.random() * 0.8),
          color,
        })
      }
    }
  }

  function updateParticles(): void {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1
      p.x = Math.max(0, Math.min(w, p.x))
      p.y = Math.max(0, Math.min(h, p.y))

      if (p.firing) {
        p.fireTimer--
        if (p.fireTimer <= 0) {
          p.firing = false
          p.fireTimer = 0
        }
      }
    }
  }

  function updateSignals(): void {
    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i]
      s.progress += s.speed

      if (s.progress >= 1) {
        triggerFire(s.toIdx)
        signals.splice(i, 1)
      }
    }
  }

  function tryRandomFire(): void {
    for (let attempt = 0; attempt < 3; attempt++) {
      const idx = Math.floor(Math.random() * particles.length)
      if (!particles[idx].firing && Math.random() < fireChance) {
        triggerFire(idx)
        break
      }
    }
  }

  function drawFrame(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, w, h)

    const firingSet = new Set<number>()
    for (let i = 0; i < particles.length; i++) {
      if (particles[i].firing) firingSet.add(i)
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j]
        const dx = p.x - q.x
        const dy = p.y - q.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist >= connectionDistance) continue
        const distFactor = 1 - dist / connectionDistance
        let alpha = baseLineOpacity * distFactor
        let width = baseLineWidth

        if (firingSet.has(i) || firingSet.has(j)) {
          alpha = Math.max(alpha, 0.4 * distFactor)
          width = baseLineWidth + 1.5
        }

        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(q.x, q.y)
        ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`
        ctx.lineWidth = width
        ctx.stroke()
      }
    }

    for (const s of signals) {
      const from = particles[s.fromIdx]
      const to = particles[s.toIdx]
      if (!from || !to) continue

      const t = s.progress
      const x = from.x + (to.x - from.x) * t
      const y = from.y + (to.y - from.y) * t

      const glowRadius = 3 + (1 - t) * 2

      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius + 6)
      grad.addColorStop(0, "rgba(255, 255, 255, 0.9)")
      grad.addColorStop(0.3, hexToRgba(s.color, 0.8))
      grad.addColorStop(1, hexToRgba("#7c3aed", 0))

      ctx.beginPath()
      ctx.arc(x, y, glowRadius + 6, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }

    for (const p of particles) {
      if (p.firing) {
        const intensity = p.fireTimer / p.maxFireTimer

        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius + 8 + intensity * 12)
        glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.7 * intensity})`)
        glowGrad.addColorStop(0.4, hexToRgba(p.baseColor, 0.5 * intensity))
        glowGrad.addColorStop(1, hexToRgba(p.baseColor, 0))

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius + 8 + intensity * 12, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()
      }

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)

      if (p.firing) {
        const intensity = p.fireTimer / p.maxFireTimer
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + 0.7 * intensity})`
      } else {
        ctx.fillStyle = p.baseColor
        ctx.globalAlpha = 0.55
      }
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  function update(): void {
    frameCount++
    updateParticles()
    updateSignals()

    if (frameCount % 3 === 0) {
      tryRandomFire()
    }
  }

  function loop(): void {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    update()
    drawFrame(ctx)

    animId = requestAnimationFrame(loop)
  }

  function stop(): void {
    if (animId !== null) {
      cancelAnimationFrame(animId)
      animId = null
    }
    signals = []
    isRunning.value = false
  }

  function drawStaticFrame(): void {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    resize()
    createParticles()
    ctx.clearRect(0, 0, w, h)
    for (const p of particles) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = p.baseColor
      ctx.globalAlpha = 0.55
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  function start(): void {
    stop()
    const canvas = canvasRef.value
    if (!canvas) return

    resize()
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    createParticles()

    if (reducedMotion) {
      drawStaticFrame()
      return
    }

    isRunning.value = true
    loop()
  }

  function onChangeReducedMotion(e: MediaQueryListEvent): void {
    reducedMotion = e.matches
    if (reducedMotion) {
      stop()
      drawStaticFrame()
    } else {
      start()
    }
  }

  function onResize(): void {
    resize()
    if (isRunning.value) {
      particles.forEach((p) => {
        p.x = Math.min(p.x, w)
        p.y = Math.min(p.y, h)
      })
    }
  }

  let resizeObserver: ResizeObserver | null = null
  let reducedMotionMq: MediaQueryList | null = null

  function init(canvas: HTMLCanvasElement): void {
    reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)")
    reducedMotionMq.addEventListener("change", onChangeReducedMotion)

    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(canvas.parentElement!)

    window.addEventListener("resize", onResize)
    start()
  }

  onUnmounted(() => {
    stop()
    window.removeEventListener("resize", onResize)
    if (resizeObserver) resizeObserver.disconnect()
    if (reducedMotionMq) reducedMotionMq.removeEventListener("change", onChangeReducedMotion)
  })

  watch(canvasRef, (canvas) => {
    if (canvas) init(canvas)
  })

  return { isRunning, start, stop }
}
