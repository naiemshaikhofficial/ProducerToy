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
 * Generates an official, luxury monochrome ProducerToy Order Invoice & Receipt PDF.
 * Returns a Buffer of the generated PDF.
 */
export async function generateInvoicePDF(params: GenerateInvoicePdfParams): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // Standard A4 dimensions (points)
  const { width, height } = page.getSize()

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold)

  const curSymbol = params.currency === 'INR' ? 'INR ' : '$'
  const isFree = params.totalAmount <= 0
  const formattedTotal = isFree ? 'FREE ($0.00)' : `${curSymbol}${params.totalAmount.toFixed(2)}`

  // 1. Top Accent Bar (Dark Charcoal)
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: rgb(0.12, 0.12, 0.14),
  })

  // 2. Embed ProducerToy Logo
  let logoDrawn = false
  try {
    const logoRes = await fetch(PRODUCER_TOY_LOGO_URL)
    if (logoRes.ok) {
      const logoBytes = await logoRes.arrayBuffer()
      const logoImg = await pdfDoc.embedPng(logoBytes)
      const logoDims = logoImg.scale(0.18)

      // Dark Box behind logo
      page.drawRectangle({
        x: 45,
        y: height - 76,
        width: 150,
        height: 52,
        color: rgb(0.08, 0.08, 0.09),
      })

      page.drawImage(logoImg, {
        x: 45 + (150 - logoDims.width) / 2,
        y: height - 76 + (52 - logoDims.height) / 2,
        width: logoDims.width,
        height: logoDims.height,
      })
      logoDrawn = true
    }
  } catch (e) {
    // Fallback text
  }

  if (!logoDrawn) {
    page.drawText('PRODUCER TOY', {
      x: 45,
      y: height - 55,
      size: 20,
      font: fontBold,
      color: rgb(0.08, 0.08, 0.09),
    })
  }

  // 3. Invoice Header Title & Meta (Right Aligned)
  page.drawText('OFFICIAL INVOICE', {
    x: width - 210,
    y: height - 48,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.12),
  })
  page.drawText('DIGITAL ASSETS & LICENSES', {
    x: width - 210,
    y: height - 62,
    size: 8,
    font: fontBold,
    color: rgb(0.45, 0.45, 0.48),
  })

  page.drawText(`ORDER #: ${params.orderNumber}`, {
    x: width - 210,
    y: height - 78,
    size: 9,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.12),
  })

  const formattedDate = new Date(params.orderDate || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  page.drawText(`DATE: ${formattedDate}`, {
    x: width - 210,
    y: height - 92,
    size: 9,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })

  // Horizontal Divider
  page.drawLine({
    start: { x: 45, y: height - 108 },
    end: { x: width - 45, y: height - 108 },
    thickness: 1,
    color: rgb(0.88, 0.88, 0.9),
  })

  // 4. Supplier & Bill To Details
  // Supplier (Left)
  page.drawText('ISSUED BY:', {
    x: 45,
    y: height - 128,
    size: 8,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.54),
  })
  page.drawText('PRODUCER TOY', {
    x: 45,
    y: height - 142,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.12),
  })
  page.drawText('Official Platform: producertoy.com', {
    x: 45,
    y: height - 156,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })
  page.drawText('Support: support@producertoy.com', {
    x: 45,
    y: height - 169,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })

  // Bill To (Right)
  page.drawText('BILL TO (LICENSEE):', {
    x: width - 230,
    y: height - 128,
    size: 8,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.54),
  })
  page.drawText(params.customerName.toUpperCase(), {
    x: width - 230,
    y: height - 142,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.12),
  })
  page.drawText(params.customerEmail.toLowerCase(), {
    x: width - 230,
    y: height - 156,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })

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
  let curAddrY = height - 169
  addrLines.slice(0, 2).forEach((l) => {
    page.drawText(l.trim(), {
      x: width - 230,
      y: curAddrY,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.42),
    })
    curAddrY -= 12
  })

  // 5. Items Table
  let tableTop = height - 215

  // Table Header Box
  page.drawRectangle({
    x: 45,
    y: tableTop,
    width: width - 90,
    height: 24,
    color: rgb(0.1, 0.1, 0.12),
  })
  page.drawText('DESCRIPTION / DIGITAL ITEM', {
    x: 55,
    y: tableTop + 7,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  })
  page.drawText('TYPE', {
    x: width - 210,
    y: tableTop + 7,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  })
  page.drawText('AMOUNT', {
    x: width - 105,
    y: tableTop + 7,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  let rowY = tableTop - 28
  for (const item of params.items) {
    const itemPrice =
      Number(item.price_usd || 0) <= 0 && Number(item.price_inr || 0) <= 0
        ? 'FREE'
        : params.currency === 'INR' && item.price_inr
        ? `INR ${Number(item.price_inr).toFixed(2)}`
        : `$${Number(item.price_usd).toFixed(2)}`

    const typeLabel =
      item.product_type === 'plugin'
        ? 'Audio Plugin'
        : item.product_type === 'sample_pack'
        ? 'Sample Pack'
        : 'Audio Asset'

    // Item Title
    page.drawText(item.name.slice(0, 48), {
      x: 55,
      y: rowY,
      size: 9.5,
      font: fontBold,
      color: rgb(0.12, 0.12, 0.14),
    })

    // Type
    page.drawText(typeLabel, {
      x: width - 210,
      y: rowY,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.45, 0.45, 0.48),
    })

    // Amount
    page.drawText(itemPrice, {
      x: width - 105,
      y: rowY,
      size: 9.5,
      font: fontBold,
      color: rgb(0.12, 0.12, 0.14),
    })

    // License Serial Key box inside PDF (Customer gets official proof of license in PDF)
    if (item.serial_key) {
      rowY -= 16
      page.drawRectangle({
        x: 55,
        y: rowY - 6,
        width: 320,
        height: 18,
        color: rgb(0.95, 0.95, 0.96),
        borderColor: rgb(0.85, 0.85, 0.88),
        borderWidth: 0.5,
      })
      page.drawText(`SERIAL: ${item.serial_key}`, {
        x: 62,
        y: rowY - 1,
        size: 8,
        font: fontMono,
        color: rgb(0.1, 0.1, 0.12),
      })
    }

    // Row divider
    rowY -= 16
    page.drawLine({
      start: { x: 45, y: rowY },
      end: { x: width - 45, y: rowY },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.92),
    })
    rowY -= 16
  }

  // 6. Summary Totals Box
  const summaryBoxY = rowY - 60
  page.drawRectangle({
    x: width - 240,
    y: summaryBoxY,
    width: 195,
    height: 70,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: rgb(0.88, 0.88, 0.9),
    borderWidth: 1,
  })

  page.drawText('Subtotal:', {
    x: width - 225,
    y: summaryBoxY + 50,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.44),
  })
  page.drawText(params.subtotal <= 0 ? '$0.00' : `${curSymbol}${params.subtotal.toFixed(2)}`, {
    x: width - 105,
    y: summaryBoxY + 50,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.22),
  })

  if (params.discount > 0) {
    page.drawText('Discount:', {
      x: width - 225,
      y: summaryBoxY + 35,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.44),
    })
    page.drawText(`-${curSymbol}${params.discount.toFixed(2)}`, {
      x: width - 105,
      y: summaryBoxY + 35,
      size: 8.5,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.18),
    })
  }

  // Total line
  page.drawLine({
    start: { x: width - 230, y: summaryBoxY + 26 },
    end: { x: width - 55, y: summaryBoxY + 26 },
    thickness: 0.5,
    color: rgb(0.82, 0.82, 0.85),
  })

  page.drawText('TOTAL PAID:', {
    x: width - 225,
    y: summaryBoxY + 10,
    size: 9.5,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })
  page.drawText(formattedTotal, {
    x: width - 115,
    y: summaryBoxY + 10,
    size: 10,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })

  // 7. Official Stamp & Terms (Bottom)
  page.drawText('VERIFICATION & LICENSE TERMS', {
    x: 45,
    y: 110,
    size: 8.5,
    font: fontBold,
    color: rgb(0.3, 0.3, 0.32),
  })
  page.drawText('1. Digital assets purchased or claimed on ProducerToy include 100% royalty-free commercial licenses.', {
    x: 45,
    y: 96,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.48),
  })
  page.drawText('2. Download your installers, WAV sample packs, and offline license (.ptlic) files anytime in your Library: producertoy.com/library', {
    x: 45,
    y: 84,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.48),
  })
  page.drawText('3. This document acts as your official bill of supply and ownership proof for commercial music production.', {
    x: 45,
    y: 72,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.48),
  })

  // Footer bar
  page.drawLine({
    start: { x: 45, y: 55 },
    end: { x: width - 45, y: 55 },
    thickness: 1,
    color: rgb(0.88, 0.88, 0.9),
  })

  page.drawText(`(c) ${new Date().getFullYear()} PRODUCER TOY - ALL RIGHTS RESERVED`, {
    x: 45,
    y: 40,
    size: 7.5,
    font: fontBold,
    color: rgb(0.45, 0.45, 0.48),
  })
  page.drawText('producertoy.com • support@producertoy.com', {
    x: width - 210,
    y: 40,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.48),
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
