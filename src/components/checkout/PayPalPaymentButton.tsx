'use client'

import React, { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

interface PayPalPaymentButtonProps {
  finalTotalUsd: number
  items: any[]
  couponCode: string
  userId: string
  billingDetails: any
  applyRewards?: boolean
  rewardAmountUsed?: number
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
              onProcessing()
              try {
                const res = await fetch('/api/paypal/create-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    items: items.map((i) => ({ id: i.id })),
                    couponCode: couponCode,
                    applyRewards: Boolean(applyRewards),
                    rewardAmountUsed: Number(rewardAmountUsed || 0),
                  }),
                })

                const data = await res.json()
                if (data.error) throw new Error(data.error)
                return data.id
              } catch (err: any) {
                onError(err.message || 'Failed to create PayPal order')
                throw err
              }
            }}
            onApprove={async (data) => {
              onProcessing()
              try {
                const captureRes = await fetch('/api/paypal/capture-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: data.orderID,
                    items: items.map((i) => ({ id: i.id })),
                    userId: userId,
                    billingDetails: billingDetails,
                    couponCode: couponCode,
                    applyRewards: Boolean(applyRewards),
                    rewardAmountUsed: Number(rewardAmountUsed || 0),
                  }),
                })

                const captureData = await captureRes.json()
                if (captureData.success) {
                  onSuccess(captureData.orderNumber || data.orderID)
                } else {
                  onError(captureData.error || 'Payment capture failed')
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
