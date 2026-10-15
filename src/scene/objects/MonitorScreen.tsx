import { useEffect, useRef } from 'react'
import {
  CanvasTexture,
  SRGBColorSpace,
  type MeshStandardMaterial,
  type PointLight,
} from 'three'
import { useIdleFrame } from '../useIdleFrame'
import { palette } from '../layout'

function drawDashboard(canvas: HTMLCanvasElement, tick: number) {
  const context = canvas.getContext('2d')!
  context.fillStyle = '#142622'
  context.fillRect(0, 0, 512, 256)
  context.fillStyle = '#638b84'
  context.fillRect(20, 16, 140, 8)
  for (let i = 0; i < 6; i++) {
    const height = 30 + (Math.sin(tick * 0.4 + i) + 1) * 30
    context.fillStyle = i % 2 ? '#8dbcc5' : '#a9b88d'
    context.fillRect(24 + i * 35, 136 - height, 22, height)
  }
  context.beginPath()
  context.strokeStyle = '#d6b47b'
  context.lineWidth = 4
  for (let i = 0; i < 12; i++) {
    const x = 270 + i * 19
    const y = 90 + Math.sin(i * 0.8 + tick * 0.2) * 24 - i * 3
    if (i === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.stroke()
  for (let row = 0; row < 4; row++) {
    context.fillStyle = '#2c443d'
    context.fillRect(20, 158 + row * 22, 472, 14)
    context.fillStyle = '#8dbcc5'
    context.fillRect(28, 162 + row * 22, 70 + ((tick + row * 17) % 90), 5)
    context.fillStyle = '#a9b88d'
    context.fillRect(392, 162 + row * 22, 70, 5)
  }
}

export function MonitorScreen() {
  const texture = useRef<CanvasTexture | null>(null)
  const material = useRef<MeshStandardMaterial>(null)
  const light = useRef<PointLight>(null)
  const lastTick = useRef(0)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    drawDashboard(canvas, 0)
    const next = new CanvasTexture(canvas)
    next.colorSpace = SRGBColorSpace
    texture.current = next
    if (material.current) {
      material.current.map = next
      material.current.emissiveMap = next
      material.current.needsUpdate = true
    }
    return () => {
      texture.current = null
      next.dispose()
    }
  }, [])
  useIdleFrame((time) => {
    if (light.current)
      light.current.intensity = 1.2 + Math.sin(time * 1.4) * 0.12
    const tick = Math.floor(time * 4)
    const dashboard = texture.current
    if (dashboard && tick !== lastTick.current) {
      lastTick.current = tick
      drawDashboard(dashboard.image as HTMLCanvasElement, tick)
      dashboard.needsUpdate = true
    }
  })
  return (
    <>
      <mesh position={[0, 1.85, -0.155]}>
        <planeGeometry args={[1.24, 0.69]} />
        <meshStandardMaterial
          color={palette.cool}
          ref={material}
          emissive="#ffffff"
          emissiveIntensity={0.65}
          roughness={0.6}
        />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 1.9, 0.2]}
        color={palette.cool}
        intensity={1.2}
        distance={3}
      />
    </>
  )
}
