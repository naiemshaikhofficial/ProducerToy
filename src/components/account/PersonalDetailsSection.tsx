'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Info, Edit2 } from 'lucide-react'

interface PersonalDetailsSectionProps {
  onSaveSuccess: () => void
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveSuccess()
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
        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            First Name *
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Last Name *
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-white">
          Address
        </h3>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Street Address or P.O. Box"
            className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Address Line 2
          </label>
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apartment, suite, unit, building, floor, etc."
            className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
              City *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
              Region
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="State / Province"
              className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
              Postal Code *
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="PIN / Postal Code"
              className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
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
              <div className="text-zinc-500 hover:text-zinc-300 cursor-pointer" title="Country is determined by your billing profile.">
                <Info className="w-4 h-4" />
              </div>
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
            <div className="mt-2 p-3 bg-[#181818] border border-[#2c2c2c] rounded-xl flex items-center gap-3">
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value)
                  setIsEditingCountry(false)
                }}
                className="bg-[#202020] text-white text-sm rounded-lg px-3 py-2 border border-[#333333] focus:outline-none w-full"
              >
                <option value="INDIA">INDIA</option>
                <option value="UNITED STATES">UNITED STATES</option>
                <option value="UNITED KINGDOM">UNITED KINGDOM</option>
                <option value="GERMANY">GERMANY</option>
                <option value="CANADA">CANADA</option>
                <option value="AUSTRALIA">AUSTRALIA</option>
                <option value="JAPAN">JAPAN</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Save Changes Button (Pure Neutral Darks, NO Blue) */}
      <div className="pt-2">
        <button
          type="submit"
          className="bg-[#262626] hover:bg-[#343434] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
