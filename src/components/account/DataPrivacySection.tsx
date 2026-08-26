'use client'

import React, { useState } from 'react'
import { Download, Trash2, CheckCircle2 } from 'lucide-react'
import { CustomConfirmModal } from './CustomConfirmModal'

export const DataPrivacySection: React.FC = () => {
  const [downloadRequested, setDownloadRequested] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteRequested, setDeleteRequested] = useState(false)

  const handleRequestDownload = () => {
    setDownloadRequested(true)
  }

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteRequested(true)
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
          {downloadRequested ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e281e] border border-[#2e442e] text-green-400 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Download Requested (Email will arrive shortly)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestDownload}
              className="inline-flex items-center gap-2 bg-[#202020] hover:bg-[#2c2c2c] text-white text-xs font-bold px-5 py-3 rounded-xl border border-[#303030] transition-colors cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Request Account Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Section: Delete Account */}
      <div className="space-y-4 pt-4 border-t border-[#222222]">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Delete account
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
          Delete your ProducerToy account including all personal information, purchases, sound packs, VST licenses, your account balance and projects. Your account will be permanently deleted in 30 days.
        </p>

        <div>
          {deleteRequested ? (
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#2a1b1d] border border-[#442326] text-[#ff4053] text-xs font-semibold animate-in fade-in max-w-md">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Account deletion request submitted. Please check your email to complete the confirmation.</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#ff4053] hover:bg-[#e63548] text-black font-semibold text-xs px-5 py-3 rounded-[10px] transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete account</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <CustomConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Account"
        description="Are you sure you want to request account deletion? All licenses, purchases, sound packs, and cloud data will be permanently scheduled for deletion in 30 days."
        confirmText="Yes, Delete Account"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  )
}
