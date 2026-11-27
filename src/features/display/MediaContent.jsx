import { useEffect, useRef, useState } from 'react'
import { getBlob } from '../../lib/mediaStore'

export default function MediaContent({ mediaId, mediaType }) {
  const [url, setUrl] = useState(null)
  const videoRef = useRef(null)
  const [needsGesture, setNeedsGesture] = useState(false)

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

  useEffect(() => {
    const video = videoRef.current
    if (!video || !url) return
    setNeedsGesture(false)
    video.muted = false
    video.play().catch(() => {
      video.muted = true
      video.play().catch(() => {})
      setNeedsGesture(true)
    })
  }, [url])

  function handleEnableSound() {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video
      .play()
      .then(() => setNeedsGesture(false))
      .catch(() => {})
  }

  if (!url) return null
  if (mediaType === 'video') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <video
          key={mediaId}
          ref={videoRef}
          src={url}
          autoPlay
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        {needsGesture && (
          <button
            type="button"
            onClick={handleEnableSound}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 10,
              padding: '6px 12px',
              fontSize: 13,
            }}
          >
            🔊 Click to enable sound
          </button>
        )}
      </div>
    )
  }
  return <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
}
