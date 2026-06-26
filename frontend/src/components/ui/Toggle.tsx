interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <label style={{ position: 'relative', width: 38, height: 21, display: 'inline-block', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span style={{
        position: 'absolute', inset: 0,
        background: checked ? 'var(--accent)' : 'var(--bg3)',
        border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 11, transition: '.2s',
      }}>
        <span style={{
          position: 'absolute', width: 15, height: 15,
          left: checked ? 20 : 2, top: 2,
          background: checked ? '#fff' : 'var(--muted)',
          borderRadius: '50%', transition: '.2s',
        }} />
      </span>
    </label>
  )
}
