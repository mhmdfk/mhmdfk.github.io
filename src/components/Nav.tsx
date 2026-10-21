import { CommandPalette } from './CommandPalette'
import { useEffect, useRef, useState } from 'react'
import { profile, ui } from '../content/content'
import { openRoomView, useRoomView } from '../state/roomView'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('top')
  const button = useRef<HTMLButtonElement>(null)
  const { ready } = useRoomView()

  useEffect(() => {
    const sections = ['top', ...ui.nav.map(({ id }) => id)]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
    // The last section can't scroll to the top of the viewport, so at the very
    // bottom of the page it is the active one.
    const atBottom = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2
    const last = sections[sections.length - 1].id
    const observer = new IntersectionObserver(
      (entries) => {
        if (atBottom()) return setActive(last)
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: 0 },
    )
    sections.forEach((section) => observer.observe(section))
    const onScroll = () => {
      if (atBottom()) setActive(last)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
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
          {ready && (
            <button
              type="button"
              className="room-entry"
              onClick={(event) => {
                // The dropdown closes, hiding this item, so focus returns to the
                // menu button instead.
                const menu = button.current
                const dropdown = menu !== null && menu.offsetParent !== null
                setOpen(false)
                openRoomView(dropdown ? menu : event.currentTarget)
              }}
            >
              {ui.roomView.open}
            </button>
          )}
        </div>
        <CommandPalette />
      </nav>
    </header>
  )
}
