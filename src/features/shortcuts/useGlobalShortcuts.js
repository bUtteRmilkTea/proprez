import { useEffect } from 'react'
import { isEditableTarget } from '../../lib/isEditableTarget'

const MODE_KEYS = { 1: 'song', 2: 'slides', 3: 'media' }

// Global navigation shortcuts, active regardless of which mode is open:
// Ctrl+1/2/3 switches mode, Ctrl+Left/Right cycles the open song, and plain
// Left/Right navigates the active item of whichever mode is currently open
// (delegated to onNavigate, since "active item" means something different
// per mode).
export function useGlobalShortcuts({ enabled, onModeChange, songs, openSongId, onSelectSong, onNavigate }) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event) {
      if (isEditableTarget(event.target)) return
      const onlyCtrl = event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
      const noModifiers = !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey

      if (onlyCtrl && MODE_KEYS[event.key]) {
        event.preventDefault()
        onModeChange(MODE_KEYS[event.key])
        return
      }

      if (onlyCtrl && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault()
        if (songs.length === 0) return
        const currentIndex = songs.findIndex((song) => song.id === openSongId)
        const delta = event.key === 'ArrowRight' ? 1 : -1
        const nextIndex = (currentIndex + delta + songs.length) % songs.length
        onSelectSong(songs[nextIndex].id)
        return
      }

      if (noModifiers && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault()
        onNavigate(event.key === 'ArrowRight' ? 1 : -1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onModeChange, songs, openSongId, onSelectSong, onNavigate])
}
