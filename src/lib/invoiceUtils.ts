export interface InvoiceProductItem {
  id: string
  name: string
  brand?: string
  brands?: { name: string }
  product_type?: string
  price_usd?: number
  cover_image?: string
  vst_format?: string
}

export interface PrintableInvoiceData {
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
  products: InvoiceProductItem
}

/**
 * Generates and opens official printable International Tax Invoice PDF / Window
 */
export function openPrintableInvoice(
  item: PrintableInvoiceData,
  userEmail?: string,
  userName?: string
) {
  if (typeof window === 'undefined') return
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
  const rawCurrency = (item.currency || '').toUpperCase()
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
  const orderRef =
    item.razorpay_order_id || item.order_id || `ORD-${item.id.slice(0, 10).toUpperCase()}`
  const paymentTxnId = item.razorpay_payment_id || item.payment_id || item.id
  const brandName = product.brands?.name || product.brand || 'Producer Toy'
  const customerFullName = item.customer_name || userName || 'Producer'
  const customerEmailAddress = item.customer_email || userEmail || 'Customer'

  const hasBillingAddress = Boolean(
    item.billing_address || item.billing_city || item.billing_country
  )
  const formattedAddress = hasBillingAddress
    ? [
        item.billing_address,
        item.billing_city,
        item.billing_state,
        item.billing_zip,
        item.billing_country,
      ]
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
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 36px;
          }
          .meta-box h4 {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #94a3b8;
            margin-bottom: 8px;
          }
          .meta-box p {
            font-size: 13px;
            color: #334155;
            line-height: 1.6;
          }
          .meta-box strong {
            color: #0f172a;
            font-weight: 700;
          }
          .table-wrapper {
            margin-bottom: 32px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
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
          .summary-card {
            background: #ffffff;
            border: 2px solid #0f172a;
            border-radius: 12px;
            padding: 20px 24px;
          }
          .sum-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #475569;
            margin-bottom: 8px;
          }
          .sum-divider {
            border-top: 1px dashed #cbd5e1;
            margin: 12px 0;
          }
          .sum-total {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
          }
          .sum-total .label {
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
            color: #0f172a;
          }
          .sum-total .val {
            font-size: 22px;
            font-weight: 900;
            color: #fc6301;
          }
          .actions-bar {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-top: 28px;
          }
          .btn-print {
            background: #fc6301;
            color: #ffffff;
            border: none;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
          }
          .btn-close {
            background: #e2e8f0;
            color: #475569;
            border: 1px solid #cbd5e1;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 13px;
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
          <div class="header">
            <div class="brand-wrapper">
              <div>
                <div class="brand-title">PRODUCER <span>TOY</span></div>
                <div class="brand-subtitle">Premier Music Producer Tools & Sound Assets</div>
              </div>
            </div>
            <div class="inv-meta-right">
              <div class="inv-badge">● Payment Settled</div>
              <div class="inv-main-heading">TAX INVOICE</div>
              <div class="inv-number">INV-${invoiceRef}</div>
              <div class="inv-date">Issued: ${dateStr} at ${timeStr}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-box">
              <h4>Billed To (Customer):</h4>
              <p>
                <strong>${customerFullName}</strong><br />
                Email: ${customerEmailAddress}<br />
                Address: ${formattedAddress}
              </p>
            </div>
            <div class="meta-box" style="text-align: right;">
              <h4>Fulfillment & Platform:</h4>
              <p>
                <strong>Producer Toy Global Direct Fulfillment</strong><br />
                Order Ref: <span style="font-family: monospace;">${orderRef}</span><br />
                Gateway: ${item.razorpay_payment_id ? 'Razorpay (Secure 3D S2S)' : 'PayPal / Card Gateway'}
              </p>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Description / Asset</th>
                  <th>Category</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="item-title">${product.name}</div>
                    <div class="item-desc">Brand: ${brandName} &bull; 100% Royalty-Free Commercial License</div>
                  </td>
                  <td>${formatType(product.product_type)}</td>
                  <td style="text-align: right; font-weight: 700;">${currency}${price.toFixed(2)} ${currencyCode}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bottom-grid">
            <div class="compliance-box">
              <div style="font-weight: 800; margin-bottom: 4px;">DIGITAL ASSET FULFILLMENT:</div>
              All sound assets, samples, and audio plugins are delivered digitally via Producer Toy high-speed Cloud CDN vault. Licensed for worldwide commercial use in music productions.
            </div>

            <div class="summary-card">
              <div class="sum-row">
                <span>Subtotal</span>
                <span>${currency}${subtotal.toFixed(2)}</span>
              </div>
              ${
                discount > 0
                  ? `<div class="sum-row" style="color: #ea580c;">
                       <span>Discount Applied</span>
                       <span>-${currency}${discount.toFixed(2)}</span>
                     </div>`
                  : ''
              }
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

          <div style="text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            Computer-generated electronic tax invoice &bull; Official Digital Delivery Record &bull; TXN_ID: ${paymentTxnId}<br />
            Need assistance? Email <strong>support@producertoy.com</strong>
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
