import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sandcastle',
  description: 'Build your sandcastle before the tide rolls in.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
