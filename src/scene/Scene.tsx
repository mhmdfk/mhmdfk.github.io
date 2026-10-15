import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Color } from 'three'
import { Room } from './Room'
import { palette } from './layout'
import { cameraStops } from './cameraPath'
import { useScrollCamera } from './useScrollCamera'

function ScrollCamera() {
  useScrollCamera()
  return null
}

function FirstFrame({ onReady }: { onReady: () => void }) {
  const frame = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
    },
    [],
  )
  useFrame(() => {
    if (frame.current === null) frame.current = requestAnimationFrame(onReady)
  })
  return null
}

export default function Scene() {
  const [visible, setVisible] = useState(false)
  const reveal = useCallback(() => setVisible(true), [])

  return (
    <div className={visible ? 'scene is-ready' : 'scene'} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{
          position: cameraStops[0].position,
          fov: 42,
          near: 0.1,
          far: 80,
        }}
        onCreated={({ scene }) => {
          scene.background = new Color(
            getComputedStyle(document.documentElement)
              .getPropertyValue('--color-background')
              .trim() || palette.background,
          )
        }}
      >
        <ambientLight color="#a3bed0" intensity={0.45} />
        <directionalLight position={[1, 7, 6]} color="#e3e4d4" intensity={2} />
        <ScrollCamera />
        <Room />
        <FirstFrame onReady={reveal} />
      </Canvas>
    </div>
  )
}
