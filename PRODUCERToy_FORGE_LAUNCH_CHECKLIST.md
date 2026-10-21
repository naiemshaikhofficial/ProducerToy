# PRODUCERTOY × FORGE MULTIMEDIA GROUP LLC
## DIRECT-SALES LAUNCH READINESS CHECKLIST & STAGING VALIDATION PLAN
**Date:** October 2026  
**Partner Entity:** FORGE Multimedia Group LLC  
**Primary Contact:** Robert (Partner Representative)  
**ProducerToy Lead:** Naiem Shaikh (Founder / Operator)  
**Status:** TECHNICAL AUDIT COMPLETE — AWAITING COMMERCIAL EXECUTION & ARTIFACT SUBMISSION  

---

## 1. APPROVED INITIAL PRODUCT SCHEDULE

The initial commercial release is strictly limited to the seller-approved signed Mac installers. No legacy or unverified operating system builds shall be published without explicit written authorization.

### Product 1: Groove Console
- **Approved Version:** `0.22.2`
- **Installer Artifact:** Signed macOS installer package (`.pkg` / `.dmg`) signed with FORGE Developer ID
- **Target Architecture:** Apple Silicon (ARM64 native)
- **Minimum Operating System:** **macOS 27.0 or later**
- **Plugin Formats Supported:** Audio Units (AUv2/AUv3), VST3, Standalone application
- **Licensing / Activation:** Seller to confirm (CSV Serial Key Pool vs Challenge-Response Machine Activation)
- **Catalog Price:** $19.00 USD (Illustrative launch price)
- **Restricted Builds:** **NO macOS 14 legacy installer or Windows beta shall be published** until separately validated and approved in writing by FORGE.

### Product 2: BarkerBox
- **Approved Version:** `0.7.2`
- **Installer Artifact:** Signed macOS installer package (`.pkg` / `.dmg`) signed with FORGE Developer ID
- **Target Architecture:** Apple Silicon (ARM64 native)
- **Minimum Operating System:** **macOS 27.0 or later**
- **Plugin Formats Supported:** Audio Units (AUv2/AUv3), VST3, Standalone application
- **Licensing / Activation:** Seller to confirm
- **Catalog Price:** $19.00 USD (Illustrative launch price)
- **Restricted Builds:** **NO macOS 14 legacy installer or Windows beta shall be published** until separately validated and approved in writing by FORGE.

---

## 2. END-TO-END STAGING TEST MATRIX

Before opening the store to live public traffic, the following test procedures must be executed in the staging environment:

| Phase | Test Objective | Validation Criteria | Status |
|---|---|---|---|
| **STG-01: Installer Integrity** | Verify signed Mac binary artifacts | Download URL resolves; binary passes Apple Gatekeeper / notarization checks; installer targets macOS 27.0+ Apple Silicon. | Pending File Upload |
| **STG-02: Pre-Purchase EULA** | Check legal disclosures in cart | Pre-purchase disclosure displays 3-tier Order of Precedence; links to ProducerToy EULA and FORGE product license operate. | **VERIFIED IN CODE** |
| **STG-03: USD Checkout** | Process PayPal sandbox transaction | Sandbox PayPal checkout completes; order status transitions from `pending` to `paid`; transaction fee ($1.14 on $19) recorded. | Ready for Staging Test |
| **STG-04: License Fulfillment** | Verify atomic key assignment | If key-based: system claims real CSV key from FORGE pool. Under concurrent orders, no key is assigned twice. No dummy string generated. | **VERIFIED IN CODE** |
| **STG-05: Customer Library** | Post-purchase download delivery | Purchased product immediately appears in customer's `/library`; authenticated download link works without exposing S3 credentials. | Ready for Staging Test |
| **STG-06: Accounting Ledger** | Seller earnings credit | Transaction is credited to FORGE brand ledger: $19.00 gross -> $12.50 net royalty (70%) -> $5.36 platform fee (30%). | **VERIFIED IN CODE** |
| **STG-07: Refund Handling** | Transaction cancellation | Refund in staging reverses commission liability; revokes customer download entitlement; preserves audit trail. | **VERIFIED IN CODE** |

---

## 3. SELLER ONBOARDING & LEGAL INPUTS REQUIRED FROM NAIEM

To finalize the written commercial agreement and complete platform compliance:

1. [ ] **Operator Legal Identity Confirmation:**
   - **Full Legal Name:** Naiem Shaikh
   - **Trade / Doing Business As (DBA) Name:** ProducerToy / Producer Toy
   - **Official Mailing Address:** *(To be supplied by Naiem for the contract preamble)*
   - **Tax Identification (PAN / GSTIN):** *(To be confirmed by Naiem if GST threshold is reached)*
2. [ ] **Disbursement Banking Details:**
   - Bank Name, Branch, IFSC Code, and SWIFT BIC for international wire transfers.
   - Confirmation of bank capability to initiate outgoing international wire transfers (USD to US bank).
3. [ ] **Written Confirmation from FORGE:**
   - Formal acceptance of the proposed monthly settlement schedule (by 15th of following month).
   - Confirmation of zero minimum payout threshold.
   - Agreement on customer support division (ProducerToy handles billing/accounts; FORGE handles plugin DSP/installation).

---

## 4. LAUNCH PLACEMENT & PROMOTIONAL DISCOVERY

ProducerToy does not publish unverified traffic claims or fabricated visitor numbers. Launch placement for FORGE products includes:

1. **Curated Store Placement:**
   - Dedicated product detail pages with high-resolution artwork, audio demo players, and DSP technical specifications.
   - Inclusion in "Audio Effects", "Dynamics", and "Creative Tools" catalog categories.
2. **Search Discovery:**
   - Search indexing across the marketplace by product name, manufacturer ("FORGE"), and format ("AU", "VST3").
3. **Transparent Reporting:**
   - Real-time telemetry in Toy Creator: units sold, gross revenue, net royalty, DAW telemetry, and operating system statistics.
   - No fabricated impressions or vanity metrics.

---

## 5. GO / NO-GO LAUNCH GATE DECISION

| Gate | Requirement | Gatekeeper | Status |
|---|---|---|---|
| **Gate 1: Contract** | Written agreement signed by FORGE & ProducerToy | Naiem & Robert | Awaiting Signature |
| **Gate 2: Artifacts** | Signed installers for Groove Console & BarkerBox provided | FORGE Engineering | Awaiting Files |
| **Gate 3: Licensing** | Serial key pool uploaded OR activation API confirmed | FORGE & ProducerToy | Awaiting Confirmation |
| **Gate 4: Staging Test** | Successful end-to-end sandbox purchase & delivery | Antigravity IDE | Ready for Execution |
| **Gate 5: Production Go** | Switch listing to public live status | ProducerToy Admin | Blocked until Gates 1–4 Pass |

**Current Assessment:**  
The technical platform, legal terms, accounting engine, and checkout disclosures are **READY**. Go-Live is held at Gate 1 pending contract execution and installer upload.
