'use client'

import React, { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import dynamic from 'next/dynamic'
import 'react-phone-number-input/style.css'
import { BillingDetails } from './types'

const Select = dynamic(() => import('react-select'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-10 bg-[#161616] border border-[#262626] rounded-lg flex items-center px-3 text-zinc-600 text-xs">
      Loading countries...
    </div>
  ),
})

const PhoneInput = dynamic(() => import('react-phone-number-input'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-10 bg-[#161616] border border-[#262626] rounded-lg flex items-center px-3 text-zinc-600 text-xs">
      Loading phone...
    </div>
  ),
})

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
            className={`w-full h-10 bg-[#181818] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400 ${
              formErrors.fullName ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626]'
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
            className={`w-full h-10 bg-[#181818] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400 ${
              formErrors.email ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626]'
            }`}
          />
          {formErrors.email && (
            <p className="text-[10px] text-red-400">{formErrors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-medium text-zinc-400">
            Phone Number
          </label>
          <div className="phone-input-pt">
            {mounted ? (
              <PhoneInput
                international
                defaultCountry="IN"
                placeholder="Mobile number"
                value={billingDetails.phone}
                onChange={(val) => onBillingChange('phone', val || '')}
                className={`w-full h-10 bg-[#181818] border px-3 rounded-lg outline-none transition-colors focus-within:border-zinc-400 ${
                  formErrors.phone ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626]'
                }`}
              />
            ) : (
              <input
                type="tel"
                placeholder="Mobile number"
                value={billingDetails.phone}
                onChange={(e) => onBillingChange('phone', e.target.value)}
                className="w-full h-10 bg-[#181818] border border-[#262626] text-white text-xs px-3.5 rounded-lg outline-none"
              />
            )}
          </div>
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
            className={`w-full h-10 bg-[#181818] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400 ${
              formErrors.address ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626]'
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
            className="w-full h-10 bg-[#181818] border border-[#262626] text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400"
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
            className={`w-full h-10 bg-[#181818] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400 ${
              formErrors.city ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626]'
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
              className={`w-full h-10 bg-[#181818] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400 ${
                formErrors.state ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626]'
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
              className={`w-full h-10 bg-[#181818] border text-white text-xs px-3.5 rounded-lg outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-400 ${
                formErrors.zip ? 'border-red-500/70 bg-red-950/10' : 'border-[#262626]'
              }`}
            />
            {formErrors.zip && (
              <p className="text-[10px] text-red-400">{formErrors.zip}</p>
            )}
          </div>
        </div>

        {/* Country Dropdown */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-medium text-zinc-400">
            Country
          </label>
          {mounted ? (
            <Select
              options={countryOptions}
              value={countryOptions.find((opt) => opt.label === billingDetails.country) || null}
              onChange={(val: any) => onBillingChange('country', val?.label || '')}
              placeholder="Select Country"
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base: any, state: any) => ({
                  ...base,
                  backgroundColor: '#181818',
                  borderColor: formErrors.country ? '#ef4444' : state.isFocused ? '#71717a' : '#262626',
                  borderRadius: '0.5rem',
                  minHeight: '2.5rem',
                  height: '2.5rem',
                  fontSize: '0.75rem',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#52525b',
                  },
                }),
                menu: (base: any) => ({
                  ...base,
                  backgroundColor: '#141414',
                  border: '1px solid #242424',
                  borderRadius: '0.75rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
                  zIndex: 50,
                  overflow: 'hidden',
                  padding: '4px 0',
                }),
                menuList: (base: any) => ({
                  ...base,
                  padding: 0,
                  maxHeight: '240px',
                }),
                option: (base: any, state: any) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? '#222222'
                    : state.isFocused
                    ? '#1a1a1a'
                    : 'transparent',
                  color: state.isSelected ? '#ffffff' : '#d4d4d8',
                  fontWeight: state.isSelected ? '700' : '500',
                  fontSize: '0.8125rem',
                  padding: '12px 16px',
                  borderBottom: '1px solid #222222',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                  '&:hover': {
                    backgroundColor: '#1c1c1c',
                    color: '#ffffff',
                  },
                }),
                singleValue: (base: any) => ({
                  ...base,
                  color: '#ffffff',
                  fontWeight: '500',
                }),
                input: (base: any) => ({
                  ...base,
                  color: '#ffffff',
                }),
                placeholder: (base: any) => ({
                  ...base,
                  color: '#71717a',
                }),
              }}
            />
          ) : (
            <select
              value={billingDetails.country || ''}
              onChange={(e) => onBillingChange('country', e.target.value)}
              className="w-full h-10 bg-[#181818] border border-[#262626] text-white text-xs px-3 rounded-lg outline-none"
            >
              <option value="" className="bg-[#181818] text-zinc-500">
                Select Country
              </option>
              {countryOptions.map((opt) => (
                <option key={opt.value} value={opt.label} className="bg-[#181818] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          )}
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

      <div className="pt-2 border-t border-[#222222] text-zinc-500 text-[11px] flex items-center gap-2">
        <Lock size={12} className="text-zinc-500 flex-shrink-0" />
        <span>Your information is encrypted and securely stored for instant license access.</span>
      </div>
    </div>
  )
}
