// Shared BroadcastChannel wrapper for /control <-> /display sync.
const CHANNEL_NAME = 'proprez'

export function send(message) {
  const channel = new BroadcastChannel(CHANNEL_NAME)
  channel.postMessage(message)
  channel.close()
}

export function onMessage(callback) {
  const channel = new BroadcastChannel(CHANNEL_NAME)
  const handler = (event) => callback(event.data)
  channel.addEventListener('message', handler)
  return () => {
    channel.removeEventListener('message', handler)
    channel.close()
  }
}
