import { Component, lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

const Scene = lazy(() => import('./Scene'))

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function SceneLoader() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), {
        timeout: 1500,
      })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setReady(true), 200)
    return () => clearTimeout(id)
  }, [])

  return ready ? (
    <SceneErrorBoundary>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </SceneErrorBoundary>
  ) : null
}
