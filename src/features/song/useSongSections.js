import { useCallback, useEffect, useState } from 'react'

let nextId = 1

function makeSection() {
  return { id: nextId++, label: '', key: '', text: '' }
}

function isEditableTarget(target) {
  if (!target) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function useSongSections() {
  const [sections, setSections] = useState([])
  const [activeId, setActiveId] = useState(null)

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
    function handleKeyDown(event) {
      if (isEditableTarget(event.target)) return
      const match = sections.find(
        (section) => section.key && section.key.toLowerCase() === event.key.toLowerCase(),
      )
      if (match) setActiveId(match.id)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sections])

  const activeSection = sections.find((section) => section.id === activeId) ?? null

  return {
    sections,
    activeSection,
    setActiveId,
    addSection,
    updateSection,
    removeSection,
  }
}
