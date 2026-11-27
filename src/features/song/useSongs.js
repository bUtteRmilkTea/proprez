import { useCallback, useEffect, useRef, useState } from 'react'
import { isEditableTarget } from '../../lib/isEditableTarget'

let nextSongId = 1
let nextSectionId = 1

function makeSection() {
  return { id: nextSectionId++, label: '', key: '', text: '' }
}

// Manages a list of songs, each with its own sections (label/key/text).
// Only the "open" song's key bindings are listened for, so different songs
// can reuse the same keys (e.g. both bind "1" to their own Verse 1).
export function useSongs({ enabled = true } = {}) {
  const [songs, setSongs] = useState(() => [
    { id: nextSongId++, title: 'Song 1', sections: [], activeSectionId: null },
  ])
  const [openSongId, setOpenSongId] = useState(() => songs[0]?.id ?? null)
  const [activationNonce, setActivationNonce] = useState(0)
  const songsRef = useRef(songs)
  songsRef.current = songs

  const addSong = useCallback(() => {
    const id = nextSongId++
    setSongs((prev) => [
      ...prev,
      { id, title: `Song ${prev.length + 1}`, sections: [], activeSectionId: null },
    ])
    setOpenSongId(id)
  }, [])

  const removeSong = useCallback((songId) => {
    setSongs((prev) => prev.filter((song) => song.id !== songId))
    setOpenSongId((current) => {
      if (current !== songId) return current
      const remaining = songsRef.current.filter((song) => song.id !== songId)
      return remaining[0]?.id ?? null
    })
  }, [])

  const updateSongTitle = useCallback((songId, title) => {
    setSongs((prev) => prev.map((song) => (song.id === songId ? { ...song, title } : song)))
  }, [])

  const addSection = useCallback((songId) => {
    setSongs((prev) =>
      prev.map((song) =>
        song.id === songId ? { ...song, sections: [...song.sections, makeSection()] } : song,
      ),
    )
  }, [])

  const updateSection = useCallback((songId, sectionId, patch) => {
    setSongs((prev) =>
      prev.map((song) =>
        song.id === songId
          ? {
              ...song,
              sections: song.sections.map((section) =>
                section.id === sectionId ? { ...section, ...patch } : section,
              ),
            }
          : song,
      ),
    )
  }, [])

  const removeSection = useCallback((songId, sectionId) => {
    setSongs((prev) =>
      prev.map((song) =>
        song.id === songId
          ? {
              ...song,
              sections: song.sections.filter((section) => section.id !== sectionId),
              activeSectionId: song.activeSectionId === sectionId ? null : song.activeSectionId,
            }
          : song,
      ),
    )
  }, [])

  // Bumps a nonce alongside the id so re-selecting the same section still
  // re-broadcasts (needed to resync a /display that reloaded mid-session).
  const selectSection = useCallback((songId, sectionId) => {
    setSongs((prev) =>
      prev.map((song) => (song.id === songId ? { ...song, activeSectionId: sectionId } : song)),
    )
    setActivationNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!enabled) return
    function handleKeyDown(event) {
      if (isEditableTarget(event.target)) return
      const song = songsRef.current.find((s) => s.id === openSongId)
      if (!song) return
      const match = song.sections.find(
        (section) => section.key && section.key.toLowerCase() === event.key.toLowerCase(),
      )
      if (match) selectSection(song.id, match.id)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openSongId, enabled, selectSection])

  const openSong = songs.find((song) => song.id === openSongId) ?? null
  const activeSection = openSong
    ? (openSong.sections.find((section) => section.id === openSong.activeSectionId) ?? null)
    : null

  return {
    songs,
    openSongId,
    openSong,
    activeSection,
    activationNonce,
    selectSong: setOpenSongId,
    addSong,
    removeSong,
    updateSongTitle,
    addSection,
    updateSection,
    removeSection,
    selectSection,
  }
}
