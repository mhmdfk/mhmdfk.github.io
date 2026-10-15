import { useEffect, useRef } from 'react'
import { CanvasTexture, SRGBColorSpace, type MeshStandardMaterial } from 'three'
import { palette } from '../layout'

export function Rug() {
  const material = useRef<MeshStandardMaterial>(null)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const context = canvas.getContext('2d')!
    context.fillStyle = '#777461'
    context.fillRect(0, 0, 256, 256)
    context.strokeStyle = palette.accent
    context.lineWidth = 3
    context.strokeRect(14, 14, 228, 228)
    context.strokeRect(21, 21, 214, 214)
    context.strokeStyle = '#a6a08a'
    context.lineWidth = 2
    for (let x = 48; x < 230; x += 40) {
      for (let y = 48; y < 230; y += 40) {
        context.beginPath()
        context.moveTo(x, y - 9)
        context.lineTo(x + 9, y)
        context.lineTo(x, y + 9)
        context.lineTo(x - 9, y)
        context.closePath()
        context.stroke()
      }
    }
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    if (material.current) {
      material.current.map = texture
      material.current.needsUpdate = true
    }
    return () => texture.dispose()
  }, [])
  return (
    <mesh
      position={[0, 0.025, 0.65]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[3.9, 3.7]} />
      <meshStandardMaterial ref={material} roughness={1} />
    </mesh>
  )
}
