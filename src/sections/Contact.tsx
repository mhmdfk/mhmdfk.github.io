import { MagneticButton } from '../components/MagneticButton'
import { ScrambleText } from '../components/ScrambleText'
import { SectionEnter } from '../components/SectionEnter'
import { useState } from 'react'
import { profile, ui } from '../content/content'
export function Contact() {
  const [status, setStatus] = useState('')
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setStatus(ui.contact.copied)
    } catch {
      setStatus(ui.contact.copyFailed)
    }
  }
  return (
    <section
      id="contact"
      className="section contact"
      aria-labelledby="contact-title"
    >
      <SectionEnter>
        <p className="eyebrow">{ui.contact.label}</p>
        <h2 id="contact-title">
          <ScrambleText>{ui.contact.heading}</ScrambleText>
        </h2>
      </SectionEnter>
      <SectionEnter className="email-row">
        <a className="email" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <MagneticButton
          className="button copy-button"
          type="button"
          onClick={copyEmail}
        >
          {status === ui.contact.copied ? ui.contact.copied : ui.contact.copy}
        </MagneticButton>
      </SectionEnter>
      <p className="copy-status" role="status" aria-live="polite">
        {status}
      </p>
      <SectionEnter className="social-links">
        <a href={profile.links.github}>
          {ui.contact.github}
          <span aria-hidden="true">↗</span>
        </a>
        <a href={profile.links.linkedin}>
          {ui.contact.linkedin}
          <span aria-hidden="true">↗</span>
        </a>
        <a href={profile.cvUrl} download>
          {ui.hero.download}
          <span aria-hidden="true">↓</span>
        </a>
      </SectionEnter>
    </section>
  )
}
