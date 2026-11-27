import ShortcutRecorder from '../../components/ShortcutRecorder'

export default function MediaPanel({ items, activeIndex, onLoadFiles, onSelect, onUpdateShortcut }) {
  return (
    <div>
      <div>
        <label>
          Photos/Videos:{' '}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(event) => onLoadFiles(event.target.files)}
          />
        </label>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 8,
          marginTop: 8,
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              border: index === activeIndex ? '3px solid #f0ad4e' : '1px solid #ccc',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(index)}
              style={{
                padding: 0,
                border: 'none',
                cursor: 'pointer',
                background: 'none',
                width: '100%',
                display: 'block',
              }}
            >
              {item.type === 'video' ? (
                <video
                  src={item.previewUrl}
                  muted
                  style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
                />
              )}
            </button>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 4,
                padding: 4,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </span>
              <ShortcutRecorder
                combo={item.shortcut}
                onChange={(shortcut) => onUpdateShortcut(item.id, shortcut)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
