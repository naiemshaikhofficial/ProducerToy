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
  if (
    delivery === 'dedicated_licensing_server' ||
    delivery === 'dedicated_licensing' ||
    delivery === 'machine_bound' ||
    delivery === 'licensing_server'
  ) {
    return true
  }
  const licType = String(prod.license_type || '').toLowerCase().trim()
  if (licType === 'dedicated' || licType === 'machine_bound') {
    return true
  }
  if (prod.plugin_identifier && (delivery.includes('dedicated') || delivery.includes('server'))) {
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

  const usesSerials =
    !isDedicated &&
    Boolean(
      product.delivery_method === 'serial_key' ||
      product.delivery_method === 'license_key' ||
      totalCount > 0 ||
      purchCount > 0
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

export interface ClaimSerialKeyParams {
  adminSupabase: SupabaseClient
  productId?: string | null
  userId?: string | null
  product?: any
  prefixOverride?: string
}

/**
 * Atomically claims a genuine creator serial key from the `serial_keys` pool.
 *
 * 1. Resolves product UUID.
 * 2. Attempts atomic optimistic claim from `serial_keys` (is_used = false).
 * 3. If claimed, marks key is_used = true and sets assigned_to_user_id.
 * 4. If pool is empty or product has no pooled keys:
 *    - If product requires a serial key and is not a dedicated activation product,
 *      falls back to generateStandardSerialKey.
 *    - Otherwise returns null.
 */
export async function claimSerialKeyForPurchase({
  adminSupabase,
  productId,
  userId,
  product,
  prefixOverride,
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
        .select('id')
        .or(`slug.ilike.${prod.slug || ''},name.ilike.${prod.name || ''}`)
        .limit(1)
        .maybeSingle()
      if (realProd && UUID_REGEX.test(realProd.id)) {
        validProductId = realProd.id
      }
    } catch (e) {
      console.warn('[claimSerialKeyForPurchase] Product resolution note:', e)
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

  // Never forge algorithmic dummy keys for products configured for pre-loaded genuine serial pools
  if (!isDedicated && !isExplicitPoolDelivery && prod?.product_type === 'plugin') {
    return generateStandardSerialKey(prod, prefixOverride)
  }

  return null
}
