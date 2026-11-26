const style = `
@keyframes proprez-gradient-drift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`

export default function GradientDrift() {
  return (
    <>
      <style>{style}</style>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(120deg, #1e3a8a, #6b21a8, #be185d, #1e3a8a)',
          backgroundSize: '400% 400%',
          animation: 'proprez-gradient-drift 18s ease infinite',
        }}
      />
    </>
  )
}
