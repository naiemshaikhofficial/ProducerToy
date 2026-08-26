export interface BillingDetails {
  fullName: string
  email: string
  phone: string
  address: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
}

export type PaymentStatus = 'idle' | 'processing' | 'success'
