import type { ComponentProps, PointerEvent } from 'react'
import { m, useSpring } from 'motion/react'
import { useMotionSettings } from './useMotionSettings'

type Props =
  | ({ href: string } & ComponentProps<typeof m.a>)
  | ({ href?: never } & ComponentProps<typeof m.button>)

export function MagneticButton(props: Props) {
  const { enabled, fine } = useMotionSettings()
  const x = useSpring(0, { stiffness: 280, damping: 20 })
  const y = useSpring(0, { stiffness: 280, damping: 20 })
  const active = enabled && fine
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  const move = (event: PointerEvent<HTMLElement>) => {
    if (!active || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    const dx = event.clientX - rect.left - rect.width / 2
    const dy = event.clientY - rect.top - rect.height / 2
    const factor = Math.min(0.15, 6 / (Math.hypot(dx, dy) || 1))
    x.set(dx * factor)
    y.set(dy * factor)
  }
  const effects = {
    style: { x: active ? x : 0, y: active ? y : 0 },
    onPointerMove: move,
    onPointerLeave: reset,
    onBlur: reset,
  }
  return props.href !== undefined ? (
    <m.a {...props} {...effects} />
  ) : (
    <m.button {...props} {...effects} />
  )
}
