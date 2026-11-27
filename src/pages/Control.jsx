import { useEffect, useState } from 'react'
import { send } from '../lib/channel'
import SongEditor from '../features/song/SongEditor'
import SongPreview from '../features/song/SongPreview'
import SongList from '../features/song/SongList'
import { useSongs } from '../features/song/useSongs'
import { BACKGROUNDS, DEFAULT_BACKGROUND } from '../features/background/backgrounds'
import { DEFAULT_THEME, THEMES } from '../features/background/themes'
import { makeMediaId, putBlob } from '../lib/mediaStore'
import SlidesPanel from '../features/slides/SlidesPanel'
import { useSlides } from '../features/slides/useSlides'
import { usePptxImport } from '../features/slides/usePptxImport'
import MediaPanel from '../features/media/MediaPanel'
import { useMedia } from '../features/media/useMedia'
import { useGlobalShortcuts } from '../features/shortcuts/useGlobalShortcuts'
import ConfirmDialog from '../components/ConfirmDialog'
import ControlPreview from '../features/display/ControlPreview'
import ShortcutsHelp from '../components/ShortcutsHelp'

export default function Control() {
  const [mode, setMode] = useState('song')
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  const {
    songs,
    openSongId,
    openSong,
    activeSection,
    activationNonce,
    selectSong,
    addSong,
    removeSong,
    updateSongTitle,
    addSection,
    updateSection,
    removeSection,
    selectSection,
  } = useSongs({ enabled: mode === 'song' })

  const {
    slides,
    activeIndex,
    activeSlide,
    activationNonce: slideActivationNonce,
    loadFiles,
    loadRenderedSlides,
    setActiveIndex,
  } = useSlides({ enabled: mode === 'slides' })

  const {
    status: pptxStatus,
    progress: pptxProgress,
    error: pptxError,
    importPptx,
  } = usePptxImport()

  const {
    items: mediaItems,
    activeIndex: mediaActiveIndex,
    activeItem: activeMediaItem,
    activationNonce: mediaActivationNonce,
    loadFiles: loadMediaFiles,
    setActiveIndex: setMediaActiveIndex,
    updateItemShortcut: updateMediaItemShortcut,
  } = useMedia({ enabled: mode === 'media' })

  const [background, setBackground] = useState(DEFAULT_BACKGROUND)
  const [backgroundMode, setBackgroundModeState] = useState('generated')
  const [fontSize, setFontSizeState] = useState(4)
  const [theme, setThemeState] = useState(DEFAULT_THEME)

  function handleFontSizeChange(event) {
    const next = Number(event.target.value)
    setFontSizeState(next)
    send({ type: 'setFontSize', fontSize: next })
  }

  function handleThemeChange(nextTheme) {
    setThemeState(nextTheme)
    send({ type: 'setTheme', theme: nextTheme })
    // A theme only shows up on an animated background - if "None" is
    // selected, switch to the gradient animation so the theme is visible.
    if (background === 'none') {
      setBackground('gradient')
      send({ type: 'setBackground', background: 'gradient' })
    }
  }

  function handleModeChange(next) {
    setMode(next)
    send({ type: 'setMode', mode: next })
  }

  function handleNavigate(direction) {
    if (mode === 'song' && openSong) {
      if (openSong.sections.length === 0) return
      const currentIndex = openSong.sections.findIndex(
        (section) => section.id === openSong.activeSectionId,
      )
      const nextIndex =
        currentIndex === -1
          ? 0
          : Math.min(openSong.sections.length - 1, Math.max(0, currentIndex + direction))
      selectSection(openSong.id, openSong.sections[nextIndex].id)
    } else if (mode === 'slides') {
      if (slides.length === 0) return
      const nextIndex =
        activeIndex === null ? 0 : Math.min(slides.length - 1, Math.max(0, activeIndex + direction))
      setActiveIndex(nextIndex)
    } else if (mode === 'media') {
      if (mediaItems.length === 0) return
      const nextIndex =
        mediaActiveIndex === null
          ? 0
          : Math.min(mediaItems.length - 1, Math.max(0, mediaActiveIndex + direction))
      setMediaActiveIndex(nextIndex)
    }
  }

  useGlobalShortcuts({
    enabled: true,
    onModeChange: handleModeChange,
    songs,
    openSongId,
    onSelectSong: selectSong,
    onNavigate: handleNavigate,
  })

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

  useEffect(() => {
    if (mode === 'media' && activeMediaItem) {
      send({ type: 'showMedia', mediaId: activeMediaItem.id, mediaType: activeMediaItem.type })
    }
  }, [mode, activeMediaItem, mediaActivationNonce])

  function handleBackgroundChange(event) {
    const next = event.target.value
    setBackground(next)
    send({ type: 'setBackground', background: next })
  }

  function handleBackgroundModeChange(nextBgMode) {
    setBackgroundModeState(nextBgMode)
    send({ type: 'setBackgroundMode', mode: nextBgMode })
  }

  async function handlePickVideoFile(event) {
    const file = event.target.files[0]
    if (!file) return
    const id = makeMediaId()
    await putBlob(id, file)
    setBackgroundModeState('video')
    send({ type: 'setBackgroundMode', mode: 'video', videoId: id })
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Control</h1>
      <button type="button" onClick={() => setConfirmClearOpen(true)}>
        Clear
      </button>
      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear display?"
        message="This will blank the audience display."
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={() => {
          send({ type: 'clear' })
          setConfirmClearOpen(false)
        }}
      />

      <ShortcutsHelp />

      <h2>Audience display</h2>
      <ControlPreview />

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
        </label>{' '}
        <label>
          <input
            type="radio"
            name="mode"
            value="media"
            checked={mode === 'media'}
            onChange={() => handleModeChange('media')}
          />{' '}
          Media
        </label>
      </div>

      {mode === 'song' && (
        <>
          <h2>Font size</h2>
          <label>
            {fontSize}rem{' '}
            <input
              type="range"
              min={2}
              max={8}
              step={0.5}
              value={fontSize}
              onChange={handleFontSizeChange}
            />
          </label>

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

          <div role="group" aria-label="Background theme" style={{ marginTop: 8 }}>
            {Object.entries(THEMES).map(([id, palette]) => (
              <button
                key={id}
                type="button"
                onClick={() => handleThemeChange(id)}
                disabled={backgroundMode !== 'generated'}
                aria-pressed={theme === id}
                style={{
                  marginRight: 6,
                  padding: '4px 10px',
                  border: theme === id ? '2px solid #333' : '1px solid #ccc',
                  borderRadius: 4,
                  background: palette.gradient[0],
                  color: '#fff',
                }}
              >
                {palette.label}
              </button>
            ))}
          </div>
          {backgroundMode === 'video' && (
            <p>
              <label>
                Video file:{' '}
                <input type="file" accept="video/*" onChange={handlePickVideoFile} />
              </label>
            </p>
          )}

          <h2>Songs</h2>
          <SongList
            songs={songs}
            openSongId={openSongId}
            onAddSong={addSong}
            onSelectSong={selectSong}
            onRemoveSong={removeSong}
            onRenameSong={updateSongTitle}
          />

          {openSong ? (
            <>
              <h2>Song sections — {openSong.title}</h2>
              <SongEditor
                sections={openSong.sections}
                activeSection={activeSection}
                onAddSection={() => addSection(openSong.id)}
                onUpdateSection={(sectionId, patch) =>
                  updateSection(openSong.id, sectionId, patch)
                }
                onRemoveSection={(sectionId) => removeSection(openSong.id, sectionId)}
                onSelectSection={(sectionId) => selectSection(openSong.id, sectionId)}
              />

              <h2>Live preview</h2>
              <SongPreview activeSection={activeSection} />
            </>
          ) : (
            <p>No song open — add one above.</p>
          )}
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
            onLoadPptx={(file) => importPptx(file, loadRenderedSlides)}
            pptxStatus={pptxStatus}
            pptxProgress={pptxProgress}
            pptxError={pptxError}
          />
        </>
      )}

      {mode === 'media' && (
        <>
          <h2>Media</h2>
          <MediaPanel
            items={mediaItems}
            activeIndex={mediaActiveIndex}
            onLoadFiles={loadMediaFiles}
            onSelect={setMediaActiveIndex}
            onUpdateShortcut={updateMediaItemShortcut}
          />
        </>
      )}
    </main>
  )
}
