import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MC 단체주문',
  description: '맥도날드 단체 주문 & 정산',
  openGraph: {
    title: 'MC 단체주문',
    description: '맥도날드 단체 주문 & 정산',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-mc-bg text-mc-brown min-h-screen font-sans">
        <div className="mx-auto max-w-lg min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
