import { ui } from '../content/content'
import { HoverContext, sceneTargetAllowed, type Hover } from './interaction'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Color } from 'three'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import {
  Bloom,
  EffectComposer,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
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

export default function Scene({ eventSource }: { eventSource: HTMLElement }) {
  const [visible, setVisible] = useState(false)
  const [hover, setHover] = useState<Hover>(null)
  useEffect(() => {
    const root = eventSource
    const clear = () => setHover(null)
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !sceneTargetAllowed(event.target))
        clear()
    }
    root.addEventListener('pointermove', move, true)
    root.addEventListener('pointerleave', clear)
    window.addEventListener('scroll', clear)
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => {
      root.removeEventListener('pointermove', move, true)
      root.removeEventListener('pointerleave', clear)
      window.removeEventListener('scroll', clear)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', clear)
    }
  }, [eventSource])
  useEffect(() => {
    if (!hover || !eventSource) return
    eventSource.classList.add('scene-object-hovered')
    return () => eventSource.classList.remove('scene-object-hovered')
  }, [hover, eventSource])
  const reveal = useCallback(() => setVisible(true), [])

  return (
    <>
      <div className={visible ? 'scene is-ready' : 'scene'} aria-hidden="true">
        {eventSource && (
          <Canvas
            eventSource={eventSource}
            eventPrefix="client"
            shadows
            dpr={[1, 1.5]}
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
            <ambientLight color="#c2d5c9" intensity={0.3} />
            <directionalLight
              position={[-3, 7, 4]}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-camera-left={-7}
              shadow-camera-right={7}
              shadow-camera-top={7}
              shadow-camera-bottom={-7}
              shadow-camera-near={1}
              shadow-camera-far={22}
              shadow-normalBias={0.035}
              shadow-bias={-0.0002}
              color="#ffdfb5"
              intensity={2}
            />
            <Environment frames={1} resolution={64} environmentIntensity={0.45}>
              <Lightformer
                position={[0, 6, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[8, 8, 1]}
                color="#ffe1b8"
                intensity={2}
              />
              <Lightformer
                position={[-4, 2, 1]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[4, 3, 1]}
                color={palette.accent}
                intensity={1.5}
              />
              <Lightformer
                position={[0, 3, -4]}
                scale={[3, 2, 1]}
                color={palette.cool}
                intensity={2}
              />
            </Environment>
            <EffectComposer multisampling={0} enableNormalPass={false}>
              <Bloom
                mipmapBlur
                intensity={0.12}
                luminanceThreshold={1}
                luminanceSmoothing={0.15}
              />
              <Vignette eskil={false} offset={0.2} darkness={0.3} />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
            <ScrollCamera />
            <HoverContext.Provider value={{ hover, reportHover: setHover }}>
              <Room />
            </HoverContext.Provider>
            <ContactShadows
              position={[0, 0.03, 0]}
              scale={20}
              resolution={256}
              frames={1}
              opacity={0.35}
              blur={2}
              far={3}
              color="#101b16"
            />
            <FirstFrame onReady={reveal} />
          </Canvas>
        )}
      </div>
      {hover && (
        <div
          className="scene-tooltip"
          aria-hidden="true"
          style={{ left: hover.x, top: hover.y }}
        >
          {ui.scene[hover.id]}
        </div>
      )}
    </>
  )
}
