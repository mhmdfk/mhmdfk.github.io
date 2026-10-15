import { Component, lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
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
  const { detected, override } = useSceneQuality()
  const tier = override === 'off' ? 'off' : detected
  const [ready, setReady] = useState<HTMLElement | null>(null)

  useEffect(() => {
    restoreOverride()
    set({ detected: detectQuality() })
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => set({ detected: detectQuality() })
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(
        () => setReady(document.getElementById('root')),
        {
          timeout: 1500,
        },
      )
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setReady(document.getElementById('root')), 200)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      <div className="scene scene-backdrop" aria-hidden="true" />
      {ready && tier !== 'off' ? (
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <Scene eventSource={ready} tier={tier} />
          </Suspense>
        </SceneErrorBoundary>
      ) : null}
    </>
  )
}
