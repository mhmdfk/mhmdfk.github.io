import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ui } from '../content/content'
import { useSceneIntro } from './useSceneIntro'
import { detectQuality } from './quality'
import { restoreOverride, set, useSceneQuality } from '../state/sceneQuality'

const Scene = lazy(() => import('./Scene'))

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    set({ detected: 'off' })
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function SceneLoader() {
  const intro = useSceneIntro()
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const announced = useRef(false)
  const onReady = useCallback(() => setLoaded(true), [])
  const { detected, override } = useSceneQuality()
  const tier = override === 'off' ? 'off' : detected
  const [loadingHost, setLoadingHost] = useState<HTMLElement | null>(null)
  const [ready, setReady] = useState<HTMLElement | null>(null)

  useEffect(() => {
    restoreOverride()
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => set({ detected: detectQuality() })
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])

  // Building the room costs seconds of main-thread work, so the decorative
  // scene waits for the first interaction (or a few idle seconds) instead of
  // competing with the content during load.
  useEffect(() => {
    const events = [
      'pointermove',
      'pointerdown',
      'wheel',
      'touchstart',
      'keydown',
      'scroll',
    ]
    let idle: number | undefined
    const start = () => {
      // Probing WebGL creates a throwaway context, which is expensive, so it
      // runs here rather than during hydration.
      set({ detected: detectQuality() })
      setReady(document.getElementById('root'))
      setLoadingHost(document.getElementById('scene-loading-slot'))
    }
    const trigger = () => {
      cancelTriggers()
      if ('requestIdleCallback' in window)
        idle = window.requestIdleCallback(start, { timeout: 1000 })
      else start()
    }
    const timer = setTimeout(trigger, 6000)
    const cancelTriggers = () => {
      clearTimeout(timer)
      events.forEach((event) => window.removeEventListener(event, trigger))
    }
    events.forEach((event) =>
      window.addEventListener(event, trigger, { once: true, passive: true }),
    )
    return () => {
      cancelTriggers()
      if (idle !== undefined) window.cancelIdleCallback(idle)
    }
  }, [])

  useEffect(() => {
    if (tier !== 'off') return
    const id = setTimeout(() => {
      setLoaded(false)
      setProgress(null)
    }, 0)
    return () => clearTimeout(id)
  }, [tier])

  const loading = tier !== 'off' && ready !== null && !loaded
  useEffect(() => {
    if (!loading) {
      const id = setTimeout(() => setAnnouncement(''), 0)
      return () => clearTimeout(id)
    }
    if (!announced.current) {
      // Defer the message so the empty live region is already mounted.
      const id = setTimeout(() => {
        announced.current = true
        setAnnouncement(ui.sceneLoading)
      }, 0)
      return () => {
        clearTimeout(id)
      }
    }
  }, [loading])

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      {loadingHost &&
        createPortal(
          <div
            className={`scene-loading${loading ? ' is-loading' : ''}`}
            aria-hidden="true"
          >
            <div className="scene-loading-track">
              <span
                className={progress === null ? 'is-indeterminate' : undefined}
                style={
                  progress === null ? undefined : { width: `${progress}%` }
                }
              />
            </div>
            <span className="scene-loading-label">{ui.sceneLoading}</span>
          </div>,
          loadingHost,
        )}
      <div className="scene scene-backdrop" aria-hidden="true" />
      {ready && tier !== 'off' ? (
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <Scene
              eventSource={ready}
              tier={tier}
              intro={intro}
              onReady={onReady}
              onProgress={setProgress}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : null}
    </>
  )
}
