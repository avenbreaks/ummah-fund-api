import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'API Pegged Price Oracle',
  description: 'API For UmmaFund Pegged Price Oracle',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
