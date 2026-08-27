'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Edit2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { CustomInfoTooltip } from './CustomInfoTooltip'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'
import { updatePersonalDetailsAction } from '@/actions/accountActions'
import { CustomCountrySelect } from '@/components/checkout/CustomCountrySelect'

interface PersonalDetailsSectionProps {
  user: any
  profile: any
  onSaveSuccess: () => void
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
  user,
  profile,
  onSaveSuccess,
}) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('INDIA')
  const [isEditingCountry, setIsEditingCountry] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setAddressLine1(profile.address_line1 || '')
      setAddressLine2(profile.address_line2 || '')
      setCity(profile.city || '')
      setRegion(profile.region || profile.state || '')
      setPostalCode(profile.postal_code || '')
      setCountry(profile.country || 'INDIA')
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const res = await updatePersonalDetailsAction(user.id, {
        first_name: firstName,
        last_name: lastName,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: city,
        region: region,
        state: region,
        postal_code: postalCode,
        country: country,
      })
      if (res.success) {
        onSaveSuccess()
      }
    } catch (err) {
      console.warn('Error saving personal details:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-[#222222]">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Personal details
        </h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Manage your name and contact info. These personal details are private and will not be displayed to other users. View our{' '}
          <Link href="/privacy" className="text-zinc-200 underline hover:text-white">
            Privacy Policy
          </Link>.
        </p>
      </div>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-zinc-300 block">
            First Name *
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-zinc-300 block">
            Last Name *
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-white">
          Address
        </h3>

        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-zinc-300 block">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Street Address or P.O. Box"
            className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-zinc-300 block">
            Address Line 2
          </label>
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apartment, suite, unit, building, floor, etc."
            className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-zinc-300 block">
              City *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-zinc-300 block">
              Region
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="State / Province"
              className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-zinc-300 block">
              Postal Code *
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="PIN / Postal Code"
              className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
            />
          </div>
        </div>

        {/* Country Selector */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Country / Region
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 bg-[#181818] border border-[#2c2c2c] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {country}
              </span>
              <CustomInfoTooltip
                content="Country / Region is determined by your billing and payment details."
              />
            </div>
            <button
              type="button"
              onClick={() => setIsEditingCountry(!isEditingCountry)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isEditingCountry
                  ? 'bg-white text-black border-white'
                  : 'bg-[#222222] hover:bg-[#2c2c2c] text-white border-[#333333]'
              }`}
              title="Change Country"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {isEditingCountry && (
            <div className="mt-2">
              <CustomCountrySelect
                value={country}
                onChange={(cName) => {
                  setCountry(cName.toUpperCase())
                  setIsEditingCountry(false)
                }}
                placeholder="Search and select country..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#262626] hover:bg-[#343434] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 min-w-[130px]"
        >
          {saving ? (
            <ButtonSpinner size={16} variant="light" />
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </form>
  )
}
