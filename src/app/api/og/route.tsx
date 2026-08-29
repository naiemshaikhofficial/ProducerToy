import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const title = searchParams.get('title') || 'Producer Toy'
    const brand = searchParams.get('brand') || 'Official Store'
    const rating = searchParams.get('rating') || '4.8'
    const price = searchParams.get('price') || 'FREE'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0c0c0c',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
            color: 'white',
          }}
        >
          {/* Top Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                backgroundColor: '#FA742B',
                color: 'white',
                fontWeight: 900,
                fontSize: '18px',
                padding: '8px 18px',
                borderRadius: '10px',
                letterSpacing: '1px',
              }}
            >
              PRODUCER TOY
            </div>
            <div style={{ color: '#a1a1aa', fontSize: '20px', fontWeight: 600 }}>
              {brand}
            </div>
          </div>

          {/* Center Title */}
          <div
            style={{
              fontSize: '60px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>

          {/* Bottom Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#18181b',
                padding: '12px 24px',
                borderRadius: '14px',
                fontSize: '22px',
                fontWeight: 800,
              }}
            >
              ★ {rating} / 5.0 (Verified)
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: price === 'FREE' ? '#0074e4' : '#22c55e',
                color: 'white',
                fontWeight: 900,
                fontSize: '24px',
                padding: '12px 32px',
                borderRadius: '14px',
              }}
            >
              {price}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    })
  }
}
