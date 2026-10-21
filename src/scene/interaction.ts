import { createContext } from 'react'
import { scrollToId } from '../lib/smoothScroll'
import { openCaseStudy } from '../lib/caseStudyActions'
import { closeRoomView } from '../state/roomView'
import { ui, type Project } from '../content/content'

export type ObjectId = keyof typeof ui.scene
export type Hover = { id: ObjectId; x: number; y: number } | null
export const HoverContext = createContext<{
  hover: Hover
  reportHover: (hover: Hover) => void
}>({ hover: null, reportHover: () => {} })

export function sceneTargetAllowed(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !target.closest(
      'a, button, input, select, textarea, dialog, p, h1, h2, h3, li, [role=button], [contenteditable], .no-scene-hover',
    ) &&
    !document.querySelector('dialog[open]')
  )
}

// The objects that stand for a project; the rest stand for a section.
export const objectProject: Partial<Record<ObjectId, Project['id']>> = {
  sofa: 'tiraz',
  corkboard: 'huntrix',
  shelf: 'matjari',
}
const objectSection: Partial<Record<ObjectId, string>> = {
  desk: 'experience',
  diploma: 'about',
  window: 'contact',
}

export function activateObject(id: ObjectId) {
  // The mobile room view closes first, so history settles before navigating.
  closeRoomView(() => {
    const project = objectProject[id]
    if (project) openCaseStudy(project)
    else scrollToId(objectSection[id]!)
  })
}
