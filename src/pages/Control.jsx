import { send } from '../lib/channel'

export default function Control() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Control</h1>
      <button type="button" onClick={() => send({ type: 'ping' })}>
        Send ping
      </button>
    </main>
  )
}
