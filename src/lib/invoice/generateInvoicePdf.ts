import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib'

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

function wrapText(text: string, font: any, size: number, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const w = font.widthOfTextAtSize(testLine, size)
    if (w <= maxW) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

const LEGAL_CLAUSES = [
  '1. COMMERCIAL USAGE GRANT: ProducerToy grants the verified licensee a perpetual, worldwide, non-exclusive commercial license to synchronize and utilize these digital assets in musical works, master recordings, broadcast, film, streaming, and commercial productions without additional royalties.',
  '2. ZERO-TOLERANCE ANTI-PIRACY & REDISTRIBUTION BAN: Licensee shall NOT resell, lease, sublicense, distribute, or upload these digital assets, sample packs, installers, or presets to any public or private server, file-sharing network, or cloud repository. Re-packaging into competing sound libraries is strictly prohibited.',
  '3. FINAL SALE & DIGITAL CONSUMPTION POLICY: Pursuant to International Digital Consumer Regulations, digital downloads and license seat authorizations are deemed fully consumed upon order completion. All digital orders are non-refundable and non-exchangeable once access is granted.',
  '4. INTELLECTUAL PROPERTY INDEMNITY: All intellectual property rights, trademarks, algorithms, audio samples, and software codes remain the exclusive property of Producer Toy and its respective creators. Licensee acquires an operational end-user license only.',
  '5. LICENSE ACCESS & AUTHENTICATION: License keys, software pairing, and offline machine license (.ptlic) files are strictly managed inside the licensee\'s authenticated ProducerToy Library at producertoy.com/library. This invoice serves as formal proof of lawful acquisition.',
  '6. DISCLAIMER OF CONSEQUENTIAL DAMAGES: Digital software and sound assets are provided "AS-IS". Producer Toy disclaims liability for any loss of recorded data, studio downtime, or incidental damages arising out of software usage across digital audio workstations (DAWs).',
]

function getLegalBlockHeight(fontRegular: any, maxWidth: number): number {
  let linesCount = 0
  for (const clause of LEGAL_CLAUSES) {
    const lines = wrapText(clause, fontRegular, 6.2, maxWidth)
    linesCount += lines.length
  }
  // Title (7.5pt) + Header gap (11pt) + lines (8.5pt each) + clause gaps (5 * 3pt)
  return 11 + linesCount * 8.5 + (LEGAL_CLAUSES.length - 1) * 3
}

/**
 * Draws the legal terms block anchored safely above the footer.
 */
function drawLegalTermsBlock(
  page: PDFPage,
  fontBold: any,
  fontRegular: any,
  startY: number,
  maxWidth: number
) {
  page.drawText('COMPREHENSIVE COMMERCIAL LICENSE & LEGAL PROVISIONS', {
    x: 45,
    y: startY,
    size: 7.5,
    font: fontBold,
    color: rgb(0.18, 0.18, 0.22),
  })

  let curLegalY = startY - 11
  for (const clause of LEGAL_CLAUSES) {
    const lines = wrapText(clause, fontRegular, 6.2, maxWidth)
    for (const line of lines) {
      page.drawText(line, {
        x: 45,
        y: curLegalY,
        size: 6.2,
        font: fontRegular,
        color: rgb(0.38, 0.38, 0.42),
      })
      curLegalY -= 8.5
    }
    curLegalY -= 3
  }
}

/**
 * Draws the page footer line and copyright.
 */
function drawPageFooter(
  page: PDFPage,
  fontBold: any,
  fontRegular: any,
  pageNumber: number,
  totalPages: number,
  width: number
) {
  page.drawLine({
    start: { x: 45, y: 40 },
    end: { x: width - 45, y: 40 },
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

  const pageStr = totalPages > 1 ? ` • Page ${pageNumber} of ${totalPages}` : ''
  page.drawText(`producertoy.com • support@producertoy.com${pageStr}`, {
    x: width - (totalPages > 1 ? 255 : 205),
    y: 26,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.48),
  })
}

/**
 * Generates an official, transparent-logo ProducerToy Order Invoice PDF.
 * Eliminates spacing overlap, anchors legal terms to the bottom, and dynamically supports Page 2 for big purchases.
 */
export async function generateInvoicePDF(params: GenerateInvoicePdfParams): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page1 = pdfDoc.addPage([595.28, 841.89]) // Standard A4 (points)
  const { width, height } = page1.getSize()

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const curSymbol = params.currency === 'INR' ? 'INR ' : '$'
  const isFree = params.totalAmount <= 0
  const formattedTotal = isFree ? 'FREE ($0.00)' : `${curSymbol}${params.totalAmount.toFixed(2)}`

  // Top Minimal Accent Bar
  page1.drawRectangle({
    x: 0,
    y: height - 4,
    width: width,
    height: 4,
    color: rgb(0.1, 0.1, 0.12),
  })

  // 1. Transparent ProducerToy Logo (NO black background box)
  let logoDrawn = false
  try {
    const logoRes = await fetch(PRODUCER_TOY_LOGO_URL)
    if (logoRes.ok) {
      const logoBytes = await logoRes.arrayBuffer()
      const logoImg = await pdfDoc.embedPng(logoBytes)
      const logoDims = logoImg.scale(0.19)
      page1.drawImage(logoImg, {
        x: 45,
        y: height - 72,
        width: logoDims.width,
        height: logoDims.height,
      })
      logoDrawn = true
    }
  } catch (e) {
    // Fallback if logo download fails
  }

  if (!logoDrawn) {
    page1.drawText('PRODUCER TOY', {
      x: 45,
      y: height - 55,
      size: 20,
      font: fontBold,
      color: rgb(0.08, 0.08, 0.1),
    })
  }

  // 2. Invoice Header Title & Meta (Right Aligned)
  page1.drawText('OFFICIAL INVOICE', {
    x: width - 215,
    y: height - 46,
    size: 16,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })
  page1.drawText('COMMERCIAL BILL OF SUPPLY', {
    x: width - 215,
    y: height - 59,
    size: 8,
    font: fontBold,
    color: rgb(0.48, 0.48, 0.52),
  })

  page1.drawText(`ORDER #: ${params.orderNumber}`, {
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
  page1.drawText(`DATE: ${formattedDate}`, {
    x: width - 215,
    y: height - 88,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })

  // Horizontal Header Divider
  page1.drawLine({
    start: { x: 45, y: height - 98 },
    end: { x: width - 45, y: height - 98 },
    thickness: 0.75,
    color: rgb(0.85, 0.85, 0.88),
  })

  // 3. Supplier & Bill To Details
  // Supplier (Left)
  page1.drawText('ISSUED BY:', {
    x: 45,
    y: height - 116,
    size: 8,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.54),
  })
  page1.drawText('PRODUCER TOY', {
    x: 45,
    y: height - 129,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })
  page1.drawText('Official Platform: producertoy.com', {
    x: 45,
    y: height - 142,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })
  page1.drawText('Support: support@producertoy.com', {
    x: 45,
    y: height - 154,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })

  // Bill To (Right - Full Customer Billing Records)
  page1.drawText('BILL TO (VERIFIED LICENSEE):', {
    x: width - 240,
    y: height - 116,
    size: 8,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.54),
  })
  page1.drawText(params.customerName.toUpperCase(), {
    x: width - 240,
    y: height - 129,
    size: 10,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })
  page1.drawText(params.customerEmail.toLowerCase(), {
    x: width - 240,
    y: height - 142,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.35, 0.38),
  })

  let curAddrY = height - 154
  if (params.customerPhone) {
    page1.drawText(`Phone: ${params.customerPhone}`, {
      x: width - 240,
      y: curAddrY,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.35, 0.35, 0.38),
    })
    curAddrY -= 12
  }

  const addrString = [
    params.billingAddress.address,
    params.billingAddress.address2,
    params.billingAddress.city,
    params.billingAddress.state,
    params.billingAddress.zip,
    params.billingAddress.country,
  ]
    .filter(Boolean)
    .join(', ')

  const addrLines = addrString.match(/.{1,36}(\s|$)/g) || [addrString]
  addrLines.slice(0, 3).forEach((l) => {
    page1.drawText(l.trim(), {
      x: width - 240,
      y: curAddrY,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.42),
    })
    curAddrY -= 11
  })

  // 4. Guaranteed Safe Spacing for Items Table (Prevents overlap / "chipak raha hai" fix)
  // Ensure at least 32 points between lowest address text and the table bar
  const safeTableStart = Math.min(height - 235, curAddrY - 26)
  const maxWidth = width - 90
  const legalBlockHeight = getLegalBlockHeight(fontRegular, maxWidth)
  // Ensure the lowest line of legal text finishes at y = 58 (18pt cleanly above footer line at y = 40)
  const safeLegalStartY = 58 + legalBlockHeight
  const summaryBoxHeight = 56
  // Minimum Y where items table can extend on Page 1 while leaving room for summary box + legal block
  const pageBottomLimit = safeLegalStartY + 24 + summaryBoxHeight

  // Function to draw table header on any page
  const drawTableHeader = (p: PDFPage, y: number) => {
    p.drawRectangle({
      x: 45,
      y,
      width: width - 90,
      height: 22,
      color: rgb(0.08, 0.08, 0.1),
    })
    p.drawText('DIGITAL ITEM & SPECIFICATION', {
      x: 55,
      y: y + 6,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    })
    p.drawText('DELIVERY & LICENSE', {
      x: width - 215,
      y: y + 6,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    })
    p.drawText('AMOUNT', {
      x: width - 100,
      y: y + 6,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    })
  }

  let activePage = page1
  let currentY = safeTableStart

  drawTableHeader(activePage, currentY)
  currentY -= 24

  let hasPage2 = false
  let page2: PDFPage | null = null

  // Function to switch to Page 2 cleanly if purchase is big
  const switchToPage2 = () => {
    hasPage2 = true
    page2 = pdfDoc.addPage([595.28, 841.89])
    
    // Top bar on page 2
    page2.drawRectangle({
      x: 0,
      y: height - 4,
      width: width,
      height: 4,
      color: rgb(0.1, 0.1, 0.12),
    })

    // Header on Page 2
    page2.drawText('PRODUCER TOY - OFFICIAL INVOICE (CONTINUED)', {
      x: 45,
      y: height - 45,
      size: 11,
      font: fontBold,
      color: rgb(0.08, 0.08, 0.1),
    })
    page2.drawText(`ORDER #: ${params.orderNumber}`, {
      x: width - 215,
      y: height - 45,
      size: 9,
      font: fontBold,
      color: rgb(0.35, 0.35, 0.38),
    })

    page2.drawLine({
      start: { x: 45, y: height - 58 },
      end: { x: width - 45, y: height - 58 },
      thickness: 0.75,
      color: rgb(0.85, 0.85, 0.88),
    })

    currentY = height - 90
    drawTableHeader(page2, currentY)
    currentY -= 24
    activePage = page2
  }

  // Draw Items
  for (const item of params.items) {
    // If not enough room for this item + summary box on Page 1, shift to Page 2
    if (!hasPage2 && currentY - 35 < pageBottomLimit) {
      switchToPage2()
    } else if (hasPage2 && currentY - 35 < 180) {
      // Very extreme order
      break
    }

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

    // Item Title
    activePage.drawText(item.name.slice(0, 48), {
      x: 55,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.12),
    })

    // Type
    activePage.drawText(typeLabel, {
      x: width - 215,
      y: currentY,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.44),
    })

    // Amount
    activePage.drawText(itemPrice, {
      x: width - 100,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.12),
    })

    currentY -= 14
    activePage.drawLine({
      start: { x: 45, y: currentY },
      end: { x: width - 45, y: currentY },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.92),
    })
    currentY -= 16
  }

  // Check if Summary Box fits on current page
  if (!hasPage2 && currentY - (summaryBoxHeight + 15) < pageBottomLimit) {
    switchToPage2()
  }

  // Draw Summary Totals Box
  const summaryBoxY = currentY - summaryBoxHeight
  activePage.drawRectangle({
    x: width - 240,
    y: summaryBoxY,
    width: 195,
    height: summaryBoxHeight,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.88, 0.88, 0.9),
    borderWidth: 0.75,
  })

  activePage.drawText('Subtotal:', {
    x: width - 225,
    y: summaryBoxY + 38,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.44),
  })
  activePage.drawText(params.subtotal <= 0 ? '$0.00' : `${curSymbol}${params.subtotal.toFixed(2)}`, {
    x: width - 105,
    y: summaryBoxY + 38,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.22),
  })

  if (params.discount > 0) {
    activePage.drawText('Discount:', {
      x: width - 225,
      y: summaryBoxY + 25,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.44),
    })
    activePage.drawText(`-${curSymbol}${params.discount.toFixed(2)}`, {
      x: width - 105,
      y: summaryBoxY + 25,
      size: 8.5,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.18),
    })
  }

  activePage.drawLine({
    start: { x: width - 230, y: summaryBoxY + 20 },
    end: { x: width - 55, y: summaryBoxY + 20 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.88),
  })

  activePage.drawText('TOTAL PAID:', {
    x: width - 225,
    y: summaryBoxY + 8,
    size: 9,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })
  activePage.drawText(formattedTotal, {
    x: width - 115,
    y: summaryBoxY + 8,
    size: 9.5,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.1),
  })

  // Determine which page receives the Legal Terms block
  // If order fits on Page 1 -> legal block anchored cleanly above footer on Page 1
  // If big order shifted to Page 2 -> legal block anchored cleanly above footer on Page 2
  const targetLegalPage = hasPage2 && page2 ? page2 : page1
  drawLegalTermsBlock(targetLegalPage, fontBold, fontRegular, safeLegalStartY, maxWidth)

  // Draw Footers on both pages
  const totalPages = hasPage2 ? 2 : 1
  drawPageFooter(page1, fontBold, fontRegular, 1, totalPages, width)
  if (hasPage2 && page2) {
    drawPageFooter(page2, fontBold, fontRegular, 2, totalPages, width)
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
