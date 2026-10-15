import type { ComponentProps, PointerEvent, ReactNode } from 'react'
import { m, useSpring } from 'motion/react'
import { useMotionSettings } from './useMotionSettings'

export function TiltCard(
  props: Omit<ComponentProps<typeof m.article>, 'children'> & {
    children: ReactNode
  },
) {
  const { enabled, fine } = useMotionSettings()
  const rotateX = useSpring(0, { stiffness: 220, damping: 24 })
  const rotateY = useSpring(0, { stiffness: 220, damping: 24 })
  const highlight = useSpring(0)
  const active = enabled && fine
  const reset = () => {
    rotateX.set(0)
    rotateY.set(0)
    highlight.set(0)
  }
  const move = (event: PointerEvent<HTMLElement>) => {
    if (!active || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.max(
      -1,
      Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
    )
    const y = Math.max(
      -1,
      Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
    )
    rotateX.set(-y * 6)
    rotateY.set(x * 6)
    highlight.set(0.08)
  }
  return (
    <m.article
      {...props}
      style={{
        rotateX: active ? rotateX : 0,
        rotateY: active ? rotateY : 0,
        transformPerspective: 900,
      }}
      onPointerMove={move}
      onPointerLeave={reset}
      onBlur={reset}
    >
      <m.span
        aria-hidden="true"
        className="card-highlight"
        style={{ opacity: active ? highlight : 0 }}
      />
      {props.children}
    </m.article>
  )
}
