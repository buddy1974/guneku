interface Props {
  className?: string
}

export function GoldDivider({ className = '' }: Props) {
  return <div className={`gold-divider ${className}`} />
}
