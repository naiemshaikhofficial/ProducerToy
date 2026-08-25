'use client'

import React from 'react'
import { Receipt, FileCheck, Calendar, Hash, ShieldCheck, Download } from 'lucide-react'

export interface PurchaseItem {
  id: string
  purchased_at: string
  amount_paid?: number
  price_usd?: number
  serial_key?: string | null
  order_id?: string
  payment_id?: string
  products: {
    id: string
    name: string
    brand: string
    product_type: string
    price_usd: number
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

  // 1. Generate printable Tax Invoice PDF / Window
  const handleDownloadInvoice = (item: PurchaseItem) => {
    const invoiceWindow = window.open('', '_blank')
    if (!invoiceWindow) return

    const product = item.products
    const dateStr = new Date(item.purchased_at).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const price = item.amount_paid ?? product.price_usd ?? 0
    const invoiceRef = item.payment_id?.slice(-10).toUpperCase() || item.id.slice(0, 10).toUpperCase()

    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoiceRef} - Producer Toy</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', -apple-system, sans-serif; padding: 48px; color: #111; background: #fff; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #111; padding-bottom: 24px; margin-bottom: 36px; }
            .brand-name { font-size: 26px; font-weight: 900; tracking: -0.05em; text-transform: uppercase; letter-spacing: -0.5px; }
            .brand-sub { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px; }
            .inv-title { text-align: right; }
            .inv-heading { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
            .inv-ref { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #444; margin-top: 4px; }
            
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
            .box-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 6px; }
            .box-name { font-size: 14px; font-weight: 800; text-transform: uppercase; }
            .box-meta { font-size: 11px; color: #555; margin-top: 4px; line-height: 1.6; }
            
            .table { width: 100%; border-collapse: collapse; margin-bottom: 36px; border: 2px solid #111; }
            .table th { background: #111; color: #fff; padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            .table td { padding: 16px; font-size: 13px; font-weight: 700; border-bottom: 1px solid #eee; }
            
            .summary { margin-left: auto; width: 280px; background: #f8f8f8; border: 2px solid #111; p: 20px; padding: 18px; margin-bottom: 40px; }
            .sum-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
            .sum-total { border-top: 2px solid #111; padding-top: 10px; font-size: 16px; font-weight: 900; }
            
            .footer { border-top: 2px solid #eee; padding-top: 24px; font-size: 10px; color: #777; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
            .btn-print { margin-top: 24px; padding: 12px 28px; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; cursor: pointer; letter-spacing: 1.5px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-name">PRODUCER TOY</div>
              <div class="brand-sub">Premier Music Producer Tools</div>
            </div>
            <div class="inv-title">
              <div class="inv-heading">TAX INVOICE</div>
              <div class="inv-ref">REF: #${invoiceRef}</div>
              <div class="inv-ref" style="font-size:10px; color:#888;">DATE: ${dateStr}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="box-title">SUPPLIER DETAILS</div>
              <div class="box-name">PRODUCER TOY STORE</div>
              <div class="box-meta">
                Digital Audio Workstation & Sound Assets<br>
                Support: support@producertoy.com<br>
                Website: https://producertoy.com
              </div>
            </div>
            <div style="text-align: right;">
              <div class="box-title">CUSTOMER DETAILS</div>
              <div class="box-name">${userName?.toUpperCase() || 'VALUED PRODUCER'}</div>
              <div class="box-meta">
                Email: ${userEmail.toUpperCase()}<br>
                Digital License Delivery<br>
                Order ID: #${item.order_id || item.id.slice(0, 12).toUpperCase()}
              </div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="width: 120px; text-align: center;">Format</th>
                <th style="width: 100px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${product.name.toUpperCase()}</strong><br>
                  <span style="font-size: 10px; color: #666;">Brand: ${product.brand} | Type: ${product.product_type}</span>
                </td>
                <td style="text-align: center;">${product.vst_format || 'DIGITAL'}</td>
                <td style="text-align: right;">$${price.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary">
            <div class="sum-row">
              <span>Subtotal</span>
              <span>$${price.toFixed(2)}</span>
            </div>
            <div class="sum-row">
              <span>Tax (GST/VAT)</span>
              <span>$0.00</span>
            </div>
            <div class="sum-row sum-total">
              <span>Total Paid</span>
              <span>$${price.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Computer generated tax invoice • Instant digital delivery to user account vault</p>
            <button class="btn-print no-print" onclick="window.print()">Print / Download PDF</button>
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

    licenseWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EULA License Certificate - ${product.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@700&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; padding: 48px; background: #fff; color: #111; line-height: 1.5; }
            .container { border: 4px solid #111; padding: 40px; position: relative; }
            .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 24px; margin-bottom: 32px; }
            .title { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-top: 4px; }
            
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #111; color: #fff; padding: 20px; border-radius: 4px; margin-bottom: 32px; }
            .meta-label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #888; letter-spacing: 1px; }
            .meta-val { font-size: 12px; font-weight: 800; text-transform: uppercase; margin-top: 2px; word-break: break-all; }
            .meta-val.green { color: #10B981; }

            .terms { font-size: 11px; line-height: 1.7; color: #333; margin-bottom: 32px; }
            .terms h4 { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #111; margin: 16px 0 4px 0; }

            .seal-row { display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #111; padding-top: 24px; }
            .seal { width: 90px; h-90px; border: 3px solid #111; padding: 12px; text-align: center; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; transform: rotate(-4deg); background: #f4f4f5; }
            .sig-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-top: 2px solid #111; padding-top: 6px; text-align: right; }
            
            .btn-print { margin-top: 24px; padding: 12px 28px; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; cursor: pointer; letter-spacing: 1.5px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">ROYALTY-FREE EULA LICENSE</div>
              <div class="subtitle">PRODUCER TOY CERTIFICATE OF AUTHORIZATION</div>
            </div>

            <div class="meta-grid">
              <div>
                <div class="meta-label">Product Name</div>
                <div class="meta-val">${product.name.toUpperCase()}</div>
              </div>
              <div>
                <div class="meta-label">Licensee</div>
                <div class="meta-val">${userName?.toUpperCase() || userEmail.toUpperCase()}</div>
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
                <div class="meta-label">License Type</div>
                <div class="meta-val">COMMERCIAL MULTI-RELEASE</div>
              </div>
              <div>
                <div class="meta-label">Verification Status</div>
                <div class="meta-val green">AUTHENTICATED</div>
              </div>
            </div>

            <div class="terms">
              <h4>1. GRANT OF LICENSE</h4>
              <p>Producer Toy hereby grants the Licensee a non-exclusive, worldwide, royalty-free commercial license to utilize the included audio samples, presets, or software assets in public music productions, commercial releases, broadcast media, and film sync placements.</p>

              <h4>2. MONETIZATION RIGHTS</h4>
              <p>You are 100% entitled to monetize your finished tracks across Spotify, Apple Music, YouTube, BeatStars, and digital radio platforms without paying secondary performance royalties or clearance fees.</p>

              <h4>3. RESTRICTIONS</h4>
              <p>Reselling, sublicensing, repackaging, or uploading raw unmixed audio files or preset banks to torrent or file-sharing networks is strictly prohibited and subject to immediate legal takedown under international copyright laws.</p>
            </div>

            <div class="seal-row">
              <div class="seal">
                PRODUCER TOY<br>OFFICIAL<br>VERIFIED
              </div>
              <div>
                <div class="sig-title">PRODUCER TOY DIGITAL AUTHORIZATION</div>
              </div>
            </div>
          </div>

          <div style="text-align: center;">
            <button class="btn-print no-print" onclick="window.print()">Print License Certificate</button>
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
                      <span className="block text-[10px] font-normal text-zinc-500">{product.brand}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400 uppercase">
                      {product.product_type || 'Digital'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-right whitespace-nowrap">
                      ${price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#20202a] hover:bg-white hover:text-black text-white text-[10px] font-mono font-bold uppercase border border-[#303040] rounded-md transition-all cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => handleDownloadLicense(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-400 hover:text-black text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/30 rounded-md transition-all cursor-pointer"
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
