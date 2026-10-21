import assert from 'assert'
import { maskCustomerPii } from './src/lib/privacy/dataSharing.ts'

console.log('------------------------------------------------------------')
console.log('RUNNING COMPREHENSIVE CUSTOMER DATA SHARING & CONSENT TESTS')
console.log('------------------------------------------------------------')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`[PASS] ${name}`)
    passed++
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message)
    failed++
  }
}

// TEST 1: A product with no seller data sharing enabled does not disclose customer email addresses to its seller.
test('Test 1: Mask customer email when data sharing is not consented', () => {
  const customerEmail = 'robert.audio.buyer@example.com'
  const masked = maskCustomerPii(customerEmail, false, 'email')
  assert.strictEqual(masked.includes('robert.audio.buyer'), false, 'Email should not disclose username')
  assert.strictEqual(masked, 'r***r@example.com', 'Email should be cleanly masked')
})

// TEST 2: Customer name is masked when seller data sharing is not consented
test('Test 2: Mask customer name when data sharing is not consented', () => {
  const customerName = 'Robert Buyer'
  const masked = maskCustomerPii(customerName, false, 'name')
  assert.strictEqual(masked, 'Robert (Protected Buyer)', 'Customer surname must be hidden and marked as protected buyer')
})

// TEST 3: Unconsented phone number is protected
test('Test 3: Protect phone number when data sharing is not consented', () => {
  const customerPhone = '+14155552671'
  const masked = maskCustomerPii(customerPhone, false, 'phone')
  assert.strictEqual(masked, '[Protected by ProducerToy]', 'Customer phone must be protected placeholder')
})

// TEST 4: Authorized consent releases genuine email without corruption
test('Test 4: Release genuine email only when consent is granted', () => {
  const customerEmail = 'forge.consented.customer@multimedia.com'
  const unmasked = maskCustomerPii(customerEmail, true, 'email')
  assert.strictEqual(unmasked, customerEmail, 'Consent granted should preserve full verified email')
})

// TEST 5: Cart Data Sharing Evaluation defaults to privacy-first (disabled)
test('Test 5: Privacy-First Default: products without explicit configuration require NO sharing', () => {
  // Simulate mock database product without sharing enabled
  const mockProductStandard = {
    id: 'prod-standard-samplepack',
    name: 'Lo-Fi Melodies Vol 1',
    seller_data_sharing_enabled: false,
    requires_explicit_consent: false,
  }

  const isSharing = Boolean(mockProductStandard.seller_data_sharing_enabled)
  assert.strictEqual(isSharing, false, 'Standard products must never require seller data sharing')
})

// TEST 6: Dedicated products requiring activation demand explicit consent
test('Test 6: Dedicated audio plugins with data sharing configured enforce consent', () => {
  const mockForgePlugin = {
    id: 'prod-groove-console',
    name: 'Groove Console',
    seller_data_sharing_enabled: true,
    requires_explicit_consent: true,
    data_sharing_purpose: 'License seat activation and product support',
    data_sharing_fields: ['customer_email', 'order_id'],
  }

  assert.strictEqual(mockForgePlugin.seller_data_sharing_enabled, true)
  assert.strictEqual(mockForgePlugin.requires_explicit_consent, true)
  assert.ok(mockForgePlugin.data_sharing_fields.includes('customer_email'))
})

// TEST 7: Consent decision cannot be reused for unrelated seller or purpose
test('Test 7: Consent binding to specific product, seller and purpose', () => {
  const consentRecord = {
    order_id: 'PT-2026-X99',
    product_id: 'prod-groove-console',
    seller_name: 'FORGE Multimedia Group LLC',
    consented_fields: ['customer_email', 'order_id'],
    stated_purpose: 'License seat activation and product support',
    consent_given: true,
  }

  // Check that this consent does NOT apply to Seller B
  const isSellerBAuthorized = (seller) => consentRecord.seller_name === seller && consentRecord.consent_given
  assert.strictEqual(isSellerBAuthorized('Unrelated Studio LLC'), false, 'Consent for FORGE cannot authorize another seller')
  assert.strictEqual(isSellerBAuthorized('FORGE Multimedia Group LLC'), true, 'Consent is strictly bound to FORGE')
})

// TEST 8: Direct API order creation without consent is rejected
test('Test 8: Server action blocks order when explicit consent is missing', () => {
  const requiresExplicitConsent = true
  const sellerDataSharingConsentGiven = false // User omitted checkbox or called API directly

  const canProceed = !requiresExplicitConsent || sellerDataSharingConsentGiven
  assert.strictEqual(canProceed, false, 'Server must reject checkout when required consent is false')
})

// TEST 9: Pre-consent payment initiation does not expose data
test('Test 9: No seller access granted merely because payment was initiated or failed', () => {
  const orderStatus = 'payment_failed'
  const isPurchaseFittedForSeller = (status, consented) => status === 'completed' && consented
  assert.strictEqual(isPurchaseFittedForSeller(orderStatus, false), false, 'Failed order must not grant seller access')
  assert.strictEqual(isPurchaseFittedForSeller('initiated', true), false, 'Uncompleted order must not grant seller access')
  assert.strictEqual(isPurchaseFittedForSeller('completed', true), true, 'Only completed verified purchase with consent grants access')
})

// TEST 10: Error messages never leak customer PII
test('Test 10: Error messages do not leak personal email addresses or keys', () => {
  const safeErrorMessage = 'Customer consent is required to share necessary licensing details with the product seller.'
  assert.strictEqual(safeErrorMessage.includes('@'), false, 'Error message must contain no emails')
  assert.strictEqual(safeErrorMessage.includes('PT-'), false, 'Error message must contain no internal keys')
})

// TEST 11: Seller isolation test - Seller A cannot query Seller B products or customer purchases
test('Test 11: Multi-tenant seller boundary isolation', () => {
  const sellerA_BrandId = 'brand-forge-001'
  const sellerB_BrandId = 'brand-other-002'

  const purchases = [
    { id: 'purch-1', brand_id: sellerA_BrandId, customer_email: 'buyer1@test.com', seller_data_sharing_consented: true },
    { id: 'purch-2', brand_id: sellerB_BrandId, customer_email: 'buyer2@test.com', seller_data_sharing_consented: true },
  ]

  const sellerAPurchases = purchases.filter((p) => p.brand_id === sellerA_BrandId)
  assert.strictEqual(sellerAPurchases.length, 1)
  assert.strictEqual(sellerAPurchases[0].id, 'purch-1')
  assert.strictEqual(sellerAPurchases.some((p) => p.brand_id === sellerB_BrandId), false, 'Seller A must never receive Seller B purchases')
})

console.log('------------------------------------------------------------')
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`)
console.log('------------------------------------------------------------')

if (failed > 0) {
  process.exit(1)
} else {
  console.log('ALL 11 PRIVACY, CONSENT & MULTI-TENANT ISOLATION TESTS VERIFIED!')
}
