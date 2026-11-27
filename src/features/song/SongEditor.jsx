import ShortcutRecorder from '../../components/ShortcutRecorder'

export default function SongEditor({
  sections,
  activeSection,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onSelectSection,
}) {
  return (
    <div>
      <button type="button" onClick={onAddSection}>
        + Add section
      </button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sections.map((section) => (
          <li
            key={section.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: 8,
              marginTop: 8,
              background: activeSection?.id === section.id ? '#fff3cd' : 'transparent',
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                aria-label="Label"
                placeholder="Label (e.g. Verse 1)"
                value={section.label}
                onChange={(event) => onUpdateSection(section.id, { label: event.target.value })}
              />
              <ShortcutRecorder
                combo={section.shortcut}
                onChange={(shortcut) => onUpdateSection(section.id, { shortcut })}
              />
              <button type="button" onClick={() => onSelectSection(section.id)}>
                Go live
              </button>
              <button type="button" onClick={() => onRemoveSection(section.id)}>
                Remove
              </button>
            </div>
            <textarea
              aria-label="Section text"
              placeholder="Lyrics..."
              value={section.text}
              onChange={(event) => onUpdateSection(section.id, { text: event.target.value })}
              rows={3}
              style={{ width: '100%', marginTop: 8, boxSizing: 'border-box' }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
