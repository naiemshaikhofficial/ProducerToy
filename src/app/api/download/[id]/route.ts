import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { verifyDownloadToken, isIpInSameSubnet } from '@/lib/security'
import { getAdminClient } from '@/lib/supabase/admin'
import { getGoogleDriveAccessToken } from '@/lib/googleDrive'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawParam } = await params
    const queryToken = request.nextUrl.searchParams.get('token')
    const token = queryToken || rawParam

    if (!token) {
      return new NextResponse('Unauthorized: Missing download token', { status: 401 })
    }

    // 1. Verify Cryptographic HMAC Token
    const payload = verifyDownloadToken(token)
    if (!payload) {
      return new NextResponse('Forbidden: Unauthorized or Expired Download Link', { status: 403 })
    }

    // 2. Anti-Piracy / Anti-Hotlink: Verify Subnet IP Address
    const headerList = await headers()
    const currentIp =
      headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerList.get('x-real-ip') ||
      'unknown'

    if (
      !isIpInSameSubnet(payload.ip, currentIp) &&
      process.env.NODE_ENV !== 'development'
    ) {
      console.warn(`[IP_MISMATCH] Token IP: ${payload.ip}, Current IP: ${currentIp}`)
      return new NextResponse('IP Address Mismatch: Download link must be used on the requesting device/network.', {
        status: 403,
      })
    }

    const productId = payload.pid
    const platform = payload.platform || 'windows'

    // 3. Fetch Product Drive / Storage URL via Supabase Admin Client
    const adminSupabase = getAdminClient()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
    
    let productQuery = adminSupabase
      .from('products')
      .select('name, download_url, download_url_win, download_url_mac, product_type')

    if (isUuid) {
      productQuery = productQuery.eq('id', productId)
    } else {
      productQuery = productQuery.eq('slug', productId)
    }

    const { data: product, error } = await productQuery.maybeSingle()

    if (error || !product) {
      return new NextResponse('Product not found in registry', { status: 404 })
    }

    // Determine platform-specific download link
    let originUrl = product.download_url
    if (platform === 'windows' && product.download_url_win) {
      originUrl = product.download_url_win
    } else if (platform === 'mac' && product.download_url_mac) {
      originUrl = product.download_url_mac
    }

    if (!originUrl) {
      return new NextResponse('Product download file is being configured. Please contact support.', {
        status: 404,
      })
    }

    // 4. Extract Google Drive File ID
    const driveIdMatch = originUrl.match(/[-\w]{25,}/)?.[0]

    const cleanExtension =
      product.product_type === 'sample_pack' || product.product_type === 'sound'
        ? 'zip'
        : platform === 'mac'
        ? 'dmg'
        : 'exe'

    const sanitizedName = product.name.replace(/[^a-zA-Z0-9\s-_]/g, '').trim()
    const fileName = `ProducerToy - ${sanitizedName}.${cleanExtension}`
    const encodedName = encodeURIComponent(fileName)

    const workerUrl = process.env.CLOUDFLARE_WORKER_URL
    const proxySecret = process.env.PROXY_SECRET

    // 5. If Cloudflare Worker is configured, redirect with AES-256-GCM encryption
    if (workerUrl && proxySecret && driveIdMatch) {
      const secretHash = crypto.createHash('sha256').update(proxySecret).digest()
      const iv = crypto.randomBytes(12)
      const cipher = crypto.createCipheriv('aes-256-gcm', secretHash, iv)
      
      let encryptedId = cipher.update(driveIdMatch, 'utf8', 'hex')
      encryptedId += cipher.final('hex')
      const authTag = cipher.getAuthTag().toString('hex')
      const encryptedPayload = iv.toString('hex') + encryptedId + authTag

      const timestamp = Math.floor(Date.now() / 1000) + 3600 // 1 hour valid edge stream
      const hmac = crypto.createHmac('sha256', proxySecret)
      hmac.update(`${encryptedPayload}:${timestamp}`)
      const sig = hmac.digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

      return NextResponse.redirect(
        `${workerUrl}?payload=${encryptedPayload}&sig=${sig}&exp=${timestamp}&name=${encodedName}&download=1`
      )
    }

    // 6. Direct Service Account Stream (Instant ZIP download without opening Google Drive page)
    if (driveIdMatch) {
      const googleToken = await getGoogleDriveAccessToken()
      if (googleToken) {
        const driveApiUrl = `https://www.googleapis.com/drive/v3/files/${driveIdMatch}?alt=media&supportsAllDrives=true`
        const driveRes = await fetch(driveApiUrl, {
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'User-Agent': 'ProducerToy-Secure-CDN/1.0',
          },
        })

        if (driveRes.ok && driveRes.body) {
          const responseHeaders = new Headers(driveRes.headers)
          responseHeaders.set('Content-Disposition', `attachment; filename="${fileName}"`)
          responseHeaders.set('Content-Type', 'application/octet-stream')
          responseHeaders.delete('set-cookie')

          return new Response(driveRes.body, {
            status: 200,
            headers: responseHeaders,
          })
        }
      }

      // Fallback direct download link
      const directGoogleDriveUrl = `https://drive.usercontent.google.com/download?id=${driveIdMatch}&export=download&confirm=t`
      return NextResponse.redirect(directGoogleDriveUrl)
    }

    return NextResponse.redirect(originUrl)
  } catch (error: any) {
    console.error('[DOWNLOAD_API_ERROR]', error)
    return new NextResponse('Internal Download Server Error', { status: 500 })
  }
}
