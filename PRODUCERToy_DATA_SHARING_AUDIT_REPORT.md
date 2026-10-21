# PRODUCERTOY CODEBASE AUDIT REPORT: CUSTOMER PRIVACY & SELLER DATA SHARING
**Audit Date:** October 2026  
**Auditor:** Senior Full-Stack Engineer, Security Engineer & Product Architect  
**Scope:** ProducerToy Marketplace (`d:\Website\ProducerToy`) & Toy Creator Seller Portal (`d:\Website\Toy Creator`)  

---

## 1. EXECUTIVE SUMMARY & AUDIT FINDINGS

A thorough inspection of the active codebase, database queries, checkout payment verification flows, and seller portal routes revealed critical privacy findings regarding how customer information is handled across the marketplace.

### Finding 1: Unrestricted Exposure of Customer PII to Sellers in Toy Creator
- **Current State:** In `Toy Creator/src/actions/analyticsActions.ts` (line 61), brand purchases are fetched using `admin.from('purchases').select('*, products(...)')`. Because a wildcard `*` is used, the raw database record—including `customer_email`, `customer_name`, `customer_phone`, and `billing_address`—is retrieved and passed directly to the client.
- **Affected Surfaces:**
  - `Toy Creator/src/app/dashboard/orders/page.tsx` renders full customer email addresses in the table and exports them in plaintext CSV.
  - `Toy Creator/src/app/dashboard/page.tsx` displays customer email in recent order feeds.
  - `Toy Creator/src/actions/serialActions.ts` and `SerialKeyPoolManager.tsx` expose customer emails alongside claimed serial keys.
- **Risk:** Sellers currently have visibility over buyers' personal email addresses and contact information regardless of whether the product requires email activation or whether the customer consented to data sharing.

### Finding 2: Lack of Product-Level Data Sharing Configuration
- **Current State:** The `products` table lacks schema fields to declare whether a seller legitimately requires customer information for activation, what exact fields are required, the approved purpose, or whether explicit buyer consent is mandatory.
- **Risk:** All products are treated identically at checkout. There is no mechanism to selectively enable data sharing only for products that genuinely require it (e.g., custom license server registration).

### Finding 3: Absence of Buyer-Facing Data Sharing Disclosures
- **Current State:** In `ProducerToy/src/components/checkout/EpicCheckoutLayout.tsx`, disclaimers cover platform terms, EULA, and refund policies, but there is no specific **Seller Data Sharing Notice** informing the buyer when their email address will be transmitted to an independent third-party developer.
- **Risk:** Non-compliance with modern data privacy frameworks (DPDP Act 2023, GDPR, CCPA), which mandate transparency and informed consent prior to third-party data transfer.

### Finding 4: No Server-Side Consent Tracking or Enforcement
- **Current State:** The database has no `customer_data_consents` table to log consent decisions. In `ProducerToy/src/actions/checkoutActions.ts`, both `verifyRazorpayPaymentAction` and `capturePayPalOrderAction` fulfill orders without validating customer consent for data sharing.
- **Risk:** A client can bypass frontend controls. Consent decisions are not audited, immutable, or bound to a specific product and purpose.

### Finding 5: License Key Assignment Integrity
- **Current State:** In `ProducerToy/src/lib/licensing/serialPool.ts`, `claimSerialKeyForPurchase` correctly claims genuine pre-loaded keys from `serial_keys` and avoids generating dummy keys for products configured for serial pools. However, the purchase record directly links the customer's raw email to the serial key without recording sharing consent.

---

## 2. REMEDIATION & IMPLEMENTATION ARCHITECTURE

To resolve these findings while preserving existing checkout and delivery functionality, the following architecture is implemented:

```
[1. Product Catalog Configuration]
   ├── seller_data_sharing_enabled (default: FALSE)
   ├── data_sharing_purpose ('license_activation', 'purchase_verification', etc.)
   ├── data_sharing_fields (JSON array of specific fields)
   ├── requires_explicit_consent (default: TRUE)
   └── product_eula_url / product_eula_text

[2. Pre-Purchase Checkout Disclosure]
   ├── Inspect cart items for seller_data_sharing_enabled
   ├── If TRUE: Display Seller Data Sharing Notice with exact fields & purpose
   ├── If explicit consent required: Render UNCHECKED consent checkbox
   └── Enforce client-side block if required checkbox is unchecked

[3. Server-Side Verification & Audit Logging]
   ├── In verifyRazorpayPaymentAction & capturePayPalOrderAction:
   │     Verify database product requirements
   │     If consent required and missing: REJECT TRANSACTION SERVER-SIDE
   └── Insert immutable record into customer_data_consents table

[4. Seller Portal Redaction & Data Masking]
   ├── In Toy Creator (analyticsActions, orders, serialActions):
   │     Inspect consent status for each purchase
   │     If consent is absent: MASK or REDACT customer_email, phone, address
   └── Prevent plaintext CSV export of unauthorized customer PII
```
