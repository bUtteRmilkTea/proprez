import { GLOBAL_SHORTCUTS, comboLabel } from '../lib/shortcuts'

// Reference list of the fixed, global shortcuts - excludes per-section
// shortcuts (those are user-assigned and shown inline in the song editor).
export default function ShortcutsHelp() {
  return (
    <details>
      <summary>Keyboard shortcuts</summary>
      <table style={{ borderCollapse: 'collapse', marginTop: 8 }}>
        <tbody>
          {GLOBAL_SHORTCUTS.map(({ combo, description }, i) => (
            <tr key={i}>
              <td style={{ padding: '2px 12px 2px 0', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {comboLabel(combo)}
              </td>
              <td style={{ padding: '2px 0' }}>{description}</td>
            </tr>
          ))}
          <tr>
            <td style={{ padding: '2px 12px 2px 0', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              1-9, 0
            </td>
            <td style={{ padding: '2px 0' }}>Jump to slide 1-10 (Slides mode only)</td>
          </tr>
        </tbody>
      </table>
    </details>
  )
}
