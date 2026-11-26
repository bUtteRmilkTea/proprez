const NON_TEXT_INPUT_TYPES = new Set([
  'radio',
  'checkbox',
  'button',
  'submit',
  'reset',
  'file',
  'range',
  'color',
])

export function isEditableTarget(target) {
  if (!target) return false
  if (target.isContentEditable) return true
  if (target.tagName === 'TEXTAREA') return true
  if (target.tagName === 'INPUT') {
    return !NON_TEXT_INPUT_TYPES.has(target.type)
  }
  return false
}
