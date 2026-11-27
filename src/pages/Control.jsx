import { useEffect, useState } from 'react'
import { send } from '../lib/channel'
import SongEditor from '../features/song/SongEditor'
import SongPreview from '../features/song/SongPreview'
import { useSongSections } from '../features/song/useSongSections'
import { BACKGROUNDS, DEFAULT_BACKGROUND } from '../features/background/backgrounds'

export default function Control() {
  const {
    sections,
    activeSection,
    activationNonce,
    setActiveId,
    addSection,
    updateSection,
    removeSection,
  } = useSongSections()

  const [background, setBackground] = useState(DEFAULT_BACKGROUND)

  useEffect(() => {
    if (activeSection) {
      send({ type: 'showText', text: activeSection.text })
    }
  }, [activeSection, activationNonce])

  function handleBackgroundChange(event) {
    const next = event.target.value
    setBackground(next)
    send({ type: 'setBackground', background: next })
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Control</h1>
      <button type="button" onClick={() => send({ type: 'clear' })}>
        Clear
      </button>

      <h2>Background</h2>
      <select value={background} onChange={handleBackgroundChange}>
        {BACKGROUNDS.map((bg) => (
          <option key={bg.id} value={bg.id}>
            {bg.label}
          </option>
        ))}
      </select>

      <h2>Song sections</h2>
      <SongEditor
        sections={sections}
        activeSection={activeSection}
        onAddSection={addSection}
        onUpdateSection={updateSection}
        onRemoveSection={removeSection}
        onSelectSection={setActiveId}
      />

      <h2>Live preview</h2>
      <SongPreview activeSection={activeSection} />
    </main>
  )
}
