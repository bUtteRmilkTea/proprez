const DEFAULT_COLORS = ['rgba(59,130,246,0.35)', 'rgba(236,72,153,0.3)', 'rgba(16,185,129,0.25)']
const DEFAULT_BACKGROUND = '#0f172a'

const SHAPE_LAYOUT = [
  { size: 260, top: '10%', left: '15%', duration: '14s', delay: '0s' },
  { size: 180, top: '60%', left: '70%', duration: '20s', delay: '2s' },
  { size: 320, top: '40%', left: '45%', duration: '26s', delay: '4s' },
]

const style = `
@keyframes proprez-shape-float {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}
`

export default function MovingShapes({ background = DEFAULT_BACKGROUND, colors = DEFAULT_COLORS }) {
  return (
    <>
      <style>{style}</style>
      <div style={{ position: 'absolute', inset: 0, background, overflow: 'hidden' }}>
        {SHAPE_LAYOUT.map((shape, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: shape.top,
              left: shape.left,
              width: shape.size,
              height: shape.size,
              borderRadius: '50%',
              background: colors[i % colors.length],
              filter: 'blur(20px)',
              animation: `proprez-shape-float ${shape.duration} ease-in-out infinite`,
              animationDelay: shape.delay,
            }}
          />
        ))}
      </div>
    </>
  )
}
