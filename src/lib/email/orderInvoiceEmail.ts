import crypto from 'crypto'
import { generateInvoicePDF } from '@/lib/invoice/generateInvoicePdf'

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

// Unified Top Header Image provided by user (Mascot + PRODUCER TOY brand logo)
const TOP_LOGO_IMAGE_URL = 'https://imagizer.imageshack.com/a/img923/2206/2pwK36.png'
// Bottom Producer Toy 3D Logo
const PRODUCER_TOY_LOGO_URL = 'https://imagizer.imageshack.com/a/img922/171/nu2UgR.png'

/**
 * Sends a high-conversion, brand-themed ProducerToy Order Invoice & Receipt email via Resend with PDF attachment.
 * Styled in ProducerToy's signature dark luxury monochrome aesthetic.
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

    // 1. Dynamic Subject Line: Purchased item name + Order Number (NO serial key in subject)
    const primaryItem = params.items[0]?.name || 'ProducerToy Asset'
    const shortProductName = primaryItem
      .split(/[–—\-:]/)[0]
      .trim() || primaryItem.slice(0, 30).trim()

    let subject = ''
    if (params.items.length === 1) {
      subject = isFree
        ? `Your Free ${shortProductName} - Order #${params.orderNumber}`
        : `Your ${shortProductName} Order - #${params.orderNumber}`
    } else {
      subject = isFree
        ? `Your Free Downloads (${shortProductName} + ${params.items.length - 1} more) - Order #${params.orderNumber}`
        : `Your ProducerToy Order #${params.orderNumber} - ${shortProductName} & more`
    }

    // Format Date: e.g. Oct 27, 2026
    const formattedDate = new Date(params.orderDate || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    // 2. Build items rows (NO serial key rendered in email body as requested)
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
            : 'Audio Asset • Instant Download'

        return `
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #1f1f22;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: top;">
                    <div style="font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.4;">
                      ${item.name}
                    </div>
                    <div style="font-size: 11px; color: #8a8a93; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.06em;">
                      ${typeLabel}
                    </div>
                  </td>
                  <td align="right" style="vertical-align: top; padding-left: 16px; white-space: nowrap;">
                    <div style="font-size: 14px; font-weight: 800; color: #ffffff;">
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

    const discountRow =
      params.discount > 0
        ? `
          <tr>
            <td style="padding: 6px 0; font-size: 12px; color: #8a8a93;">Discounts Applied</td>
            <td align="right" style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #ffffff;">
              -${currencySymbol}${params.discount.toFixed(2)}
            </td>
          </tr>
        `
        : ''

    const subtotalFormatted =
      params.subtotal <= 0
        ? '$0.00'
        : `${currencySymbol}${params.subtotal.toFixed(2)}`

    // 3. Generate Official PDF Invoice Buffer
    let pdfBuffer: Buffer | null = null
    try {
      pdfBuffer = await generateInvoicePDF(params)
    } catch (pdfErr) {
      console.warn('[ORDER_INVOICE_EMAIL] PDF generation warning:', pdfErr)
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #050505; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-p-20 { padding: 24px 20px !important; }
      .mobile-p-16 { padding: 16px 14px !important; }
      .mobile-full-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #ffffff;">

  <!-- Outer Canvas -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #050505; width: 100%; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 32px 12px 48px 12px;">

        <!-- Central 580px Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 580px; width: 100%; background-color: #0f0f11; border: 1px solid #202024; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.75);">

          <!-- ================= HEADER WITH UNIFIED IMAGE ================= -->
          <tr>
            <td align="center" style="padding: 32px 32px 20px 32px; background-color: #121215; border-bottom: 1px solid #1f1f23;">
              
              <!-- Unified Bear + PRODUCER TOY Logo Image (Drag Off, Clickable to Site) -->
              <a href="${siteUrl}" target="_blank" draggable="false" style="text-decoration: none; display: inline-block; border: none; outline: none;">
                <img
                  src="${TOP_LOGO_IMAGE_URL}"
                  alt="Producer Toy"
                  width="170"
                  draggable="false"
                  style="display: block; margin: 0 auto; border: none; outline: none; -webkit-user-drag: none; user-select: none;"
                />
              </a>

              <div style="font-size: 11px; font-weight: 600; color: #71717a; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 10px;">
                OFFICIAL ORDER RECEIPT &amp; LICENSE INVOICE
              </div>
            </td>
          </tr>

          <!-- ================= ORDER METADATA BAR ================= -->
          <tr>
            <td style="padding: 16px 32px; background-color: #16161a; border-bottom: 1px solid #1f1f23;" class="mobile-p-16">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 10px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.08em;">
                      ORDER NUMBER
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #ffffff; font-family: 'SFMono-Regular', Consolas, monospace; margin-top: 2px;">
                      #${params.orderNumber}
                    </div>
                  </td>
                  <td align="center" style="vertical-align: middle; padding: 0 10px;">
                    <div style="display: inline-block; background-color: #222226; border: 1px solid #333338; color: #ffffff; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
                      ${isFree ? 'CLAIMED' : 'PAID'}
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <div style="font-size: 10px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.08em;">
                      ORDER DATE
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #ffffff; margin-top: 2px;">
                      ${formattedDate}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ================= MAIN BODY ================= -->
          <tr>
            <td style="padding: 32px;" class="mobile-p-20">
              
              <!-- Greeting Message -->
              <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
                Hello ${params.customerName || 'Producer'},
              </div>
              <div style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 28px;">
                Thank you for your order! Your digital assets and genuine commercial licenses have been verified and added directly to your permanent <strong>ProducerToy Library</strong>.
              </div>

              <!-- Section: Items In This Order -->
              <div style="font-size: 11px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
                ITEMS IN THIS ORDER
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                ${itemsHtml}
              </table>

              <!-- Totals Breakdown Table -->
              <div style="background-color: #141417; border: 1px solid #202024; border-radius: 10px; padding: 18px 20px; margin-bottom: 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 4px 0; font-size: 12px; color: #8a8a93;">Subtotal</td>
                    <td align="right" style="padding: 4px 0; font-size: 12px; color: #ffffff;">
                      ${subtotalFormatted}
                    </td>
                  </tr>
                  ${discountRow}
                  <tr>
                    <td style="padding: 12px 0 0 0; border-top: 1px solid #242428; font-size: 14px; font-weight: 800; color: #ffffff; text-transform: uppercase;">
                      Total Paid
                    </td>
                    <td align="right" style="padding: 12px 0 0 0; border-top: 1px solid #242428; font-size: 16px; font-weight: 900; color: #ffffff;">
                      ${formattedTotal}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Primary CTA Button (High conversion white pill) -->
              <div style="text-align: center; margin-bottom: 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
                  <tr>
                    <td align="center" style="background-color: #ffffff; border-radius: 10px;">
                      <a href="${libraryUrl}" target="_blank" class="mobile-full-btn" style="display: inline-block; background-color: #ffffff; color: #0a0a0c; font-weight: 800; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; padding: 16px 36px; border-radius: 10px; text-decoration: none;">
                        Open My Library &amp; Download
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Verified Licensee / Billing Information -->
              <div style="background-color: #121215; border: 1px solid #1f1f23; border-radius: 10px; padding: 18px 20px;">
                <div style="font-size: 10px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">
                  VERIFIED BILLING &amp; LICENSEE INFORMATION
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                  ${params.customerName}
                </div>
                <div style="font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                  ${params.billingAddress.address}${params.billingAddress.address2 ? ', ' + params.billingAddress.address2 : ''}<br />
                  ${params.billingAddress.city}, ${params.billingAddress.state} ${params.billingAddress.zip}<br />
                  ${params.billingAddress.country}
                </div>
                <div style="margin-top: 10px; font-size: 11px; color: #71717a;">
                  ${params.customerPhone ? `Phone: <span style="color: #ffffff;">${params.customerPhone}</span> &bull; ` : ''}
                  Email: <span style="color: #ffffff;">${cleanEmail}</span>
                </div>
              </div>

            </td>
          </tr>

          <!-- ================= FOOTER SECTION ================= -->
          <tr>
            <td style="padding: 36px 32px 32px 32px; background-color: #0b0b0d; border-top: 1px solid #1c1c20; text-align: center;" class="mobile-p-20">
              
              <!-- ProducerToy 3D Charcoal Logo (Bottom Centered, Drag Off) -->
              <div style="margin-bottom: 16px;">
                <a href="${siteUrl}" target="_blank" draggable="false" style="text-decoration: none; display: inline-block; border: none; outline: none;">
                  <img
                    src="${PRODUCER_TOY_LOGO_URL}"
                    alt="Producer Toy"
                    width="168"
                    height="59"
                    draggable="false"
                    style="display: block; margin: 0 auto; border: none; outline: none; -webkit-user-drag: none; user-select: none;"
                  />
                </a>
              </div>

              <!-- Minimal Separation Line Underneath Logo -->
              <div style="width: 48px; height: 1px; background-color: #242428; margin: 0 auto 18px auto;"></div>

              <!-- Looking for help? support@producertoy.com -->
              <div style="margin-bottom: 22px;">
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 6px;">
                      <img src="https://img.icons8.com/ios-filled/50/a1a1aa/mail.png" width="14" height="14" alt="Email" draggable="false" style="display: block; -webkit-user-drag: none;" />
                    </td>
                    <td style="vertical-align: middle;">
                      <span style="color: #71717a; font-size: 12px; margin-right: 4px;">Looking for help?</span>
                      <a href="mailto:support@producertoy.com" style="color: #a1a1aa; text-decoration: none; font-size: 12px; font-weight: 600;">
                        support@producertoy.com
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Social Media Links (Instagram, YouTube, Website) -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 24px auto;">
                <tr>
                  <td align="center" style="padding: 0 10px;">
                    <a href="https://instagram.com/producertoy" target="_blank" draggable="false" style="text-decoration: none; display: inline-block;">
                      <img
                        src="https://img.icons8.com/?size=100&id=32292&format=png&color=71717a"
                        width="20"
                        height="20"
                        alt="Instagram"
                        draggable="false"
                        style="display: block; width: 20px; height: 20px; border: 0; outline: none; -webkit-user-drag: none;"
                      />
                    </a>
                  </td>
                  <td align="center" style="padding: 0 10px;">
                    <a href="https://youtube.com/@producertoy" target="_blank" draggable="false" style="text-decoration: none; display: inline-block;">
                      <img
                        src="https://img.icons8.com/?size=100&id=37325&format=png&color=71717a"
                        width="20"
                        height="20"
                        alt="YouTube"
                        draggable="false"
                        style="display: block; width: 20px; height: 20px; border: 0; outline: none; -webkit-user-drag: none;"
                      />
                    </a>
                  </td>
                  <td align="center" style="padding: 0 10px;">
                    <a href="${siteUrl}" target="_blank" draggable="false" style="text-decoration: none; display: inline-block;">
                      <img
                        src="https://img.icons8.com/?size=100&id=3685&format=png&color=71717a"
                        width="20"
                        height="20"
                        alt="Producer Toy Website"
                        draggable="false"
                        style="display: block; width: 20px; height: 20px; border: 0; outline: none; -webkit-user-drag: none;"
                      />
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Copyright Only -->
              <div style="font-size: 11px; color: #52525b; line-height: 1.6;">
                &copy; ${new Date().getFullYear()} Producer Toy. All rights reserved.
              </div>

              <!-- Unique ID to prevent Gmail thread collapsing -->
              <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; color: #050505;">
                Order Ref: ${params.orderNumber}-${Date.now()}
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`

    const requestPayload: any = {
      from: fromAddress,
      to: [cleanEmail],
      subject,
      html: htmlContent,
    }

    // Attach PDF Invoice if successfully generated
    if (pdfBuffer) {
      requestPayload.attachments = [
        {
          filename: `ProducerToy-Invoice-${params.orderNumber}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ]
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      console.warn('[ORDER_INVOICE_EMAIL] Resend returned non-200 with fromAddress:', fromAddress, data)
      return { success: false, error: data.message || 'Failed to dispatch email' }
    }

    console.log('[ORDER_INVOICE_EMAIL] Email successfully dispatched. ID:', data.id)
    return { success: true, messageId: data.id }
  } catch (err: any) {
    console.error('[ORDER_INVOICE_EMAIL] Error dispatching order invoice:', err)
    return { success: false, error: err.message || 'Internal invoice email error' }
  }
}
