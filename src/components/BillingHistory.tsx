'use client'

import React from 'react'
import { Receipt, FileCheck, Calendar, Hash, ShieldCheck, Download } from 'lucide-react'

export interface PurchaseItem {
  id: string
  purchased_at: string
  amount_paid?: number
  price_usd?: number
  currency?: string
  serial_key?: string | null
  order_id?: string
  payment_id?: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  billing_address?: string | null
  billing_city?: string | null
  billing_state?: string | null
  billing_zip?: string | null
  billing_country?: string | null
  discount_amount?: number
  coupon_code?: string | null
  products: {
    id: string
    name: string
    brand?: string
    brands?: { name: string }
    product_type?: string
    price_usd?: number
    cover_image?: string
    vst_format?: string
  }
}

export function BillingHistory({
  purchases,
  userEmail,
  userName,
}: {
  purchases: PurchaseItem[]
  userEmail: string
  userName?: string
}) {
  if (!purchases || purchases.length === 0) return null

  // 1. Generate printable International Tax Invoice PDF / Window
  const handleDownloadInvoice = (item: PurchaseItem) => {
    const invoiceWindow = window.open('', '_blank')
    if (!invoiceWindow) return

    const product = item.products
    const dateStr = new Date(item.purchased_at).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const timeStr = new Date(item.purchased_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const price = Number(item.amount_paid ?? product.price_usd ?? 0)
    const currency = item.currency === 'INR' ? '₹' : '$'
    const currencyCode = item.currency || (item.currency === 'INR' ? 'INR' : 'USD')
    const discount = Number(item.discount_amount || 0)
    const subtotal = price + discount

    const invoiceRef = (item.razorpay_payment_id || item.payment_id || item.id).replace(/[^a-zA-Z0-9]/g, '').slice(-10).toUpperCase()
    const orderRef = item.razorpay_order_id || item.order_id || `ORD-${item.id.slice(0, 10).toUpperCase()}`
    const paymentTxnId = item.razorpay_payment_id || item.payment_id || item.id
    const brandName = product.brands?.name || product.brand || ''
    const customerFullName = item.customer_name || userName || 'Producer'
    const customerEmailAddress = item.customer_email || userEmail
    
    const hasBillingAddress = !!(item.billing_address || item.billing_city || item.billing_country)
    const formattedAddress = hasBillingAddress
      ? [item.billing_address, item.billing_city, item.billing_state, item.billing_zip, item.billing_country].filter(Boolean).join(', ')
      : 'Digital Fulfillment (Global License Vault)'

    const formatType = (type?: string) => {
      if (!type) return 'Digital Audio Asset'
      if (type === 'sample_pack') return 'Audio Sample Pack (WAV 24-Bit / 44.1kHz)'
      if (type === 'sound' || type === 'one_shot') return 'Drum & Sound Kit (WAV / One-Shots)'
      if (type === 'plugin' || type === 'vst') return 'Audio Software Plugin / VST Instrument'
      if (type === 'preset') return 'Synthesizer Preset Bank'
      if (type === 'bundle') return 'Complete Producer Sound & Tool Bundle'
      return type.replace(/_/g, ' ').toUpperCase()
    }

    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Tax Invoice #INV-${invoiceRef} - Producer Toy</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
            
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              padding: 40px; 
              color: #0f172a; 
              background: #f8fafc; 
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
            }
            .invoice-card {
              max-width: 880px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 48px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
            }
            
            /* Header */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 28px;
              margin-bottom: 32px;
            }
            .brand-wrapper {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .brand-logo {
              width: 46px;
              height: 46px;
              object-fit: contain;
            }
            .brand-title {
              font-size: 26px;
              font-weight: 900;
              letter-spacing: -0.8px;
              text-transform: uppercase;
              line-height: 1;
              color: #0f172a;
            }
            .brand-title span {
              color: #fc6301;
            }
            .brand-subtitle {
              font-size: 9.5px;
              font-weight: 800;
              letter-spacing: 1.8px;
              color: #64748b;
              text-transform: uppercase;
              margin-top: 4px;
            }
            
            .inv-meta-right {
              text-align: right;
            }
            .inv-badge {
              display: inline-block;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              font-weight: 800;
              color: #fc6301;
              background: #fff7ed;
              border: 1px solid #fed7aa;
              padding: 4px 10px;
              border-radius: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            }
            .inv-main-heading {
              font-size: 28px;
              font-weight: 900;
              letter-spacing: -0.5px;
              color: #0f172a;
              line-height: 1.1;
            }
            .inv-number {
              font-family: 'JetBrains Mono', monospace;
              font-size: 12px;
              font-weight: 700;
              color: #475569;
              margin-top: 4px;
            }
            .inv-date {
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              margin-top: 2px;
            }

            /* 2-Col Party Details */
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 36px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px 28px;
              margin-bottom: 32px;
            }
            .section-label {
              font-size: 9.5px;
              font-weight: 800;
              text-transform: uppercase;
              color: #64748b;
              letter-spacing: 1.2px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .party-name {
              font-size: 15px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
            }
            .party-meta {
              font-size: 11.5px;
              color: #475569;
              line-height: 1.65;
              margin-top: 4px;
            }
            .party-meta strong {
              color: #1e293b;
            }

            /* Table */
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 28px;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              overflow: hidden;
            }
            .table th {
              background: #0f172a;
              color: #ffffff;
              padding: 12px 16px;
              text-align: left;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .table td {
              padding: 16px;
              font-size: 12.5px;
              color: #1e293b;
              border-bottom: 1px solid #e2e8f0;
              vertical-align: top;
            }
            .item-title {
              font-weight: 800;
              font-size: 14px;
              color: #0f172a;
              text-transform: uppercase;
            }
            .item-desc {
              font-size: 11px;
              color: #64748b;
              margin-top: 3px;
              line-height: 1.4;
            }
            .serial-tag {
              display: inline-block;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10.5px;
              font-weight: 700;
              color: #fc6301;
              background: #fff7ed;
              border: 1px solid #fed7aa;
              padding: 2px 8px;
              border-radius: 4px;
              margin-top: 6px;
            }

            /* Summary & Calculation */
            .bottom-grid {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 28px;
              align-items: start;
              margin-bottom: 32px;
            }
            .compliance-box {
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 18px 20px;
              font-size: 10.5px;
              color: #475569;
              line-height: 1.6;
            }
            .compliance-title {
              font-size: 10px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin-bottom: 6px;
            }
            
            .summary-card {
              background: #ffffff;
              border: 2px solid #0f172a;
              border-radius: 10px;
              padding: 20px;
            }
            .sum-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              font-weight: 600;
              color: #475569;
              margin-bottom: 10px;
            }
            .sum-row span:last-child {
              font-family: 'JetBrains Mono', monospace;
              font-weight: 700;
              color: #0f172a;
            }
            .sum-divider {
              border-top: 1px solid #e2e8f0;
              margin: 10px 0;
            }
            .sum-total {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 8px;
              border-top: 2px solid #0f172a;
            }
            .sum-total .label {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #0f172a;
            }
            .sum-total .val {
              font-family: 'JetBrains Mono', monospace;
              font-size: 20px;
              font-weight: 900;
              color: #0f172a;
            }

            /* Seal & Verification */
            .verification-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              margin-bottom: 24px;
            }
            .seal-badge {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .seal-icon {
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: #fff7ed;
              border: 2px solid #fc6301;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fc6301;
              font-weight: 900;
              font-size: 16px;
            }
            .seal-text {
              font-size: 10px;
              font-weight: 700;
              color: #334155;
              line-height: 1.4;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .seal-text span {
              color: #64748b;
              font-weight: 500;
              text-transform: none;
              display: block;
            }

            /* Footer & Buttons */
            .footer-notes {
              border-top: 1px solid #e2e8f0;
              padding-top: 18px;
              font-size: 10px;
              color: #64748b;
              text-align: center;
              line-height: 1.6;
            }
            .actions-bar {
              display: flex;
              justify-content: center;
              gap: 12px;
              margin-top: 24px;
            }
            .btn-print {
              padding: 12px 32px;
              background: #0f172a;
              color: #ffffff;
              border: none;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .btn-print:hover {
              background: #fc6301;
              transform: translateY(-1px);
            }
            .btn-close {
              padding: 12px 24px;
              background: #ffffff;
              color: #475569;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
            }

            @media print {
              body { padding: 0; background: #fff; }
              .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
              .no-print { display: none !important; }
              @page { size: A4 portrait; margin: 12mm 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <!-- Header -->
            <div class="header">
              <div class="brand-wrapper">
                <img src="/Icon.png" alt="Producer Toy Logo" class="brand-logo" onerror="this.style.display='none'" />
                <div>
                  <div class="brand-title">PRODUCER <span>TOY</span></div>
                  <div class="brand-subtitle">Premier Music Producer Tools & Sound Assets</div>
                </div>
              </div>
              <div class="inv-meta-right">
                <div class="inv-badge">● Payment Settled</div>
                <div class="inv-main-heading">TAX INVOICE</div>
                <div class="inv-number">INV-${invoiceRef}</div>
                <div class="inv-date">${dateStr} • ${timeStr}</div>
              </div>
            </div>

            <!-- 2-Column Party Grid -->
            <div class="details-grid">
              <div>
                <div class="section-label">Merchant / Supplier Details</div>
                <div class="party-name">PRODUCER TOY STORE</div>
                <div class="party-meta">
                  Digital Audio Workstation Software & Sound Library Assets<br>
                  <strong>Entity:</strong> Nemo Studio<br>
                  <strong>Support Desk:</strong> support@producertoy.com<br>
                  <strong>Web Portal:</strong> https://producertoy.com<br>
                  <strong>HSN / SAC Code:</strong> 998434 (Digital Software & Audio Supply)
                </div>
              </div>
              <div>
                <div class="section-label">Billed To (Licensee / Customer)</div>
                <div class="party-name">${customerFullName.toUpperCase()}</div>
                <div class="party-meta">
                  <strong>Account Email:</strong> ${customerEmailAddress}<br>
                  <strong>Billing Address:</strong> ${formattedAddress}<br>
                  <strong>Order ID:</strong> #${orderRef}<br>
                  <strong>Payment Reference:</strong> #${paymentTxnId}<br>
                  <strong>License Tier:</strong> Lifetime Commercial Royalty-Free EULA
                </div>
              </div>
            </div>

            <!-- Table of Items -->
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 50%;">Item & Asset Description</th>
                  <th style="width: 20%; text-align: center;">Format / Delivery</th>
                  <th style="width: 12%; text-align: center;">Tax Rate</th>
                  <th style="width: 18%; text-align: right;">Amount (${currencyCode})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="item-title">${product.name.toUpperCase()}</div>
                    <div class="item-desc">
                      ${brandName ? `<strong>Brand / Publisher:</strong> ${brandName} &bull; ` : ''}<strong>Category:</strong> ${formatType(product.product_type)}
                    </div>
                    ${item.serial_key ? `<div class="serial-tag">License Key: ${item.serial_key}</div>` : ''}
                  </td>
                  <td style="text-align: center; font-size: 11px; font-weight: 700; color: #475569;">
                    DIGITAL VAULT<br>
                    <span style="font-size: 9.5px; color: #fc6301; font-weight: 800;">INSTANT ACCESS</span>
                  </td>
                  <td style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b;">
                    0% (Export)
                  </td>
                  <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 14px;">
                    ${currency}${price.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Bottom Grid: Compliance Notes & Financial Breakdown -->
            <div class="bottom-grid">
              <div class="compliance-box">
                <div class="compliance-title">International Tax & Licensing Notice</div>
                This invoice serves as the official commercial proof of purchase and statutory record for cross-border electronic supply of digital soundware. Zero-rated international export / Reverse charge mechanism (RCM) applies where stipulated by regional VAT/GST tax codes. Perpetual commercial master rights are granted under the Producer Toy Standard EULA.
              </div>

              <div class="summary-card">
                <div class="sum-row">
                  <span>Subtotal</span>
                  <span>${currency}${subtotal.toFixed(2)}</span>
                </div>
                ${discount > 0 ? `
                <div class="sum-row" style="color: #ea580c;">
                  <span>Discount Applied ${item.coupon_code ? `(${item.coupon_code})` : ''}</span>
                  <span>-${currency}${discount.toFixed(2)}</span>
                </div>` : ''}
                <div class="sum-row">
                  <span>Tax / VAT / GST (0%)</span>
                  <span>${currency}0.00</span>
                </div>
                <div class="sum-divider"></div>
                <div class="sum-total">
                  <div class="label">Total Paid</div>
                  <div class="val">${currency}${price.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <!-- Cryptographic Verification Bar -->
            <div class="verification-bar">
              <div class="seal-badge">
                <div class="seal-icon">✓</div>
                <div class="seal-text">
                  PRODUCER TOY CERTIFIED DIGITAL PURCHASE
                  <span>Verified transaction on Producer Toy Cloud Vault</span>
                </div>
              </div>
              <div style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #94a3b8;">
                TXN_ID: ${paymentTxnId}
              </div>
            </div>

            <!-- Footer Legal Notes -->
            <div class="footer-notes">
              Computer-generated electronic tax invoice &bull; No physical signature required &bull; Official Digital Delivery Record<br>
              Need assistance? Email <strong>support@producertoy.com</strong> or visit <strong>https://producertoy.com/support</strong>
            </div>
          </div>

          <div class="actions-bar no-print">
            <button class="btn-print" onclick="window.print()">Print / Download PDF</button>
            <button class="btn-close" onclick="window.close()">Close Window</button>
          </div>
        </body>
      </html>
    `)
    invoiceWindow.document.close()
  }

  // 2. Generate printable EULA License Certificate PDF / Window
  const handleDownloadLicense = (item: PurchaseItem) => {
    const licenseWindow = window.open('', '_blank')
    if (!licenseWindow) return

    const product = item.products
    const dateStr = new Date(item.purchased_at).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const licenseRef = item.id.slice(0, 14).toUpperCase()
    const brandName = product.brand || product.brands?.name || 'Producer Toy'
    const customerFullName = item.customer_name || userName || 'Producer'
    const customerEmailAddress = item.customer_email || userEmail

    licenseWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>EULA License Certificate - ${product.name} - Producer Toy</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; background: #f8fafc; color: #0f172a; line-height: 1.5; }
            .container { 
              max-width: 880px; 
              margin: 0 auto; 
              background: #ffffff; 
              border: 3px solid #0f172a; 
              padding: 48px; 
              border-radius: 12px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
            }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; }
            .title { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; color: #0f172a; }
            .title span { color: #fc6301; }
            .subtitle { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: 6px; }
            
            .meta-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 16px; 
              background: #0f172a; 
              color: #ffffff; 
              padding: 24px; 
              border-radius: 8px; 
              margin-bottom: 32px; 
            }
            .meta-label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
            .meta-val { font-size: 12.5px; font-weight: 800; text-transform: uppercase; margin-top: 4px; word-break: break-all; }
            .meta-val.orange { color: #fc6301; }

            .terms { font-size: 11.5px; line-height: 1.75; color: #334155; margin-bottom: 32px; }
            .terms h4 { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 18px 0 6px 0; }

            .seal-row { display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #0f172a; padding-top: 24px; }
            .seal { border: 2px solid #0f172a; padding: 14px 20px; text-align: center; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; transform: rotate(-2deg); background: #f8fafc; border-radius: 6px; }
            .sig-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-top: 2px solid #0f172a; padding-top: 6px; text-align: right; color: #0f172a; }
            
            .actions-bar { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
            .btn-print { padding: 12px 32px; background: #0f172a; color: #fff; border: none; border-radius: 8px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; cursor: pointer; letter-spacing: 1.5px; }
            .btn-print:hover { background: #fc6301; }
            .btn-close { padding: 12px 24px; background: #fff; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }
            @media print { 
              body { padding: 0; background: #fff; }
              .container { border: 2px solid #000; box-shadow: none; padding: 24px; max-width: 100%; }
              .no-print { display: none !important; } 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">PRODUCER <span>TOY</span> ROYALTY-FREE EULA LICENSE</div>
              <div class="subtitle">Official Commercial Certificate of Authorization</div>
            </div>

            <div class="meta-grid">
              <div>
                <div class="meta-label">Asset Name</div>
                <div class="meta-val">${product.name.toUpperCase()}</div>
              </div>
              <div>
                <div class="meta-label">Authorized Licensee</div>
                <div class="meta-val">${customerFullName.toUpperCase()}</div>
              </div>
              <div>
                <div class="meta-label">Issue Date</div>
                <div class="meta-val">${dateStr}</div>
              </div>
              <div>
                <div class="meta-label">License Ref</div>
                <div class="meta-val">#${licenseRef}</div>
              </div>
              <div>
                <div class="meta-label">License Grant</div>
                <div class="meta-val">WORLDWIDE COMMERCIAL</div>
              </div>
              <div>
                <div class="meta-label">Authentication</div>
                <div class="meta-val orange">● VERIFIED IN VAULT</div>
              </div>
            </div>

            <div class="terms">
              <h4>1. SCOPE OF COMMERCIAL LICENSE</h4>
              <p>Producer Toy hereby grants the authorized Licensee a perpetual, worldwide, non-exclusive, royalty-free commercial license to integrate, synthesize, and reproduce the enclosed audio samples, presets, instruments, or soundware assets in commercial music recordings, albums, streaming releases, broadcast radio, television sync, video game soundtracks, and multimedia productions.</p>

              <h4>2. MONETIZATION & ROYALTY RIGHTS</h4>
              <p>The Licensee retains 100% of all master recording royalties, mechanical revenues, and digital streaming performance payouts generated across Spotify, Apple Music, YouTube Music, BeatStars, Tidal, Soundcloud, and international collection societies. No clearance fees or secondary author splits are owed to Producer Toy.</p>

              <h4>3. STRICT RESTRICTIONS</h4>
              <p>Sublicensing, reselling, repackaging, isolating raw unmixed audio files, or distributing individual preset banks as standalone competing sound libraries or via P2P torrent channels is strictly prohibited and subject to immediate copyright revocation under international WIPO intellectual property treaties.</p>
            </div>

            <div class="seal-row">
              <div class="seal">
                PRODUCER TOY<br><span style="color:#fc6301;">OFFICIAL</span> VERIFIED<br>VAULT SEAL
              </div>
              <div>
                <div class="sig-title">PRODUCER TOY DIGITAL AUTHORIZATION DESK</div>
                <div style="font-size: 10px; color: #64748b; text-align: right; margin-top: 4px;">support@producertoy.com &bull; https://producertoy.com</div>
              </div>
            </div>
          </div>

          <div class="actions-bar no-print">
            <button class="btn-print" onclick="window.print()">Print License Certificate</button>
            <button class="btn-close" onclick="window.close()">Close Window</button>
          </div>
        </body>
      </html>
    `)
    licenseWindow.document.close()
  }

  return (
    <div className="space-y-4 pt-6 border-t border-[#24242e]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1c1c24] border border-[#2c2c3a] flex items-center justify-center">
            <Receipt className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Billing & License Receipts</h2>
            <p className="text-[10px] font-mono text-zinc-400">Download official tax invoices and EULA commercial certificates</p>
          </div>
        </div>
      </div>

      <div className="bg-[#141418] border border-[#24242e] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#24242e] bg-[#1a1a22] text-zinc-400 font-mono text-[10px] uppercase">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24242e]">
              {purchases.map((item) => {
                const product = item.products
                if (!product) return null
                const price = item.amount_paid ?? product.price_usd ?? 0

                return (
                  <tr key={item.id} className="hover:bg-[#1a1a22]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-400 whitespace-nowrap">
                      {new Date(item.purchased_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white">
                      {product.name}
                      <span className="block text-[10px] font-normal text-zinc-500">{product.brands?.name || product.brand || ''}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400 uppercase">
                      {product.product_type || 'Digital'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#fc6301] text-right whitespace-nowrap">
                      ${price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#20202a] hover:bg-[#fc6301] hover:text-white text-white text-[10px] font-mono font-bold uppercase border border-[#303040] rounded-md transition-all cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => handleDownloadLicense(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#20202a] hover:bg-[#fc6301] hover:text-white text-zinc-300 text-[10px] font-mono font-bold uppercase border border-[#303040] rounded-md transition-all cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>License</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
