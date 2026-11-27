export default function VideoBackground({ src }) {
  if (!src) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#111',
          color: '#888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        No video loaded — pick a video file on the Control page
      </div>
    )
  }

  return (
    <video
      key={src}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  )
}
