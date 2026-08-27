'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'
import { updateCompanyDetailsAction } from '@/actions/accountActions'

interface CompanyDetailsSectionProps {
  user: any
  profile: any
  onSaveSuccess: () => void
}

export const CompanyDetailsSection: React.FC<CompanyDetailsSectionProps> = ({
  user,
  profile,
  onSaveSuccess,
}) => {
  const [companyName, setCompanyName] = useState('')
  const [companyVat, setCompanyVat] = useState('')
  const [companyAddress1, setCompanyAddress1] = useState('')
  const [companyAddress2, setCompanyAddress2] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyRegion, setCompanyRegion] = useState('')
  const [companyPostal, setCompanyPostal] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || '')
      setCompanyVat(profile.company_vat || '')
      setCompanyAddress1(profile.company_address_line1 || '')
      setCompanyAddress2(profile.company_address_line2 || '')
      setCompanyCity(profile.company_city || '')
      setCompanyRegion(profile.company_region || '')
      setCompanyPostal(profile.company_postal_code || '')
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const res = await updateCompanyDetailsAction(user.id, {
        company_name: companyName,
        company_tax_id: companyVat,
        company_address_line1: companyAddress1,
        company_address_line2: companyAddress2,
        company_city: companyCity,
        company_region: companyRegion,
        company_postal_code: companyPostal,
      })
      if (res.success) {
        onSaveSuccess()
      }
    } catch (err) {
      console.warn('Error saving company details:', err)
    } finally {
      setSaving(false)
    }
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
        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-zinc-300 block">
            Company Name *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Registered Business Name"
            className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-zinc-300 block">
            Company VAT number *
          </label>
          <input
            type="text"
            value={companyVat}
            onChange={(e) => setCompanyVat(e.target.value)}
            placeholder="e.g. GB123456789 or GSTIN"
            className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-white">
          Company address
        </h3>

        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-zinc-300 block">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={companyAddress1}
            onChange={(e) => setCompanyAddress1(e.target.value)}
            placeholder="Business Address"
            className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-zinc-300 block">
            Address Line 2
          </label>
          <input
            type="text"
            value={companyAddress2}
            onChange={(e) => setCompanyAddress2(e.target.value)}
            placeholder="Suite, building, floor"
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
              value={companyCity}
              onChange={(e) => setCompanyCity(e.target.value)}
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
              value={companyRegion}
              onChange={(e) => setCompanyRegion(e.target.value)}
              placeholder="State / Region"
              className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-zinc-300 block">
              Postal Code *
            </label>
            <input
              type="text"
              value={companyPostal}
              onChange={(e) => setCompanyPostal(e.target.value)}
              placeholder="Postal Code"
              className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md px-3.5 outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
            />
          </div>
        </div>
      </div>

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
