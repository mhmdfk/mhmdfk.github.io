import type { RefObject } from 'react'
import {
  education,
  experiences,
  profile,
  projects,
  ui,
} from '../content/content'
import { activateObject, objectProject } from '../scene/interaction'
import type { ObjectId } from '../scene/interaction'
import { leaveFocus } from '../state/roomView'

const copy = ui.roomView

// One line under the title, built from the content the page already shows.
function summary(id: ObjectId) {
  const project = objectProject[id]
  if (project) return projects.find((item) => item.id === project)!.tagline
  if (id === 'desk')
    return `${experiences[0].role} at ${experiences[0].company}`
  if (id === 'diploma') return `${education.degree}, ${education.school}`
  return profile.email
}

// Shown under the object the camera has flown up to.
export function RoomFocusCard({
  id,
  primary,
}: {
  id: ObjectId
  primary: RefObject<HTMLButtonElement | null>
}) {
  return (
    <div
      className="room-card no-scene-hover"
      role="group"
      aria-labelledby="room-card-title"
      aria-describedby="room-card-summary"
    >
      <p id="room-card-title" className="room-card-title">
        {ui.scene[id]}
      </p>
      <p id="room-card-summary" className="room-card-summary">
        {summary(id)}
      </p>
      <div className="room-card-actions">
        <button
          ref={primary}
          type="button"
          className="room-card-primary"
          onClick={() => activateObject(id)}
        >
          {objectProject[id] ? ui.work.caseStudy : copy.openSection}
        </button>
        <button
          type="button"
          className="room-card-secondary"
          onClick={leaveFocus}
        >
          {copy.backToRoom}
        </button>
      </div>
    </div>
  )
}
