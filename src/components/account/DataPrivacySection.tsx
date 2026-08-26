'use client'

import React, { useState } from 'react'
import { Download, Trash2 } from 'lucide-react'

export const DataPrivacySection: React.FC = () => {
  const [downloadRequested, setDownloadRequested] = useState(false)

  const handleRequestDownload = () => {
    setDownloadRequested(true)
  }

  const handleDeleteAccount = () => {
    if (
      confirm(
        'Are you sure you want to request account deletion? All licenses, purchases, and cloud data will be permanently deleted.'
      )
    ) {
      alert('Account deletion request submitted. Please check your email to confirm.')
    }
  }

  return (
    <div className="space-y-8 pt-8 border-t border-[#222222]">
      {/* Section: Download Account Data */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Download account data
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
          Download a copy of available data you've shared with us. We'll email you once it's ready, and you'll have 15 days to download it.
        </p>
        <div>
          <button
            type="button"
            onClick={handleRequestDownload}
            className="bg-[#262626] hover:bg-[#343434] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{downloadRequested ? "Download Requested (Email Sent)" : "Request download"}</span>
          </button>
        </div>
      </div>

      {/* Section: Delete Account (Danger Zone) */}
      <div className="space-y-4 pt-6 border-t border-[#222222]">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Delete account
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
          Delete your ProducerToy account including all personal information, purchases, sound packs, VST licenses, your account balance and projects. Your account will be permanently deleted in 30 days.
        </p>
        <div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="bg-[#ff4053] hover:bg-[#e83447] text-black font-semibold text-sm px-6 py-2.5 rounded-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete account</span>
          </button>
        </div>
      </div>
    </div>
  )
}
