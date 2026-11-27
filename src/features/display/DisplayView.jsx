import BackgroundLayer from '../background/BackgroundLayer'
import VideoBackground from '../background/VideoBackground'
import MediaContent from './MediaContent'

// Presentational render of exactly what the audience sees, driven entirely
// by props (from useDisplayState). Used by both /display (fullscreen) and
// Control's live preview (scaled down), so they can never drift apart.
export default function DisplayView({
  mode,
  cleared,
  text,
  fontSize,
  theme,
  background,
  backgroundMode,
  videoUrl,
  imageSrc,
  mediaId,
  mediaType,
}) {
  if (cleared) {
    return <div style={{ position: 'absolute', inset: 0, background: 'black' }} />
  }

  if (mode === 'slides') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'black' }}>
        {imageSrc && (
          <img
            src={imageSrc}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
      </div>
    )
  }

  if (mode === 'media') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'black' }}>
        {mediaId && <MediaContent key={mediaId} mediaId={mediaId} mediaType={mediaType} />}
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'black', overflow: 'hidden' }}>
      {backgroundMode === 'video' ? (
        <VideoBackground src={videoUrl} />
      ) : (
        <BackgroundLayer background={background} theme={theme} />
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem',
          boxSizing: 'border-box',
          fontSize: `${fontSize}rem`,
          lineHeight: 1.3,
          fontFamily: 'sans-serif',
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)',
        }}
      >
        {text}
      </div>
    </div>
  )
}
