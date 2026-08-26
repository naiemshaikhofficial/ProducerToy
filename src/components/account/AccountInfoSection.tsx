'use client'

import React, { useState } from 'react'
import { Info, Edit2, Check } from 'lucide-react'

interface AccountInfoSectionProps {
  accountId: string
  displayName: string
  maskedEmail: string
  onSaveDisplayName: (name: string) => void
}

export const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({
  accountId,
  displayName,
  maskedEmail,
  onSaveDisplayName,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(displayName)

  const handleToggleEdit = () => {
    if (isEditing) {
      onSaveDisplayName(tempName)
    }
    setIsEditing(!isEditing)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white tracking-tight">
        Account information
      </h2>
      <p className="text-xs font-semibold text-zinc-300">
        ID: <span className="font-mono text-zinc-400">{accountId}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Display Name Input with Edit Pencil */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Display name
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 bg-[#181818] border border-[#2c2c2c] rounded-xl px-4 py-3 flex items-center justify-between">
              <input
                type="text"
                value={isEditing ? tempName : displayName}
                onChange={(e) => setTempName(e.target.value)}
                disabled={!isEditing}
                className="bg-transparent text-white text-sm focus:outline-none w-full disabled:opacity-90 font-medium"
              />
              <div className="text-zinc-500 hover:text-zinc-300 cursor-pointer ml-2" title="Display Name Info">
                <Info className="w-4 h-4" />
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleEdit}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isEditing
                  ? 'bg-white text-black border-white'
                  : 'bg-[#222222] hover:bg-[#2c2c2c] text-white border-[#333333]'
              }`}
              title={isEditing ? "Save Display Name" : "Edit Display Name"}
            >
              {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Email Address (LOCKED / READ-ONLY - NO EDIT OPTION AS REQUIRED) */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            Email address
          </label>
          <div className="relative bg-[#181818] border border-[#2c2c2c] rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-zinc-200 font-mono select-all">
              {maskedEmail}
            </span>
            <div className="text-zinc-500 hover:text-zinc-300 cursor-help" title="Email address is permanently verified and locked.">
              <Info className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
