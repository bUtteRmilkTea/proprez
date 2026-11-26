import { useEffect, useState } from 'react'
import { onMessage } from '../lib/channel'
import BackgroundLayer from '../features/background/BackgroundLayer'
import { DEFAULT_BACKGROUND } from '../features/background/backgrounds'

export default function Display() {
  const [text, setText] = useState('')
  const [background, setBackgroundState] = useState(DEFAULT_BACKGROUND)

  useEffect(() => {
    return onMessage((message) => {
      if (message.type === 'showText') {
        setText(message.text)
      } else if (message.type === 'clear') {
        setText('')
      } else if (message.type === 'setBackground') {
        setBackgroundState(message.background)
      }
    })
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'black', overflow: 'hidden' }}>
      <BackgroundLayer background={background} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem',
          boxSizing: 'border-box',
          fontSize: '4rem',
          lineHeight: 1.3,
          fontFamily: 'sans-serif',
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)',
        }}
      >
        {text}
      </div>
    </div>
  )
}
