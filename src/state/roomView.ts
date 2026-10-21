import { useSyncExternalStore } from 'react'
import type { ObjectId } from '../scene/interaction'

type RoomViewState = {
  ready: boolean
  open: boolean
  // The object the camera is flown up to, with its card showing.
  focus: ObjectId | null
  // The entrance sweep has finished, so the tags can show.
  entered: boolean
  // The device could not keep up while the view was open: stay light for the
  // rest of the session.
  throttled: boolean
}

const initial: RoomViewState = {
  ready: false,
  open: false,
  focus: null,
  entered: false,
  throttled: false,
}
let state = initial
const listeners = new Set<() => void>()

export const get = () => state
export function set(next: Partial<RoomViewState>) {
  const updated = { ...state, ...next }
  // The view can only be open while the scene is on screen.
  if (!updated.ready) updated.open = false
  if (!updated.open) {
    updated.focus = null
    updated.entered = false
  }
  if (
    (Object.keys(updated) as (keyof RoomViewState)[]).every(
      (key) => updated[key] === state[key],
    )
  )
    return
  state = updated
  listeners.forEach((listener) => listener())
}
export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function useRoomView() {
  return useSyncExternalStore(subscribe, get, () => initial)
}
// For components that only care about one field, so they skip the rest.
export function useRoomViewValue<T>(select: (state: RoomViewState) => T) {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(initial),
  )
}

// While open, the view owns one history entry so the back gesture closes it.
let entry = false // the entry is the current one
let popping = false // its popstate is still being dispatched
let returnFocus: HTMLElement | null = null
let afterClose: (() => void) | null = null

export function openRoomView(trigger: HTMLElement | null) {
  if (!state.ready || state.open || entry) return
  returnFocus = trigger
  set({ open: true })
}

// Closes the view, then runs `then` once history has settled. With nothing
// open or closing, it runs straight away.
export function closeRoomView(then?: () => void) {
  if (!state.open && !entry) {
    then?.()
    return
  }
  afterClose = then ?? afterClose
  set({ open: false })
}

export const getReturnFocus = () => returnFocus

export function focusObject(id: ObjectId) {
  if (state.open) set({ focus: id })
}
export const leaveFocus = () => set({ focus: null })
export const markEntered = () => set({ entered: true })
export const markThrottled = () => set({ throttled: true })

// Other popstate listeners skip the pop of the view's own entry: it carries no
// location change, so they would only jump the page or toggle a case study.
export function isRoomViewPop(event: PopStateEvent) {
  return entry || popping || event.state?.roomView === true
}

function settle(restore: () => void) {
  popping = true
  window.setTimeout(() => {
    popping = false
    restore()
    const run = afterClose
    afterClose = null
    run?.()
  }, 0)
}

export function pushRoomViewEntry() {
  window.history.pushState({ roomView: true }, '')
  entry = true
}

// The browser popped the entry (back gesture): nothing is left to undo.
export function handleRoomViewPop() {
  entry = false
  popping = true
  set({ open: false })
}

// Run when the view has closed. Any other way of closing leaves the entry, so
// pop it and only then run the follow-up action, keeping history correct.
export function finishRoomViewClose(restore: () => void) {
  if (!entry) {
    settle(restore)
    return
  }
  const done = () => {
    window.clearTimeout(fallback)
    window.removeEventListener('popstate', done)
    entry = false
    settle(restore)
  }
  // Without a popstate (history changed under us) carry on regardless.
  const fallback = window.setTimeout(done, 500)
  window.addEventListener('popstate', done)
  window.history.back()
}
