// Color palettes for the generated backgrounds (GradientDrift, MovingShapes,
// ParticleField). "default" preserves the original hardcoded look.
export const THEMES = {
  default: {
    label: 'Default',
    gradient: ['#1e3a8a', '#6b21a8', '#be185d', '#1e3a8a'],
    shapesBackground: '#0f172a',
    shapesColors: ['rgba(59,130,246,0.35)', 'rgba(236,72,153,0.3)', 'rgba(16,185,129,0.25)'],
    particlesBackground: '#0a0a1a',
    particlesColor: 'rgba(199, 210, 254, 0.8)',
  },
  warm: {
    label: 'Warm',
    gradient: ['#7c2d12', '#b91c1c', '#f59e0b', '#7c2d12'],
    shapesBackground: '#451a03',
    shapesColors: ['rgba(249,115,22,0.35)', 'rgba(239,68,68,0.3)', 'rgba(250,204,21,0.25)'],
    particlesBackground: '#2a1205',
    particlesColor: 'rgba(253, 186, 116, 0.85)',
  },
  cool: {
    label: 'Cool',
    gradient: ['#0c4a6e', '#1e40af', '#0891b2', '#0c4a6e'],
    shapesBackground: '#082f49',
    shapesColors: ['rgba(56,189,248,0.35)', 'rgba(99,102,241,0.3)', 'rgba(34,211,238,0.25)'],
    particlesBackground: '#031726',
    particlesColor: 'rgba(165, 243, 252, 0.85)',
  },
  summer: {
    label: 'Summer',
    gradient: ['#065f46', '#facc15', '#0ea5e9', '#065f46'],
    shapesBackground: '#083344',
    shapesColors: ['rgba(250,204,21,0.35)', 'rgba(14,165,233,0.3)', 'rgba(16,185,129,0.25)'],
    particlesBackground: '#042f2e',
    particlesColor: 'rgba(253, 224, 71, 0.85)',
  },
  forest: {
    label: 'Forest',
    gradient: ['#14532d', '#166534', '#3f6212', '#14532d'],
    shapesBackground: '#052e16',
    shapesColors: ['rgba(74,222,128,0.35)', 'rgba(132,204,22,0.3)', 'rgba(21,128,61,0.25)'],
    particlesBackground: '#031a0d',
    particlesColor: 'rgba(187, 247, 208, 0.85)',
  },
  'earth-tone': {
    label: 'Earth tone',
    gradient: ['#44403c', '#78350f', '#a16207', '#44403c'],
    shapesBackground: '#1c1917',
    shapesColors: ['rgba(161,98,7,0.35)', 'rgba(120,53,15,0.3)', 'rgba(168,162,158,0.25)'],
    particlesBackground: '#171310',
    particlesColor: 'rgba(214, 211, 209, 0.85)',
  },
}

export const DEFAULT_THEME = 'default'
