'use client'

import React, { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import {
  createPayPalOrderAction,
  capturePayPalOrderAction,
} from '@/actions/checkoutActions'

interface PayPalPaymentButtonProps {
  finalTotalUsd: number
  items: any[]
  couponCode: string
  userId: string
  billingDetails: any
  applyRewards?: boolean
  rewardAmountUsed?: number
  sellerDataSharingConsentGiven?: boolean
  requiresConsent?: boolean
  onSuccess: (orderNumber: string) => void
  onError: (errorMsg: string) => void
  onProcessing: () => void
}

export function PayPalPaymentButton({
  items,
  couponCode,
  userId,
  billingDetails,
  applyRewards,
  rewardAmountUsed,
  sellerDataSharingConsentGiven,
  requiresConsent,
  onSuccess,
  onError,
  onProcessing,
}: PayPalPaymentButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test'
  const [isSdkReady, setIsSdkReady] = useState(false)

  return (
    <div className="w-full space-y-2 pt-1">
      <PayPalScriptProvider
        options={{
          clientId: clientId,
          currency: 'USD',
          intent: 'capture',
          components: 'buttons',
        }}
      >
        <div className="w-full min-h-[45px] paypal-button-container">
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'white',
              shape: 'rect',
              label: 'pay',
              height: 44,
              tagline: false,
            }}
            createOrder={async () => {
              if (requiresConsent && !sellerDataSharingConsentGiven) {
                onError('Please review and accept the Seller Data Sharing Notice before proceeding.')
                throw new Error('Seller data sharing consent required.')
              }
              onProcessing()
              try {
                const res = await createPayPalOrderAction(
                  items.map((i) => ({
                    id: i.id,
                    name: i.name,
                    slug: i.slug,
                    price_usd: i.price_usd,
                    price_inr: i.price_inr,
                    product_type: i.product_type,
                    is_gift: Boolean(i.is_gift),
                    gift_recipient_email: i.gift_recipient_email || '',
                    gift_message: i.gift_message || '',
                    gift_send_date: i.gift_send_date || '',
                  })),
                  couponCode,
                  {
                    applyRewards: Boolean(applyRewards),
                    rewardAmountUsed: Number(rewardAmountUsed || 0),
                  }
                )

                if (!res.success || !res.orderId) {
                  throw new Error(res.error || 'Failed to create PayPal order')
                }
                return res.orderId
              } catch (err: any) {
                onError(err.message || 'Failed to create PayPal order')
                throw err
              }
            }}
            onApprove={async (data) => {
              onProcessing()
              try {
                const captureRes = await capturePayPalOrderAction({
                  orderId: data.orderID,
                  items: items.map((i) => ({
                    id: i.id,
                    name: i.name,
                    slug: i.slug,
                    price_usd: i.price_usd,
                    price_inr: i.price_inr,
                    product_type: i.product_type,
                    is_gift: Boolean(i.is_gift),
                    gift_recipient_email: i.gift_recipient_email || '',
                    gift_message: i.gift_message || '',
                    gift_send_date: i.gift_send_date || '',
                  })),
                  userId: userId,
                  billingDetails: billingDetails,
                  couponCode: couponCode,
                  applyRewards: Boolean(applyRewards),
                  rewardAmountUsed: Number(rewardAmountUsed || 0),
                  sellerDataSharingConsentGiven: Boolean(sellerDataSharingConsentGiven),
                })

                if (captureRes.success) {
                  onSuccess(captureRes.orderNumber || data.orderID)
                } else {
                  onError(captureRes.error || 'Payment capture failed')
                }
              } catch (err: any) {
                onError(err.message || 'PayPal capture error')
              }
            }}
            onError={(err: any) => {
              console.error('PayPal Buttons Error:', err)
              onError('PayPal encountered an error. Please try again.')
            }}
            onCancel={() => {
              onError('Payment was cancelled.')
            }}
          />
        </div>
      </PayPalScriptProvider>
    </div>
  )
}
