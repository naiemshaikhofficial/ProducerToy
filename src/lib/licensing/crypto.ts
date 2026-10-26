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

// Server Ed25519 Private Key loaded exclusively from environment variables
export function getServerPrivateKey(): crypto.KeyObject {
  let envKey = process.env.LICENSE_ED25519_PRIVATE_KEY || process.env.PROVERB_ED25519_PRIVATE_KEY_PEM

  // Fallback to local machine developer key file if running in local development
  if (!envKey && process.env.LOCALAPPDATA) {
    try {
      const fs = require('fs')
      const path = require('path')
      const localPath = path.join(process.env.LOCALAPPDATA, 'ProducerToy', 'Licensing', 'ProVerb', 'proverb-ed25519-private.pem')
      if (fs.existsSync(localPath)) {
        envKey = fs.readFileSync(localPath, 'utf8')
      }
    } catch {}
  }

  if (!envKey) {
    throw new Error('LICENSE_ED25519_PRIVATE_KEY / PROVERB_ED25519_PRIVATE_KEY_PEM environment variable is not configured.')
  }

  return crypto.createPrivateKey(envKey.replace(/\\n/g, '\n'))
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

export interface IssueLicenseOptions {
  product: {
    id: string
    name: string
    brand?: string
    plugin_identifier: string
  }
  deviceId: string
  userName?: string
  userEmail?: string
  activationId?: string
}

/**
 * Issues a cryptographically signed Ed25519 v2 license token.
 * Validated by ProVerb C++ JUCE engine via Ed25519Verifier.
 */
export function issueEd25519LicenseToken(options: IssueLicenseOptions): {
  token: string
  activationId: string
  payload: any
} {
  const now = Math.floor(Date.now() / 1000)
  const cleanDevId = (options.deviceId || '').trim().toLowerCase().replace(/[^0-9a-f]/g, '')
  const activationId = options.activationId || crypto.randomUUID()
  const privKey = getServerPrivateKey()

  const payload = {
    v: 2,
    iss: 'producertoy.com',
    aud: options.product.plugin_identifier || 'com.producertoy.proverb',
    pid: options.product.id,
    product_name: options.product.name,
    brand: options.product.brand || 'Producer Toy',
    plugin_id: options.product.plugin_identifier || 'com.producertoy.proverb',
    kid: 'proverb-ed25519-2026-10-v2',
    status: 'active',
    aid: activationId,
    dev_hash: cleanDevId,
    user_name: options.userName || 'ProducerToy Licensed Artist',
    user_email_masked: maskEmail(options.userEmail || ''),
    tier: 'perpetual',
    iat: now,
    nbf: now,
    exp: 0, // Perpetual license
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = crypto.sign(null, Buffer.from(encodedPayload, 'ascii'), privKey).toString('base64url')

  return {
    token: `${encodedPayload}.${signature}`,
    activationId,
    payload,
  }
}

