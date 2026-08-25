'use client'

import React from 'react'
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react'
import Select from 'react-select'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { BillingDetails } from './types'

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
  return (
    <div
      id="billing-details-section"
      className="bg-[#181818] border border-[#282828] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-[#282828] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-4 bg-[#FC6301] rounded-sm" />
          <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
            Billing &amp; Delivery Details
          </h2>
        </div>
        <span
          className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 ${
            Object.keys(formErrors).length > 0
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {Object.keys(formErrors).length > 0 ? (
            <>
              <ShieldCheck size={11} />
              <span>Action Required</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={11} />
              <span>Auto-Saved</span>
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Full Name <span className="text-[#FC6301]">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Alex Producer"
            value={billingDetails.fullName}
            onChange={(e) => onBillingChange('fullName', e.target.value)}
            className={`w-full h-11 bg-[#202020] border text-white text-xs px-4 rounded-xl outline-none transition-all placeholder:text-zinc-600 focus:border-[#FC6301] focus:ring-1 focus:ring-[#FC6301] ${
              formErrors.fullName ? 'border-red-500 bg-red-950/10' : 'border-[#333333]'
            }`}
          />
          {formErrors.fullName && (
            <p className="text-[10px] font-semibold text-red-400">{formErrors.fullName}</p>
          )}
        </div>

        {/* Delivery Email */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Delivery Email <span className="text-[#FC6301]">*</span>
          </label>
          <input
            type="email"
            placeholder="producer@studio.com"
            value={billingDetails.email}
            onChange={(e) => onBillingChange('email', e.target.value)}
            className={`w-full h-11 bg-[#202020] border text-white text-xs px-4 rounded-xl outline-none transition-all placeholder:text-zinc-600 focus:border-[#FC6301] focus:ring-1 focus:ring-[#FC6301] ${
              formErrors.email ? 'border-red-500 bg-red-950/10' : 'border-[#333333]'
            }`}
          />
          {formErrors.email && (
            <p className="text-[10px] font-semibold text-red-400">{formErrors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Phone Number <span className="text-[#FC6301]">*</span>
          </label>
          <div className="phone-input-pt">
            <PhoneInput
              international
              defaultCountry="IN"
              placeholder="Enter mobile number"
              value={billingDetails.phone}
              onChange={(val) => onBillingChange('phone', val || '')}
              className={`w-full h-11 bg-[#202020] border px-3 rounded-xl outline-none transition-all focus-within:border-[#FC6301] focus-within:ring-1 focus-within:ring-[#FC6301] ${
                formErrors.phone ? 'border-red-500 bg-red-950/10' : 'border-[#333333]'
              }`}
            />
          </div>
          {formErrors.phone && (
            <p className="text-[10px] font-semibold text-red-400">{formErrors.phone}</p>
          )}
        </div>

        {/* Street Address */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Street Address <span className="text-[#FC6301]">*</span>
          </label>
          <input
            type="text"
            placeholder="House / Studio No, Street, Landmark"
            value={billingDetails.address}
            onChange={(e) => onBillingChange('address', e.target.value)}
            className={`w-full h-11 bg-[#202020] border text-white text-xs px-4 rounded-xl outline-none transition-all placeholder:text-zinc-600 focus:border-[#FC6301] focus:ring-1 focus:ring-[#FC6301] ${
              formErrors.address ? 'border-red-500 bg-red-950/10' : 'border-[#333333]'
            }`}
          />
          {formErrors.address && (
            <p className="text-[10px] font-semibold text-red-400">{formErrors.address}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            City <span className="text-[#FC6301]">*</span>
          </label>
          <input
            type="text"
            placeholder="City"
            value={billingDetails.city}
            onChange={(e) => onBillingChange('city', e.target.value)}
            className={`w-full h-11 bg-[#202020] border text-white text-xs px-4 rounded-xl outline-none transition-all placeholder:text-zinc-600 focus:border-[#FC6301] focus:ring-1 focus:ring-[#FC6301] ${
              formErrors.city ? 'border-red-500 bg-red-950/10' : 'border-[#333333]'
            }`}
          />
          {formErrors.city && (
            <p className="text-[10px] font-semibold text-red-400">{formErrors.city}</p>
          )}
        </div>

        {/* State & Pincode Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              State <span className="text-[#FC6301]">*</span>
            </label>
            <input
              type="text"
              placeholder="State"
              value={billingDetails.state}
              onChange={(e) => onBillingChange('state', e.target.value)}
              className={`w-full h-11 bg-[#202020] border text-white text-xs px-4 rounded-xl outline-none transition-all placeholder:text-zinc-600 focus:border-[#FC6301] focus:ring-1 focus:ring-[#FC6301] ${
                formErrors.state ? 'border-red-500 bg-red-950/10' : 'border-[#333333]'
              }`}
            />
            {formErrors.state && (
              <p className="text-[10px] font-semibold text-red-400">{formErrors.state}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              Pincode / Zip <span className="text-[#FC6301]">*</span>
            </label>
            <input
              type="text"
              placeholder="ZIP"
              value={billingDetails.zip}
              onChange={(e) => onBillingChange('zip', e.target.value)}
              className={`w-full h-11 bg-[#202020] border text-white text-xs px-4 rounded-xl outline-none transition-all placeholder:text-zinc-600 focus:border-[#FC6301] focus:ring-1 focus:ring-[#FC6301] ${
                formErrors.zip ? 'border-red-500 bg-red-950/10' : 'border-[#333333]'
              }`}
            />
            {formErrors.zip && (
              <p className="text-[10px] font-semibold text-red-400">{formErrors.zip}</p>
            )}
          </div>
        </div>

        {/* Country Dropdown */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Country <span className="text-[#FC6301]">*</span>
          </label>
          <Select
            options={countryOptions}
            value={countryOptions.find((opt) => opt.label === billingDetails.country)}
            onChange={(val: any) => onBillingChange('country', val?.label || '')}
            placeholder="Select Country"
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: '#202020',
                borderColor: formErrors.country ? '#ef4444' : state.isFocused ? '#FC6301' : '#333333',
                borderRadius: '0.75rem',
                height: '2.75rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                boxShadow: state.isFocused ? '0 0 0 1px #FC6301' : 'none',
                '&:hover': {
                  borderColor: state.isFocused ? '#FC6301' : '#444444',
                },
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#181818',
                border: '1px solid #333333',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 50,
                overflow: 'hidden',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? '#FC6301'
                  : state.isFocused
                  ? '#2a2a2a'
                  : 'transparent',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                '&:active': {
                  backgroundColor: '#FC6301',
                },
              }),
              singleValue: (base) => ({
                ...base,
                color: '#ffffff',
              }),
              input: (base) => ({
                ...base,
                color: '#ffffff',
              }),
              placeholder: (base) => ({
                ...base,
                color: '#71717a',
              }),
            }}
          />
          {formErrors.country && (
            <p className="text-[10px] font-semibold text-red-400">{formErrors.country}</p>
          )}
        </div>
      </div>

      {/* Newsletter Opt-in Checkbox */}
      <div className="flex items-start gap-3 p-3.5 bg-[#202020] border border-[#2a2a2a] rounded-xl">
        <input
          id="checkout-newsletter"
          type="checkbox"
          checked={newsletterOptIn}
          onChange={(e) => setNewsletterOptIn(e.target.checked)}
          className="w-4 h-4 mt-0.5 bg-[#181818] border border-[#333333] rounded text-[#FC6301] accent-[#FC6301] focus:ring-0 cursor-pointer"
        />
        <label
          htmlFor="checkout-newsletter"
          className="text-xs text-zinc-300 leading-relaxed cursor-pointer select-none"
        >
          Receive exclusive producer discount codes, free plugin releases, and preset pack drops.
        </label>
      </div>

      <div className="p-3.5 bg-[#202020] border border-[#2a2a2a] rounded-xl text-zinc-400 text-xs flex items-center gap-2.5">
        <Lock size={15} className="text-emerald-400 flex-shrink-0" />
        <span>
          All customer and billing details are encrypted and securely verified. Digital licenses are attached to your account permanently.
        </span>
      </div>
    </div>
  )
}
