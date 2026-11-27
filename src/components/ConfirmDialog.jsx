export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: '1.5rem',
          minWidth: 280,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} autoFocus>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
