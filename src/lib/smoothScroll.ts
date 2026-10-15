import { isSplashActive } from './splash'
import Lenis from 'lenis'

let lenis: Lenis | null = null
let dialogOpen = false
let splashOpen = false
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
  if (dialogOpen || splashOpen) lenis?.stop()
  else lenis?.start()
}

export function setSplashScrollLocked(locked: boolean) {
  splashOpen = locked
  if (dialogOpen || splashOpen) lenis?.stop()
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
  // Lenis runs its own rAF loop and writes the native scroll position, so the
  // scene's ScrollTrigger (lazy-loaded with the 3D chunk) sees every update
  // without GSAP having to ship in the main bundle.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const configure = () => {
    reducedMotion = motion.matches
    motionListeners.forEach((listener) => listener(reducedMotion))
    lenis?.destroy()
    lenis = null
    if (!reducedMotion) {
      lenis = new Lenis({
        duration: 0.8,
        autoRaf: true,
        prevent: (node) => node instanceof HTMLDialogElement,
      })
      if (dialogOpen || splashOpen || isSplashActive()) lenis.stop()
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
    if (isSplashActive()) return
    const id = window.location.hash.slice(1)
    if (id) scrollToId(id, { updateHash: false, immediate: true })
  }
  let disposed = false
  configure()
  document.addEventListener('click', navigate)
  window.addEventListener('splashdone', syncHash)
  window.addEventListener('hashchange', syncHash)
  window.addEventListener('popstate', syncHash)
  motion.addEventListener('change', configure)
  void document.fonts.ready.then(() => {
    if (!disposed) syncHash()
  })
  return () => {
    disposed = true
    document.removeEventListener('click', navigate)
    window.removeEventListener('splashdone', syncHash)
    window.removeEventListener('hashchange', syncHash)
    window.removeEventListener('popstate', syncHash)
    motion.removeEventListener('change', configure)
    lenis?.destroy()
    lenis = null
  }
}
