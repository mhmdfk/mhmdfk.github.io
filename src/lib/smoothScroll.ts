import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenis: Lenis | null = null
let dialogOpen = false
let reducedMotion = false
const motionListeners = new Set<(reduced: boolean) => void>()

export function subscribeReducedMotion(listener: (reduced: boolean) => void) {
  motionListeners.add(listener)
  listener(reducedMotion)
  return () => {
    motionListeners.delete(listener)
  }
}

export function scrollOffset() {
  return (
    document.querySelector('.site-header')!.getBoundingClientRect().height + 16
  )
}

export function sectionTop(id: string) {
  if (typeof window === 'undefined' || id === 'top') return 0
  const element = document.getElementById(id)
  if (!element) return 0
  return Math.max(
    0,
    element.getBoundingClientRect().top + window.scrollY - scrollOffset(),
  )
}

export function setDialogScrollLocked(locked: boolean) {
  dialogOpen = locked
  if (locked) lenis?.stop()
  else lenis?.start()
}

export function scrollToId(
  id: string,
  { updateHash = true, immediate = false } = {},
) {
  if (typeof window === 'undefined') return
  const element = document.getElementById(id)
  if (!element) return
  const top = sectionTop(id)
  if (updateHash && window.location.hash !== '#' + id)
    window.history.pushState(null, '', '#' + id)
  if (lenis) lenis.scrollTo(top, { immediate })
  else window.scrollTo({ top, behavior: 'instant' })
  if (id === 'main') element.focus({ preventScroll: true })
}

export function initSmoothScroll() {
  if (typeof window === 'undefined') return () => {}
  gsap.registerPlugin(ScrollTrigger)
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const tick = (time: number) => lenis?.raf(time * 1000)
  const configure = () => {
    reducedMotion = motion.matches
    motionListeners.forEach((listener) => listener(reducedMotion))
    lenis?.destroy()
    lenis = null
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    if (!reducedMotion) {
      lenis = new Lenis({
        duration: 0.8,
        prevent: (node) => node instanceof HTMLDialogElement,
      })
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      if (dialogOpen) lenis.stop()
    }
  }
  const navigate = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    )
    if (!link || link.hasAttribute('download') || link.target) return
    const id = link.hash.slice(1)
    if (!document.getElementById(id)) return
    event.preventDefault()
    scrollToId(id)
  }
  const syncHash = () => {
    const id = window.location.hash.slice(1)
    if (id) scrollToId(id, { updateHash: false, immediate: true })
  }
  let disposed = false
  configure()
  document.addEventListener('click', navigate)
  window.addEventListener('hashchange', syncHash)
  window.addEventListener('popstate', syncHash)
  motion.addEventListener('change', configure)
  void document.fonts.ready.then(() => {
    if (!disposed) {
      syncHash()
      ScrollTrigger.refresh()
    }
  })
  return () => {
    disposed = true
    document.removeEventListener('click', navigate)
    window.removeEventListener('hashchange', syncHash)
    window.removeEventListener('popstate', syncHash)
    motion.removeEventListener('change', configure)
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    lenis?.destroy()
    lenis = null
  }
}
