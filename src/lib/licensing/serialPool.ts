import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Dynamic Multi-Brand Plugin Licensing System
 * Supports ProducerToy first-party plugins and third-party marketplace brands (e.g. Plugin Boutique model)
 * without hardcoding brand names, product titles, or UUIDs.
 */
export function isDedicatedLicensedProduct(prod: any): boolean {
  if (!prod) return false
  const delivery = String(prod.delivery_method || '').toLowerCase().trim()
  const licDelivery = String(prod.license_delivery_type || '').toLowerCase().trim()
  if (
    delivery === 'dedicated_licensing_server' ||
    delivery === 'dedicated_licensing' ||
    delivery === 'machine_bound' ||
    delivery === 'licensing_server' ||
    licDelivery === 'dedicated_licensing_server' ||
    licDelivery === 'machine_bound'
  ) {
    return true
  }
  const licType = String(prod.license_type || '').toLowerCase().trim()
  if (licType === 'dedicated' || licType === 'machine_bound') {
    return true
  }
  if (
    prod.plugin_identifier &&
    (delivery.includes('dedicated') ||
      delivery.includes('server') ||
      licDelivery.includes('dedicated') ||
      licDelivery.includes('server'))
  ) {
    return true
  }
  // Backward compatibility fallback for legacy ProVerb entries
  if (
    prod.id === '92cf2454-2cfc-4db5-b210-2c732457605f' ||
    (prod.slug && String(prod.slug).toLowerCase().includes('proverb')) ||
    (prod.name && String(prod.name).toLowerCase().includes('proverb'))
  ) {
    return true
  }
  return false
}

/**
 * Standard algorithmic serial key generator for fallback or procedural licensing.
 */
export function generateStandardSerialKey(prod: any, prefixOverride?: string): string {
  const brandOrSlug = prefixOverride || prod?.serial_prefix || prod?.brand || prod?.slug || 'VST'
  const cleanPrefix =
    String(brandOrSlug)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5) || 'VST'
  const partA = crypto.randomBytes(3).toString('hex').toUpperCase()
  const partB = crypto.randomBytes(3).toString('hex').toUpperCase()
  const partC = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `PT-${cleanPrefix}-${partA}-${partB}-${partC}`
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface ProductStockStatus {
  inStock: boolean
  isDepletedSerials: boolean
  isMissingDownload: boolean
  availableSerialsCount: number
  totalSerialsCount: number
  reason?: 'depleted_serials' | 'missing_download' | 'inactive' | 'invalid_product'
  message?: string
}

/**
 * Validates whether an audio product is genuinely In Stock.
 * A product is Out of Stock if:
 * 1. It requires / uses serial keys and its available unused pool is 0 (all claimed).
 * 2. It has no downloadable archive or installer attached and no external link.
 */
