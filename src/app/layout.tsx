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
import { StoreOrganizationJsonLd, WebSiteJsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'https://producertoy.com'
  ),
  title: {
    default: 'Producer Toy | Music Production VST Plugins, Samples & Presets',
    template: '%s | Producer Toy Store',
  },
  description:
    'The premier minimalist marketplace for music producers. Download premium and free VST plugins, sample packs, synth presets, and DAW templates.',
  keywords: [
    'Producer Toy',
    'producertoy',
    'producertoy.com',
    'producer toys',
    'producers toy',
    'producers toys',
    'producer toy store',
    'producer toy marketplace',
    'producer toy official',
    'producer toy plugins',
    'producer toy sounds',
    'VST Plugins',
    'Free VST Plugins',
    'Sample Packs',
    'Free Sample Packs',
    'Synth Presets',
    'Serum Presets',
    'FL Studio Templates',
    'Ableton Live Plugins',
    'Audio Effects',
    'Music Production Tools',
  ],
  authors: [{ name: 'Producer Toy', url: 'https://producertoy.com' }],
  creator: 'Producer Toy',
  publisher: 'Producer Toy',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/Icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://producertoy.com',
    siteName: 'Producer Toy Store',
    title: 'Producer Toy | Music Production VST Plugins, Samples & Presets',
    description:
      'The premier minimalist marketplace for music producers. Download premium and free VST plugins, sample packs, synth presets, and DAW templates.',
    images: [
      {
        url: 'https://producertoy.com/Icon.png',
        width: 512,
        height: 512,
        alt: 'Producer Toy Logo',
      },
      {
        url: 'https://producertoy.com/pt-banner.png',
        width: 1200,
        height: 630,
        alt: 'Producer Toy Store',
      },
    ],
  },
  other: {
    'og:logo': 'https://producertoy.com/Icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producer Toy | Music Production VST Plugins, Samples & Presets',
    description:
      'The premier minimalist marketplace for music producers. Download premium and free VST plugins, sample packs, synth presets, and DAW templates.',
    images: ['https://producertoy.com/pt-banner.png'],
    creator: '@producertoy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="512x512" href="/Icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="bg-[#121212] text-white min-h-screen flex flex-col font-sans antialiased">
        <StoreOrganizationJsonLd />
        <WebSiteJsonLd />
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
