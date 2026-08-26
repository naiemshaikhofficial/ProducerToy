'use client'

import React, { useState } from 'react'

export const SecurityTab: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters.')
      return
    }
    setPasswordMsg('Password updated successfully.')
    setCurrentPassword('')
    setNewPassword('')
    setTimeout(() => setPasswordMsg(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Password and security
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your password and two-factor authentication (2FA).
        </p>
      </div>

      <div className="bg-[#181818] border border-[#242424] p-5 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Change Password</h3>
        <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#202020] border border-[#333333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#202020] border border-[#333333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
            />
          </div>

          {passwordMsg && (
            <p className={`text-xs font-semibold ${passwordMsg.includes('must') ? 'text-[#ff4053]' : 'text-green-400'}`}>
              {passwordMsg}
            </p>
          )}

          <button
            type="submit"
            className="bg-[#262626] hover:bg-[#343434] text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Update Password
          </button>
        </form>
      </div>

      <div className="bg-[#181818] border border-[#242424] p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md">
            Add an extra layer of security to prevent unauthorized access to your licenses and wallet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert('2FA setup initiated. Check your authenticator app.')}
          className="bg-white text-black hover:bg-zinc-200 font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Enable 2FA
        </button>
      </div>
    </div>
  )
}
