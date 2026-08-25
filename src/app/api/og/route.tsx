import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const title = searchParams.get('title') || 'Producer Toy Store'
    const brand = searchParams.get('brand') || 'Producer Toy'
    const price = searchParams.get('price') || 'FREE'
    const type = searchParams.get('type') || 'VST PLUGIN'

    const isFree = price.toUpperCase() === 'FREE' || price === '0' || price === '0.00' || price === '$0.00'
    const displayPrice = isFree ? 'FREE DOWNLOAD' : price.startsWith('$') ? price : `$${price}`

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#09090b',
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            padding: '56px',
            fontFamily: 'sans-serif',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Outer Border Glow Box */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              right: '24px',
              bottom: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              pointerEvents: 'none',
            }}
          />

          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: 16,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                }}
              >
                PRODUCER TOY
              </div>
              <div
                style={{
                  color: '#71717a',
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}
              >
                BY {brand.toUpperCase()}
              </div>
            </div>

            {/* Price Badge */}
            <div
              style={{
                backgroundColor: isFree ? 'rgba(16, 185, 129, 0.15)' : '#18181b',
                border: isFree ? '1px solid #10b981' : '1px solid #3f3f46',
                color: isFree ? '#10b981' : '#ffffff',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {displayPrice}
            </div>
          </div>

          {/* Main Title & Category Pill Box */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginTop: 'auto',
              marginBottom: 'auto',
              maxWidth: '960px',
              zIndex: 10,
            }}
          >
            <div
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                color: '#a1a1aa',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                width: 'fit-content',
              }}
            >
              {type.toUpperCase()}
            </div>

            <div
              style={{
                fontSize: 60,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
                textTransform: 'uppercase',
                color: '#ffffff',
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer Branding Bar */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '20px',
              color: '#71717a',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              zIndex: 10,
            }}
          >
            <div>INSTANT DIGITAL ACCESS • ROYALTY-FREE EULA CERTIFIED</div>
            <div style={{ color: '#ffffff', fontWeight: 900 }}>PRODUCERTOY.COM</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
          'CDN-Cache-Control': 'public, max-age=31536000, immutable',
          'Vercel-CDN-Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    )
  } catch (e: any) {
    return new Response(`Failed to generate OpenGraph image: ${e.message}`, {
      status: 500,
    })
  }
}
