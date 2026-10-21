# PRODUCERTOY MARKETPLACE CORRECTIONS & FORGE PARTNERSHIP AUDIT FIX REPORT
**Date:** October 2026  
**Status:** IMPLEMENTED & VERIFIED IN STAGING / LOCAL ENVIRONMENT  
**Target Partner:** FORGE Multimedia Group LLC  
**Author:** Senior Full-Stack Marketplace & Settlement Engineer  

---

## 1. EXECUTIVE SUMMARY

This report documents the architectural, financial, and legal corrections executed across **ProducerToy** (`d:\Website\ProducerToy`) and **Toy Creator** (`d:\Website\Toy Creator`). 

In response to deep-dive audits and active partnership discussions with **FORGE Multimedia Group LLC**, all public inaccuracies regarding seller revenue share and payout timing have been corrected. The currency accounting bug in the seller portal has been resolved, pre-purchase EULA disclosures and order-of-precedence rules have been integrated into checkout, and a deterministic 7-step itemized settlement calculation engine has been established.

---

## 2. FILES MODIFIED & IMPLEMENTED

### A. ProducerToy Marketplace (`d:\Website\ProducerToy`)
1. **`src/app/faq/page.tsx` & `src/app/faq/FaqPageClient.tsx`**
   - Corrected inaccurate public claims that promised "automated bi-weekly payouts".
   - Stated official commercial policy: **70% seller share / 30% marketplace commission** on eligible net sale proceeds.
   - Clarified that seller settlements are **manually processed monthly**, due by the **15th calendar day of the following month**, with **zero minimum payout threshold**.
   - Added explicit FAQ disclosures for third-party software licensing, order of precedence, and an illustrative $19 sale breakdown.
2. **`src/app/distribute/page.tsx`**
   - Replaced legacy promotional claims ("88% royalty / instant payouts") with truthful terms: 70% net revenue share and monthly itemized settlements.
3. **`src/app/eula/page.tsx`**
   - Updated Section 1.2 with an explicit **Three-Tier Order of Precedence**:
     1. *ProducerToy General Terms & Marketplace Policies* govern platform accounts, checkout, billing, and distribution services.
     2. *Developer Product-Specific EULA* governs software use, machine seats, DSP usage, and activation.
     3. *Mandatory Applicable Law* overrides any conflicting provision.
4. **`src/app/licensing/page.tsx`**
   - Updated Section 2 to reinforce developer product EULA precedence over general platform soundware terms.
5. **`src/components/checkout/EpicCheckoutLayout.tsx` & `CheckoutOrderSummary.tsx`**
   - Added pre-purchase licensing disclosure cards in both mobile and desktop payment views.
   - Explicitly alerts buyers that software usage is governed by the developer's product-specific license and seat limits.
   - Linked all legal policies (`/eula`, `/purchase-policy`, `/refund-policy`, `/terms`, `/privacy`) directly at the point of purchase.
6. **`src/lib/accounting.ts`**
   - Implemented the deterministic 7-step itemized settlement engine and illustrative $19.00 FORGE sale test fixture.

### B. Toy Creator Seller Portal (`d:\Website\Toy Creator`)
1. **`src/lib/rbac.ts` & `src/components/RoleGate.tsx`**
   - Implemented Plugin Boutique-style studio Role-Based Access Control (RBAC) across 5 distinct roles: `owner`, `admin`, `developer`, `finance`, and `support`.
   - Guaranteed strict data isolation: Developers cannot view banking, payouts, or financial ledgers; Finance cannot modify DSP specs or audio installers.
2. **`src/actions/analyticsActions.ts`**
   - **Fixed Currency Blending Bug:** Replaced raw `purchases.reduce` aggregation. Previously, raw INR checkouts (e.g. ₹1,500) were summed directly with USD checkouts as if they were $1,500.
   - Distinctly tracks `grossRevenueUsd`, `grossRevenueInr`, `netRoyalty70` (USD), and `netRoyaltyInr70`.
   - Integrated `calculateItemizedSettlement` to calculate true net publisher earnings under the 70/30 model.
3. **`src/app/dashboard/earnings/page.tsx`**
   - Updated financial ledgers and monthly self-billing statement generation to reflect currency-safe USD calculations.
   - Aligned settlement schedule to **monthly by the 15th of the following month**, with zero minimum payout threshold.
