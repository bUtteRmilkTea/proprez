import { useDisplayState } from '../features/display/useDisplayState'
import DisplayView from '../features/display/DisplayView'

export default function Display() {
  const displayState = useDisplayState()

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'black' }}>
      <DisplayView {...displayState} />
    </div>
  )
}
