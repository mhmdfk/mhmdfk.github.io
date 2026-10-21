import { isSplashActive } from './splash'
import { isRoomViewPop } from '../state/roomView'
import Lenis from 'lenis'

let lenis: Lenis | null = null
let dialogOpen = false
let splashOpen = false
let roomOpen = false
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
  if (dialogOpen || splashOpen || roomOpen) lenis?.stop()
  else lenis?.start()
}

export function setSplashScrollLocked(locked: boolean) {
  splashOpen = locked
  if (dialogOpen || splashOpen || roomOpen) lenis?.stop()
  else lenis?.start()
}

export function setRoomScrollLocked(locked: boolean) {
  roomOpen = locked
  if (dialogOpen || splashOpen || roomOpen) lenis?.stop()
  else lenis?.start()
}

// Jumps further than this (in viewport heights) cut through a curtain instead
// of flying past every section in between.
const NEAR = 1.2
const CURTAIN_IN_MS = 180
let cutting = false
let curtain: HTMLDivElement | null = null
let cameraSnapPending = false

// Read once by the scroll camera: true right after an instant jump, so it moves
// straight to the new framing instead of easing across the whole room.
export function takeCameraSnap() {
  const snap = cameraSnapPending
  cameraSnapPending = false
  return snap
}

function jumpTo(top: number) {
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
  else window.scrollTo({ top, behavior: 'instant' })
  cameraSnapPending = true
}

function cutTo(top: number) {
  if (cutting) return
  cutting = true
  if (!curtain) {
    curtain = document.createElement('div')
    curtain.className = 'jump-curtain'
    curtain.setAttribute('aria-hidden', 'true')
  }
  if (!curtain.isConnected) document.body.append(curtain)
  curtain.classList.add('is-covering')
  window.setTimeout(() => {
    jumpTo(top)
    // Two frames: one for the scroll and camera snap, one to paint them.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        curtain?.classList.remove('is-covering')
        cutting = false
      }),
    )
  }, CURTAIN_IN_MS)
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
  const screens = Math.abs(top - window.scrollY) / window.innerHeight
  if (immediate || !lenis) jumpTo(top)
  else if (screens > NEAR) cutTo(top)
  else lenis.scrollTo(top, { duration: 0.6 + 0.4 * screens })
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
      if (dialogOpen || splashOpen || roomOpen || isSplashActive()) lenis.stop()
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
  const onPopState = (event: PopStateEvent) => {
    if (!isRoomViewPop(event)) syncHash()
  }
  let disposed = false
  configure()
  document.addEventListener('click', navigate)
  window.addEventListener('splashdone', syncHash)
  window.addEventListener('hashchange', syncHash)
  window.addEventListener('popstate', onPopState)
  motion.addEventListener('change', configure)
  void document.fonts.ready.then(() => {
    if (!disposed) syncHash()
  })
  return () => {
    disposed = true
    document.removeEventListener('click', navigate)
    window.removeEventListener('splashdone', syncHash)
    window.removeEventListener('hashchange', syncHash)
    window.removeEventListener('popstate', onPopState)
    motion.removeEventListener('change', configure)
    lenis?.destroy()
    lenis = null
  }
}
