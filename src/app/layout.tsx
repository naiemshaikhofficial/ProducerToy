import type { Metadata } from 'next'
import './globals.css'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { AudioProvider } from '@/context/AudioContext'
import { AuthProvider } from '@/context/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AudioPlayer } from '@/components/AudioPlayer'
import { CartDrawer } from '@/components/CartDrawer'
import { ImageProtection } from '@/components/ImageProtection'
import { ContentProtection } from '@/components/ContentProtection'
import { StoreOrganizationJsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://producertoy.com'),
  title: 'Producer Toy | Music Production VST Plugins, Samples & Presets',
  description: 'The premier minimalist marketplace for music producers. Download VST plugins, sample packs, synth presets, and DAW templates.',
  keywords: ['VST Plugins', 'Sample Packs', 'Synth Presets', 'FL Studio Templates', 'Ableton Templates', 'Music Producer Tools'],
  alternates: {
    canonical: './',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark bg-[#121212] text-white">
      <head>
        <link rel="preconnect" href="https://supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="bg-[#121212] text-white min-h-screen flex flex-col font-sans antialiased">
        <StoreOrganizationJsonLd />
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <WishlistProvider>
                <AudioProvider>
                  <ImageProtection />
                  <ContentProtection />
                  
                  <Header />
                  
                  <main className="flex-1 pb-24">
                    {children}
                  </main>
                  
                  <Footer />
                  
                  <AudioPlayer />
                  <CartDrawer />

                </AudioProvider>
              </WishlistProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
