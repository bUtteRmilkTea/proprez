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
  const [backgroundMode, setBackgroundModeState] = useState('generated')

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

  function handleBackgroundModeChange(mode) {
    setBackgroundModeState(mode)
    send({ type: 'setBackgroundMode', mode })
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Control</h1>
      <button type="button" onClick={() => send({ type: 'clear' })}>
        Clear
      </button>

      <h2>Background</h2>
      <div role="group" aria-label="Background mode">
        <label>
          <input
            type="radio"
            name="background-mode"
            value="generated"
            checked={backgroundMode === 'generated'}
            onChange={() => handleBackgroundModeChange('generated')}
          />{' '}
          Generated
        </label>{' '}
        <label>
          <input
            type="radio"
            name="background-mode"
            value="video"
            checked={backgroundMode === 'video'}
            onChange={() => handleBackgroundModeChange('video')}
          />{' '}
          Video
        </label>
      </div>
      <select
        value={background}
        onChange={handleBackgroundChange}
        disabled={backgroundMode !== 'generated'}
      >
        {BACKGROUNDS.map((bg) => (
          <option key={bg.id} value={bg.id}>
            {bg.label}
          </option>
        ))}
      </select>
      {backgroundMode === 'video' && (
        <p style={{ color: '#666', fontSize: 14 }}>
          Pick the video file directly on the /display window (file picker in its bottom-left
          corner).
        </p>
      )}

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
