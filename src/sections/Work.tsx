import { useRef } from 'react'
import { CaseStudyPanel } from '../components/CaseStudyPanel'
import { projects, ui } from '../content/content'
export function Work() {
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({})
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="section-heading">
        <p className="eyebrow">{ui.work.label}</p>
        <h2 id="work-title">{ui.work.heading}</h2>
      </div>
      <div className="project-grid">
        {projects.map((project, index) => (
          <article
            key={project.id}
            className="project-card"
            aria-labelledby={`${project.id}-title`}
          >
            <div className="project-top">
              <span className="project-number" aria-hidden="true">
                0{index + 1}
              </span>
              <span className="project-symbol" aria-hidden="true">
                ↗
              </span>
            </div>
            <h3 id={`${project.id}-title`}>{project.name}</h3>
            <p className="project-tagline">{project.tagline}</p>
            <ul className="highlights">
              {project.highlights.slice(0, 2).map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <ul className="chips">
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="project-actions">
              <button
                type="button"
                className="text-button"
                aria-haspopup="dialog"
                ref={(button) => {
                  triggers.current[project.id] = button
                }}
              >
                {ui.work.caseStudy}
                <span aria-hidden="true">↗</span>
              </button>
              <a href={project.liveUrl ?? project.repoUrl}>
                {project.liveUrl ? ui.work.live : ui.work.repo}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
      <CaseStudyPanel triggers={triggers} />
    </section>
  )
}
