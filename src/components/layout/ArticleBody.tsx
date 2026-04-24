interface Props {
  body: string
  className?: string
}

export function ArticleBody({ body, className }: Props) {
  return (
    <div
      className={className}
      style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '1.05rem',
        lineHeight: 1.85,
        color: 'rgba(245,242,233,0.75)',
        maxWidth: '780px',
        margin: '0 auto',
      }}
      dangerouslySetInnerHTML={{ __html: body || '' }}
    />
  )
}
