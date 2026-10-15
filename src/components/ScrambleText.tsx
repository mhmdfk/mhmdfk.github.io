import { useEffect, useRef, useState } from 'react'
import { useMotionSettings } from './useMotionSettings'

export function ScrambleText({ children }: { children: string }) {
  const element = useRef<HTMLSpanElement>(null)
  const played = useRef(false)
  const [visual, setVisual] = useState<string | null>(null)
  const { enabled } = useMotionSettings()
  useEffect(() => {
    if (
      !enabled ||
      played.current ||
      !element.current ||
      !('IntersectionObserver' in window)
    )
      return
    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      played.current = true
      observer.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 600, 1)
        const resolved = Math.floor(progress * children.length)
        setVisual(
          progress === 1
            ? null
            : Array.from(children, (char, index) =>
                index < resolved || /\s/.test(char)
                  ? char
                  : String.fromCharCode(65 + Math.floor(Math.random() * 26)),
              ).join(''),
        )
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    })
    observer.observe(element.current)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [children, enabled])
  const active = enabled && visual !== null
  return (
    <span ref={element} className="scramble-text">
      <span style={{ opacity: active ? 0 : 1 }}>{children}</span>
      {active && (
        <span className="scramble-visual" aria-hidden="true">
          {visual}
        </span>
      )}
    </span>
  )
}
