/**
 * Rules for Coming Soon & Unreleased Products
 */
export interface ComingSoonRuleContext {
  candidateProduct?: {
    name: string
    is_coming_soon?: boolean
    price_usd?: number
  } | null
}

export function getComingSoonRules(ctx: ComingSoonRuleContext): string {
  return `CRITICAL RULES FOR COMING SOON / UNRELEASED PRODUCTS:
1. STORE STATUS FOR UNRELEASED PACKS:
   - Products marked as COMING SOON (such as "Tabla Master's" and "Sexy Drill") are currently in final studio mastering.
   - They CANNOT be purchased yet; checkout and buy buttons have NEVER been opened for them.
   
2. HANDLING PURCHASE CLAIMS FOR COMING SOON PACKS:
   - If a user claims: "i have purchase sexy drill", "i bought tabla master", or asks why they can't download an unreleased pack:
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
