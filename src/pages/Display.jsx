import { useEffect, useState } from 'react'
import { onMessage } from '../lib/channel'

const PING_VISIBLE_MS = 1500

export default function Display() {
  const [showPing, setShowPing] = useState(false)

  useEffect(() => {
    return onMessage((message) => {
      if (message.type === 'ping') {
        setShowPing(true)
        setTimeout(() => setShowPing(false), PING_VISIBLE_MS)
      }
    })
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'black',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        fontFamily: 'sans-serif',
      }}
    >
      {showPing ? 'PING RECEIVED' : null}
    </div>
  )
}
