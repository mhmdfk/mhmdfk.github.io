import { useSyncExternalStore } from 'react'
import type { SceneQuality } from '../scene/quality'

type SceneQualityState = {
  detected: SceneQuality
  override: 'auto' | 'off'
}

const initial: SceneQualityState = { detected: 'off', override: 'auto' }
let state = initial
const listeners = new Set<() => void>()
const storageKey = 'scene-quality-override'

export const get = () => state
export function set(next: Partial<SceneQualityState>) {
  const updated = { ...state, ...next }
  if (
    updated.detected === state.detected &&
    updated.override === state.override
  )
    return
  if (updated.override !== state.override) {
    try {
      localStorage.setItem(storageKey, updated.override)
    } catch {
      // Storage can be unavailable in private or restricted browsing.
    }
  }
  state = updated
  listeners.forEach((listener) => listener())
}
export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function restoreOverride() {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'off' || saved === 'auto') set({ override: saved })
  } catch {
    // Keep the default when storage is unavailable.
  }
}
export function useSceneQuality() {
  return useSyncExternalStore(subscribe, get, () => initial)
}
