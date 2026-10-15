import { experiences, ui } from '../content/content'
export function Experience() {
  return (
    <section
      id="experience"
      className="section"
      aria-labelledby="experience-title"
    >
      <div className="section-heading">
        <p className="eyebrow">{ui.experience.label}</p>
        <h2 id="experience-title">{ui.experience.heading}</h2>
      </div>
      <ol className="timeline">
        {experiences.map((experience) => (
          <li key={experience.id} className="timeline-entry">
            <div className="experience-meta">
              <p>
                {experience.start} — {experience.end}
              </p>
              <p>{experience.location}</p>
            </div>
            <div className="experience-body">
              <h3>{experience.company}</h3>
              <p className="role">{experience.role}</p>
              <ul className="highlights">
                {experience.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <ul className="chips">
                {experience.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
