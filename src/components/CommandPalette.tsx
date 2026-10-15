import { useCallback, useEffect, useRef, useState } from 'react'
import { profile, ui } from '../content/content'
import { openCaseStudy } from '../lib/caseStudyActions'
import { scrollToId, setDialogScrollLocked } from '../lib/smoothScroll'
import { useCopyEmail } from '../lib/useCopyEmail'
import { set, useSceneQuality } from '../state/sceneQuality'

const copy = ui.commandPalette

type Command = {
  id: string
  label: string
  keywords: string
  group: keyof typeof copy.groups
  run?: () => void
  href?: string
  download?: boolean
}

export function CommandPalette() {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const previousOverflow = useRef('')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selection, setSelection] = useState(0)
  const { status, copyEmail } = useCopyEmail()
  const { override } = useSceneQuality()

  const close = useCallback(() => {
    if (!dialog.current?.open) return
    dialog.current.close()
    document.body.style.overflow = previousOverflow.current
    setDialogScrollLocked(false)
    setOpen(false)
    previousFocus.current?.focus({ preventScroll: true })
  }, [])

  const show = useCallback(() => {
    if (!dialog.current || dialog.current.open) return
    // Keep a single modal active so scroll locking and focus have one owner.
    if (document.querySelector('dialog[open]')) return
    previousFocus.current = document.activeElement as HTMLElement | null
    previousOverflow.current = document.body.style.overflow
    setQuery('')
    setSelection(0)
    dialog.current.showModal()
    document.body.style.overflow = 'hidden'
    setDialogScrollLocked(true)
    setOpen(true)
    input.current?.focus()
  }, [])

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.closest('input, textarea, select, [role="textbox"]')))
      )
        return
      const key = event.key.toLowerCase()
      if (
        (!event.altKey &&
          !event.shiftKey &&
          (event.ctrlKey || event.metaKey) &&
          key === 'k') ||
        (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey)
      ) {
        if (document.querySelector('dialog[open]')) return
        event.preventDefault()
        show()
      }
    }
    document.addEventListener('keydown', shortcut)
    return () => {
      document.removeEventListener('keydown', shortcut)
      close()
    }
  }, [close, show])

  const commands: Command[] = [
    ...copy.sections.map((section) => ({
      ...section,
      group: 'sections' as const,
      run: () => scrollToId(section.id),
    })),
    ...copy.projects.map((project) => ({
      ...project,
      group: 'projects' as const,
      run: () => openCaseStudy(project.id),
    })),
    {
      id: 'copy-email',
      ...copy.copy,
      group: 'actions',
      run: () => {
        void copyEmail()
      },
    },
    {
      id: 'cv',
      ...copy.cv,
      group: 'actions',
      href: profile.cvUrl,
      download: true,
    },
    {
      id: 'github',
      ...copy.github,
      group: 'actions',
      href: profile.links.github,
    },
    {
      id: 'linkedin',
      ...copy.linkedin,
      group: 'actions',
      href: profile.links.linkedin,
    },
    {
      id: 'scene',
      group: 'actions',
      label: override === 'off' ? copy.scene.enable : copy.scene.disable,
      keywords: copy.scene.keywords,
      run: () => set({ override: override === 'off' ? 'auto' : 'off' }),
    },
  ]
  const filtered = commands.filter(({ label, keywords }) =>
    (label + ' ' + keywords).toLowerCase().includes(query.trim().toLowerCase()),
  )
  const selectedId = filtered[selection]?.id
  const optionId = (id: string) => 'command-' + id

  useEffect(() => {
    if (open && selectedId)
      document
        .getElementById(optionId(selectedId))
        ?.scrollIntoView({ block: 'nearest' })
  }, [open, selectedId])

  return (
    <>
      <button
        type="button"
        className="command-hint"
        aria-label={copy.open}
        aria-haspopup="dialog"
        aria-controls="command-palette"
        onClick={show}
      >
        {copy.hint}
      </button>
      <dialog
        id="command-palette"
        ref={dialog}
        className="command-palette"
        aria-labelledby="command-title"
        aria-describedby="command-help"
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
      >
        <div className="command-header">
          <h2 id="command-title">{copy.title}</h2>
          <button type="button" className="text-button" onClick={close}>
            {copy.close}
          </button>
        </div>
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-label={copy.search}
          placeholder={copy.search}
          aria-expanded={open}
          aria-controls="command-list"
          aria-autocomplete="list"
          aria-activedescendant={selectedId ? optionId(selectedId) : undefined}
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setSelection(0)
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              if (filtered.length)
                setSelection(
                  (index) =>
                    (index +
                      (event.key === 'ArrowDown' ? 1 : -1) +
                      filtered.length) %
                    filtered.length,
                )
            } else if (event.key === 'Enter') {
              event.preventDefault()
              if (selectedId)
                document.getElementById(optionId(selectedId))?.click()
            }
          }}
        />
        <div
          id="command-list"
          role="listbox"
          aria-label={copy.title}
          className="command-list"
        >
          {Object.entries(copy.groups).map(([group, heading]) => {
            const items = filtered.filter((command) => command.group === group)
            if (!items.length) return null
            return (
              <div
                key={group}
                role="group"
                aria-labelledby={'command-group-' + group}
              >
                <div id={'command-group-' + group} className="command-group">
                  {heading}
                </div>
                {items.map((command) => {
                  const props = {
                    id: optionId(command.id),
                    role: 'option',
                    tabIndex: -1,
                    'aria-selected': command.id === selectedId,
                    className: 'command-option',
                    onMouseDown: (event: React.MouseEvent) =>
                      event.preventDefault(),
                    onClick: () => {
                      close()
                      command.run?.()
                    },
                  }
                  return command.href ? (
                    <a
                      key={command.id}
                      {...props}
                      href={command.href}
                      download={command.download || undefined}
                      target={command.download ? undefined : '_blank'}
                      rel={command.download ? undefined : 'noopener noreferrer'}
                    >
                      {command.label}
                    </a>
                  ) : (
                    <button key={command.id} {...props} type="button">
                      {command.label}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
        {!filtered.length && (
          <p className="command-empty" role="status">
            {copy.empty}
          </p>
        )}
        <p id="command-help" className="command-help">
          {copy.help}
        </p>
      </dialog>
      <span className="command-status" role="status" aria-live="polite">
        {status}
      </span>
    </>
  )
}
