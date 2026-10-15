import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function useIdleFrame(animate: (time: number) => void) {
  const paused = useRef(true)
  const time = useRef(0)
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      paused.current = motion.matches || document.hidden
    }
    update()
    motion.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      motion.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  useFrame((_, delta) => {
    if (paused.current) return
    time.current += Math.min(delta, 0.1)
    animate(time.current)
  })
}
