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
      border: '1px solid rgba(242,169,11,0.15)',
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
        <span style={{ color:'#f2a90b', fontSize:'1.2rem' }}>◻</span>
      </div>
      {label && (
        <span style={{
          color: 'rgba(245,242,233,0.2)',
          fontSize: '0.65rem',
          fontFamily: 'Syne, sans-serif',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
