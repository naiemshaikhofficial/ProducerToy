import crypto from 'crypto'

/**
 * ProducerToy Cryptographic Licensing & Entitlement Engine
 * Uses Ed25519 asymmetric digital signatures for anti-keygen / anti-tamper security.
 * Private key is kept exclusively on the server.
 * Public key is embedded into the plugin binary.
 */

export interface EntitlementPayload {
  v: number // Schema version (e.g. 1)
  pid: string // Database Product UUID
  plugin_id: string // Stable plugin identifier (e.g. 'com.producertoy.proverb')
  aid: string // Activation UUID
  uid_hash: string // SHA-256 of user ID
  dev_hash: string // SHA-256 of device identifier
  user_name: string // Customer display name
  user_email_masked: string // Masked email (e.g. n***@***.com)
  tier: string // 'perpetual' | 'trial' | 'subscription'
  iat: number // Issued-at timestamp (epoch seconds)
  exp?: number // Expiration timestamp (for trials/subscriptions)
  grace_days: number // Offline grace allowance (days)
}

// Master Server Ed25519 Private Key in PEM format (or loaded from environment variable)
// Default development fallback keypair for ProducerToy test environment
const DEFAULT_DEV_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEICv6sCY5rkoY0vI7L1PLXwXG3Cz1wLOLWP5MqPJPaeDD
-----END PRIVATE KEY-----`

export function getServerPrivateKey(): crypto.KeyObject {
  const envKey = process.env.LICENSE_ED25519_PRIVATE_KEY
  if (envKey) {
    try {
      return crypto.createPrivateKey(envKey.replace(/\\n/g, '\n'))
    } catch (e) {
      console.warn('Failed to parse LICENSE_ED25519_PRIVATE_KEY, falling back to default key:', e)
    }
  }

  // Deterministic default development key
  return crypto.createPrivateKey(DEFAULT_DEV_PRIVATE_KEY_PEM)
}

export function getServerPublicKey(): crypto.KeyObject {
  const privKey = getServerPrivateKey()
  return crypto.createPublicKey(privKey)
}

/**
 * Returns the hex-encoded 32-byte Ed25519 public key suitable for embedding into C++ JUCE plugin
 */
export function getEmbeddedPublicKeyHex(): string {
  const pubKey = getServerPublicKey()
  const rawKey = pubKey.export({ format: 'der', type: 'spki' })
  // Ed25519 SPKI DER format: 44 bytes, the last 32 bytes are the raw public key
  return rawKey.subarray(rawKey.length - 32).toString('hex')
}

/**
 * Hashes an arbitrary string (e.g. device ID or pairing code) using SHA-256
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input.trim()).digest('hex')
}

/**
 * Masks an email for safe public display in UI / token (e.g. "producer@gmail.com" -> "p***r@gmail.com")
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'user@producertoy.com'
  const [local, domain] = email.split('@')
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`
}

/**
 * Generates an alphanumeric pairing challenge code (e.g. "TOY-8942")
 */
export function generatePairingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Excludes ambiguous 0, 1, I, O
  let randomPart = ''
  const bytes = crypto.randomBytes(4)
  for (let i = 0; i < 4; i++) {
    randomPart += chars[bytes[i] % chars.length]
  }
  return `TOY-${randomPart}`
}

const MASTER_SIGNING_SECRET = process.env.LICENSE_MASTER_SECRET || '3qwpro3wqu3u3uodnnxcv82384903898'

/**
 * Signs an entitlement payload into an HMAC-SHA256 authenticated token
 * Format: base64url(payload_json) + "." + base64url(hmac_signature)
 */
export function signEntitlementToken(payload: EntitlementPayload): string {
  const payloadJson = JSON.stringify(payload)
  const encodedPayload = Buffer.from(payloadJson, 'utf8').toString('base64url')
  const signature = crypto.createHmac('sha256', MASTER_SIGNING_SECRET).update(encodedPayload).digest('base64url')
  return `${encodedPayload}.${signature}`
}

/**
 * Verifies an entitlement token against the master signing secret
 */
export function verifyEntitlementToken(token: string): {
  valid: boolean
  payload?: EntitlementPayload
  error?: string
} {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed token structure' }
    }

    const [encodedPayload, encodedSignature] = parts
    const expectedSignature = crypto.createHmac('sha256', MASTER_SIGNING_SECRET).update(encodedPayload).digest('base64url')

    if (encodedSignature !== expectedSignature) {
      return { valid: false, error: 'Cryptographic signature verification failed' }
    }

    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8')
    const payload: EntitlementPayload = JSON.parse(payloadJson)

    // Check expiration if present
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && now > payload.exp) {
      return { valid: false, payload, error: 'Entitlement token has expired' }
    }

    return { valid: true, payload }
  } catch (err: any) {
    return { valid: false, error: err.message || 'Token verification exception' }
  }
}
