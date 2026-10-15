import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { SplashScreen } from '../components/SplashScreen'
import { useSceneIntro } from './useSceneIntro'
import { detectQuality } from './quality'
import {
  get,
  restoreOverride,
  set,
  useSceneQuality,
} from '../state/sceneQuality'

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
  const [building, setBuilding] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const onReady = useCallback(() => setLoaded(true), [])
  const onProgress = useCallback((value: number | null) => {
    setBuilding(true)
    setProgress(value)
  }, [])
  const { detected, override } = useSceneQuality()
  const tier = override === 'off' ? 'off' : detected
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    restoreOverride()
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () =>
      set({ detected: get().override === 'off' ? 'off' : detectQuality() })
    // Resolve opt-outs and capability before ever rendering the lazy scene.
    const timer = window.setTimeout(() => {
      update()
      setHost(document.getElementById('root'))
    }, 0)
    motion.addEventListener('change', update)
    return () => {
      window.clearTimeout(timer)
      motion.removeEventListener('change', update)
    }
  }, [override])

  useEffect(() => {
    if (tier !== 'off') return
    const timer = window.setTimeout(() => {
      setLoaded(false)
      setBuilding(false)
      setProgress(null)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [tier])

  return (
    <>
      <SplashScreen
        ready={loaded}
        unavailable={host !== null && tier === 'off'}
        building={building}
        progress={progress}
      />
      <div className="scene scene-backdrop" aria-hidden="true" />
      {host && tier !== 'off' ? (
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <Scene
              eventSource={host}
              tier={tier}
              intro={intro}
              onReady={onReady}
              onProgress={onProgress}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : null}
    </>
  )
}
