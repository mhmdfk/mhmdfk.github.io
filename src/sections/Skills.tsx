import { SectionEnter } from '../components/SectionEnter'
import { skillGroups, ui } from '../content/content'
export function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <SectionEnter className="section-heading">
        <p className="eyebrow">{ui.skills.label}</p>
        <h2 id="skills-title">{ui.skills.heading}</h2>
      </SectionEnter>
      <SectionEnter className="skills-grid">
        {skillGroups.map((group) => (
          <div key={group.label} className="skill-group">
            <h3>{group.label}</h3>
            <ul className="chips">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </SectionEnter>
    </section>
  )
}
