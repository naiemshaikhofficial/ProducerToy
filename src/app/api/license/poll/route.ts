import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'This route has been decommissioned. ProVerb licensing is hosted on the dedicated licensing server (https://licensing.producertoy.com) with zero Vercel/Supabase dependency.',
    },
    { status: 410 }
  )
}
