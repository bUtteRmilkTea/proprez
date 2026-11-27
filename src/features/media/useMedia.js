import { useCallback, useEffect, useRef, useState } from 'react'
import { isEditableTarget } from '../../lib/isEditableTarget'
import { emptyCombo, matchesCombo, nextAutoKey } from '../../lib/shortcuts'
import { makeMediaId, putBlob } from '../../lib/mediaStore'

function mediaTypeOf(file) {
  return file.type.startsWith('video/') ? 'video' : 'photo'
}

// Photo/video content items for the "Media" mode. Modeled on useSlides.js,
// but each item's blob is also stored in mediaStore so /display (a
// different tab) can resolve it - unlike slides' local-tab object URLs.
export function useMedia({ enabled }) {
  const [items, setItems] = useState([])
  const [activeIndex, setActiveIndexRaw] = useState(null)
  const [activationNonce, setActivationNonce] = useState(0)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const setActiveIndex = useCallback((index) => {
    setActiveIndexRaw(index)
    setActivationNonce((n) => n + 1)
  }, [])

  const loadFiles = useCallback((fileList) => {
    const files = Array.from(fileList).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    )

    setItems((prev) => {
      for (const item of prev) URL.revokeObjectURL(item.previewUrl)
      return []
    })
    setActiveIndexRaw(null)

    Promise.all(
      files.map(async (file) => {
        const id = makeMediaId()
        await putBlob(id, file)
        return {
          id,
          name: file.name,
          type: mediaTypeOf(file),
          previewUrl: URL.createObjectURL(file),
        }
      }),
    ).then((loaded) => {
      const combos = []
      const withShortcuts = loaded.map((item) => {
        const shortcut = { ...emptyCombo(), key: nextAutoKey(combos) }
        combos.push(shortcut)
        return { ...item, shortcut }
      })
      setItems(withShortcuts)
    })
  }, [])

  const updateItemShortcut = useCallback((itemId, shortcut) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, shortcut } : item)))
  }, [])

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    function handleKeyDown(event) {
      if (isEditableTarget(event.target)) return
      const index = itemsRef.current.findIndex((item) => matchesCombo(event, item.shortcut))
      if (index !== -1) setActiveIndex(index)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, setActiveIndex])

  const activeItem = activeIndex === null ? null : (items[activeIndex] ?? null)

  return {
    items,
    activeIndex,
    activeItem,
    activationNonce,
    loadFiles,
    setActiveIndex,
    updateItemShortcut,
  }
}
