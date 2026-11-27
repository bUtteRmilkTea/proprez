import { useCallback, useEffect, useRef, useState } from 'react'

let nextId = 1

function isEditableTarget(target) {
  if (!target) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function useSlides({ enabled }) {
  const [slides, setSlides] = useState([])
  const [activeIndex, setActiveIndexRaw] = useState(null)
  const [activationNonce, setActivationNonce] = useState(0)
  const slidesRef = useRef(slides)
  slidesRef.current = slides

  const setActiveIndex = useCallback((index) => {
    setActiveIndexRaw(index)
    setActivationNonce((n) => n + 1)
  }, [])

  const loadFiles = useCallback((fileList) => {
    setSlides((prev) => {
      for (const slide of prev) URL.revokeObjectURL(slide.url)
      return Array.from(fileList)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .map((file) => ({ id: nextId++, name: file.name, url: URL.createObjectURL(file) }))
    })
    setActiveIndexRaw(null)
  }, [])

  useEffect(() => {
    return () => {
      for (const slide of slidesRef.current) URL.revokeObjectURL(slide.url)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    function handleKeyDown(event) {
      if (isEditableTarget(event.target)) return
      const current = slidesRef.current
      if (current.length === 0) return

      if (/^[0-9]$/.test(event.key)) {
        const digit = Number(event.key)
        const index = digit === 0 ? 9 : digit - 1
        if (index < current.length) setActiveIndex(index)
        return
      }

      if (event.key === 'ArrowRight') {
        setActiveIndexRaw((prevIndex) => {
          const next = prevIndex === null ? 0 : Math.min(current.length - 1, prevIndex + 1)
          setActivationNonce((n) => n + 1)
          return next
        })
      } else if (event.key === 'ArrowLeft') {
        setActiveIndexRaw((prevIndex) => {
          const next = prevIndex === null ? 0 : Math.max(0, prevIndex - 1)
          setActivationNonce((n) => n + 1)
          return next
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, setActiveIndex])

  const activeSlide = activeIndex === null ? null : slides[activeIndex] ?? null

  return {
    slides,
    activeIndex,
    activeSlide,
    activationNonce,
    loadFiles,
    setActiveIndex,
  }
}
