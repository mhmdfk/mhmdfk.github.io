import type { SceneIntro } from './useSceneIntro'
import type { SceneQuality } from './quality'
import { set as setSceneQuality } from '../state/sceneQuality'
import { ui } from '../content/content'
import { HoverContext, sceneTargetAllowed, type Hover } from './interaction'
import {
  type ComponentType,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Color, HalfFloatType, WebGLRenderTarget } from 'three'
import {
  ContactShadows,
  PerformanceMonitor,
  useProgress,
} from '@react-three/drei'
import { Room } from './Room'
import { palette } from './layout'
import { cameraStops } from './cameraPath'
import { useScrollCamera } from './useScrollCamera'
import { ObjectTags } from './ObjectTags'
import { markThrottled, useRoomViewValue } from '../state/roomView'

function disableScene() {
  setSceneQuality({ detected: 'off' })
}

function SceneRuntime({
  tier,
  stage,
  onDecline,
}: {
  tier: Exclude<SceneQuality, 'off'>
  stage: number
  onDecline: () => void
}) {
  const gl = useThree((state) => state.gl)
  const setFrameloop = useThree((state) => state.setFrameloop)
  const invalidate = useThree((state) => state.invalidate)
  const roomViewOpen = useRoomViewValue((state) => state.open)
  const throttled = useRoomViewValue((state) => state.throttled)
  const [active, setActive] = useState(false)
  useEffect(() => {
    let intersecting = true
    const update = () => {
      const running = !document.hidden && intersecting
      // The low tier only renders on demand: scrolling and camera easing
      // invalidate, so an idle page costs no frames. The room view keeps the
      // camera, the tags and the idle animations moving, so it renders always.
      setFrameloop(
        running
          ? tier === 'low' && !roomViewOpen
            ? 'demand'
            : 'always'
          : 'never',
      )
      if (running && tier === 'low') invalidate()
      setActive(running)
    }
    const lost = (event: Event) => {
      event.preventDefault()
      setFrameloop('never')
      disableScene()
    }
    const canvas = gl.domElement
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting
      update()
    })
    observer.observe(canvas)
    canvas.addEventListener('webglcontextlost', lost)
    document.addEventListener('visibilitychange', update)
    update()
    return () => {
      observer.disconnect()
      canvas.removeEventListener('webglcontextlost', lost)
      document.removeEventListener('visibilitychange', update)
    }
  }, [gl, setFrameloop, invalidate, tier, roomViewOpen])

  // PerformanceMonitor counts rendered frames, which would read as low fps
  // under demand rendering, so the low tier only measures in the room view.
  // If it can't keep up there it drops back to the light settings for good
  // (the scene itself stays).
  if (!active) return null
  if (tier === 'low')
    return roomViewOpen && !throttled ? (
      <PerformanceMonitor
        ms={500}
        iterations={10}
        threshold={0.8}
        bounds={() => [30, 60]}
        onDecline={markThrottled}
      />
    ) : null
  return (
    <PerformanceMonitor
      key={stage}
      ms={500}
      iterations={10}
      threshold={0.8}
      bounds={() => [tier === 'high' && stage < 2 ? 55 : 30, 60]}
      onDecline={onDecline}
    />
  )
}

function ScrollCamera({
  intro,
  tier,
}: {
  intro: SceneIntro
  tier: Exclude<SceneQuality, 'off'>
}) {
  useScrollCamera(intro, tier)
  return null
}

function LoadingProgress({
  onProgress,
}: {
  onProgress: (progress: number | null) => void
}) {
  const { total, progress } = useProgress()
  useEffect(() => {
    onProgress(total > 0 ? progress : null)
  }, [total, progress, onProgress])
  return null
}

