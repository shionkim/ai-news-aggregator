import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'TrustedAI',
  description: 'AI-powered news aggregator you can count on.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
