import { MagneticButton } from '../components/MagneticButton'
import { profile, ui } from '../content/content'
import { openRoomView, useRoomView } from '../state/roomView'
export function Hero() {
  const { ready } = useRoomView()
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <p className="eyebrow">
        <span className="status-dot" />
        {ui.hero.eyebrow}
      </p>
      <h1 id="hero-title">
        {profile.name} <span className="hero-role">{profile.title}</span>
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
        {ready && (
          <button
            type="button"
            className="button room-entry"
            onClick={(event) => openRoomView(event.currentTarget)}
          >
            {ui.roomView.open}
          </button>
        )}
      </div>
      <p className="location">
        <span aria-hidden="true">↳</span> {profile.location}
      </p>
    </section>
  )
}
