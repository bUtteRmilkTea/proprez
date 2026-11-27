export default function SongPreview({ activeSection }) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: 16,
        minHeight: 120,
        whiteSpace: 'pre-wrap',
      }}
    >
      {activeSection ? (
        <>
          <strong>{activeSection.label || '(untitled)'}</strong>
          <p>{activeSection.text}</p>
        </>
      ) : (
        <em>No active section</em>
      )}
    </div>
  )
}
