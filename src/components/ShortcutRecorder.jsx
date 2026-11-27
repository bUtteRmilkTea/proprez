import { useState } from 'react'
import { comboFromEvent, comboLabel, isReservedCombo } from '../lib/shortcuts'

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta'])

export default function ShortcutRecorder({ combo, onChange }) {
  const [recording, setRecording] = useState(false)

  function handleKeyDown(event) {
    event.preventDefault()
    event.stopPropagation()
    if (event.key === 'Escape') {
      setRecording(false)
      return
    }
    if (MODIFIER_KEYS.has(event.key)) return
    const next = comboFromEvent(event)
    if (isReservedCombo(next)) return
    onChange(next)
    setRecording(false)
  }

  return (
    <button
      type="button"
      onClick={() => setRecording(true)}
      onKeyDown={recording ? handleKeyDown : undefined}
      onBlur={() => setRecording(false)}
      style={{ width: 110 }}
    >
      {recording ? 'Press keys…' : combo?.key ? comboLabel(combo) : 'Set shortcut'}
    </button>
  )
}
