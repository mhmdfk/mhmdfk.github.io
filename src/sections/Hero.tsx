import { MagneticButton } from '../components/MagneticButton'
import { profile, ui } from '../content/content'
export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <p className="eyebrow">
        <span className="status-dot" />
        {ui.hero.eyebrow}
      </p>
      <h1 id="hero-title">
        {profile.name}
        <span>{profile.title}</span>
      </h1>
      <p className="hero-pitch">{profile.pitch}</p>
      <div className="actions">
        <MagneticButton
          className="button button-primary"
          href={profile.cvUrl}
          download
        >
          {ui.hero.download}
          <span aria-hidden="true">↓</span>
        </MagneticButton>
        <MagneticButton className="button" href="#contact">
          {ui.hero.contact}
          <span aria-hidden="true">↗</span>
        </MagneticButton>
      </div>
      <p className="location">
        <span aria-hidden="true">↳</span> {profile.location}
      </p>
    </section>
  )
}
