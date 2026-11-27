import { useEffect, useRef, useState } from 'react'
import { onMessage } from '../lib/channel'
import BackgroundLayer from '../features/background/BackgroundLayer'
import VideoBackground from '../features/background/VideoBackground'
import { DEFAULT_BACKGROUND } from '../features/background/backgrounds'
import { DEFAULT_THEME } from '../features/background/themes'
import { getBlob } from '../lib/mediaStore'

function MediaContent({ mediaId, mediaType }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!mediaId) return
    let cancelled = false
    let objectUrl = null
    getBlob(mediaId).then((blob) => {
      if (cancelled || !blob) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [mediaId])

  if (!url) return null
  if (mediaType === 'video') {
    return (
      <video
        key={mediaId}
        src={url}
        autoPlay
        loop
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    )
  }
  return (
    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
  )
}

export default function Display() {
  const [mode, setMode] = useState('song')
  const [text, setText] = useState('')
  const [background, setBackgroundState] = useState(DEFAULT_BACKGROUND)
  const [backgroundMode, setBackgroundMode] = useState('generated')
  const [videoId, setVideoId] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [mediaId, setMediaId] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  const [cleared, setCleared] = useState(false)
  const [fontSize, setFontSize] = useState(4)
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const videoUrlRef = useRef(null)

  useEffect(() => {
    return onMessage((message) => {
      if (message.type === 'showText') {
        setText(message.text)
        setCleared(false)
      } else if (message.type === 'clear') {
        setText('')
        setImageSrc(null)
        setMediaId(null)
        setMediaType(null)
        setCleared(true)
      } else if (message.type === 'setBackground') {
        setBackgroundState(message.background)
      } else if (message.type === 'setBackgroundMode') {
        setBackgroundMode(message.mode)
        if (message.videoId) setVideoId(message.videoId)
      } else if (message.type === 'setMode') {
        setMode(message.mode)
      } else if (message.type === 'showImage') {
        setImageSrc(message.src)
        setCleared(false)
      } else if (message.type === 'setFontSize') {
        setFontSize(message.fontSize)
      } else if (message.type === 'setTheme') {
        setTheme(message.theme)
      } else if (message.type === 'showMedia') {
        setMediaId(message.mediaId)
        setMediaType(message.mediaType)
        setCleared(false)
      }
    })
  }, [])

  // Resolve the stored video Blob into a local object URL whenever the id
  // changes (including after this tab reloads and re-receives the id).
  useEffect(() => {
    if (!videoId) return
    let cancelled = false
    getBlob(videoId).then((blob) => {
      if (cancelled || !blob) return
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
      const url = URL.createObjectURL(blob)
      videoUrlRef.current = url
      setVideoUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [videoId])

  useEffect(() => {
    return () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
    }
  }, [])

  if (cleared) {
    return <div style={{ position: 'fixed', inset: 0, background: 'black' }} />
  }

  if (mode === 'slides') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'black' }}>
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
      <div style={{ position: 'fixed', inset: 0, background: 'black' }}>
        {mediaId && <MediaContent key={mediaId} mediaId={mediaId} mediaType={mediaType} />}
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'black', overflow: 'hidden' }}>
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
