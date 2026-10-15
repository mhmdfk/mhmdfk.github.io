import { useEffect, useRef } from 'react'
import { m, useSpring } from 'motion/react'
import { useMotionSettings } from './useMotionSettings'

export function CustomCursor() {
  const { enabled, fine } = useMotionSettings()
  const element = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 320, damping: 30 })
  const y = useSpring(0, { stiffness: 320, damping: 30 })
  const scale = useSpring(1, { stiffness: 300, damping: 24 })
  useEffect(() => {
    if (!enabled || !fine) return
    let visible = false
    const hide = () => {
      visible = false
      if (element.current) element.current.style.opacity = '0'
    }
    const grow = () => {
      const link = document.querySelector(
        'a:hover, button:hover, [role="button"]:hover',
      )
      scale.set(
        link || document.querySelector('.scene-object-hovered') ? 1.8 : 1,
      )
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        hide()
        return
      }
      if (!visible) {
        x.jump(event.clientX)
        y.jump(event.clientY)
      }
      x.set(event.clientX)
      y.set(event.clientY)
      visible = true
      if (element.current) element.current.style.opacity = '1'
      grow()
    }
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) hide()
    }
    const observer = new MutationObserver(grow)
    const root = document.getElementById('root')
    if (root)
      observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerout', leave)
    window.addEventListener('blur', hide)
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('scroll', grow)
    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerout', leave)
      window.removeEventListener('blur', hide)
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('scroll', grow)
      hide()
    }
  }, [enabled, fine, x, y, scale])
  return enabled && fine ? (
    <m.div
      ref={element}
      className="cursor-ring"
      aria-hidden="true"
      style={{ x, y, scale, opacity: 0 }}
    />
  ) : null
}
