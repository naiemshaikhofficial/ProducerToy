/**
 * ProducerToy Cloudflare Download Worker with Google Service Account Bot
 * 
 * High-Speed, Zero-Leak Private Google Drive Edge Streaming Proxy
 * 
 * Features:
 * 1. Cryptographic HMAC SHA-256 Signature Verification
 * 2. AES-256-GCM Payload Decryption
 * 3. Google Service Account RS256 OAuth 2.0 Token Generation (Accesses 100% Restricted/Private Drive files)
 * 4. In-Memory Edge Access Token Caching (Blazing fast, zero Google quota bottleneck)
 * 5. Gigabit Edge Streaming with Range header support & custom attachment filenames
 */

// In-memory token cache across worker edge requests
let cachedToken = null
let tokenExpiresAt = 0

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const url = new URL(request.url)
    const payload = url.searchParams.get('payload')
    const sig = url.searchParams.get('sig')
    const exp = url.searchParams.get('exp')
    const name = url.searchParams.get('name') || 'ProducerToy-Download.zip'

    if (!payload || !sig || !exp) {
      return new Response('Missing Secure Token Parameters', { status: 400 })
    }

    // 1. Check Expiration
    const now = Math.floor(Date.now() / 1000)
    if (parseInt(exp, 10) < now) {
      return new Response('Secure Download Link Has Expired', { status: 403 })
    }

    const secret = env.PROXY_SECRET || 'producertoy_super_secret_master_key_2026'

    // 2. Verify HMAC SHA-256 Signature
    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      )

      const sigBase64 = sig.replace(/-/g, '+').replace(/_/g, '/')
      const sigPadding = sigBase64.padEnd(sigBase64.length + (4 - (sigBase64.length % 4)) % 4, '=')
      const sigBytes = Uint8Array.from(atob(sigPadding), (c) => c.charCodeAt(0))

      const dataToVerify = encoder.encode(`${payload}:${exp}`)
      const isValid = await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, dataToVerify)

      if (!isValid) {
        return new Response('Invalid Cryptographic Signature', { status: 403 })
      }
    } catch (e) {
      return new Response('Signature Verification Error: ' + e.message, { status: 403 })
    }

    // 3. Decrypt Payload with AES-256-GCM
    let driveId = ''
    try {
      const ivHex = payload.substring(0, 24)
      const authTagHex = payload.substring(payload.length - 32)
      const cipherTextHex = payload.substring(24, payload.length - 32)

      const iv = hexToUint8Array(ivHex)
      const cipherText = hexToUint8Array(cipherTextHex)
      const authTag = hexToUint8Array(authTagHex)

      const combinedCipher = new Uint8Array(cipherText.length + authTag.length)
      combinedCipher.set(cipherText)
      combinedCipher.set(authTag, cipherText.length)

      const secretHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
      const aesKey = await crypto.subtle.importKey(
        'raw',
        secretHash,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      )

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        combinedCipher
      )

      driveId = new TextDecoder().decode(decrypted)
    } catch (e) {
      return new Response('Decryption Error: ' + e.message, { status: 403 })
    }

    if (!driveId) {
      return new Response('File Identifier Missing', { status: 404 })
    }

    // 4. Check if Google Service Account Credentials are configured
    const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKeyPem = env.GOOGLE_PRIVATE_KEY

    let fetchUrl = ''
    const forwardHeaders = new Headers()
    const rangeHeader = request.headers.get('Range')
    if (rangeHeader) {
      forwardHeaders.set('Range', rangeHeader)
    }
    forwardHeaders.set('User-Agent', 'ProducerToy-Secure-CDN/1.0')

    if (clientEmail && privateKeyPem) {
      // 🚀 PRIVATE GOOGLE DRIVE BOT MODE (Accesses 100% Restricted/Private Files via Service Account)
      try {
        const accessToken = await getGoogleAccessToken(clientEmail, privateKeyPem)
        fetchUrl = `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&supportsAllDrives=true`
        forwardHeaders.set('Authorization', `Bearer ${accessToken}`)
      } catch (err) {
        return new Response('Google Service Account Bot Error: ' + err.message, { status: 500 })
      }
    } else {
      // 🌐 Fallback: Standard Google Drive Direct Mode
      fetchUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`
    }

    // 5. Fetch and Stream from Google Drive
    const driveResponse = await fetch(fetchUrl, {
      method: request.method,
      headers: forwardHeaders,
    })

    if (driveResponse.status >= 300 && driveResponse.status < 400) {
      const redirectLocation = driveResponse.headers.get('Location')
      if (redirectLocation) {
        return fetch(redirectLocation, {
          method: request.method,
          headers: forwardHeaders,
        })
      }
    }

    if (!driveResponse.ok) {
      const errText = await driveResponse.text().catch(() => '')
      return new Response(
        `Google Drive Stream Error (${driveResponse.status}): Make sure file is shared with service account.`,
        { status: driveResponse.status }
      )
    }

    // 6. Return Clean Download Response
    const responseHeaders = new Headers(driveResponse.headers)
    const sanitizedName = decodeURIComponent(name).replace(/["\r\n]/g, '')
    responseHeaders.set('Content-Disposition', `attachment; filename="${sanitizedName}"`)
    responseHeaders.set('Cache-Control', 'private, no-transform, max-age=3600')
    responseHeaders.delete('set-cookie')

    return new Response(driveResponse.body, {
      status: driveResponse.status,
      statusText: driveResponse.statusText,
      headers: responseHeaders,
    })
  },
}

/**
 * Generates and caches Google OAuth 2.0 Access Token using Service Account RSA-256 JWT
 */
async function getGoogleAccessToken(clientEmail, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000)

  // Return cached token if valid for at least another 5 minutes
  if (cachedToken && tokenExpiresAt > now + 300) {
    return cachedToken
  }

  const cleanKey = privateKeyPem
    .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (RSA )?PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '')

  const keyBytes = Uint8Array.from(atob(cleanKey), (c) => c.charCodeAt(0))

  const privateCryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  )

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet))
  const unsignedToken = `${encodedHeader}.${encodedClaimSet}`

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateCryptoKey,
    new TextEncoder().encode(unsignedToken)
  )

  const encodedSignature = base64UrlEncodeBytes(new Uint8Array(signature))
  const jwt = `${unsignedToken}.${encodedSignature}`

  // Exchange JWT for Google Access Token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenResponse.json()
  if (!tokenData.access_token) {
    throw new Error(tokenData.error_description || 'Failed to obtain Google access token')
  }

  cachedToken = tokenData.access_token
  tokenExpiresAt = now + (tokenData.expires_in || 3600)

  return cachedToken
}

function hexToUint8Array(hexString) {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16)
  }
  return bytes
}

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlEncodeBytes(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
