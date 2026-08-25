import { NextRequest, NextResponse } from 'next/server'
import { verifyDownloadToken } from '@/lib/security'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse('Unauthorized: Missing download token', { status: 401 })
  }

  // Verify HMAC SHA256 database-less token
  const payload = verifyDownloadToken(token)
  if (!payload || payload.pid !== id) {
    return new NextResponse('Forbidden: Invalid or expired download token', { status: 403 })
  }

  const supabase = getAdminClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, download_url, product_type')
    .eq('id', id)
    .single()

  if (!product || !product.download_url) {
    return new NextResponse('Product download file not found', { status: 404 })
  }

  // Redirect to CDN / Secure Bucket Storage URL
  return NextResponse.redirect(product.download_url)
}
