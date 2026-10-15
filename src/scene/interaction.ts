import { createContext } from 'react'
import { scrollToId } from '../lib/smoothScroll'
import { openCaseStudy } from '../lib/caseStudyActions'
import { ui } from '../content/content'

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

export function activateObject(id: ObjectId) {
  if (id === 'sofa') openCaseStudy('tiraz')
  else if (id === 'corkboard') openCaseStudy('huntrix')
  else if (id === 'shelf') openCaseStudy('matjari')
  else
    scrollToId({ desk: 'experience', diploma: 'about', window: 'contact' }[id])
}
