import { SectionEnter } from '../components/SectionEnter'
import { education, profile, ui } from '../content/content'
export function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <SectionEnter className="section-heading">
        <p className="eyebrow">{ui.about.label}</p>
        <h2 id="about-title">{ui.about.heading}</h2>
      </SectionEnter>
      <SectionEnter className="about-grid">
        <p className="about-bio">{profile.bio}</p>
        <div className="education">
          <p className="eyebrow">{ui.about.education}</p>
          <h3>{education.degree}</h3>
          <p>{education.school}</p>
          <p className="education-dates">
            {education.start} — {education.end}
          </p>
          <span className="grade">{education.note}</span>
        </div>
      </SectionEnter>
    </section>
  )
}
