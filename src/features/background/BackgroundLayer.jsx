import GradientDrift from './GradientDrift'
import MovingShapes from './MovingShapes'
import ParticleField from './ParticleField'
import { DEFAULT_THEME, THEMES } from './themes'

export default function BackgroundLayer({ background, theme = DEFAULT_THEME }) {
  const palette = THEMES[theme] ?? THEMES[DEFAULT_THEME]

  if (background === 'gradient') return <GradientDrift colors={palette.gradient} />
  if (background === 'shapes') {
    return <MovingShapes background={palette.shapesBackground} colors={palette.shapesColors} />
  }
  if (background === 'particles') {
    return <ParticleField background={palette.particlesBackground} color={palette.particlesColor} />
  }
  return null
}
