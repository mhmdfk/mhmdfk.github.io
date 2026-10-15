import { useState } from 'react'
import { profile, ui } from '../content/content'

export function useCopyEmail() {
  const [status, setStatus] = useState('')
  async function copyEmail() {
    setStatus('')
    try {
      await navigator.clipboard.writeText(profile.email)
      setStatus(ui.contact.copied)
    } catch {
      setStatus(ui.contact.copyFailed)
    }
  }
  return { status, copyEmail }
}
