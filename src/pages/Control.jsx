import { send } from '../lib/channel'
import SongEditor from '../features/song/SongEditor'
import SongPreview from '../features/song/SongPreview'
import { useSongSections } from '../features/song/useSongSections'

export default function Control() {
  const {
    sections,
    activeSection,
    setActiveId,
    addSection,
    updateSection,
    removeSection,
  } = useSongSections()

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Control</h1>
      <button type="button" onClick={() => send({ type: 'ping' })}>
        Send ping
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
