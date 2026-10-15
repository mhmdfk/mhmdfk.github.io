import type { Project } from '../content/content'

type Opener = (id: Project['id'], updateHash: boolean) => void
let opener: Opener | null = null

export function registerCaseStudyOpener(next: Opener) {
  opener = next
  return () => {
    if (opener === next) opener = null
  }
}

export function openCaseStudy(id: Project['id'], updateHash = true) {
  opener?.(id, updateHash)
}
