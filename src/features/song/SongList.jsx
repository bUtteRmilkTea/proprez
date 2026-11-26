export default function SongList({
  songs,
  openSongId,
  onAddSong,
  onSelectSong,
  onRemoveSong,
  onRenameSong,
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {songs.map((song) => (
        <div
          key={song.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            border: song.id === openSongId ? '2px solid #f0ad4e' : '1px solid #ccc',
            borderRadius: 4,
            padding: '2px 4px',
          }}
        >
          <input
            aria-label="Song title"
            value={song.title}
            onChange={(event) => onRenameSong(song.id, event.target.value)}
            onFocus={() => onSelectSong(song.id)}
            style={{ border: 'none', width: 100 }}
          />
          <button type="button" onClick={() => onSelectSong(song.id)}>
            Open
          </button>
          <button type="button" onClick={() => onRemoveSong(song.id)}>
            &times;
          </button>
        </div>
      ))}
      <button type="button" onClick={onAddSong}>
        + Add song
      </button>
    </div>
  )
}
