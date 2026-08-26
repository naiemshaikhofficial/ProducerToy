'use client'

import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface CustomConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const CustomConfirmModal: React.FC<CustomConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onCancel}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-md bg-[#181818] border border-[#2c2c2c] rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 select-none">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {isDanger && (
              <div className="w-10 h-10 rounded-xl bg-[#2a1b1d] border border-[#442326] flex items-center justify-center text-[#ff4053] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-zinc-300 leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-bold transition-colors cursor-pointer active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md ${
              isDanger
                ? 'bg-[#ff4053] hover:bg-[#e63548] text-black font-semibold'
                : 'bg-white hover:bg-zinc-200 text-black'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  )
}
