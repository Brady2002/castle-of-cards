import type { Metadata } from 'next'
import { Patrick_Hand } from 'next/font/google'
import './globals.css'

const patrickHand = Patrick_Hand({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Castle of Cards',
  description: 'Build your sandcastle before the tide rolls in.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={patrickHand.className}>
      <body>{children}</body>
    </html>
  )
}
