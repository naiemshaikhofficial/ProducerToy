'use client'

import React, { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { BillingDetails } from './types'
import { CustomPhoneInput } from './CustomPhoneInput'
import { CustomCountrySelect } from './CustomCountrySelect'

interface CheckoutBillingFormProps {
  billingDetails: BillingDetails
  onBillingChange: (field: keyof BillingDetails, value: string) => void
  formErrors: Record<string, string>
  newsletterOptIn: boolean
  setNewsletterOptIn: (val: boolean) => void
  countryOptions: { value: string; label: string }[]
}

export function CheckoutBillingForm({
  billingDetails,
  onBillingChange,
  formErrors,
  newsletterOptIn,
  setNewsletterOptIn,
  countryOptions,
}: CheckoutBillingFormProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      id="billing-details-section"
      className="bg-[#141414] border border-[#222222] rounded-xl p-5 sm:p-6 space-y-5"
    >
      <div className="flex items-center justify-between border-b border-[#222222] pb-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
          Billing &amp; Delivery Information
        </h2>
        <span className="text-[10px] text-zinc-500 font-medium">
          Encrypted &amp; Secure
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-400">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Alex Producer"
            value={billingDetails.fullName}
            onChange={(e) => onBillingChange('fullName', e.target.value)}
            className={`w-full h-10 bg-[#161616] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] focus:border-zinc-400 ${
              formErrors.fullName ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626] hover:border-[#383838]'
            }`}
          />
          {formErrors.fullName && (
            <p className="text-[10px] text-red-400">{formErrors.fullName}</p>
          )}
        </div>

        {/* Delivery Email */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-400">
            Delivery Email
          </label>
          <input
            type="email"
            placeholder="producer@studio.com"
            value={billingDetails.email}
            onChange={(e) => onBillingChange('email', e.target.value)}
            className={`w-full h-10 bg-[#161616] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] focus:border-zinc-400 ${
              formErrors.email ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626] hover:border-[#383838]'
            }`}
          />
          {formErrors.email && (
            <p className="text-[10px] text-red-400">{formErrors.email}</p>
          )}
        </div>

        {/* Phone Number with Epic Games Dark Dropdown */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-medium text-zinc-400">
            Phone Number
          </label>
          <CustomPhoneInput
            value={billingDetails.phone || ''}
            onChange={(val) => onBillingChange('phone', val)}
            error={Boolean(formErrors.phone)}
            defaultCountryCode="IN"
          />
          {formErrors.phone && (
            <p className="text-[10px] text-red-400">{formErrors.phone}</p>
          )}
        </div>

        {/* Address Line 1 */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-medium text-zinc-400">
            Address Line 1 *
          </label>
          <input
            type="text"
            placeholder="Studio / House No, Street name"
            value={billingDetails.address}
            onChange={(e) => onBillingChange('address', e.target.value)}
            className={`w-full h-10 bg-[#161616] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] focus:border-zinc-400 ${
              formErrors.address ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626] hover:border-[#383838]'
            }`}
          />
          {formErrors.address && (
            <p className="text-[10px] text-red-400">{formErrors.address}</p>
          )}
        </div>

        {/* Address Line 2 (Optional) */}
        <div className="space-y-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-zinc-400">
              Address Line 2
            </label>
            <span className="text-[10px] text-zinc-500">Optional</span>
          </div>
          <input
            type="text"
            placeholder="Apartment, suite, unit, building, floor, etc."
            value={billingDetails.address2 || ''}
            onChange={(e) => onBillingChange('address2', e.target.value)}
            className="w-full h-10 bg-[#161616] border border-[#262626] hover:border-[#383838] focus:border-zinc-400 text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
          />
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-400">
            City
          </label>
          <input
            type="text"
            placeholder="City"
            value={billingDetails.city}
            onChange={(e) => onBillingChange('city', e.target.value)}
            className={`w-full h-10 bg-[#161616] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] focus:border-zinc-400 ${
              formErrors.city ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626] hover:border-[#383838]'
            }`}
          />
          {formErrors.city && (
            <p className="text-[10px] text-red-400">{formErrors.city}</p>
          )}
        </div>

        {/* State & Pincode */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400">
              State
            </label>
            <input
              type="text"
              placeholder="State"
              value={billingDetails.state}
              onChange={(e) => onBillingChange('state', e.target.value)}
              className={`w-full h-10 bg-[#161616] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] focus:border-zinc-400 ${
                formErrors.state ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626] hover:border-[#383838]'
              }`}
            />
            {formErrors.state && (
              <p className="text-[10px] text-red-400">{formErrors.state}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400">
              Postal / Zip
            </label>
            <input
              type="text"
              placeholder="Zip Code"
              value={billingDetails.zip}
              onChange={(e) => onBillingChange('zip', e.target.value)}
              className={`w-full h-10 bg-[#161616] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] focus:border-zinc-400 ${
                formErrors.zip ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626] hover:border-[#383838]'
              }`}
            />
            {formErrors.zip && (
              <p className="text-[10px] text-red-400">{formErrors.zip}</p>
            )}
          </div>
        </div>

        {/* Country Dropdown with Search and SVG Flags */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-medium text-zinc-400">
            Country
          </label>
          <CustomCountrySelect
            value={billingDetails.country || ''}
            onChange={(countryName) => onBillingChange('country', countryName)}
            error={Boolean(formErrors.country)}
            placeholder="Select Country"
          />
          {formErrors.country && (
            <p className="text-[10px] text-red-400">{formErrors.country}</p>
          )}
        </div>
      </div>

      {/* Newsletter */}
      <div className="flex items-center gap-2.5 pt-1">
        <input
          id="checkout-newsletter"
          type="checkbox"
          checked={newsletterOptIn}
          onChange={(e) => setNewsletterOptIn(e.target.checked)}
          className="w-3.5 h-3.5 bg-[#181818] border border-[#333333] rounded accent-zinc-200 cursor-pointer"
        />
        <label
          htmlFor="checkout-newsletter"
          className="text-[11px] text-zinc-400 cursor-pointer select-none"
        >
          Send updates about new plugin releases, updates, and presets.
        </label>
      </div>

      <div className="pt-2 text-zinc-500 text-[11px] flex items-center gap-2">
        <Lock size={12} className="text-zinc-500 flex-shrink-0" />
        <span>Your information is encrypted and securely stored for instant license access.</span>
      </div>
    </div>
  )
}