4. **`src/app/dashboard/payouts/page.tsx`**
   - Bound available payout balance directly to normalized analytics royalties rather than mixed-currency client sums.
   - Updated copy and instructions to reflect monthly manual settlements via direct bank transfer / international wire (SWIFT).
5. **`src/lib/accounting.ts`**
   - Shared unified settlement calculation logic with the marketplace.

---

## 3. EXISTING CODE & SYSTEMS RETAINED

1. **Authentication & Supabase Schema:**
   - Retained Supabase SSR authentication, session handling, and workspace structure.
2. **Payment Gateways:**
   - Retained existing dual-gateway architecture: **Razorpay** for domestic Indian INR checkouts and **PayPal** for international USD checkouts.
   - Retained server-side payment verification endpoints and webhook listeners.
3. **Cart & Checkout Experience:**
   - Retained the high-conversion Epic checkout layout, responsive design tokens, and order state machines.
4. **Brand Context:**
   - Retained multi-brand context and session switching in the Creator portal.

---

## 4. TESTS EXECUTED & ACTUAL VERIFIED OUTCOMES

| Test ID | Test Description | Execution Method | Result | Notes |
|---|---|---|---|---|
| **T-SET-01** | Illustrative $19 FORGE Sale Settlement | Node.js Test Harness (`test_accounting_settlement.mjs`) | **PASSED** | Customer paid: $19.00; PayPal fee (4.4% + $0.30): $1.14; Net proceeds: $17.86; **FORGE 70%: $12.50; ProducerToy 30%: $5.36**. Exact match. |
| **T-SET-02** | Seller-Funded Discount ($29 - $10 = $19) | Node.js Test Harness | **PASSED** | Net proceeds: $17.86; Seller share: $12.50. Base properly reduced by seller discount. |
| **T-SET-03** | Refunded Transaction Reconciliation | Node.js Test Harness | **PASSED** | Net proceeds: $0.00; Commission liability cleanly zeroed out. |
| **T-CUR-01** | Currency Blending Bug Resolution | Code Inspection & Logic Analysis (`analyticsActions.ts`) | **PASSED** | USD and INR purchases are separated; INR amounts no longer inflate USD GMV. |
| **T-EULA-01** | EULA Order of Precedence Consistency | Route Verification (`/eula`, `/licensing`, `/checkout`) | **PASSED** | Clear 3-tier hierarchy displayed across all public and checkout routes. |
| **T-RBAC-01** | Studio Role Isolation & Permissions | Component & Navigation Audit (`RoleGate.tsx`, `Sidebar.tsx`) | **PASSED** | Developers restricted from financial tabs; Finance restricted from installer packages. |

---

## 5. SECURITY CONSIDERATIONS

1. **Service-Role Client Isolation:**
   - Privileged Supabase service-role calls (`getAdminClient`) are strictly restricted to Server Actions and server-rendered components.
2. **License Key Protection:**
   - Unassigned license keys in the CSV pool are never rendered in frontend bundles or logged in plaintext production logs.
3. **No Unverified Gateway Integrations:**
   - Resisted introducing unverified automated disbursement APIs (such as PayPal Payouts API or Stripe Connect transfers) that lack confirmed business account approvals in India.
4. **Idempotent Webhooks:**
   - Payment fulfillment and settlement crediting are guarded by transaction/order unique references to prevent duplicate payouts.

---

## 6. REMAINING LEGAL & BUSINESS INPUTS NEEDED FROM NAIEM

Before public launch and execution of the FORGE agreement, the business owner (Naiem Shaikh) must confirm:
1. **Operator Legal Identity:**
   - Confirm official legal name (sole proprietorship trade name or individual registration name).
   - Confirm official postal mailing address for legal notices.
   - Confirm PAN / GSTIN registration status (if applicable under Indian tax thresholds).
2. **International Banking Details:**
   - Confirm domestic Indian bank account capability to receive and remit international SWIFT / wire transfers to US-based business accounts.
   - Identify intermediary bank fees, if any, that will be itemized on international payout statements.
