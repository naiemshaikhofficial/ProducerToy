import crypto from 'crypto'

export interface OrderInvoiceItem {
  name: string
  slug?: string
  product_type?: string
  price_usd: number
  price_inr?: number
  serial_key?: string | null
}

export interface SendOrderInvoiceParams {
  orderNumber: string
  orderDate: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  billingAddress: {
    address: string
    address2?: string
    city: string
    state: string
    zip: string
    country: string
  }
  items: OrderInvoiceItem[]
  currency: string
  subtotal: number
  discount: number
  totalAmount: number
  paymentMethod?: string
}

/**
 * Sends a high-conversion, brand-themed ProducerToy Order Invoice & Receipt email via Resend.
 * Styled in ProducerToy's signature dark monochrome aesthetic (#0d0d0d, #141414, #262626, white accents).
 */
export async function sendOrderInvoiceEmail(
  params: SendOrderInvoiceParams
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY || process.env.Resend
    if (!apiKey) {
      console.warn('[ORDER_INVOICE_EMAIL] Neither RESEND_API_KEY nor Resend is configured.')
      return { success: false, error: 'Email service configuration missing' }
    }

    const cleanEmail = params.customerEmail?.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Invalid customer email address' }
    }

    const isFree = params.totalAmount <= 0
    const currencySymbol = params.currency === 'INR' ? '₹' : '$'
    const formattedTotal = isFree
      ? 'FREE ($0.00)'
      : `${currencySymbol}${params.totalAmount.toFixed(2)}`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : 'https://producertoy.com'

    const libraryUrl = `${siteUrl}/library`
    const fromAddress = process.env.EMAIL_FROM || 'ProducerToy Orders <orders@producertoy.com>'

    // Build items rows
    const itemsHtml = params.items
      .map((item) => {
        const itemPrice =
          Number(item.price_usd || 0) <= 0 && Number(item.price_inr || 0) <= 0
            ? 'FREE'
            : params.currency === 'INR' && item.price_inr
            ? `₹${Number(item.price_inr).toFixed(2)}`
            : `$${Number(item.price_usd).toFixed(2)}`

        const typeLabel =
          item.product_type === 'plugin'
            ? 'Audio Plugin • VST3 / AU / AAX'
            : item.product_type === 'sample_pack'
            ? 'Sample Pack • 24-Bit WAV'
            : 'Sound Tool'

        const serialBox = item.serial_key
          ? `
            <div style="margin-top: 10px; background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; padding: 10px 14px;">
              <div style="font-size: 10px; font-weight: 700; font-family: monospace; letter-spacing: 0.1em; color: #a1a1aa; text-transform: uppercase;">
                LICENSE SERIAL KEY
              </div>
              <div style="font-size: 13px; font-weight: 700; font-family: 'Courier New', Courier, monospace; color: #ffffff; letter-spacing: 0.1em; margin-top: 4px; word-break: break-all;">
                ${item.serial_key}
              </div>
            </div>
          `
          : ''

        return `
          <tr>
            <td style="padding: 18px 0; border-bottom: 1px solid #222222;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: top;">
                    <div style="font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.4;">
                      ${item.name}
                    </div>
                    <div style="font-size: 11px; color: #71717a; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.05em;">
                      ${typeLabel}
                    </div>
                    ${serialBox}
                  </td>
                  <td align="right" style="vertical-align: top; padding-left: 16px; white-space: nowrap;">
                    <div style="font-size: 14px; font-weight: 700; color: #ffffff;">
                      ${itemPrice}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `
      })
      .join('')

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Receipt - ${params.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #e4e4e7; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #141414; border: 1px solid #262626; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);" cellspacing="0" cellpadding="0">
          
          <!-- Top Accent Monochrome Line -->
          <tr>
            <td style="height: 3px; background-color: #ffffff;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 24px 36px; border-bottom: 1px solid #202020;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 900; letter-spacing: 0.1em; color: #ffffff; text-transform: uppercase;">
                      PRODUCER TOY
                    </div>
                    <div style="font-size: 11px; color: #71717a; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 2px;">
                      Official Order Receipt & License Invoice
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #222222; border: 1px solid #333333; border-radius: 6px; font-size: 11px; font-weight: 700; color: #ffffff; font-family: monospace;">
                      ${isFree ? 'CLAIMED' : 'PAID'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Summary Meta Banner -->
          <tr>
            <td style="padding: 24px 36px; background-color: #171717; border-bottom: 1px solid #202020;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: top; width: 50%;">
                    <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.08em; color: #71717a;">Order Number</div>
                    <div style="font-size: 13px; font-weight: 700; font-family: monospace; color: #ffffff; margin-top: 3px;">${params.orderNumber}</div>
                  </td>
                  <td style="vertical-align: top; width: 50%;">
                    <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.08em; color: #71717a;">Order Date</div>
                    <div style="font-size: 13px; font-weight: 500; color: #ffffff; margin-top: 3px;">${new Date(params.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <div style="font-size: 15px; color: #e4e4e7; margin-bottom: 24px;">
                Hello <strong style="color: #ffffff;">${params.customerName}</strong>,
                <br /><br />
                Thank you for your order! Your digital assets and genuine commercial licenses have been verified and added directly to your permanent <strong>ProducerToy Library</strong>.
              </div>

              <!-- Purchased Products List -->
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin-bottom: 8px;">
                Items in This Order
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                ${itemsHtml}
              </table>

              <!-- Financial Totals -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #181818; border: 1px solid #27272a; border-radius: 10px; padding: 16px 20px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 12px; color: #a1a1aa; padding-bottom: 6px;">Subtotal</td>
                  <td align="right" style="font-size: 12px; color: #ffffff; font-weight: 600; padding-bottom: 6px;">
                    ${currencySymbol}${params.subtotal.toFixed(2)}
                  </td>
                </tr>
                ${
                  params.discount > 0
                    ? `
                  <tr>
                    <td style="font-size: 12px; color: #a1a1aa; padding-bottom: 6px;">Discount</td>
                    <td align="right" style="font-size: 12px; color: #ffffff; font-weight: 600; padding-bottom: 6px;">
                      -${currencySymbol}${params.discount.toFixed(2)}
                    </td>
                  </tr>
                `
                    : ''
                }
                <tr>
                  <td style="font-size: 14px; font-weight: 700; color: #ffffff; border-top: 1px solid #2a2a2a; padding-top: 10px;">Total Paid</td>
                  <td align="right" style="font-size: 16px; font-weight: 800; color: #ffffff; border-top: 1px solid #2a2a2a; padding-top: 10px;">
                    ${formattedTotal}
                  </td>
                </tr>
              </table>

              <!-- Billing Address Snapshot -->
              <div style="background-color: #171717; border: 1px solid #242424; border-radius: 10px; padding: 16px 20px; margin-bottom: 32px;">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin-bottom: 6px;">
                  Verified Billing & Licensee Information
                </div>
                <div style="font-size: 12px; color: #e4e4e7; line-height: 1.5;">
                  <strong>${params.customerName}</strong><br />
                  ${params.billingAddress.address}${params.billingAddress.address2 ? `, ${params.billingAddress.address2}` : ''}<br />
                  ${params.billingAddress.city}, ${params.billingAddress.state} ${params.billingAddress.zip}<br />
                  ${params.billingAddress.country}<br />
                  ${params.customerPhone ? `<span style="color: #a1a1aa;">Phone: ${params.customerPhone}</span><br />` : ''}
                  <span style="color: #a1a1aa;">Email: ${cleanEmail}</span>
                </div>
              </div>

              <!-- Primary CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${libraryUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #0a0a0a; font-weight: 800; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase; padding: 16px 36px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);">
                  Open My Library & Download
                </a>
              </div>

              <div style="text-align: center; font-size: 11px; color: #71717a;">
                You can also generate offline license files (.ptlic) and access direct installers inside your Library at any time.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #0f0f0f; border-top: 1px solid #1f1f1f; text-align: center;">
              <div style="font-size: 11px; color: #71717a; line-height: 1.6;">
                © ${new Date().getFullYear()} Producer Toy. All rights reserved.<br />
                Audio plugins and samples purchased on Producer Toy include 100% royalty-free commercial licenses.<br />
                Need help? Contact support at <a href="mailto:support@producertoy.com" style="color: #a1a1aa; text-decoration: underline;">support@producertoy.com</a>.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const subject = isFree
      ? `Your Free Download & License - Order ${params.orderNumber}`
      : `Order Confirmation & Receipt - ${params.orderNumber}`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [cleanEmail],
        subject,
        html: htmlContent,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      console.warn('[ORDER_INVOICE_EMAIL] Resend returned non-200 with fromAddress:', fromAddress, data)
      // Retry with onboarding@resend.dev if custom domain is not yet verified on Resend
      if (data?.statusCode === 403 || data?.name === 'validation_error' || data?.message?.includes('domain')) {
        const fallbackRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ProducerToy <onboarding@resend.dev>',
            to: [cleanEmail],
            subject,
            html: htmlContent,
          }),
        })
        const fallbackData = await fallbackRes.json().catch(() => ({}))
        if (fallbackRes.ok) {
          return { success: true, messageId: fallbackData.id }
        }
      }
      return { success: false, error: data.message || 'Failed to dispatch email' }
    }

    return { success: true, messageId: data.id }
  } catch (err: any) {
    console.error('[ORDER_INVOICE_EMAIL] Error dispatching order invoice:', err)
    return { success: false, error: err.message || 'Internal invoice email error' }
  }
}
