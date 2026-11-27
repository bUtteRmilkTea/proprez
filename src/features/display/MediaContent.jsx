import { useEffect, useState } from 'react'
import { getBlob } from '../../lib/mediaStore'

export default function MediaContent({ mediaId, mediaType }) {
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
  return <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
}
