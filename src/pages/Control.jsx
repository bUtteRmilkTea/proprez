import { useEffect } from 'react'
import { send } from '../lib/channel'
import SongEditor from '../features/song/SongEditor'
import SongPreview from '../features/song/SongPreview'
import { useSongSections } from '../features/song/useSongSections'

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

  useEffect(() => {
    if (activeSection) {
      send({ type: 'showText', text: activeSection.text })
    }
  }, [activeSection, activationNonce])

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Control</h1>
      <button type="button" onClick={() => send({ type: 'clear' })}>
        Clear
      </button>

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
