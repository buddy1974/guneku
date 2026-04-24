interface Props {
  label: string
  title: string
  subtitle?: string
  accent?: string
  bg?: string
}

export function PageHero({ label, title, subtitle, accent, bg }: Props) {
  return (
    <div style={{
      background: bg || 'linear-gradient(to bottom, rgba(139,30,45,0.4) 0%, #0F0F0F 100%)',
      padding: '8rem 1.5rem 4rem',
      textAlign: 'center',
      borderBottom: '1px solid rgba(139,30,45,0.25)',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display:'flex', alignItems:'center',
                      justifyContent:'center', gap:'12px', marginBottom:'1.5rem' }}>
          <span style={{ width:'28px', height:'2px',
                         backgroundColor:'#8B1E2D', flexShrink:0 }} />
          <span className="section-label">{label}</span>
          <span style={{ width:'28px', height:'2px',
                         backgroundColor:'#8B1E2D', flexShrink:0 }} />
        </div>
        <h1 style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          color: '#F5F2E9',
          letterSpacing: '0.05em',
          lineHeight: 1,
          margin: '0 0 1rem',
        }}>
          {accent ? (
            <>
              {title.split(accent)[0]}
              <span style={{ color:'#f2a90b' }}>{accent}</span>
              {title.split(accent)[1]}
            </>
          ) : title}
        </h1>
        {subtitle && (
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.1rem',
            color: 'rgba(245,242,233,0.6)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
