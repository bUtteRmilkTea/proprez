export default function SlidesPanel({ slides, activeIndex, onLoadFiles, onSelect }) {
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => onLoadFiles(event.target.files)}
      />
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
