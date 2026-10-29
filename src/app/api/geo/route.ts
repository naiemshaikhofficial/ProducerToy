import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const country =
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('x-country') ||
    ''

  const cleanCountry = country.trim().toUpperCase()
  const isIndia = cleanCountry === 'IN'

  const res = NextResponse.json({
    country: cleanCountry || null,
    currency: isIndia ? 'INR' : cleanCountry ? 'USD' : null,
  })

  if (cleanCountry && cleanCountry !== 'XX' && cleanCountry !== 'T1') {
    res.cookies.set('pt_cf_country', cleanCountry, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    })
  }

  return res
}
