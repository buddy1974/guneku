interface Props {
  label?: string
  aspectRatio?: string
  className?: string
}

export function ImagePlaceholder({ label, aspectRatio = '16/9' }: Props) {
  return (
    <div style={{
      aspectRatio,
      backgroundColor: '#1A1A20',
      border: '1px solid oklch(0.878 0.010 90)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '1px solid rgba(242,169,11,0.3)',
        display: 'flex', alignItems:'center', justifyContent:'center',
      }}>
        <span style={{ color:'oklch(0.320 0.060 158)', fontSize:'1.2rem' }}>◻</span>
      </div>
      {label && (
        <span style={{
          color: 'oklch(0.560 0.016 150)',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-sans)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