// Queues every shader compile up front and waits for them without blocking the
// main thread (KHR_parallel_shader_compile). Rendering only starts afterwards,
// so the first frames don't stall on synchronous compile checks.
// With postprocessing the scene is drawn into an offscreen target, which needs
// different shader variants (no tone mapping, linear output), so compile those.
function Precompile({
  offscreen,
  onDone,
}: {
  offscreen: boolean
  onDone: () => void
}) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  useEffect(() => {
    let cancelled = false
    const target = offscreen
      ? new WebGLRenderTarget(1, 1, { type: HalfFloatType })
      : null
    const previous = gl.getRenderTarget()
    gl.setRenderTarget(target)
    const compiling = gl.compileAsync(scene, camera)
    gl.setRenderTarget(previous)
    compiling
      .catch(() => {})
      .then(() => {
        target?.dispose()
        if (!cancelled) onDone()
      })
    return () => {
      cancelled = true
    }
  }, [gl, scene, camera, offscreen, onDone])
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

export default function Scene({
  eventSource,
  tier,
  intro,
  onReady,
  onProgress,
}: {
  intro: SceneIntro
  onReady: () => void
  onProgress: (progress: number | null) => void
  eventSource: HTMLElement
  tier: Exclude<SceneQuality, 'off'>
}) {
  const roomViewOpen = useRoomViewValue((state) => state.open)
  const throttled = useRoomViewValue((state) => state.throttled)
  const [stage, setStage] = useState(0)
  const full = tier === 'high' && stage < 2
  const decline = () => {
    if (tier === 'low' || stage >= 2) disableScene()
    else setStage(stage + 1)
  }
  const [visible, setVisible] = useState(false)
  const [compiled, setCompiled] = useState(false)
  const markCompiled = useCallback(() => setCompiled(true), [])
  // The room mounts in stages; shaders are compiled once everything is in.
  const [roomMounted, setRoomMounted] = useState(false)
  const markRoomMounted = useCallback(() => setRoomMounted(true), [])
  const [Effects, setEffects] = useState<ComponentType | null>(null)
  useEffect(() => {
    if (!full) return
    let cancelled = false
    import('./Effects').then((module) => {
      if (!cancelled) setEffects(() => module.default)
    })
    return () => {
      cancelled = true
    }
  }, [full])
  // Postprocessing changes which shader variants are needed, so on the full
  // tier wait for it before precompiling.
  const readyToCompile = roomMounted && (!full || Effects !== null)
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
  const reveal = useCallback(() => {
    setVisible(true)
    onReady()
  }, [onReady])

  return (
    <>
      <LoadingProgress onProgress={onProgress} />
      <div className={visible ? 'scene is-ready' : 'scene'} aria-hidden="true">
        {eventSource && (
          <Canvas
            eventSource={eventSource}
            eventPrefix="client"
            shadows={full ? 'percentage' : false}
            dpr={
              tier === 'high' && stage === 0
                ? [1, 2]
                : // Phones render sharper in the room view, where a still
                  // frame is the point. R3F reapplies this prop on every render,
                  // so a manual setDpr would not stick.
                  tier === 'low' && roomViewOpen && !throttled
                  ? Math.min(window.devicePixelRatio, 2)
                  : 1
            }
            frameloop="never"
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
              castShadow={full}
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
            {/* Soft fill that the reflection environment used to provide: warm
                from the ceiling panel above, dark green bounce from the floor.
                Cheaper than <Environment>, which compiles its own shaders at mount. */}
            <hemisphereLight args={['#ffe1b8', '#1b2a22', 0.55]} />
            {full && Effects && <Effects />}
            {compiled && (
              <SceneRuntime tier={tier} stage={stage} onDecline={decline} />
            )}
            <ScrollCamera intro={intro} tier={tier} />
            {roomViewOpen && <ObjectTags />}
            <HoverContext.Provider value={{ hover, reportHover: setHover }}>
              <Room onMounted={markRoomMounted} />
            </HoverContext.Provider>
            {(full || tier === 'low') && (
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
            )}
            {compiled ? (
              <FirstFrame onReady={reveal} />
            ) : (
              readyToCompile && (
                <Precompile offscreen={full} onDone={markCompiled} />
              )
            )}
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
