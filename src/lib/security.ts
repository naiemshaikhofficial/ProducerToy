import crypto from 'crypto'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()
  if (secret && secret.length >= 16) return secret

  // Derive a cryptographically unique secret from server-only service role key if available
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (fallback && fallback.length >= 20) {
    return crypto.createHash('sha256').update(`pt-jwt-derived:${fallback}`).digest('hex')
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: JWT_SECRET or SUPABASE_SERVICE_ROLE_KEY environment variable is required.')
  }
  return 'producer-toy-dev-secret-secure-salt'
}

/**
 * Checks if two IPs are in the same subnet (IPv4 / IPv6) to allow seamless mobile ISP shifts while blocking cross-user sharing.
 */
export function isIpInSameSubnet(ip1: string, ip2: string): boolean {
  if (!ip1 || !ip2 || ip1 === 'unknown' || ip2 === 'unknown' || ip1 === '127.0.0.1' || ip2 === '127.0.0.1') {
    return true
  }
  if (ip1 === ip2) return true

  // IPv4 check first 2 octets (e.g. 192.168.x.x)
  if (ip1.includes('.') && ip2.includes('.')) {
    const p1 = ip1.split('.')
    const p2 = ip2.split('.')
    return p1[0] === p2[0] && p1[1] === p2[1]
  }

  // IPv6 check first 2 blocks
  if (ip1.includes(':') && ip2.includes(':')) {
    const p1 = ip1.split(':')
    const p2 = ip2.split(':')
    return p1[0] === p2[0] && p1[1] === p2[1]
  }

  return false
}

/**
 * Signs a payload into a database-less tamper-proof token
 */
export function signDownloadToken(
  payload: { uid: string; pid: string; type?: string; platform?: string; ip: string },
  expiresInSeconds: number = 300
) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  const fullPayload = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url')

  const hmac = crypto.createHmac('sha256', getJwtSecret())
  hmac.update(`${header}.${fullPayload}`)
  const signature = hmac.digest('base64url')

  return `${header}.${fullPayload}.${signature}`
}

/**
 * Verifies a download token
 */
export function verifyDownloadToken(token: string): {
  uid: string
  pid: string
  type?: string
  platform?: string
  ip: string
  exp: number
} | null {
  try {
    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) return null

    const hmac = crypto.createHmac('sha256', getJwtSecret())
    hmac.update(`${header}.${payload}`)
    const expectedSignature = hmac.digest('base64url')

    if (signature !== expectedSignature) return null

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString())

    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decodedPayload
  } catch {
    return null
  }
}
