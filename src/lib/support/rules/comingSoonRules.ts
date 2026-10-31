/**
 * Rules for Coming Soon & Unreleased Products
 */
export interface ComingSoonRuleContext {
  candidateProduct?: {
    name: string
    is_coming_soon?: boolean
    price_usd?: number
  } | null
  comingSoonProducts?: Array<{
    name: string
    price_usd?: number
    release_date?: string | null
  }>
}

export function getComingSoonRules(ctx: ComingSoonRuleContext): string {
  const dynamicComingSoonList =
    ctx.comingSoonProducts && ctx.comingSoonProducts.length > 0
      ? ctx.comingSoonProducts.map((p) => `"${p.name}"`).join(', ')
      : ctx.candidateProduct?.is_coming_soon
      ? `"${ctx.candidateProduct.name}"`
      : 'unreleased sound libraries'

  return `CRITICAL RULES FOR COMING SOON / UNRELEASED PRODUCTS:
1. STORE STATUS FOR UNRELEASED PACKS:
   - Products marked as COMING SOON in our database (${dynamicComingSoonList}) are currently in final studio mastering.
   - They CANNOT be purchased yet; checkout and buy buttons have NEVER been opened for them.
   
2. HANDLING PURCHASE CLAIMS FOR COMING SOON PACKS:
   - If a user claims they bought or asks why they cannot download an unreleased pack (${dynamicComingSoonList}):
     * State clearly, politely, and respectfully that "${ctx.candidateProduct?.name || 'this pack'}" has NOT officially launched yet!
     * It is currently in final audio mastering and was never available for checkout.
     * Therefore, no purchase exists in the system for this pack.
     * NEVER hallucinate or claim "I have verified your purchase of ${ctx.candidateProduct?.name || 'this pack'}"!
     * Inform them that a "Drop Alert / Notify Me" card has been provided so they can be first in line when it drops.

3. INR PRICING FOR COMING SOON PACKS:
   - If user asks about the price in INR (e.g. "kitna price hoga", "indian rupees me kitna hoga"):
     * Calculate approx INR at ~₹85-87/USD.
     * Reiterate that checkout will open upon official drop date.`
}
