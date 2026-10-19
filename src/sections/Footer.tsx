import { profile, ui } from '../content/content'
export function Footer() {
  return (
    <footer className="container footer">
      <p>
        {profile.fullName}
        <span aria-hidden="true"> / </span>
        <span>{profile.title}</span>
      </p>
      <a href="#top">
        {ui.footer}
        <span aria-hidden="true">↑</span>
      </a>
    </footer>
  )
}
