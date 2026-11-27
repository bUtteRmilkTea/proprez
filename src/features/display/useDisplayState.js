import { useEffect, useRef, useState } from 'react'
import { onMessage } from '../../lib/channel'
import { DEFAULT_BACKGROUND } from '../background/backgrounds'
import { DEFAULT_THEME } from '../background/themes'
import { getBlob } from '../../lib/mediaStore'

// Subscribes to the BroadcastChannel and resolves the stored video Blob into
// a local object URL, returning everything DisplayView needs to render.
// Used independently by both /display (fullscreen) and Control's live
// preview, so both always reflect the exact same state.
export function useDisplayState() {
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
  // changes (including after this subscriber reloads/mounts after the id
  // was already broadcast).
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

  return {
    mode,
    text,
    background,
    backgroundMode,
    videoUrl,
    imageSrc,
    mediaId,
    mediaType,
    cleared,
    fontSize,
    theme,
  }
}
