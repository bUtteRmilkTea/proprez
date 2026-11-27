import { useEffect, useState } from 'react'
import { onMessage } from '../lib/channel'

export default function Display() {
  const [text, setText] = useState('')

  useEffect(() => {
    return onMessage((message) => {
      if (message.type === 'showText') {
        setText(message.text)
      } else if (message.type === 'clear') {
        setText('')
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
        padding: '4rem',
        boxSizing: 'border-box',
        fontSize: '4rem',
        lineHeight: 1.3,
        fontFamily: 'sans-serif',
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
    </div>
  )
}
