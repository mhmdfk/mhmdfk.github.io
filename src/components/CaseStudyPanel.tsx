import { useEffect, useRef, type RefObject } from 'react'
import { projects, ui } from '../content/content'
import { TirazDiagram } from './diagrams/TirazDiagram'
import { HuntrixDiagram } from './diagrams/HuntrixDiagram'
import { MatjariDiagram } from './diagrams/MatjariDiagram'

const diagrams = {
  tiraz: TirazDiagram,
  huntrix: HuntrixDiagram,
  matjari: MatjariDiagram,
}

type Props = { triggers: RefObject<Record<string, HTMLButtonElement | null>> }

export function CaseStudyPanel({ triggers }: Props) {
  const dialogs = useRef<Record<string, HTMLDialogElement | null>>({})

  useEffect(() => {
    let active: string | null = null
    let previousOverflow = ''
    const cleanups: (() => void)[] = []

    const close = (updateHash: boolean) => {
      if (!active) return
      const id = active
      active = null
      dialogs.current[id]?.close()
      document.body.style.overflow = previousOverflow
      if (updateHash) window.history.replaceState(null, '', '#work')
      triggers.current[id]?.focus({ preventScroll: true })
    }

    const open = (id: string, updateHash: boolean) => {
      if (active === id) return
      close(false)
      const dialog = dialogs.current[id]
      if (!dialog) return
      previousOverflow = document.body.style.overflow
      active = id
      document.body.style.overflow = 'hidden'
      if (updateHash) window.history.pushState(null, '', '#' + id)
      dialog.showModal()
      dialog.scrollTop = 0
      dialog.querySelector<HTMLButtonElement>('button')?.focus()
    }

    const syncHash = () => {
      const project = projects.find(
        (item) => '#' + item.id === window.location.hash,
      )
      if (project) open(project.id, false)
      else close(false)
    }

    for (const project of projects) {
      const trigger = triggers.current[project.id]
      const dialog = dialogs.current[project.id]
      if (!dialog) continue
      const onOpen = () => open(project.id, true)
      const onClose = () => {
        if (active === project.id && !dialog.open) close(true)
      }
      const onCancel = (event: Event) => {
        event.preventDefault()
        close(true)
      }
      trigger?.addEventListener('click', onOpen)
      dialog.addEventListener('close', onClose)
      dialog.addEventListener('cancel', onCancel)
      cleanups.push(() => {
        trigger?.removeEventListener('click', onOpen)
        dialog.removeEventListener('close', onClose)
        dialog.removeEventListener('cancel', onCancel)
      })
    }
    window.addEventListener('popstate', syncHash)
    window.addEventListener('hashchange', syncHash)
    syncHash()
    return () => {
      cleanups.forEach((cleanup) => cleanup())
      window.removeEventListener('popstate', syncHash)
      window.removeEventListener('hashchange', syncHash)
      close(false)
    }
  }, [triggers])

  return projects.map((project) => {
    const Diagram = diagrams[project.id]
    return (
      <dialog
        key={project.id}
        ref={(dialog) => {
          dialogs.current[project.id] = dialog
        }}
        className="case-study-panel"
        aria-labelledby={project.id + '-case-title'}
        aria-describedby={project.id + '-case-tagline'}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            event.currentTarget.close()
        }}
      >
        <div className="case-study-header">
          <div>
            <h2 id={project.id + '-case-title'}>{project.name}</h2>
            <p id={project.id + '-case-tagline'}>{project.tagline}</p>
          </div>
          <button
            type="button"
            className="button case-study-close"
            onClick={(event) => event.currentTarget.closest('dialog')?.close()}
          >
            {ui.caseStudy.close}
          </button>
        </div>
        <div className="case-study-content">
          <div className="case-study-links">
            {project.liveUrl && (
              <a className="button" href={project.liveUrl}>
                {ui.work.live}
              </a>
            )}
            {project.repoUrl && (
              <a className="button" href={project.repoUrl}>
                {ui.work.repo}
              </a>
            )}
          </div>
          <section>
            <h3>{ui.caseStudy.problem}</h3>
            <p>{project.caseStudy.problem}</p>
          </section>
          <section>
            <h3>{ui.caseStudy.role}</h3>
            <p>{project.role}</p>
          </section>
          <section>
            <h3>{ui.caseStudy.approach}</h3>
            <p>{project.caseStudy.approach}</p>
          </section>
          <section>
            <h3>{ui.caseStudy.highlights}</h3>
            <ul className="highlights">
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>{ui.caseStudy.stack}</h3>
            <ul className="chips">
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>{ui.caseStudy.outcome}</h3>
            <p>{project.caseStudy.outcome}</p>
          </section>
          <section>
            <h3>{ui.caseStudy.diagram}</h3>
            <Diagram />
          </section>
          {project.screenshot && (
            <section>
              <h3>{ui.caseStudy.screenshot}</h3>
              <img
                className="case-study-screenshot"
                src={project.screenshot.src}
                alt={project.screenshot.alt}
                width="1200"
                height="750"
                loading="lazy"
              />
            </section>
          )}
        </div>
      </dialog>
    )
  })
}
