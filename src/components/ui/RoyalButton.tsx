import { type ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  href?: string
  variant?: 'gold' | 'outline'
  onClick?: () => void
  className?: string
  target?: string
}

export function RoyalButton({
  children,
  href,
  variant = 'gold',
  onClick,
  className = '',
  target,
}: Props) {
  const cls = `${variant === 'gold' ? 'btn-gold' : 'btn-outline-gold'} ${className}`

  if (href) {
    return (
      <Link href={href} className={cls} target={target}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  )
}
