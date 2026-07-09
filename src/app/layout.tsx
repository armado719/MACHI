import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ServiceWorkerRegister } from '@/components/shared/ServiceWorkerRegister'
import './globals.css'

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MACHI — Tracker de Horómetros y Combustible',
  description: 'Registro digital de horómetros y consumo de combustible por equipo',
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#3E5C76',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${barlow.variable} ${inter.variable}`}>
      <body className="bg-bg-base text-content font-sans antialiased">
        {children}
        <ServiceWorkerRegister />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E2E5EA',
              color: '#1C2430',
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
      </body>
    </html>
  )
}
