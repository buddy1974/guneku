interface Props {
  children: string
  className?: string
}

export function SectionLabel({ children, className = '' }: Props) {
  return (
    <span className={`section-label ${className}`}>{children}</span>
  )
}
