import type { Metadata } from 'next'
import './globals.css'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { CartProvider } from '@/context/CartContext'
import { AudioProvider } from '@/context/AudioContext'
import { AuthProvider } from '@/context/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AudioPlayer } from '@/components/AudioPlayer'
import { CartDrawer } from '@/components/CartDrawer'
import { ImageProtection } from '@/components/ImageProtection'

export const metadata: Metadata = {
  title: 'Producer Toy | Music Production VST Plugins, Samples & Presets',
  description: 'The premier minimalist marketplace for music producers. Download VST plugins, sample packs, synth presets, and DAW templates.',
  keywords: ['VST Plugins', 'Sample Packs', 'Synth Presets', 'FL Studio Templates', 'Ableton Templates', 'Music Producer Tools'],
  icons: {
    icon: [
      { url: '/Icon.png' },
      { url: '/favicon.ico' }
    ],
    shortcut: '/Icon.png',
    apple: '/Icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark bg-[#121212] text-white">
      <body className="bg-[#121212] text-white min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <AudioProvider>
                <ImageProtection />
                
                <Header />
                
                <main className="flex-1 pb-24">
                  {children}
                </main>
                
                <Footer />
                
                <AudioPlayer />
                <CartDrawer />

              </AudioProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
