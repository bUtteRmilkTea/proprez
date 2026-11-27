import { useEffect, useRef, useState } from 'react'

export default function VideoBackground({ src }) {
  const videoRef = useRef(null)
  const [needsGesture, setNeedsGesture] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return
    setNeedsGesture(false)
    video.muted = false
    video.play().catch(() => {
      // Autoplay with sound was blocked by the browser (no user gesture on
      // this page yet) - fall back to muted so the background still plays,
      // and offer a one-click way to turn sound on (that click is the
      // gesture the browser needs).
      video.muted = true
      video.play().catch(() => {})
      setNeedsGesture(true)
    })
  }, [src])

  function handleEnableSound() {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video
      .play()
      .then(() => setNeedsGesture(false))
      .catch(() => {})
  }

  if (!src) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#111',
          color: '#888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        No video loaded — pick a video file on the Control page
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <video
        key={src}
        ref={videoRef}
        src={src}
        autoPlay
        loop
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
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
