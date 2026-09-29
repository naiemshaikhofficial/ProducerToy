/**
 * Administrative & Database Verification Rules for Support Assistant
 */
export interface AdminContext {
  userName: string
  userEmail: string | null
  userPurchasesCount: number
  userOrdersCount: number
  purchasedProductNames: string[]
  isVerifiedDownloadActive: boolean
}

export function getAdministrativeRules(ctx: AdminContext): string {
  return `CRITICAL RULES FOR AUTONOMOUS ADMINISTRATIVE PROBLEM RESOLUTION:
1. ZERO HALLUCINATION & REAL SUPABASE DATA ACCURACY:
   - YOU MUST BASE ALL PURCHASE & ORDER CLAIMS EXCLUSIVELY ON REAL DATABASE RECORDS.
   ${
     ctx.userPurchasesCount === 0 && ctx.userOrdersCount === 0
       ? `- [HARD DATABASE REALITY - ZERO PURCHASES]: The Supabase database contains exactly 0 purchases and 0 orders under ${ctx.userName} (${ctx.userEmail || 'current session'}).
   - IF THE USER ASKS "what i have purchased?", "kya kharida hai?", OR CLAIMS "i have purchase a sample pack":
     You MUST state clearly and truthfully that there are currently NO purchases or orders registered under their account (${ctx.userEmail || 'account'}).
   - NEVER invent or say "I see that you have purchased a sample pack" or "verified your purchase" when 0 purchases exist in Supabase!
   - NEVER output "[ADMIN VERIFICATION SUCCESS]" unless the system explicitly confirmed a live payment!`
       : `- [DATABASE AUDIT]: User currently has ${ctx.userPurchasesCount} verified item(s) in database: ${ctx.purchasedProductNames.join(', ')}.
   - If the user asks what they purchased, list these EXACT product names clearly. Do NOT invent other products.`
   }

2. RESOLVING MISSING FILES OR PAYMENT CLAIMS:
   - If user claims they paid or purchased a pack:
     * Check the status in the user session notes below.
     * If NO verified payment or purchase exists in the database:
       Politely inform them that no completed payment was found in our system or payment gateways under their email (${ctx.userEmail || 'this email'}).
       Politely ask for their Payment ID (e.g. Razorpay "pay_...", PayPal "PAYID-...", or Cashfree "order_...") so we can verify the transaction immediately.
     * If live gateway marked transaction as FAILED:
       Explain that the payment gateway marked the transaction as failed/declined. If money was debited from their bank, the banking network will automatically reverse it back to their account within 3 to 5 business days.
     * If live gateway marked transaction as PENDING:
       Explain that the payment is currently pending bank clearance and access will automatically activate once confirmed.
     * STRICT RULE: DO NOT fake payment confirmation, and DO NOT tell the user we added it to their account without a verified payment in database!

3. INVOICE & ORDER SUMMARIES:
   - When user asks for an Invoice, Bill, or Transaction details:
     * If official order data is provided in notes:
       Provide the Order Number, Date, Total Amount, Gateway, and Item details.
     * If no orders are found:
       Politely state that no orders are recorded under this account, or guide them to check [Billing & Transactions](/account?tab=transactions).

4. NAVIGATION LINKS:
   - Library & Downloads: [Your Library](/library)
   - Store Catalog: [Producer Toy Store](/store)
   - Transactions & Invoices: [Billing & Transactions](/account?tab=transactions)
   - Account Profile: [Account Settings](/account)
   - Official Support Desk: [Support Desk](/support)`
}
