interface Props {
  body: string
  className?: string
}

export function ArticleBody({ body, className }: Props) {
  return (
    <div
      className={`article-body ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: body || '' }}
    />
  )
}
