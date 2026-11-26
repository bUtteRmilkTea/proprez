import { useEffect, useRef, useState } from 'react'
import { onMessage } from '../lib/channel'
import BackgroundLayer from '../features/background/BackgroundLayer'
import VideoBackground from '../features/background/VideoBackground'
import { DEFAULT_BACKGROUND } from '../features/background/backgrounds'

export default function Display() {
  const [text, setText] = useState('')
  const [background, setBackgroundState] = useState(DEFAULT_BACKGROUND)
  const [backgroundMode, setBackgroundMode] = useState('generated')
  const [videoUrl, setVideoUrl] = useState(null)
  const videoUrlRef = useRef(null)

  useEffect(() => {
    return onMessage((message) => {
      if (message.type === 'showText') {
        setText(message.text)
      } else if (message.type === 'clear') {
        setText('')
      } else if (message.type === 'setBackground') {
        setBackgroundState(message.background)
      } else if (message.type === 'setBackgroundMode') {
        setBackgroundMode(message.mode)
      }
    })
  }, [])

  function handlePickVideo(event) {
    const file = event.target.files[0]
    if (!file) return
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
    const url = URL.createObjectURL(file)
    videoUrlRef.current = url
    setVideoUrl(url)
  }

  useEffect(() => {
    return () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'black', overflow: 'hidden' }}>
      {backgroundMode === 'video' ? (
        <VideoBackground src={videoUrl} />
      ) : (
        <BackgroundLayer background={background} />
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
          fontSize: '4rem',
          lineHeight: 1.3,
          fontFamily: 'sans-serif',
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)',
        }}
      >
        {text}
      </div>

      <label
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          color: 'rgba(255,255,255,0.4)',
          fontSize: 12,
          fontFamily: 'sans-serif',
        }}
      >
        Video file:{' '}
        <input
          type="file"
          accept="video/*"
          onChange={handlePickVideo}
          style={{ fontSize: 12 }}
        />
      </label>
    </div>
  )
}
