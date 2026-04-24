'use client'
import { useEffect, useRef } from 'react'

export function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: Array<{
      x: number; y: number; r: number
      vx: number; vy: number; alpha: number
    }> = []

    for (let i = 0; i < 60; i++) {
      particles.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.5 + 0.3,
        vx:    (Math.random() - 0.5) * 0.3,
        vy:    -Math.random() * 0.5 - 0.1,
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    let animId: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(242, 169, 11, ${p.alpha})`
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
      })
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 5, pointerEvents: 'none', opacity: 0.6,
      }}
    />
  )
}
