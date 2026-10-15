import { ui } from '../content/content'
import { HoverContext, sceneTargetAllowed, type Hover } from './interaction'
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
            <directionalLight
              position={[1, 7, 6]}
              color="#e3e4d4"
              intensity={2}
            />
            <ScrollCamera />
            <HoverContext.Provider value={{ hover, reportHover: setHover }}>
              <Room />
            </HoverContext.Provider>
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
