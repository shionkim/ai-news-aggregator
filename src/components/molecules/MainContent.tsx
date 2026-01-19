import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export default function MainContent({ children, className = '' }: ContainerProps) {
  return (
    <div
      className={`@container flex flex-col w-full sm:flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-8 sm:py-12 ${className}`}
    >
      {children}
    </div>
  )
}