3. **FORGE Written Product Confirmation:**
   - Obtain written sign-off from Robert / FORGE confirming:
     - Exact installer packages (`Groove Console 0.22.2` and `BarkerBox 0.7.2`).
     - macOS compatibility statement (Apple Silicon, macOS 27.0+).
     - Activation mechanism (serial key CSV pool vs hardware challenge-response).

---

## 7. STEPS REQUIRED BEFORE FORGE LIVE PAID SALES

1. [ ] **Execute FORGE Written Partnership Agreement:** Include approved 70/30 net split, monthly settlement schedule (15th of following month), zero minimum threshold, and EULA order of precedence.
2. [ ] **Receive Signed Mac Installers:** Upload exact FORGE-approved binary packages to ProducerToy secure S3/Supabase storage.
3. [ ] **Upload License Inventory (If Key-Based):** If products require serial keys, upload genuine seller-provided CSV keys via Toy Creator portal and test atomic assignment in staging.
4. [ ] **Publish Approved Product Listings:** Create product pages with exact stated compatibility: *Apple Silicon, macOS 27.0 or later (AU, VST3, Standalone)*. No legacy macOS 14 or Windows beta.
5. [ ] **Execute End-to-End Test Purchase in Staging:** Validate customer checkout, license key assignment, download delivery, order receipt email, and seller accounting settlement creation.
6. [ ] **Go-Live Authorization:** Switch product visibility to live.

---

## 8. UNIVERSAL MULTI-VENDOR SUPPORT MODEL & CREATOR APP GAP ANALYSIS

### A. Universal Multi-Vendor Support Implementation
The platform documentation, legal templates, and public policy pages have been unified under a **Universal Multi-Vendor Support Responsibility Model**:
- **`PRODUCERToy_SELLER_AGREEMENT_TEMPLATE.md`:** Master distribution agreement template for all audio software and soundware brands featuring the 70/30 net split, monthly settlements by the 15th, zero threshold, 7-step deduction order, cause-based support allocation, and Schedule A product addendum.
- **`PRODUCERToy_CUSTOMER_SUPPORT_POLICY.md`:** Comprehensive buyer-facing resolution policy establishing clear routing between ProducerToy Platform Support (`support@producertoy.com`) and Independent Brand Technical Support (`support@brand.com`), with 24h acknowledgement and D+4 resolution SLA.
- **`PRODUCERToy_SELLER_PAYOUT_POLICY.md`:** Updated Section 4 to universal multi-vendor standard; generalized the illustrative $19.00 USD developer sale example.
- **Public Website Updates:** Integrated the multi-vendor division across `/faq`, `/distribute`, and `/refund-policy`.

### B. Creator App Profile & Product Listing Capability Gap Analysis
An audit of the current Toy Creator schema and UI identified the following status:

| Feature / Metadata Field | Current Implementation Status | Location | Notes / Recommendations |
|---|---|---|---|
| **Brand Support Email** | **IMPLEMENTED** | `ProfilePage` (`brand.support_email`) | Sellers can configure their public support email; rendered on invoices and receipts. |
| **Supported OS & Architectures** | **IMPLEMENTED** | `ProductNew` / `ProductEdit` (`operating_systems`) | Configurable per product (macOS, Windows, Apple Silicon native). |
| **Plugin Formats & DAWs** | **IMPLEMENTED** | `ProductNew` / `ProductEdit` (`vst_format`, `supported_daws`) | Supports VST3, AU, AAX, Standalone, and DAW lists. |
| **Machine Seats & Offline Days** | **IMPLEMENTED** | `ProductNew` / `ProductEdit` (`max_seats`, `offline_grace_days`) | Stored in database per product. |
| **Product-Specific Support Email Override** | **GAP IDENTIFIED** | Missing in `products` table | Currently inherits `brand.support_email`. Recommended: add optional `support_email` column to `products` table for multi-developer collaborations. |
| **Product-Specific EULA URL / Text** | **GAP IDENTIFIED** | Missing in `products` table | Currently inherits platform EULA + brand profile. Recommended: add `eula_url` and `eula_text` columns to `products` table in next migration. |
| **Update Policy / Custom Refund Policy** | **GAP IDENTIFIED** | Missing in `products` table | Currently governed by universal marketplace refund policy. Recommended: add `update_policy` markdown field to product specs. |
