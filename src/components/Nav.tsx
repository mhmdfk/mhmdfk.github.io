import { CommandPalette } from './CommandPalette'
import { useEffect, useRef, useState } from 'react'
import { profile, ui } from '../content/content'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('top')
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const sections = ['top', ...ui.nav.map(({ id }) => id)]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: 0 },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <header className="site-header no-scene-hover">
      <nav className="container nav" aria-label={ui.navigation}>
        <a
          className="wordmark"
          href="#top"
          aria-label={`${profile.name} — ${ui.home}`}
          onClick={() => setOpen(false)}
        >
          {profile.name}
          <span aria-hidden="true">.</span>
        </a>
        <button
          ref={button}
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen(!open)}
        >
          {ui.menu}
          <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        <div id="nav-links" className={`nav-links${open ? ' is-open' : ''}`}>
          {ui.nav.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'location' : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </div>
        <CommandPalette />
      </nav>
    </header>
  )
}
