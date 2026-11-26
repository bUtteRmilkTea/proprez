import { renderToHtml } from '@meshesha/pptxjs'
import { toBlob } from 'html-to-image'

// Renders each slide of a .pptx to a flat PNG image, so it can be used the
// same way as a pre-exported slide image. This is a best-effort preview:
// PPTXjs (alpha) covers text, shapes, pictures, tables, charts and SmartArt,
// but animations, some fonts, and unusual layouts may not match PowerPoint
// exactly.
export async function renderPptxToSlideImages(file, { onProgress } = {}) {
  const buffer = await file.arrayBuffer()
  const { slides, css, width, height } = await renderToHtml(buffer)

  const container = document.createElement('div')
  Object.assign(container.style, {
    position: 'fixed',
    left: '-99999px',
    top: '0',
    width: `${width}px`,
    height: `${height}px`,
    overflow: 'hidden',
  })
  document.body.appendChild(container)

  const styleEl = document.createElement('style')
  styleEl.textContent = css
  container.appendChild(styleEl)

  const slideHost = document.createElement('div')
  container.appendChild(slideHost)

  const baseName = file.name.replace(/\.pptx$/i, '')

  try {
    const results = []
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      slideHost.innerHTML = slide.html
      // eslint-disable-next-line no-await-in-loop
      const blob = await toBlob(slideHost, { width, height, pixelRatio: 2 })
      results.push({
        name: `${baseName} — slide ${String(slide.number).padStart(2, '0')}`,
        url: URL.createObjectURL(blob),
      })
      onProgress?.(i + 1, slides.length)
    }
    return results
  } finally {
    document.body.removeChild(container)
  }
}
