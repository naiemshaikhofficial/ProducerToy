import { NextRequest, NextResponse } from 'next/server'
import { submitIndexNowUrls } from '@/lib/seo/indexing'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const secret = req.nextUrl.searchParams.get('secret')
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const provided = secret || bearer
    const expected = process.env.CRON_SECRET || process.env.REVALIDATE_SECRET

    if (expected && (!provided || provided !== expected)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const urls = body.urls || [
      'https://producertoy.com',
      'https://producertoy.com/free-vst-plugins',
      'https://producertoy.com/best/free-autotune-vst-plugins',
      'https://producertoy.com/best/free-saturation-plugins',
      'https://producertoy.com/daw/fl-studio',
      'https://producertoy.com/daw/ableton-live',
    ]

    const res = await submitIndexNowUrls(urls)
    return NextResponse.json(res)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