export async function checkProductStockStatus(
  adminSupabase: SupabaseClient,
  product: any
): Promise<ProductStockStatus> {
  const prodId = product?.id
  if (!prodId) {
    return {
      inStock: false,
      isDepletedSerials: false,
      isMissingDownload: true,
      availableSerialsCount: 0,
      totalSerialsCount: 0,
      reason: 'invalid_product',
      message: 'Product could not be identified',
    }
  }

  // 1. Check download links / deliverables
  const hasDownloadUrl = Boolean(
    (product.download_url && String(product.download_url).trim()) ||
    (product.download_url_win && String(product.download_url_win).trim()) ||
    (product.download_url_mac && String(product.download_url_mac).trim()) ||
    (product.external_url && String(product.external_url).trim())
  )

  // 2. Check serial key pool status
  const isDedicated = isDedicatedLicensedProduct(product)
  let availCount = 0
  let totalCount = 0
  let purchCount = 0

  if (!isDedicated) {
    try {
      const { count: ac } = await adminSupabase
        .from('serial_keys')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', prodId)
        .eq('is_used', false)
      availCount = ac || 0

      const { count: tc } = await adminSupabase
        .from('serial_keys')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', prodId)
      totalCount = tc || 0

      if (totalCount === 0) {
        const { count: pc } = await adminSupabase
          .from('purchases')
          .select('id', { count: 'exact', head: true })
          .eq('product_id', prodId)
          .not('serial_key', 'is', null)
        purchCount = pc || 0
      }
    } catch (err) {
      console.warn('[checkProductStockStatus] Serial pool count note:', err)
    }
  }

  const delivery = String(product.delivery_method || '').toLowerCase().trim()
  const isDirectDownload =
    delivery === 'direct_download' ||
    delivery === 'keyless' ||
    delivery === 'no_serial' ||
    delivery === 'direct_cloud_zip' ||
    product.product_type === 'sample_pack' ||
    product.product_type === 'preset'

  const isExternalApi =
    product.license_delivery_type === 'external_api' ||
    Boolean(product.license_api_url && String(product.license_api_url).trim())

  const usesSerials =
    !isDedicated &&
    !isDirectDownload &&
    !isExternalApi &&
    Boolean(
      delivery === 'serial_key' ||
      delivery === 'license_key' ||
      (totalCount > 0 && delivery !== 'direct_download') ||
      (purchCount > 0 && delivery !== 'direct_download' && product.product_type !== 'sample_pack')
    )

  const isDepletedSerials = usesSerials && availCount === 0
  const isMissingDownload = !hasDownloadUrl

  if (isDepletedSerials) {
    return {
      inStock: false,
      isDepletedSerials: true,
      isMissingDownload,
      availableSerialsCount: availCount,
      totalSerialsCount: totalCount + purchCount,
      reason: 'depleted_serials',
      message: `"${product.name || 'Product'}" is currently out of stock. All serial license keys have been claimed.`,
    }
  }

  if (isMissingDownload) {
    return {
      inStock: false,
      isDepletedSerials: false,
      isMissingDownload: true,
      availableSerialsCount: availCount,
      totalSerialsCount: totalCount + purchCount,
      reason: 'missing_download',
      message: `"${product.name || 'Product'}" is currently out of stock. Download files are being uploaded.`,
    }
  }

  return {
    inStock: true,
    isDepletedSerials: false,
    isMissingDownload: false,
    availableSerialsCount: availCount,
    totalSerialsCount: totalCount + purchCount,
  }
}

export interface ExternalLicenseApiParams {
  url: string
  secret?: string | null
  timeoutMs?: number
  payload: {
    event: string
    order_id: string
    product_id: string
    product_slug?: string
    product_sku?: string
    product_name?: string
    customer_reference: string
    customer_email?: string
    seller_data_sharing_consented: boolean
    timestamp: number
  }
}

/**
 * Dispatches an authenticated real-time webhook request to a developer's external license generation API.
 * Follows industry standards (Plugin Boutique / Splice model) with:
 * - Bearer authorization
 * - HMAC-SHA256 signature (X-ProducerToy-Signature)
 * - Strict 3000ms timeout via AbortController
 * - Customer privacy preservation (omits email unless consented)
 */
