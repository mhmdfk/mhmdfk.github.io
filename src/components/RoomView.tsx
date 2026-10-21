import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { ui } from '../content/content'
import { setRoomScrollLocked } from '../lib/smoothScroll'
import {
  closeRoomView,
  finishRoomViewClose,
  get as getRoomView,
  getReturnFocus,
  handleRoomViewPop,
  leaveFocus,
  pushRoomViewEntry,
  useRoomView,
  useRoomViewValue,
} from '../state/roomView'
import type { ObjectId } from '../scene/interaction'
import { RoomFocusCard } from './RoomFocusCard'
import { useOrbitGestures } from './useOrbitGestures'

const copy = ui.roomView
const welcomeKey = 'room-view-welcome-seen'

function welcomeSeen() {
  try {
    return sessionStorage.getItem(welcomeKey) === 'true'
  } catch {
    // Show the card anyway when storage is unavailable.
    return false
  }
}

function WelcomeCard({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    try {
      sessionStorage.setItem(welcomeKey, 'true')
    } catch {
      // Storage is optional.
    }
  }, [])
  return (
    <div
      className="room-welcome no-scene-hover"
      role="group"
      aria-labelledby="room-welcome-title"
      aria-describedby="room-welcome-body"
    >
      <p id="room-welcome-title" className="room-welcome-title">
        {copy.title}
      </p>
      <p id="room-welcome-body" className="room-welcome-body">
        {copy.body}
      </p>
      <button
        type="button"
        className="room-welcome-dismiss"
        onClick={onDismiss}
      >
        {copy.dismiss}
      </button>
    </div>
  )
}

// The surface under the tags and buttons takes the drags, so the camera can be
// turned from anywhere on the screen.
function RoomLayer({ back }: { back: RefObject<HTMLButtonElement | null> }) {
  const { focus, entered } = useRoomView()
  const surface = useRef<HTMLDivElement>(null)
  const primary = useRef<HTMLButtonElement>(null)
  const focused = useRef<ObjectId | null>(null)
  const [welcome, setWelcome] = useState(() => !welcomeSeen())
  const dismiss = useCallback(() => setWelcome(false), [])
  // Flying to an object means the visitor has found their way around.
  if (focus && welcome) setWelcome(false)
  useOrbitGestures(surface, dismiss)

  // Whatever took the focus away (the card going, say) hands it back to the
  // Back to text button rather than letting it fall to the page.
  useEffect(() => {
    if (!welcome && document.activeElement === document.body)
      back.current?.focus({ preventScroll: true })
  }, [welcome, back])

  // Focus follows the camera: to the card on the way in, back to the tag it
  // came from on the way out.
  useEffect(() => {
    if (focus) {
      focused.current = focus
      primary.current?.focus({ preventScroll: true })
    } else if (focused.current) {
      const tag = document.querySelector<HTMLElement>(
        `.room-tag[data-object="${focused.current}"]`,
      )
      focused.current = null
      tag?.focus({ preventScroll: true })
      if (document.activeElement !== tag)
        back.current?.focus({ preventScroll: true })
    }
  }, [focus, back])

  return (
    <>
      <div ref={surface} className="room-surface" />
      <div
        id="room-view-tags"
        className={entered && !focus ? 'room-tags is-shown' : 'room-tags'}
      />
      {welcome && <WelcomeCard onDismiss={dismiss} />}
      {focus && <RoomFocusCard key={focus} id={focus} primary={primary} />}
    </>
  )
}

export function RoomView() {
  const open = useRoomViewValue((state) => state.open)
  const back = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const page = document.getElementById('site-content')!
    const scrollTop = window.scrollY
    page.inert = true
    page.setAttribute('aria-hidden', 'true')
    root.classList.add('room-view')
    setRoomScrollLocked(true)
    pushRoomViewEntry()
    back.current?.focus({ preventScroll: true })

    const wide = window.matchMedia('(min-width: 1024px)')
    const onWide = () => {
      if (wide.matches) closeRoomView()
    }
    const onKey = (event: KeyboardEvent) => {
      // From an object it goes back to the room; from the room it leaves.
      if (event.key === 'Escape') {
        if (getRoomView().focus) leaveFocus()
        else closeRoomView()
      }
      // The command palette lives in the page, which is inert under the view.
      else if (
        event.key === '/' ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')
      )
        event.stopPropagation()
    }
    wide.addEventListener('change', onWide)
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('popstate', handleRoomViewPop)

    return () => {
      wide.removeEventListener('change', onWide)
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('popstate', handleRoomViewPop)
      root.classList.remove('room-view')
      page.inert = false
      page.removeAttribute('aria-hidden')
      setRoomScrollLocked(false)
      // Run again once history has settled: returning to an entry with a hash
      // can scroll to it and clear the focus.
      const restore = () => {
        if (window.scrollY !== scrollTop)
          window.scrollTo({ top: scrollTop, behavior: 'instant' })
        const opener = getReturnFocus()
        opener?.focus({ preventScroll: true })
        if (document.activeElement !== opener)
          document.getElementById('main')?.focus({ preventScroll: true })
      }
      restore()
      finishRoomViewClose(restore)
    }
  }, [open])

  if (!open) return null
  return (
    <div
      className="room-layer"
      role="dialog"
      aria-modal="true"
      aria-label={copy.label}
    >
      <button
        ref={back}
        type="button"
        className="room-back"
        onClick={() => closeRoomView()}
      >
        {copy.close}
      </button>
      <RoomLayer back={back} />
    </div>
  )
}
