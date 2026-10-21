import { useEffect, useRef } from 'react'
import { useSceneQuality } from '../state/sceneQuality'
import { useRoomViewValue } from '../state/roomView'
import { useFrame } from '@react-three/fiber'

export function useIdleFrame(animate: (time: number) => void) {
  const { detected, override } = useSceneQuality()
  // Phones only animate the room while the room view is open, and stop for good
  // if they can't keep up.
  const roomView = useRoomViewValue((state) => state.open && !state.throttled)
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
    if (
      paused.current ||
      (detected !== 'high' && !roomView) ||
      override === 'off'
    )
      return
    time.current += Math.min(delta, 0.1)
    animate(time.current)
  })
}
