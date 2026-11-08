import type { ReactNode } from 'react'

interface SectionHeadingProps {
  id: string
  eyebrow: string
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function SectionHeading({ id, eyebrow, title, children, action }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow"><span aria-hidden="true" />{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        {children && <div className="section-intro">{children}</div>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  )
}

