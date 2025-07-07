import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://malicious-url-detector.vercel.app'),
  title: 'URL Threat Analyzer - Advanced Malicious URL Detection',
  description: 'Analyze URLs for potential security threats using advanced AI and threat intelligence. Protect yourself from phishing, malware, and malicious websites.',
  keywords: 'url security, malware detection, phishing protection, cybersecurity, threat analysis',
  openGraph: {
    title: 'URL Threat Analyzer',
    description: 'Advanced malicious URL detection powered by AI',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL Threat Analyzer',
    description: 'Advanced malicious URL detection powered by AI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: '',
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '0.5rem',
              },
            }}
          />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}