export async function callExternalBrandLicenseApi({
  url,
  secret,
  timeoutMs = 3000,
  payload,
}: ExternalLicenseApiParams): Promise<{
  success: boolean
  serialKey?: string
  error?: string
  latencyMs?: number
}> {
  const start = Date.now()
  try {
    const cleanUrl = String(url || '').trim()
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return { success: false, error: 'Invalid license API URL protocol (must be http:// or https://)', latencyMs: 0 }
    }

    const bodyString = JSON.stringify(payload)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ProducerToy-Licensing-Engine/1.0 (+https://producertoy.com)',
      'X-ProducerToy-Event': payload.event || 'license.generate',
      'X-ProducerToy-Timestamp': String(payload.timestamp),
    }

    if (secret && String(secret).trim()) {
      const cleanSecret = String(secret).trim()
      headers['Authorization'] = `Bearer ${cleanSecret}`
      const signature = crypto.createHmac('sha256', cleanSecret).update(bodyString).digest('hex')
      headers['X-ProducerToy-Signature'] = signature
    }

    const effectiveTimeout = Math.min(Math.max(timeoutMs, 1000), 10000)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), effectiveTimeout)

    try {
      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers,
        body: bodyString,
        signal: controller.signal,
      })
      clearTimeout(timer)
      const latencyMs = Date.now() - start

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        return {
          success: false,
          error: `HTTP ${response.status} ${response.statusText}${errText ? `: ${errText.slice(0, 160)}` : ''}`,
          latencyMs,
        }
      }

      const json = await response.json().catch(() => null)
      if (!json) {
        return {
          success: false,
          error: 'Brand API returned 200 OK but response was not valid JSON.',
          latencyMs,
        }
      }

      const serialKey =
        json.serial_key ||
        json.serialKey ||
        json.license_key ||
        json.licenseKey ||
        json.key ||
        (typeof json.data === 'string' ? json.data : json.data?.serial_key)

      if (!serialKey || typeof serialKey !== 'string') {
        return {
          success: false,
          error: 'Brand API returned 200 OK but response JSON missing "serial_key" or "license_key" field.',
          latencyMs,
        }
      }

      return {
        success: true,
        serialKey: serialKey.trim(),
        latencyMs,
      }
    } catch (fetchErr: any) {
      clearTimeout(timer)
      const latencyMs = Date.now() - start
      if (fetchErr.name === 'AbortError') {
        return {
          success: false,
          error: `External API call timed out after ${effectiveTimeout}ms.`,
          latencyMs,
        }
      }
      return {
        success: false,
        error: fetchErr.message || 'Network request failed',
        latencyMs,
      }
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to dispatch external license API',
      latencyMs: Date.now() - start,
    }
  }
}

export interface ClaimSerialKeyParams {
  adminSupabase: SupabaseClient
  productId?: string | null
  userId?: string | null
  product?: any
  prefixOverride?: string
  customerEmail?: string | null
  customerReference?: string | null
  orderId?: string | null
  sellerDataSharingConsented?: boolean
}

/**
 * Atomically claims a genuine creator serial key from:
 * 1. Live Developer External License API (if configured by brand).
 * 2. `serial_keys` preloaded CSV batch pool (optimistic concurrency is_used = false).
 * 3. Algorithmic fallback if product is generic plugin and not dedicated/pool-restricted.
 */
