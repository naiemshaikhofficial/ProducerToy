import crypto from 'crypto'

let cachedToken: string | null = null
let tokenExpiresAt = 0

/**
 * Generates Google OAuth 2.0 Access Token using Service Account RSA-256 JWT
 */
export async function getGoogleDriveAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKeyPem = process.env.GOOGLE_PRIVATE_KEY

  if (!clientEmail || !privateKeyPem) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)

  // Return cached token if still valid
  if (cachedToken && tokenExpiresAt > now + 300) {
    return cachedToken
  }

  try {
    const cleanKey = privateKeyPem
      .replace(/\\n/g, '\n')
      .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/g, '')
      .replace(/-----END (RSA )?PRIVATE KEY-----/g, '')
      .replace(/\s+/g, '')

    const keyBuffer = Buffer.from(cleanKey, 'base64')

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

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url')
    const unsignedToken = `${encodedHeader}.${encodedClaimSet}`

    // Sign with Node.js crypto using RSA SHA-256
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(unsignedToken)
    const privateKeyFormatted = `-----BEGIN PRIVATE KEY-----\n${privateKeyPem
      .replace(/\\n/g, '\n')
      .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/g, '')
      .replace(/-----END (RSA )?PRIVATE KEY-----/g, '')
      .trim()}\n-----END PRIVATE KEY-----`

    const signature = sign.sign(privateKeyFormatted, 'base64url')
    const jwt = `${unsignedToken}.${signature}`

    // Exchange JWT for Google Access Token
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    })

    const data = await res.json()
    if (data.access_token) {
      cachedToken = data.access_token
      tokenExpiresAt = now + (data.expires_in || 3600)
      return cachedToken
    } else {
      console.error('[GOOGLE_OAUTH_TOKEN_ERROR]', data)
      return null
    }
  } catch (err) {
    console.error('[GET_GOOGLE_ACCESS_TOKEN_ERROR]', err)
    return null
  }
}
