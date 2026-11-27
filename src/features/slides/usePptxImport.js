import { useCallback, useState } from 'react'
import { renderPptxToSlideImages } from './pptx'

export function usePptxImport() {
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState(null)

  const importPptx = useCallback(async (file, onSlides) => {
    setStatus('loading')
    setError(null)
    setProgress({ done: 0, total: 0 })
    try {
      const entries = await renderPptxToSlideImages(file, {
        onProgress: (done, total) => setProgress({ done, total }),
      })
      onSlides(entries)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  return { status, progress, error, importPptx }
}
