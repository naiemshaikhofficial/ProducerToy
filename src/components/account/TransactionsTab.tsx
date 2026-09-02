'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  History,
  Receipt,
  FileCheck,
  Download,
  ChevronRight,
  Gift,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  RotateCw,
} from 'lucide-react'
import { getUserTransactionsAction } from '@/actions/accountActions'

interface TransactionsTabProps {
  user: any
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ user }) => {
  const [purchases, setPurchases] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

  const loadData = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await getUserTransactionsAction(user.id)
      if (res.success) {
        setPurchases(res.purchases || [])
        setOrders(res.orders || [])
      }
    } catch (err) {
      console.warn('Error loading transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleCopySerial = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKeyId(id)
    setTimeout(() => setCopiedKeyId(null), 2500)
  }

  // 1. Generate & Print Official Tax Invoice
  const handleDownloadInvoice = (item: any) => {
    const invoiceWindow = window.open('', '_blank')
    if (!invoiceWindow) return

    const product = item.products || {}
    const dateStr = new Date(item.purchased_at || item.created_at).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const timeStr = new Date(item.purchased_at || item.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const rawCurrency = (item.currency || 'INR').toUpperCase()
    const isINR = rawCurrency === 'INR' || rawCurrency === '₹'
    const currency = isINR ? '₹' : '$'
    const currencyCode = isINR ? 'INR' : 'USD'
    const price = Number(item.amount_paid ?? product.price_usd ?? 0)
    const discount = Number(item.discount_amount || 0)
    const subtotal = price + discount

    const invoiceRef = (item.razorpay_payment_id || item.payment_id || item.id)
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-10)
      .toUpperCase()
    const orderRef = item.razorpay_order_id || item.order_id || `ORD-${item.id.slice(0, 10).toUpperCase()}`
    const paymentTxnId = item.razorpay_payment_id || item.payment_id || item.id
    const brandName = product.brands?.name || product.brand || 'Producer Toy'
    const customerFullName = item.customer_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Producer'
    const customerEmailAddress = item.customer_email || user?.email || 'N/A'

    const hasBillingAddress = !!(item.billing_address || item.billing_city || item.billing_country)
    const formattedAddress = hasBillingAddress
      ? [item.billing_address, item.billing_city, item.billing_state, item.billing_zip, item.billing_country]
          .filter(Boolean)
          .join(', ')
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
            .brand-title {
              font-size: 26px;
              font-weight: 900;
              letter-spacing: -0.8px;
              text-transform: uppercase;
              line-height: 1;
              color: #0f172a;
            }
            .brand-title span { color: #fc6301; }
            .brand-tagline {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #64748b;
              margin-top: 5px;
            }
            .inv-meta-right {
              text-align: right;
            }
            .inv-main-heading {
              font-size: 28px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: -0.5px;
              color: #0f172a;
              line-height: 1;
            }
            .inv-number {
              font-family: 'JetBrains Mono', monospace;
              font-size: 13px;
              font-weight: 700;
              color: #fc6301;
              margin-top: 6px;
              letter-spacing: 0.5px;
            }
            .inv-status-badge {
              display: inline-block;
              margin-top: 8px;
              padding: 4px 10px;
              background: #fff7ed;
              border: 1px solid #fed7aa;
              color: #c2410c;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            /* Info Two-Columns */
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 32px;
              margin-bottom: 36px;
            }
            .info-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 20px 24px;
            }
            .info-box-title {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1.2px;
              color: #64748b;
              margin-bottom: 12px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
            }
            .info-entity-name {
              font-size: 15px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .info-row {
              font-size: 12px;
              color: #475569;
              margin-bottom: 3px;
              line-height: 1.4;
            }
            .info-row strong {
              color: #0f172a;
              font-weight: 600;
            }

            /* Order Details Strip */
            .details-strip {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              background: #0f172a;
              color: #ffffff;
              border-radius: 10px;
              padding: 16px 20px;
              margin-bottom: 36px;
            }
            .strip-item-label {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #94a3b8;
              margin-bottom: 4px;
            }
            .strip-item-value {
              font-family: 'JetBrains Mono', monospace;
              font-size: 12px;
              font-weight: 700;
              color: #ffffff;
              word-break: break-all;
            }

            /* Table */
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 32px;
            }
            .items-table th {
              background: #f1f5f9;
              color: #475569;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 12px 16px;
              text-align: left;
              border-top: 1px solid #cbd5e1;
              border-bottom: 1px solid #cbd5e1;
            }
            .items-table td {
              padding: 18px 16px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
              vertical-align: top;
            }
            .item-name {
              font-weight: 800;
              color: #0f172a;
              font-size: 14px;
              margin-bottom: 3px;
            }
            .item-desc {
              font-size: 11px;
              color: #64748b;
              line-height: 1.4;
            }
            .item-lic-key {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              color: #0f172a;
              background: #f1f5f9;
              padding: 3px 6px;
              border-radius: 4px;
              display: inline-block;
              margin-top: 5px;
              font-weight: 600;
            }

            /* Totals Breakdown */
            .totals-wrapper {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 36px;
            }
            .totals-box {
              width: 320px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 20px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #475569;
              margin-bottom: 8px;
            }
            .totals-row.final {
              border-top: 2px solid #0f172a;
              padding-top: 10px;
              margin-top: 10px;
              font-size: 16px;
              font-weight: 900;
              color: #0f172a;
            }
            .totals-row.final .val {
              color: #fc6301;
              font-family: 'JetBrains Mono', monospace;
            }

            /* Compliance & Footer */
            .legal-section {
              border-top: 1px solid #e2e8f0;
              padding-top: 24px;
              margin-bottom: 28px;
            }
            .legal-text {
              font-size: 10.5px;
              color: #64748b;
              line-height: 1.6;
              margin-bottom: 12px;
            }
            .tax-badge-row {
              display: flex;
              gap: 16px;
              align-items: center;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #475569;
            }
            .tax-badge {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 4px 8px;
              border-radius: 4px;
            }

            .print-actions {
              display: flex;
              justify-content: center;
              gap: 16px;
              margin-top: 32px;
            }
            .btn {
              padding: 12px 28px;
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
            }
            .btn-primary {
              background: #0f172a;
              color: #ffffff;
            }
            .btn-primary:hover {
              background: #fc6301;
            }
            .btn-secondary {
              background: #ffffff;
              color: #475569;
              border: 1px solid #cbd5e1;
            }

            @media print {
              body { padding: 0; background: #ffffff; }
              .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
              .print-actions { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <!-- Header -->
            <div class="header">
              <div class="brand-wrapper">
                <div>
                  <div class="brand-title">Producer<span>Toy</span></div>
                  <div class="brand-tagline">Electronic Soundware &amp; VST Marketplace</div>
                </div>
              </div>
              <div class="inv-meta-right">
                <div class="inv-main-heading">TAX INVOICE</div>
                <div class="inv-number">INV-${invoiceRef}</div>
                <div class="inv-status-badge">&#x2713; PAID &bull; FULFILLED</div>
              </div>
            </div>

            <!-- Two-Column Meta: Supplier vs Customer -->
            <div class="info-grid">
              <div class="info-box">
                <div class="info-box-title">Supplier / Merchant Details</div>
                <div class="info-entity-name">Producer Toy Global Ltd.</div>
                <div class="info-row">Official Marketplace &amp; Soundware Registry</div>
                <div class="info-row"><strong>Support:</strong> support@producertoy.com</div>
                <div class="info-row"><strong>Portal:</strong> https://producertoy.com</div>
                <div class="info-row"><strong>Supply Type:</strong> Online Information &amp; Database Access / Digital Download (OIDAR)</div>
              </div>

              <div class="info-box">
                <div class="info-box-title">Billed To / Licensee</div>
                <div class="info-entity-name">${customerFullName}</div>
                <div class="info-row"><strong>Account Email:</strong> ${customerEmailAddress}</div>
                <div class="info-row"><strong>Billing Address:</strong> ${formattedAddress}</div>
                <div class="info-row"><strong>Place of Supply:</strong> Digital E-Vault (Instant Delivery)</div>
              </div>
            </div>

            <!-- Details Strip -->
            <div class="details-strip">
              <div>
                <div class="strip-item-label">Invoice Date</div>
                <div class="strip-item-value">${dateStr}</div>
              </div>
              <div>
                <div class="strip-item-label">Order Reference</div>
                <div class="strip-item-value">${orderRef}</div>
              </div>
              <div>
                <div class="strip-item-label">Payment Gateway Ref</div>
                <div class="strip-item-value">${paymentTxnId.slice(0, 16)}</div>
              </div>
              <div>
                <div class="strip-item-label">Payment Method</div>
                <div class="strip-item-value">${item.payment_gateway ? item.payment_gateway.toUpperCase() : 'RAZORPAY / UPI'}</div>
              </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Item Description</th>
                  <th style="width: 20%;">Creator / Brand</th>
                  <th style="width: 15%; text-align: center;">Qty</th>
                  <th style="width: 15%; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="item-name">${product.name || 'Digital Sound Product'}</div>
                    <div class="item-desc">${formatType(product.product_type)} &bull; Commercial License</div>
                    ${
                      item.serial_key
                        ? `<div class="item-lic-key"><strong>Serial License:</strong> ${item.serial_key}</div>`
                        : ''
                    }
                  </td>
                  <td>${brandName}</td>
                  <td style="text-align: center; font-family: 'JetBrains Mono', monospace;">1</td>
                  <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">
                    ${currency}${price.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Totals Breakdown -->
            <div class="totals-wrapper">
              <div class="totals-box">
                <div class="totals-row">
                  <span>Subtotal</span>
                  <span style="font-family: 'JetBrains Mono', monospace;">${currency}${subtotal.toFixed(2)}</span>
                </div>
                ${
                  discount > 0
                    ? `
                  <div class="totals-row" style="color: #16a34a;">
                    <span>Promotional Discount ${item.coupon_code ? `(${item.coupon_code})` : ''}</span>
                    <span style="font-family: 'JetBrains Mono', monospace;">-${currency}${discount.toFixed(2)}</span>
                  </div>
                `
                    : ''
                }
                <div class="totals-row">
                  <span>GST / Tax (Included)</span>
                  <span style="font-family: 'JetBrains Mono', monospace;">${currency}0.00</span>
                </div>
                <div class="totals-row final">
                  <span>Total Paid (${currencyCode})</span>
                  <span class="val">${currency}${price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Statutory Notes -->
            <div class="legal-section">
              <div class="legal-text">
                This invoice serves as the official commercial proof of purchase and statutory record for cross-border electronic supply of digital soundware. Perpetual commercial master rights are granted under the Producer Toy Standard EULA.
              </div>
              <div class="tax-badge-row">
                <span class="tax-badge">Digital Commercial Delivery</span>
                <span class="tax-badge">Instant E-Vault Fulfilled</span>
                <span class="tax-badge">100% Royalty Free</span>
              </div>
            </div>

            <!-- Print Actions -->
            <div class="print-actions">
              <button class="btn btn-primary" onclick="window.print()">Print / Save PDF</button>
              <button class="btn btn-secondary" onclick="window.close()">Close</button>
            </div>
          </div>
        </body>
      </html>
    `)
    invoiceWindow.document.close()
  }

  // 2. Generate Commercial License Certificate PDF / Window
  const handleDownloadLicense = (item: any) => {
    const licenseWindow = window.open('', '_blank')
    if (!licenseWindow) return

    const product = item.products || {}
    const dateStr = new Date(item.purchased_at || item.created_at).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const licenseRef = item.id.slice(0, 14).toUpperCase()
    const brandName = product.brand || product.brands?.name || 'Producer Toy'
    const customerFullName = item.customer_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Producer'
    const customerEmailAddress = item.customer_email || user?.email || 'N/A'

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
              .actions-bar { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">Commercial License <span>Certificate</span></div>
              <div class="subtitle">Producer Toy Commercial End User License Agreement (EULA)</div>
            </div>

            <div class="meta-grid">
              <div>
                <div class="meta-label">Licensee / Customer</div>
                <div class="meta-val">${customerFullName}</div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${customerEmailAddress}</div>
              </div>
              <div>
                <div class="meta-label">Licensed Product</div>
                <div class="meta-val orange">${product.name}</div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Creator: ${brandName}</div>
              </div>
              <div>
                <div class="meta-label">License Certificate ID</div>
                <div class="meta-val" style="font-family: 'JetBrains Mono', monospace;">LIC-${licenseRef}</div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Date: ${dateStr}</div>
              </div>
            </div>

            <div class="terms">
              <h4>1. Grant of License</h4>
              <p>Producer Toy hereby grants the Licensee a non-exclusive, worldwide, perpetual, royalty-free commercial license to use, synchronize, edit, and incorporate the audio samples, presets, and digital soundware contained within "${product.name}" in unlimited commercial music releases, broadcasts, films, games, streaming media, and synchronization projects.</p>

              <h4>2. Master Rights &amp; Royalties</h4>
              <p>The Licensee retains 100% of all master recording royalties, streaming revenue, sync fees, performance royalties, and mechanical income generated from musical compositions created using these sound tools. No subsequent royalty payments are owed to Producer Toy or the author.</p>

              <h4>3. Restrictions</h4>
              <p>This license strictly prohibits the resale, redistribution, sublicensing, repackaging, or sharing of the isolated audio samples or source presets as competitive sample packs, sound libraries, or virtual instruments.</p>
            </div>

            <div class="seal-row">
              <div class="seal">
                &#x2713; Producer Toy Verified<br />
                <span style="color: #fc6301; font-size: 8.5px;">Statutory Commercial Master EULA</span>
              </div>
              <div>
                <div style="font-weight: 800; font-size: 14px; text-align: right; color: #0f172a;">Producer Toy Registry</div>
                <div class="sig-title">Authorized Digital Signature</div>
              </div>
            </div>

            <div class="actions-bar">
              <button class="btn-print" onclick="window.print()">Print / Save Certificate</button>
              <button class="btn-close" onclick="window.close()">Close</button>
            </div>
          </div>
        </body>
      </html>
    `)
    licenseWindow.document.close()
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[#202020] rounded-lg" />
        <div className="h-28 bg-[#181818] rounded-2xl border border-[#242424]" />
        <div className="h-28 bg-[#181818] rounded-2xl border border-[#242424]" />
      </div>
    )
  }

  const hasPurchases = purchases.length > 0
  const hasOrders = orders.length > 0

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Transactions &amp; Invoices
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            View your verified purchase history, GST tax invoices, and commercial license certificates.
          </p>
        </div>

        <button
          onClick={loadData}
          title="Refresh Transactions"
          className="p-2 rounded-xl bg-[#1c1c1e] hover:bg-[#28282b] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {!hasPurchases && !hasOrders ? (
        <div className="bg-[#181818] border border-[#242424] p-10 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#222222] border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Purchases or Transactions Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Any products, sample packs, or VST plugins you purchase will automatically show up here with download links and official tax invoices.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 bg-[#FC6301] hover:bg-[#e05700] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              <span>Explore Store Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Render Verified Purchases */}
          {hasPurchases && (
            <div className="space-y-3">
              {purchases.map((item) => {
                const product = item.products
                if (!product) return null

                const rawCurrency = (item.currency || 'INR').toUpperCase()
                const isINR = rawCurrency === 'INR' || rawCurrency === '₹'
                const currSymbol = isINR ? '₹' : '$'
                const price = Number(item.amount_paid ?? product.price_usd ?? 0)
                const dateFormatted = new Date(item.purchased_at || item.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
                const invoiceRef = (item.razorpay_payment_id || item.payment_id || item.id)
                  .replace(/[^a-zA-Z0-9]/g, '')
                  .slice(-8)
                  .toUpperCase()

                return (
                  <div
                    key={item.id}
                    className="bg-[#181818] border border-[#262626] p-4 sm:p-5 rounded-xl space-y-3 transition-colors"
                  >
                    {/* Top Row: Order ID + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242424] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white tracking-wider">
                            INV-{invoiceRef}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-[#202020] text-zinc-300 border border-white/5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FC6301]" />
                            <span>Paid</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500 block pt-0.5">{dateFormatted}</span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-sm font-bold text-white font-mono">
                          {currSymbol}{price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Product Summary Row */}
                    <div className="flex items-start justify-between gap-3 pt-0.5">
                      <div className="flex items-center gap-3 min-w-0">
                        {product.cover_image && (
                          <div className="relative w-12 h-14 rounded-md overflow-hidden bg-[#202020] border border-[#282828] flex-shrink-0">
                            <Image
                              src={product.cover_image}
                              alt={product.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                          <p className="text-xs text-zinc-400 truncate">
                            {product.brands?.name || product.brand || 'Producer Toy'} &bull;{' '}
                            <span className="uppercase text-[10px] text-zinc-500 font-mono">
                              {product.product_type?.replace(/_/g, ' ') || 'Audio Pack'}
                            </span>
                          </p>
                          {item.serial_key && (
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-mono text-zinc-300 bg-[#202020] px-2 py-0.5 rounded border border-white/5 truncate max-w-xs select-all">
                                {item.serial_key}
                              </span>
                              <button
                                onClick={() => handleCopySerial(item.serial_key, item.id)}
                                className="text-[10px] text-zinc-400 hover:text-white p-1 rounded hover:bg-[#252525] transition-colors cursor-pointer"
                                title="Copy Serial Key"
                              >
                                {copiedKeyId === item.id ? (
                                  <Check className="w-3 h-3 text-[#FC6301]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Invoice, Certificate & Library */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#242424]">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white text-xs font-medium rounded-lg border border-[#2e2e2e] hover:border-[#FC6301]/60 transition-all cursor-pointer"
                        title="Download GST Tax Invoice"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#FC6301]" />
                        <span>Tax Invoice</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadLicense(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white text-xs font-medium rounded-lg border border-[#2e2e2e] hover:border-[#FC6301]/60 transition-all cursor-pointer"
                        title="Download EULA Commercial License"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-zinc-400" />
                        <span>License</span>
                      </button>

                      <Link
                        href="/library"
                        prefetch={true}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FC6301] hover:bg-[#e05700] text-white text-xs font-bold rounded-lg transition-all shadow-xs active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </Link>
                    </div>

                  </div>
                )
              })}
            </div>
          )}

          {/* Render Any Additional Orders without Duplicate */}
          {hasOrders && !hasPurchases && (
            <div className="space-y-3">
              {orders.map((order) => {
                const items = Array.isArray(order.items) ? order.items : []
                const dateFormatted = new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
                const isINR = order.currency === 'INR' || order.currency === '₹'

                return (
                  <div
                    key={order.id}
                    className="bg-[#181818] border border-[#262626] p-4 sm:p-5 rounded-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242424] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white block">
                            Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-[#202020] text-zinc-300 border border-white/5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FC6301]" />
                            <span>{order.payment_status || 'Paid'}</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{dateFormatted}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white font-mono">
                          {isINR ? '₹' : '$'}
                          {Number(order.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="font-medium truncate">{item.name || item.title || 'Digital Audio Asset'}</span>
                          <span className="text-zinc-400 font-mono">
                            {isINR ? '₹' : '$'}
                            {Number(item.price || item.unit_amount || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#242424]">
                      <Link
                        href="/library"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FC6301] hover:bg-[#e05700] text-white text-xs font-bold rounded-lg transition-all shadow-xs active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
