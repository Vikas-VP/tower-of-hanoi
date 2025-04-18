"use client"

import { useEffect, useRef } from "react"
import styled from "styled-components"

const FireworksContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
`

const FireworksCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  size: number
}

interface Firework {
  particles: Particle[]
  x: number
  y: number
  color: string
  exploded: boolean
  vy: number
}

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fireworksRef = useRef<Firework[]>([])
  const animationRef = useRef<number>(0)

  // Initialize fireworks
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Colors for fireworks
    const colors = [
      "#ff0000", // Red
      "#00ff00", // Green
      "#0000ff", // Blue
      "#ffff00", // Yellow
      "#ff00ff", // Magenta
      "#00ffff", // Cyan
      "#ff8000", // Orange
      "#8000ff", // Purple
      "#ff0080", // Pink
      "#00ff80", // Mint
    ]

    // Create a new firework
    const createFirework = () => {
      const x = Math.random() * canvas.width
      const y = canvas.height
      const color = colors[Math.floor(Math.random() * colors.length)]
      const vy = -15 - Math.random() * 5 // Upward velocity

      return {
        particles: [],
        x,
        y,
        color,
        exploded: false,
        vy,
      }
    }

    // Create particles for explosion
    const createParticles = (x: number, y: number, color: string) => {
      const particles: Particle[] = []
      const particleCount = 80 + Math.floor(Math.random() * 40)

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 3
        const size = 1 + Math.random() * 2

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size,
        })
      }

      return particles
    }

    // Launch initial fireworks
    for (let i = 0; i < 4; i++) {
      fireworksRef.current.push(createFirework())
    }

    // Animation loop
    const animate = () => {
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = "lighter"

      // Update and draw fireworks
      fireworksRef.current.forEach((firework, index) => {
        if (!firework.exploded) {
          // Draw firework trail
          ctx.beginPath()
          ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = firework.color
          ctx.fill()

          // Move firework up
          firework.y += firework.vy
          firework.vy += 0.1 // Gravity

          // Explode when velocity becomes positive (at peak)
          if (firework.vy >= -1) {
            firework.exploded = true
            firework.particles = createParticles(firework.x, firework.y, firework.color)
          }
        } else {
          // Draw and update particles
          firework.particles.forEach((particle, particleIndex) => {
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.alpha})`
            ctx.fill()

            // Update particle position
            particle.x += particle.vx
            particle.y += particle.vy
            particle.vy += 0.05 // Gravity
            particle.alpha -= 0.01 // Fade out

            // Remove faded particles
            if (particle.alpha <= 0) {
              firework.particles.splice(particleIndex, 1)
            }
          })

          // Remove firework if all particles are gone
          if (firework.particles.length === 0) {
            fireworksRef.current.splice(index, 1)
            // Add a new firework
            if (Math.random() < 0.5) {
              fireworksRef.current.push(createFirework())
            }
          }
        }
      })

      // Add new fireworks occasionally
      if (Math.random() < 0.05 && fireworksRef.current.length < 8) {
        fireworksRef.current.push(createFirework())
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Helper function to convert hex to rgb
    function hexToRgb(hex: string) {
      const r = Number.parseInt(hex.slice(1, 3), 16)
      const g = Number.parseInt(hex.slice(3, 5), 16)
      const b = Number.parseInt(hex.slice(5, 7), 16)
      return `${r}, ${g}, ${b}`
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <FireworksContainer>
      <FireworksCanvas ref={canvasRef} />
    </FireworksContainer>
  )
}
