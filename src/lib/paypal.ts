const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || ''

// Check if production or sandbox based on client ID prefix
const isLive = !PAYPAL_CLIENT_ID.startsWith('sb-') && !PAYPAL_CLIENT_ID.includes('sandbox')
const PAYPAL_BASE_URL = isLive
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to generate PayPal access token: ${errorText}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function createPayPalOrderOnServer(amountUsd: number, description: string) {
  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: description || 'ProducerToy Digital Software License',
          amount: {
            currency_code: 'USD',
            value: amountUsd.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'ProducerToy',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PayPal create order failed: ${errorText}`)
  }

  return response.json()
}

export async function capturePayPalOrderOnServer(orderId: string) {
  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PayPal capture order failed: ${errorText}`)
  }

  return response.json()
}
