/* Scroll-reveal was removed with the institutional facelift.
   Content must never depend on JavaScript to become visible: every section
   here starts at opacity 0 otherwise, which risks a blank page on a slow
   connection and is exactly the decorative motion the design language bans.
   The component is kept as a passthrough so the routes importing it are
   untouched. */
export function Reveal({ children, className, style }: {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
  className?: string
  style?: React.CSSProperties
}) {
  return <div className={className} style={style}>{children}</div>
}
