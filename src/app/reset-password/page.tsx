'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon } from '@/components/Logo'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'
import { TurnstileWidget } from '@/components/TurnstileWidget'
import { validateTurnstileAction } from '@/actions/authActions'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ChevronLeft, ArrowRight } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Form Fields
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Status & Feedback States
  const [isVerifyingSession, setIsVerifyingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(3)

  // Calculate Password Strength (0 to 4) - Matching Auth Page
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0
    let score = 0
    if (pass.length >= 6) score++
    if (pass.length >= 10) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const passwordStrength = getPasswordStrength(password)

  // Verify Session / Recovery Token on Mount
  useEffect(() => {
    let isMounted = true

    const verifyRecoveryState = async () => {
      // 1. Check for URL error parameters from Supabase redirect
      let rawError = searchParams.get('error_description') || searchParams.get('error') || ''
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        if (hashParams.get('error_description')) rawError = hashParams.get('error_description') || ''
      }

      if (rawError) {
        if (isMounted) {
          setError(decodeURIComponent(rawError.replace(/\+/g, ' ')) || 'Password reset link is invalid or expired.')
          setIsVerifyingSession(false)
          setHasValidSession(false)
        }
        return
      }

      // 2. Check for PKCE Authorization Code in query params (from email link)
      const code = searchParams.get('code')
      if (code) {
        try {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeErr) {
            console.warn('PKCE exchange note:', exchangeErr.message)
          } else {
            if (isMounted) {
              setHasValidSession(true)
              setIsVerifyingSession(false)
            }
            return
          }
        } catch (e) {
          console.warn('Code exchange error:', e)
        }
      }

      // 3. Check URL hash for implicit recovery tokens (#access_token=...&type=recovery)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')
        if (type === 'recovery' || (accessToken && type === 'recovery')) {
          if (isMounted) {
            setHasValidSession(true)
            setIsVerifyingSession(false)
          }
          return
        }
      }

      // 4. Short buffer for Supabase background recovery event; if none, deny access
      const timer = setTimeout(() => {
        if (isMounted) {
          setIsVerifyingSession(false)
        }
      }, 1200)

      return () => clearTimeout(timer)
    }

    verifyRecoveryState()

    // 5. Listen strictly for verified PASSWORD_RECOVERY Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (isMounted) {
          setHasValidSession(true)
          setIsVerifyingSession(false)
          setError('')
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [searchParams, supabase])

  // Countdown timer for automatic redirect after success
  useEffect(() => {
    if (!isSuccess) return
    if (redirectCountdown <= 0) {
      router.push('/store')
      router.refresh()
      return
    }

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isSuccess, redirectCountdown, router])

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.')
      return
    }

    if (!turnstileToken) {
      setError('Security verification required. Please complete Cloudflare Turnstile before updating your password.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      const turnstileCheck = await validateTurnstileAction(turnstileToken)
      if (!turnstileCheck.success) {
        setError(turnstileCheck.error || 'Security verification failed. Please try again.')
        setTurnstileToken(null)
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        throw updateError
      }

      setIsSuccess(true)
      setMessage('Password updated successfully! Redirecting you to the store...')
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('same_password') || msg.toLowerCase().includes('same as')) {
        setError('New password must be different from your old password.')
      } else if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('session')) {
        setError('Your password reset session has expired. Please request a new link.')
        setHasValidSession(false)
      } else {
        setError(msg || 'Failed to update password. Please try requesting a new reset link.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4 py-8 sm:py-14 selection:bg-[#34363d] selection:text-white">
      {/* Dark Auth Card Container (#161616 background, border #262626, rounded-2xl) */}
      <div className="w-full max-w-[480px] bg-[#161616] border border-[#262626] rounded-2xl p-7 sm:p-10 shadow-2xl space-y-6 relative transition-all">

        {/* LOADING / VERIFYING STATE */}
        {isVerifyingSession ? (
          <div className="flex flex-col items-center justify-center space-y-5 py-8 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center">
              <ButtonSpinner size={24} variant="light" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-white">Verifying Reset Link...</h2>
              <p className="text-xs text-zinc-400">Securing your session with Producer Toy.</p>
            </div>
          </div>
        ) : isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="flex flex-col items-center text-center space-y-6 py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center relative">
              <Lock className="w-8 h-8 text-zinc-200" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-4 h-4 text-black font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Password Updated!
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                Your password has been changed successfully. You can now use your new password to sign in to Producer Toy.
              </p>
            </div>

            <div className="bg-[#1c1c1f] border border-[#2e2e33] text-zinc-200 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 w-full shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-zinc-200 shrink-0" />
              <span>Redirecting to store in {redirectCountdown}s...</span>
            </div>

            <div className="w-full pt-2">
              <button
                type="button"
                onClick={() => {
                  router.push('/store')
                  router.refresh()
                }}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 active:bg-zinc-300 active:scale-[0.99] text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Store</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : !hasValidSession ? (
          /* NO ACTIVE SESSION / EXPIRED LINK FALLBACK SCREEN */
          <div className="flex flex-col items-center text-center space-y-6 py-2 animate-in fade-in">
            <Link href="/" prefetch={true} className="hover:opacity-80 transition-opacity">
              <LogoIcon size={48} />
            </Link>

            <div className="w-16 h-16 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-zinc-300" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Reset Link Expired or Invalid
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                For security purposes, password reset links can only be used once and expire shortly after being requested.
              </p>
            </div>

            {error && (
              <div className="bg-[#ff4053] text-black font-extrabold p-3.5 rounded-2xl text-xs text-center space-y-2 shadow-lg w-full animate-in fade-in">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="w-full space-y-3 pt-2">
              <Link
                href="/auth"
                prefetch={true}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Request New Reset Link</span>
              </Link>

              <Link
                href="/auth"
                prefetch={true}
                className="w-full py-3.5 bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white border border-[#2e2e2e] rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* CREATE NEW PASSWORD FORM (ACTIVE RECOVERY SESSION) */
          <div className="space-y-5 animate-in fade-in">
            {/* Header with Logo, Title & Description */}
            <div className="flex flex-col items-center text-center space-y-3">
              <Link href="/" prefetch={true} className="hover:opacity-80 transition-opacity">
                <LogoIcon size={48} />
              </Link>

              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Create New Password
              </h1>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Choose a strong password with at least 6 characters for your account.
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="bg-[#ff4053] text-black font-extrabold p-3.5 rounded-2xl text-xs text-center space-y-2 shadow-lg animate-in fade-in">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Success Message Alert */}
            {message && (
              <div className="bg-[#1c1c1f] border border-[#2e2e33] text-zinc-200 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 w-full animate-in fade-in shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-zinc-200 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Input */}
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-zinc-300">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ paddingLeft: '14px', paddingRight: '44px' }}
                    className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm touch-manipulation select-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer touch-manipulation"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            bar <= passwordStrength
                              ? passwordStrength <= 2
                                ? 'bg-zinc-400'
                                : 'bg-white'
                              : 'bg-[#2a2a2a]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Strength:{' '}
                      {passwordStrength <= 1
                        ? 'Weak'
                        : passwordStrength === 2
                        ? 'Medium'
                        : passwordStrength === 3
                        ? 'Strong'
                        : 'Very Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password Input */}
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-zinc-300">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{ paddingLeft: '14px', paddingRight: '44px' }}
                    className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm touch-manipulation select-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer touch-manipulation"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Match Status */}
                {confirmPassword.length > 0 && (
                  <div className="pt-1">
                    {password === confirmPassword ? (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Passwords match
                      </span>
                    ) : (
                      <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Cloudflare Turnstile Verification Widget */}
              <TurnstileWidget
                onSuccess={(token) => {
                  setTurnstileToken(token)
                  setError('')
                }}
                onExpire={() => setTurnstileToken(null)}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 active:bg-zinc-300 active:scale-[0.99] text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all shadow-lg cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
              >
                {loading ? (
                  <ButtonSpinner size={16} variant="dark" />
                ) : (
                  <span>Update Password &amp; Continue</span>
                )}
              </button>
            </form>

            {/* Back to Sign In Link */}
            <div className="pt-3 text-center text-xs text-zinc-400 border-t border-[#262626]">
              <Link
                href="/auth"
                prefetch={true}
                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white font-bold transition-colors uppercase tracking-wider text-[11px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <ButtonSpinner size={24} variant="light" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
