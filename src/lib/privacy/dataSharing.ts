import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ProductDataSharingConfig {
  productId: string
  productName: string
  sellerName: string
  brandId?: string | null
  sharingEnabled: boolean
  requiresExplicitConsent: boolean
  purpose: string
  sharedFields: string[]
  disclosureVersion: string
  productEulaUrl?: string | null
  productEulaText?: string | null
}

export interface CartDataSharingAudit {
  requiresSharing: boolean
  requiresExplicitConsent: boolean
  configs: ProductDataSharingConfig[]
}

/**
 * Inspects cart items and evaluates whether any item requires seller data sharing.
 * Privacy-First: Defaults to FALSE unless explicitly authorized in database.
 */
export async function evaluateCartDataSharing(
  adminSupabase: SupabaseClient,
  productIds: string[]
): Promise<CartDataSharingAudit> {
  if (!productIds || productIds.length === 0) {
    return { requiresSharing: false, requiresExplicitConsent: false, configs: [] }
  }

  try {
    const { data: products, error } = await adminSupabase
      .from('products')
      .select('id, name, brand_id, seller_data_sharing_enabled, data_sharing_purpose, data_sharing_fields, data_sharing_disclosure_version, requires_explicit_consent, product_eula_url, product_eula_text, brands(id, name, slug)')
      .in('id', productIds)

    if (error || !products) {
      console.warn('[DATA_SHARING] Note querying product sharing settings:', error)
      return { requiresSharing: false, requiresExplicitConsent: false, configs: [] }
    }

    const configs: ProductDataSharingConfig[] = []
    let requiresSharing = false
    let requiresExplicitConsent = false

    for (const p of products) {
      const enabled = Boolean(p.seller_data_sharing_enabled)
      if (enabled) {
        requiresSharing = true
        const needsConsent = p.requires_explicit_consent !== false
        if (needsConsent) {
          requiresExplicitConsent = true
        }

        const brandObj = Array.isArray(p.brands) ? p.brands[0] : p.brands
        const sellerName = brandObj?.name || 'Third-Party Audio Developer'
        const rawFields = p.data_sharing_fields
        const sharedFields = Array.isArray(rawFields) && rawFields.length > 0
          ? rawFields
          : ['Customer Email Address', 'Assigned License Key', 'Order Reference ID']

        configs.push({
          productId: p.id,
          productName: p.name,
          sellerName,
          brandId: p.brand_id || brandObj?.id || null,
          sharingEnabled: true,
          requiresExplicitConsent: needsConsent,
          purpose: p.data_sharing_purpose || 'Product software licensing, machine activation, and technical support',
          sharedFields,
          disclosureVersion: p.data_sharing_disclosure_version || 'v1.0',
          productEulaUrl: p.product_eula_url || null,
          productEulaText: p.product_eula_text || null,
        })
      }
    }

    return {
      requiresSharing,
      requiresExplicitConsent,
      configs,
    }
  } catch (err) {
    console.warn('[DATA_SHARING] Exception during cart evaluation:', err)
    return { requiresSharing: false, requiresExplicitConsent: false, configs: [] }
  }
}

export interface RecordConsentInput {
  adminSupabase: SupabaseClient
  userId?: string | null
  orderId: string
  purchaseId?: string | null
  productId: string
  brandId?: string | null
  sellerName: string
  consentGiven: boolean
  consentedFields: string[]
  statedPurpose: string
  disclosureVersion?: string
  productLicenseVersion?: string
  ipAddress?: string | null
  userAgent?: string | null
}

/**
 * Creates an immutable audit record in customer_data_consents table.
 */
export async function recordCustomerDataConsent(input: RecordConsentInput): Promise<string | null> {
  const {
    adminSupabase,
    userId,
    orderId,
    purchaseId,
    productId,
    brandId,
    sellerName,
    consentGiven,
    consentedFields,
    statedPurpose,
    disclosureVersion = 'v1.0',
    productLicenseVersion = 'v1.0',
    ipAddress,
    userAgent,
  } = input

  try {
    // Hash IP address with salt to protect customer privacy in log storage
    const ipHash = ipAddress
      ? crypto.createHash('sha256').update(ipAddress + '_pt_salt').digest('hex').slice(0, 32)
      : null

    const payload: any = {
      order_id: orderId,
      product_id: productId,
      seller_name: sellerName,
      consent_given: consentGiven,
      consented_fields: consentedFields,
      stated_purpose: statedPurpose,
      disclosure_version: disclosureVersion,
      product_license_version: productLicenseVersion,
      consented_at: new Date().toISOString(),
    }

    if (userId) payload.user_id = userId
    if (purchaseId) payload.purchase_id = purchaseId
    if (brandId) payload.brand_id = brandId
    if (ipHash) payload.ip_hash = ipHash
    if (userAgent) payload.user_agent = userAgent.slice(0, 255)

    const { data, error } = await adminSupabase
      .from('customer_data_consents')
      .insert(payload)
      .select('id')
      .maybeSingle()

    if (error) {
      console.warn('[DATA_SHARING] Note storing customer consent record:', error.message)
      return null
    }

    return data?.id || null
  } catch (err: any) {
    console.warn('[DATA_SHARING] Exception logging consent:', err.message)
    return null
  }
}

/**
 * Masks customer personal identifiers when seller data sharing is not authorized.
 */
export function maskCustomerPii(
  value: string | null | undefined,
  isConsentGranted: boolean,
  type: 'email' | 'name' | 'phone' = 'email'
): string {
  if (isConsentGranted && value) {
    return value
  }

  if (!value) {
    return type === 'email' ? 'Protected Customer' : 'Customer'
  }

  if (type === 'email') {
    const parts = value.split('@')
    if (parts.length === 2) {
      const userPart = parts[0]
      const domainPart = parts[1]
      const maskedUser = userPart.length > 2
        ? `${userPart[0]}***${userPart[userPart.length - 1]}`
        : `${userPart[0]}***`
      return `${maskedUser}@${domainPart}`
    }
    return 'Protected Customer'
  }

  if (type === 'name') {
    const parts = value.trim().split(' ')
    if (parts.length > 0 && parts[0]) {
      return `${parts[0]} (Protected Buyer)`
    }
    return 'Protected Buyer'
  }

  return '[Protected by ProducerToy]'
}
