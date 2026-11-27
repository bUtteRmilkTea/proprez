import GradientDrift from './GradientDrift'
import MovingShapes from './MovingShapes'
import ParticleField from './ParticleField'

export default function BackgroundLayer({ background }) {
  if (background === 'gradient') return <GradientDrift />
  if (background === 'shapes') return <MovingShapes />
  if (background === 'particles') return <ParticleField />
  return null
}
