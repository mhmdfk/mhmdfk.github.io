import { useEffect, useState } from 'react'

export function useMotionSettings() {
  const [settings, setSettings] = useState({ enabled: false, fine: false })
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = window.matchMedia('(pointer: fine)')
    const update = () =>
      setSettings({ enabled: !reduced.matches, fine: pointer.matches })
    const frame = requestAnimationFrame(update)
    reduced.addEventListener('change', update)
    pointer.addEventListener('change', update)
    return () => {
      cancelAnimationFrame(frame)
      reduced.removeEventListener('change', update)
      pointer.removeEventListener('change', update)
    }
  }, [])
  return settings
}
