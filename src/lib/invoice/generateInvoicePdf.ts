import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export interface InvoicePdfItem {
  name: string
  product_type?: string
  price_usd: number
  price_inr?: number
  serial_key?: string | null
}

export interface GenerateInvoicePdfParams {
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
  items: InvoicePdfItem[]
  currency: string
  subtotal: number
  discount: number
  totalAmount: number
  paymentMethod?: string
}

const PRODUCER_TOY_LOGO_URL = 'https://imagizer.imageshack.com/a/img922/171/nu2UgR.png'

/**
 * Generates an official, transparent-logo, highly protected ProducerToy Order Invoice & Receipt PDF.
 * Features comprehensive commercial license protections, anti-piracy terms, and full billing records.
 */
export async function generateInvoicePDF(params: GenerateInvoicePdfParams): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // Standard A4 (points)
  const { width, height } = page.getSize()

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const curSymbol = params.currency === 'INR' ? 'INR ' : '$'
  const isFree = params.totalAmount <= 0
  const formattedTotal = isFree ? 'FREE ($0.00)' : `${curSymbol}${params.totalAmount.toFixed(2)}`

  // 1. Top Minimal Accent Bar (Charcoal / Black)
  page.drawRectangle({
    x: 0,
    y: height - 4,
    width: width,
    height: 4,
    color: rgb(0.1, 0.1, 0.12),
  })

  // 2. Transparent Logo (NO black background box)
  let logoDrawn = false
  try {
    const logoRes = await fetch(PRODUCER_TOY_LOGO_URL)
    if (logoRes.ok) {
      const logoBytes = await logoRes.arrayBuffer()
      const logoImg = await pdfDoc.embedPng(logoBytes)
      
      // Scale transparent logo naturally
      const logoDims = logoImg.scale(0.19)
      page.drawImage(logoImg, {
        x: 45,
        y: height - 72,
        width: logoDims.width,
        height: logoDims.height,
      })
      logoDrawn = true
    }
  } catch (e) {
    // Fallback if network issue
  }

  if (!logoDrawn) {
    page.drawText('PRODUCER TOY', {
      x: 45,
      y: height - 55,
      size: 20,
      font: fontBold,
      color: rgb(0.08, 0.08, 0.1),
    })
  }

  // 3. Invoice Header Title & Meta (Right Aligned)
  page.drawText('OFFICIAL INVOICE', {
    x: width - 215,
    y: height - 46,
    size: 16,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })
  page.drawText('COMMERCIAL BILL OF SUPPLY', {
    x: width - 215,
    y: height - 59,
    size: 8,
    font: fontBold,
    color: rgb(0.48, 0.48, 0.52),
  })

  page.drawText(`ORDER #: ${params.orderNumber}`, {
    x: width - 215,
    y: height - 74,
    size: 9,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })

  const formattedDate = new Date(params.orderDate || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  page.drawText(`DATE: ${formattedDate}`, {
    x: width - 215,
    y: height - 88,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })

  // Horizontal Header Divider
  page.drawLine({
    start: { x: 45, y: height - 98 },
    end: { x: width - 45, y: height - 98 },
    thickness: 0.75,
    color: rgb(0.85, 0.85, 0.88),
  })

  // 4. Supplier & Bill To Details
  // Supplier (Left)
  page.drawText('ISSUED BY:', {
    x: 45,
    y: height - 116,
    size: 8,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.54),
  })
  page.drawText('PRODUCER TOY', {
    x: 45,
    y: height - 129,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })
  page.drawText('Official Platform: producertoy.com', {
    x: 45,
    y: height - 142,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })
  page.drawText('Support: support@producertoy.com', {
    x: 45,
    y: height - 154,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })

  // Bill To (Right - Full Customer Billing Records)
  page.drawText('BILL TO (VERIFIED LICENSEE):', {
    x: width - 240,
    y: height - 116,
    size: 8,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.54),
  })
  page.drawText(params.customerName.toUpperCase(), {
    x: width - 240,
    y: height - 129,
    size: 10,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })
  page.drawText(params.customerEmail.toLowerCase(), {
    x: width - 240,
    y: height - 142,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })

  if (params.customerPhone) {
    page.drawText(`Phone: ${params.customerPhone}`, {
      x: width - 240,
      y: height - 154,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.35, 0.35, 0.38),
    })
  }

  const addrString = [
    params.billingAddress.address,
    params.billingAddress.city,
    params.billingAddress.state,
    params.billingAddress.zip,
    params.billingAddress.country,
  ]
    .filter(Boolean)
    .join(', ')
  const addrLines = addrString.match(/.{1,36}(\s|$)/g) || [addrString]
  let curAddrY = params.customerPhone ? height - 166 : height - 154
  addrLines.slice(0, 2).forEach((l) => {
    page.drawText(l.trim(), {
      x: width - 240,
      y: curAddrY,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.42),
    })
    curAddrY -= 11
  })

  // 5. Items Table (NO License Key in Invoice - cleanly formatted)
  const tableTop = height - 200

  // Table Header Bar (Black)
  page.drawRectangle({
    x: 45,
    y: tableTop,
    width: width - 90,
    height: 22,
    color: rgb(0.08, 0.08, 0.1),
  })
  page.drawText('DIGITAL ITEM & SPECIFICATION', {
    x: 55,
    y: tableTop + 6,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  })
  page.drawText('DELIVERY & LICENSE', {
    x: width - 215,
    y: tableTop + 6,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  })
  page.drawText('AMOUNT', {
    x: width - 100,
    y: tableTop + 6,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  let rowY = tableTop - 24
  for (const item of params.items) {
    const itemPrice =
      Number(item.price_usd || 0) <= 0 && Number(item.price_inr || 0) <= 0
        ? 'FREE'
        : params.currency === 'INR' && item.price_inr
        ? `INR ${Number(item.price_inr).toFixed(2)}`
        : `$${Number(item.price_usd).toFixed(2)}`

    const typeLabel =
      item.product_type === 'plugin'
        ? 'Audio Plugin • VST3/AU/AAX'
        : item.product_type === 'sample_pack'
        ? 'Sample Pack • 24-Bit WAV'
        : 'Digital Audio Asset'

    // Item Title (clean text, no serial key)
    page.drawText(item.name.slice(0, 48), {
      x: 55,
      y: rowY,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.12),
    })

    // Type & License
    page.drawText(typeLabel, {
      x: width - 215,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.44),
    })

    // Amount
    page.drawText(itemPrice, {
      x: width - 100,
      y: rowY,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.12),
    })

    // Bottom row separator
    rowY -= 14
    page.drawLine({
      start: { x: 45, y: rowY },
      end: { x: width - 45, y: rowY },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.92),
    })
    rowY -= 16
  }

  // 6. Summary Totals Box
  const summaryBoxY = rowY - 50
  page.drawRectangle({
    x: width - 240,
    y: summaryBoxY,
    width: 195,
    height: 56,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.88, 0.88, 0.9),
    borderWidth: 0.75,
  })

  page.drawText('Subtotal:', {
    x: width - 225,
    y: summaryBoxY + 38,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.44),
  })
  page.drawText(params.subtotal <= 0 ? '$0.00' : `${curSymbol}${params.subtotal.toFixed(2)}`, {
    x: width - 105,
    y: summaryBoxY + 38,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.22),
  })

  if (params.discount > 0) {
    page.drawText('Discount:', {
      x: width - 225,
      y: summaryBoxY + 25,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.44),
    })
    page.drawText(`-${curSymbol}${params.discount.toFixed(2)}`, {
      x: width - 105,
      y: summaryBoxY + 25,
      size: 8.5,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.18),
    })
  }

  // Line before total
  page.drawLine({
    start: { x: width - 230, y: summaryBoxY + 20 },
    end: { x: width - 55, y: summaryBoxY + 20 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.88),
  })

  page.drawText('TOTAL PAID:', {
    x: width - 225,
    y: summaryBoxY + 8,
    size: 9,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })
  page.drawText(formattedTotal, {
    x: width - 115,
    y: summaryBoxY + 8,
    size: 9.5,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })

  // 7. COMPREHENSIVE LEGAL & BRAND PROTECTION TERMS (Extensive Protection)
  const legalTop = summaryBoxY - 26
  page.drawText('COMPREHENSIVE COMMERCIAL LICENSE & LEGAL PROVISIONS', {
    x: 45,
    y: legalTop,
    size: 8,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.18),
  })

  const legalClauses = [
    '1. COMMERCIAL USAGE GRANT: Subject to terms, ProducerToy grants the verified licensee a perpetual, worldwide, non-exclusive commercial license to synchronize, perform, and broadcast musical compositions and master recordings containing these digital assets without paying additional royalties.',
    '2. ZERO-TOLERANCE ANTI-PIRACY & REDISTRIBUTION BAN: Licensee shall NOT copy, resell, redistribute, sub-license, rent, share, or upload these digital assets, sample packs, software installers, or license data to any public or private server, file-sharing network, or cloud repository. Re-packaging in competing sound libraries, AI models, or VST plugins is strictly prohibited.',
    '3. FINAL SALE & DIGITAL CONSUMPTION POLICY: Pursuant to International Digital Consumer Regulations, digital downloads and software seat authorizations are deemed fully consumed upon order completion. All digital orders and claims are non-refundable and non-exchangeable once digital access is granted.',
    '4. INTELLECTUAL PROPERTY INDEMNITY: All intellectual property rights, trademarks, algorithms, audio samples, and software codes remain the exclusive property of Producer Toy and its authorized creators. Licensee acquires an operational end-user license only, not ownership of the underlying assets.',
    '5. LICENSE ACCESS & AUTHENTICATION: License keys, software pairing, and offline machine license (.ptlic) authorization files are strictly managed inside the licensee\'s authenticated ProducerToy Library at producertoy.com/library. This invoice serves as formal proof of lawful acquisition.',
    '6. DISCLAIMER OF CONSEQUENTIAL DAMAGES: Digital software and sound assets are provided "AS-IS". Producer Toy disclaims liability for any loss of recorded data, studio downtime, or incidental damages arising out of software usage across digital audio workstations (DAWs).',
  ]

  let curLegalY = legalTop - 14
  for (const clause of legalClauses) {
    const wrapped = clause.match(/.{1,118}(\s|$)/g) || [clause]
    for (const line of wrapped) {
      page.drawText(line.trim(), {
        x: 45,
        y: curLegalY,
        size: 6.8,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.38),
      })
      curLegalY -= 9.5
    }
    curLegalY -= 3.5
  }

  // 8. Footer Line & Copyright
  page.drawLine({
    start: { x: 45, y: 38 },
    end: { x: width - 45, y: 38 },
    thickness: 0.75,
    color: rgb(0.85, 0.85, 0.88),
  })

  page.drawText(`(c) ${new Date().getFullYear()} PRODUCER TOY - ALL RIGHTS RESERVED`, {
    x: 45,
    y: 26,
    size: 7.5,
    font: fontBold,
    color: rgb(0.45, 0.45, 0.48),
  })
  page.drawText('Official Portal: producertoy.com • Support: support@producertoy.com', {
    x: width - 275,
    y: 26,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.48),
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
