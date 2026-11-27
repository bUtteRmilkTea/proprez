import { useDisplayState } from './useDisplayState'
import DisplayView from './DisplayView'

// A 16:9 "virtual screen" is rendered at full size then scaled down with a
// CSS transform, so DisplayView's rem-based font sizing stays proportional
// to the preview box instead of looking tiny/huge relative to it.
const VIRTUAL_WIDTH = 1920
const VIRTUAL_HEIGHT = 1080
const PREVIEW_WIDTH = 480
const SCALE = PREVIEW_WIDTH / VIRTUAL_WIDTH

export default function ControlPreview() {
  const displayState = useDisplayState()

  return (
    <div
      style={{
        position: 'relative',
        width: PREVIEW_WIDTH,
        height: VIRTUAL_HEIGHT * SCALE,
        background: 'black',
        overflow: 'hidden',
        borderRadius: 4,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: VIRTUAL_WIDTH,
          height: VIRTUAL_HEIGHT,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
        }}
      >
        <DisplayView {...displayState} />
      </div>
    </div>
  )
}
