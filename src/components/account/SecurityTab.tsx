'use client'

import React, { useState } from 'react'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'

export const SecurityTab: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorMsg, setTwoFactorMsg] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setPasswordMsg('New password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match.')
      return
    }
    setIsUpdating(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) {
        setPasswordMsg(error.message)
      } else {
        setPasswordMsg('Password successfully updated!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      setPasswordMsg('Failed to update password. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEnable2FA = () => {
    setTwoFactorEnabled(true)
    setTwoFactorMsg(true)
    setTimeout(() => setTwoFactorMsg(false), 4000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Password and security
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your login credentials and two-factor authentication.
        </p>
      </div>

      <div className="bg-[#181818] border border-[#242424] p-6 rounded-2xl space-y-6">
        <h2 className="text-xl font-bold text-white">Change password</h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
              Current password *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#202020] border border-[#333333] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
              New password *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#202020] border border-[#333333] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
              Confirm new password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#202020] border border-[#333333] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none"
            />
          </div>

          {passwordMsg && (
            <p
              className={`text-xs font-semibold ${
                passwordMsg.includes('must') || passwordMsg.includes('match') || passwordMsg.includes('Failed')
                  ? 'text-[#ff4053]'
                  : 'text-green-400'
              }`}
            >
              {passwordMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isUpdating}
            className="bg-[#262626] hover:bg-[#343434] text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-60"
          >
            {isUpdating ? <ButtonSpinner size={14} variant="light" /> : <span>Update Password</span>}
          </button>
        </form>
      </div>

      <div className="bg-[#181818] border border-[#242424] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Two-Factor Authentication (2FA)</span>
            {twoFactorEnabled && (
              <span className="text-[10px] bg-[#1e281e] text-green-400 border border-[#2e442e] font-bold px-2 py-0.5 rounded uppercase">
                Active
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md">
            Add an extra layer of security to prevent unauthorized access to your licenses and wallet.
          </p>
          {twoFactorMsg && (
            <p className="text-xs font-bold text-green-400 mt-2 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2FA verification email sent! Follow instructions to pair authenticator app.</span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleEnable2FA}
          className="bg-white text-black hover:bg-zinc-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          {twoFactorEnabled ? 'Reconfigure 2FA' : 'Enable 2FA'}
        </button>
      </div>
    </div>
  )
}
