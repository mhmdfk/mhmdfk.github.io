import { useEffect, useRef, type ComponentProps } from 'react'
import { m, useMotionValue } from 'motion/react'
import { useMotionSettings } from './useMotionSettings'

export function SectionEnter(props: ComponentProps<typeof m.div>) {
  const { enabled } = useMotionSettings()
  const entered = useRef(false)
  const opacity = useMotionValue(1)
  const y = useMotionValue(0)
  useEffect(() => {
    if (enabled && !entered.current && 'IntersectionObserver' in window) {
      opacity.set(0)
      y.set(16)
    } else {
      opacity.jump(1)
      y.jump(0)
    }
  }, [enabled, opacity, y])
  return (
    <m.div
      {...props}
      className={['motion-enter', props.className].filter(Boolean).join(' ')}
      initial={false}
      style={{ opacity, y }}
      whileInView={enabled ? { opacity: 1, y: 0 } : undefined}
      onViewportEnter={() => {
        entered.current = true
      }}
      onFocusCapture={() => {
        entered.current = true
        opacity.jump(1)
        y.jump(0)
      }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: enabled ? 0.45 : 0, ease: 'easeOut' }}
    />
  )
}
