import { useCallback, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Color } from 'three'
import { PerspectiveCamera } from '@react-three/drei'
import { Room } from './Room'
import { cameraStops, palette } from './layout'

function HeroCamera() {
  const size = useThree((state) => state.size)
  const fov = Math.max(
    42,
    (2 * Math.atan(Math.tan(Math.PI / 9) / (size.width / size.height)) * 180) /
      Math.PI,
  )
  return (
    <PerspectiveCamera
      makeDefault
      position={cameraStops.hero.position}
      fov={fov}
      near={0.1}
      far={80}
      onUpdate={(camera) => camera.lookAt(...cameraStops.hero.target)}
    />
  )
}

function FirstFrame({ onReady }: { onReady: () => void }) {
  const rendered = useRef(false)
  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera)
    if (!rendered.current) {
      rendered.current = true
      onReady()
    }
  }, 1)
  return null
}

export default function Scene() {
  const [visible, setVisible] = useState(false)
  const reveal = useCallback(() => setVisible(true), [])

  return (
    <div className={visible ? 'scene is-ready' : 'scene'} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
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
        <HeroCamera />
        <Room />
        <FirstFrame onReady={reveal} />
      </Canvas>
    </div>
  )
}