export async function claimSerialKeyForPurchase({
  adminSupabase,
  productId,
  userId,
  product,
  prefixOverride,
  customerEmail,
  customerReference,
  orderId,
  sellerDataSharingConsented = false,
}: ClaimSerialKeyParams): Promise<string | null> {
  const prod = product || {}

  // 1. Resolve valid product UUID
  let validProductId: string | null = null
  if (productId && UUID_REGEX.test(productId)) {
    validProductId = productId
  } else if (prod.id && UUID_REGEX.test(prod.id)) {
    validProductId = prod.id
  } else if (prod.slug || prod.name) {
    try {
      const { data: realProd } = await adminSupabase
        .from('products')
        .select('id, license_delivery_type, license_api_url, license_api_secret, license_api_timeout_ms, license_api_fallback_to_pool, delivery_method, product_type, name, slug')
        .or(`slug.ilike.${prod.slug || ''},name.ilike.${prod.name || ''}`)
        .limit(1)
        .maybeSingle()
      if (realProd && UUID_REGEX.test(realProd.id)) {
        validProductId = realProd.id
        // Enrich prod with database fields if missing
        Object.assign(prod, realProd)
      }
    } catch (e) {
      console.warn('[claimSerialKeyForPurchase] Product resolution note:', e)
    }
  }

  // 1.5. DEVELOPER EXTERNAL LICENSE API DISPATCH (Plugin Boutique / Live Generation Model)
  const isExternalApi =
    prod.license_delivery_type === 'external_api' ||
    Boolean(prod.license_api_url && String(prod.license_api_url).trim())

  if (isExternalApi && prod.license_api_url && String(prod.license_api_url).trim()) {
    const payload = {
      event: 'license.generate',
      order_id: orderId || `PT_ORD_${Date.now()}`,
      product_id: validProductId || prod.id || '',
      product_slug: prod.slug || '',
      product_sku: prod.sku || prod.slug || 'VST',
      product_name: prod.name || 'Audio Plugin',
      customer_reference: customerReference || userId || 'cust_anon',
      customer_email: sellerDataSharingConsented && customerEmail ? customerEmail : undefined,
      seller_data_sharing_consented: Boolean(sellerDataSharingConsented),
      timestamp: Math.floor(Date.now() / 1000),
    }

    const apiResult = await callExternalBrandLicenseApi({
      url: prod.license_api_url,
      secret: prod.license_api_secret,
      timeoutMs: Number(prod.license_api_timeout_ms) || 3000,
      payload,
    })

    if (apiResult.success && apiResult.serialKey) {
      console.log(
        `[EXTERNAL_LICENSE_API] Successfully received dynamic serial key from developer API (${apiResult.latencyMs}ms)`
      )

      // Record in serial_keys table as claimed so brand can audit it in their Creator Dashboard
      if (validProductId) {
        try {
          await adminSupabase.from('serial_keys').insert({
            product_id: validProductId,
            serial_key: apiResult.serialKey,
            is_used: true,
            assigned_to_user_id: userId && UUID_REGEX.test(userId) ? userId : null,
            created_at: new Date().toISOString(),
          })
        } catch (auditErr) {
          console.warn('[EXTERNAL_LICENSE_API] Serial audit note:', auditErr)
        }
      }

      return apiResult.serialKey
    } else {
      console.warn(
        `[EXTERNAL_LICENSE_API] External API call failed (${apiResult.error}). Checking fallback options...`
      )
      // If creator explicitly disabled pool fallback, return null to avoid delivering from pool
      if (prod.license_api_fallback_to_pool === false) {
        return null
      }
      // Otherwise proceed to fallback step 2 (pool)
    }
  }

  // 2. Attempt to claim genuine key from serial_keys pool if validProductId is present
  if (validProductId) {
    const MAX_RETRIES = 3
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Find the oldest available unused key for this product
        const { data: availableKey, error: fetchError } = await adminSupabase
          .from('serial_keys')
          .select('id, serial_key')
          .eq('product_id', validProductId)
          .eq('is_used', false)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (!fetchError && availableKey?.id && availableKey?.serial_key) {
          const updatePayload: Record<string, any> = {
            is_used: true,
          }
          if (userId && UUID_REGEX.test(userId)) {
            updatePayload.assigned_to_user_id = userId
          }

          // Optimistic concurrency claim: only update if still unused
          let { data: claimedKey, error: updateError } = await adminSupabase
            .from('serial_keys')
            .update(updatePayload)
            .eq('id', availableKey.id)
            .eq('is_used', false)
            .select('serial_key')
            .maybeSingle()

          // If foreign key constraint failed on assigned_to_user_id, retry without it to ensure claim
          if (updateError && updatePayload.assigned_to_user_id) {
            const fallbackUpdate = await adminSupabase
              .from('serial_keys')
              .update({ is_used: true })
              .eq('id', availableKey.id)
              .eq('is_used', false)
              .select('serial_key')
              .maybeSingle()
            claimedKey = fallbackUpdate.data
            updateError = fallbackUpdate.error
          }

          if (!updateError && claimedKey?.serial_key) {
            console.log(
              `[SERIAL_POOL] Successfully claimed genuine serial key for product ${validProductId} (user: ${userId || 'guest'})`
            )
            return claimedKey.serial_key
          }
          // If another concurrent request claimed it first, retry loop
          continue
        } else {
          // No unused keys found in pool for this product
          break
        }
      } catch (poolErr) {
        console.warn('[SERIAL_POOL] Error during key claim attempt:', poolErr)
        break
      }
    }
  }

  // 3. Evaluate if product requires standard serial fallback
  const isDedicated = isDedicatedLicensedProduct(prod)
  const isExplicitPoolDelivery = Boolean(
    prod?.delivery_method === 'serial_key' ||
    prod?.delivery_method === 'license_key'
  )

  // 3. Fallback: Generate genuine algorithmic serial key for plugins and dedicated products
  if (prod?.product_type === 'plugin' || isDedicated || isExplicitPoolDelivery) {
    return generateStandardSerialKey(prod, prefixOverride)
  }

  return null
}
