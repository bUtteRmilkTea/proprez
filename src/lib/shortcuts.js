// Keyboard shortcut combos: a plain key plus optional modifiers.
// Note: the "Fn" key is not reliably exposed to web pages (handled at the
// OS/keyboard-firmware level on most devices), so combos support
// Ctrl/Shift/Alt/Meta(Cmd) only.

const AUTO_KEY_SEQUENCE = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
]

// Combos reserved for global navigation (see useGlobalShortcuts) - the
// shortcut recorder refuses to assign these to a section/slide/media item.
export const RESERVED_COMBOS = [
  { key: '1', ctrl: true, shift: false, alt: false, meta: false },
  { key: '2', ctrl: true, shift: false, alt: false, meta: false },
  { key: '3', ctrl: true, shift: false, alt: false, meta: false },
  { key: 'ArrowLeft', ctrl: true, shift: false, alt: false, meta: false },
  { key: 'ArrowRight', ctrl: true, shift: false, alt: false, meta: false },
  { key: 'ArrowLeft', ctrl: false, shift: false, alt: false, meta: false },
  { key: 'ArrowRight', ctrl: false, shift: false, alt: false, meta: false },
]

// Human-readable reference for the fixed global shortcuts (see
// useGlobalShortcuts.js) - shown in the Control page's shortcuts help
// panel. Does not include per-section/slide/media-item shortcuts, since
// those are user-assigned and already shown inline next to each item.
export const GLOBAL_SHORTCUTS = [
  { combo: RESERVED_COMBOS[0], description: 'Switch to Song mode' },
  { combo: RESERVED_COMBOS[1], description: 'Switch to Slides mode' },
  { combo: RESERVED_COMBOS[2], description: 'Switch to Media mode' },
  { combo: RESERVED_COMBOS[3], description: 'Previous song' },
  { combo: RESERVED_COMBOS[4], description: 'Next song' },
  { combo: RESERVED_COMBOS[5], description: 'Previous item (section / slide / media item)' },
  { combo: RESERVED_COMBOS[6], description: 'Next item (section / slide / media item)' },
]

export function emptyCombo() {
  return { key: '', ctrl: false, shift: false, alt: false, meta: false }
}

export function comboFromEvent(event) {
  return {
    key: event.key,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
    meta: event.metaKey,
  }
}

function sameCombo(a, b) {
  return (
    a.key.toLowerCase() === b.key.toLowerCase() &&
    !!a.ctrl === !!b.ctrl &&
    !!a.shift === !!b.shift &&
    !!a.alt === !!b.alt &&
    !!a.meta === !!b.meta
  )
}

export function matchesCombo(event, combo) {
  if (!combo || !combo.key) return false
  return sameCombo(comboFromEvent(event), combo)
}

export function isReservedCombo(combo) {
  if (!combo || !combo.key) return false
  return RESERVED_COMBOS.some((reserved) => sameCombo(reserved, combo))
}

function keyLabel(key) {
  if (key === ' ') return 'Space'
  if (key.length === 1) return key.toUpperCase()
  return key
}

export function comboLabel(combo) {
  if (!combo || !combo.key) return ''
  const parts = []
  if (combo.ctrl) parts.push('Ctrl')
  if (combo.shift) parts.push('Shift')
  if (combo.alt) parts.push('Alt')
  if (combo.meta) parts.push('Meta')
  parts.push(keyLabel(combo.key))
  return parts.join('+')
}

// Next free plain (no-modifier) key in the 1-9, 0, a-z sequence, skipping
// any plain key already assigned among existingCombos.
export function nextAutoKey(existingCombos) {
  const used = new Set(
    existingCombos
      .filter((combo) => combo && combo.key && !combo.ctrl && !combo.shift && !combo.alt && !combo.meta)
      .map((combo) => combo.key.toLowerCase()),
  )
  return AUTO_KEY_SEQUENCE.find((key) => !used.has(key)) ?? ''
}
