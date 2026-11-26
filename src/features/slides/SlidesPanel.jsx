export default function SlidesPanel({
  slides,
  activeIndex,
  onLoadFiles,
  onSelect,
  onLoadPptx,
  pptxStatus,
  pptxProgress,
  pptxError,
}) {
  return (
    <div>
      <div>
        <label>
          Images:{' '}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => onLoadFiles(event.target.files)}
          />
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>
          PowerPoint (.pptx):{' '}
          <input
            type="file"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            disabled={pptxStatus === 'loading'}
            onChange={(event) => {
              const file = event.target.files[0]
              if (file) onLoadPptx(file)
              event.target.value = ''
            }}
          />
        </label>
        <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>
          Best-effort preview — each slide is rendered and flattened into an image. Complex
          layouts, animations, or unusual fonts may not look exactly like PowerPoint. For
          anything critical, export the deck as images instead.
        </p>
        {pptxStatus === 'loading' && (
          <p style={{ fontSize: 13 }}>
            Converting slide {pptxProgress.done} of {pptxProgress.total || '…'}
          </p>
        )}
        {pptxStatus === 'error' && (
          <p style={{ color: '#c00', fontSize: 13 }}>Couldn't read that .pptx: {pptxError}</p>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 8,
          marginTop: 8,
        }}
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => onSelect(index)}
            style={{
              position: 'relative',
              padding: 0,
              border: index === activeIndex ? '3px solid #f0ad4e' : '1px solid #ccc',
              borderRadius: 4,
              cursor: 'pointer',
              background: 'none',
            }}
          >
            {index < 10 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  fontSize: 12,
                  padding: '1px 6px',
                  borderRadius: 3,
                }}
              >
                {index === 9 ? 0 : index + 1}
              </span>
            )}
            <img
              src={slide.url}
              alt={slide.name}
              style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
