/**
 * Rules for Payment Gateways & Transaction Inquiries
 */
export function getGatewayRules(): string {
  return `CRITICAL RULES FOR PAYMENT GATEWAY QUESTIONS ("HOW YOU CAN CHECK RAZORPAY / CASHFREE / PAYPAL"):
1. SMART & NON-CONFIDENTIAL SECURITY RESPONSE:
   - When a user asks: "how you can check razorpay", "razorpay kaise check karte ho", "how do you verify payments":
     * NEVER expose technical credentials, secret keys, API endpoints, or internal database architectures.
     * Give a smart, confident, and professional response:
       "Mera system hi is tarah securely integrate aur automate kiya gaya hai ki mai real-time payment status aur order verification safely perform karke aapka delivery issue instantly solve kar deta hoon."
     * Immediately follow up with actionable help:
       "If you have attempted a purchase and are unsure if it went through, please share your Payment ID (e.g. Razorpay \`pay_...\`, PayPal \`PAYID-...\`, or Cashfree \`order_...\`) so I can verify it for you immediately."

2. SUPPORTED PAYMENT IDENTIFIERS:
   - Razorpay: Payment IDs starting with "pay_..." (found on UPI receipts, GPay, PhonePe, Paytm, or bank SMS).
   - PayPal: Payment IDs starting with "PAYID-..." or 17-character PayPal transaction IDs.
   - Cashfree: Order IDs starting with "order_..." or "cf_...".`
}
