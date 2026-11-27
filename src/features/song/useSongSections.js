import { useCallback, useEffect, useState } from 'react'
import { isEditableTarget } from '../../lib/isEditableTarget'

let nextId = 1

function makeSection() {
  return { id: nextId++, label: '', key: '', text: '' }
}

export function useSongSections({ enabled = true } = {}) {
  const [sections, setSections] = useState([])
  const [activeId, setActiveIdRaw] = useState(null)
  const [activationNonce, setActivationNonce] = useState(0)

  // Bumps a nonce alongside the id so re-selecting the same section still
  // re-broadcasts (needed to resync a /display that reloaded mid-session).
  const setActiveId = useCallback((id) => {
    setActiveIdRaw(id)
    setActivationNonce((n) => n + 1)
  }, [])

  const addSection = useCallback(() => {
    setSections((prev) => [...prev, makeSection()])
  }, [])

  const updateSection = useCallback((id, patch) => {
    setSections((prev) =>
      prev.map((section) => (section.id === id ? { ...section, ...patch } : section)),
    )
  }, [])

  const removeSection = useCallback((id) => {
    setSections((prev) => prev.filter((section) => section.id !== id))
    setActiveId((current) => (current === id ? null : current))
  }, [])

  useEffect(() => {
    if (!enabled) return
    function handleKeyDown(event) {
      if (isEditableTarget(event.target)) return
      const match = sections.find(
        (section) => section.key && section.key.toLowerCase() === event.key.toLowerCase(),
      )
      if (match) setActiveId(match.id)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sections, enabled])

  const activeSection = sections.find((section) => section.id === activeId) ?? null

  return {
    sections,
    activeSection,
    activationNonce,
    setActiveId,
    addSection,
    updateSection,
    removeSection,
  }
}
