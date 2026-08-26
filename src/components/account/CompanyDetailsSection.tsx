'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface CompanyDetailsSectionProps {
  onSaveSuccess: () => void
}

export const CompanyDetailsSection: React.FC<CompanyDetailsSectionProps> = ({
  onSaveSuccess,
}) => {
  const [companyName, setCompanyName] = useState('')
  const [companyVat, setCompanyVat] = useState('')
  const [companyAddress1, setCompanyAddress1] = useState('')
  const [companyAddress2, setCompanyAddress2] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyRegion, setCompanyRegion] = useState('')
  const [companyPostal, setCompanyPostal] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-8 border-t border-[#222222]">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Company
        </h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Manage your company information used for business receipts for your purchase(s).{' '}
          <Link href="/terms" className="text-zinc-200 underline hover:text-white">
            Learn more
          </Link>
        </p>
        <p className="text-xs font-semibold text-zinc-300 mt-2">
          If you are registered for VAT, you may not be charged VAT on your purchase. To get started, enter your COMPANY VAT NUMBER.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Company Name *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Registered Business Name"
            className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Company VAT number *
          </label>
          <input
            type="text"
            value={companyVat}
            onChange={(e) => setCompanyVat(e.target.value)}
            placeholder="e.g. GB123456789 or GSTIN"
            className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-white">
          Company address
        </h3>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={companyAddress1}
            onChange={(e) => setCompanyAddress1(e.target.value)}
            placeholder="Business Address"
            className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Address Line 2
          </label>
          <input
            type="text"
            value={companyAddress2}
            onChange={(e) => setCompanyAddress2(e.target.value)}
            placeholder="Suite, building, floor"
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
              value={companyCity}
              onChange={(e) => setCompanyCity(e.target.value)}
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
              value={companyRegion}
              onChange={(e) => setCompanyRegion(e.target.value)}
              placeholder="State / Region"
              className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
              Postal Code *
            </label>
            <input
              type="text"
              value={companyPostal}
              onChange={(e) => setCompanyPostal(e.target.value)}
              placeholder="Postal Code"
              className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

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
