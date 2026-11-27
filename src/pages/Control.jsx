import { useEffect, useState } from 'react'
import { send } from '../lib/channel'
import SongEditor from '../features/song/SongEditor'
import SongPreview from '../features/song/SongPreview'
import { useSongSections } from '../features/song/useSongSections'
import { BACKGROUNDS, DEFAULT_BACKGROUND } from '../features/background/backgrounds'
import SlidesPanel from '../features/slides/SlidesPanel'
import { useSlides } from '../features/slides/useSlides'

export default function Control() {
  const [mode, setMode] = useState('song')

  const {
    sections,
    activeSection,
    activationNonce,
    setActiveId,
    addSection,
    updateSection,
    removeSection,
  } = useSongSections({ enabled: mode === 'song' })

  const {
    slides,
    activeIndex,
    activeSlide,
    activationNonce: slideActivationNonce,
    loadFiles,
    setActiveIndex,
  } = useSlides({ enabled: mode === 'slides' })

  const [background, setBackground] = useState(DEFAULT_BACKGROUND)
  const [backgroundMode, setBackgroundModeState] = useState('generated')

  function handleModeChange(next) {
    setMode(next)
    send({ type: 'setMode', mode: next })
  }

  useEffect(() => {
    if (mode === 'song' && activeSection) {
      send({ type: 'showText', text: activeSection.text })
    }
  }, [mode, activeSection, activationNonce])

  useEffect(() => {
    if (mode === 'slides' && activeSlide) {
      send({ type: 'showImage', src: activeSlide.url })
    }
  }, [mode, activeSlide, slideActivationNonce])

  function handleBackgroundChange(event) {
    const next = event.target.value
    setBackground(next)
    send({ type: 'setBackground', background: next })
  }

  function handleBackgroundModeChange(nextBgMode) {
    setBackgroundModeState(nextBgMode)
    send({ type: 'setBackgroundMode', mode: nextBgMode })
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Control</h1>
      <button type="button" onClick={() => send({ type: 'clear' })}>
        Clear
      </button>

      <div role="group" aria-label="Mode">
        <label>
          <input
            type="radio"
            name="mode"
            value="song"
            checked={mode === 'song'}
            onChange={() => handleModeChange('song')}
          />{' '}
          Song
        </label>{' '}
        <label>
          <input
            type="radio"
            name="mode"
            value="slides"
            checked={mode === 'slides'}
            onChange={() => handleModeChange('slides')}
          />{' '}
          Slides
        </label>
      </div>

      {mode === 'song' && (
        <>
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
              Pick the video file directly on the /display window (file picker in its
              bottom-left corner).
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
        </>
      )}

      {mode === 'slides' && (
        <>
          <h2>Slides</h2>
          <SlidesPanel
            slides={slides}
            activeIndex={activeIndex}
            onLoadFiles={loadFiles}
            onSelect={setActiveIndex}
          />
        </>
      )}
    </main>
  )
}
