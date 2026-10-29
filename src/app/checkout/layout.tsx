import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Checkout | Producer Toy',
  description: 'Complete your order securely with instant digital delivery and verified license keys.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
