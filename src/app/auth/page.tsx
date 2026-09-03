'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon } from '@/components/Logo'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'
import { ChevronLeft, Eye, EyeOff, Mail, CheckCircle2, Lock, AlertCircle, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { checkUserStatusAction, validateTurnstileAction } from '@/actions/authActions'
import { TurnstileWidget } from '@/components/TurnstileWidget'

// Sleek Monochrome Google Icon SVG
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-white">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="currentColor"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="currentColor"
      />
    </svg>
  )
}

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/'
  const supabase = createClient()

  // Navigation mode ('signin' | 'signup' | 'forgot' | 'reset') & Step ('email' | 'details')
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin')
  const [step, setStep] = useState<'email' | 'details'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isResetEmailSent, setIsResetEmailSent] = useState(false)
  const [resetCountdown, setResetCountdown] = useState(0)

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // UI feedback states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [accountAlreadyExists, setAccountAlreadyExists] = useState(false)
  const [noAccountFound, setNoAccountFound] = useState(false)
  const [wrongPassword, setWrongPassword] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)

  // Countdown timer effect for email resend
  useEffect(() => {
    let timer: any
    if (resetCountdown > 0) {
      timer = setInterval(() => {
        setResetCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [resetCountdown])

  // Check URL params and Supabase Auth events for Password Recovery
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'reset') {
      setMode('reset')
      setStep('details')
    }

    // Catch hash fragments (Supabase sends recovery token in hash)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const type = hashParams.get('type')
      if (type === 'recovery') {
        setMode('reset')
        setStep('details')
      }
    }

    // Subscribe to auth state changes (handles recovery link click)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset')
        setStep('details')
        setError('')
        setMessage('')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [searchParams, supabase])

  // Resend confirmation email
  const handleResendConfirmation = async () => {
    if (!email.trim()) return
    try {
      setResendingEmail(true)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      })
      if (error) throw error
      setMessage('Confirmation link sent! Please check your email inbox.')
      setError('')
      setEmailNotConfirmed(false)
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email.')
    } finally {
      setResendingEmail(false)
    }
  }

  // Handle Forgot Password Request
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      // 1. Fast server check if account exists
      const checkData = await checkUserStatusAction(email.trim())
      if (!checkData.exists) {
        setError('No account found with this email address. Please check your email or sign up.')
        setLoading(false)
        return
      }

      // 2. Request password reset email from Supabase
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth?mode=reset')}`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: callbackUrl,
      })

      if (resetError) throw resetError

      setIsResetEmailSent(true)
      setResetCountdown(60)
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('rate_limit') || msg.toLowerCase().includes('security purposes')) {
        setError('Rate limit reached. Please wait a few moments before requesting another reset email.')
      } else {
        setError(msg || 'Failed to send password reset email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Resending Password Reset Link
  const handleResendResetLink = async () => {
    if (resetCountdown > 0 || !email.trim()) return
    try {
      setLoading(true)
      setError('')
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth?mode=reset')}`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: callbackUrl,
      })
      if (resetError) throw resetError
      setMessage('A fresh password reset link has been sent to your email!')
      setResetCountdown(60)
    } catch (err: any) {
      setError(err.message || 'Failed to resend reset email.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Setting New Password (in Reset Mode)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setMessage('Password updated successfully! Redirecting you to your destination...')
      setTimeout(() => {
        router.push(nextUrl)
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Your reset link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  // Catch URL error params and hash fragment from Supabase redirects
  useEffect(() => {
    let raw = searchParams.get('error_description') || searchParams.get('error') || ''
    let code = searchParams.get('error_code') || ''

    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      if (hashParams.get('error_description')) raw = hashParams.get('error_description') || ''
      if (hashParams.get('error_code')) code = hashParams.get('error_code') || ''
    }

    if (raw || code) {
      if (
        code === 'over_email_send_rate_limit' ||
        raw.toLowerCase().includes('rate_limit') ||
        raw.toLowerCase().includes('rate limit') ||
        raw.toLowerCase().includes('security purposes')
      ) {
        setError('Security rate limit reached. Please wait a few seconds before requesting another email.')
      } else if (raw.toLowerCase().includes('not confirmed') || raw.toLowerCase().includes('email_not_confirmed')) {
        setEmailNotConfirmed(true)
        setError('Please confirm your email address before logging in. Check your email for the confirmation link.')
      } else {
        setError(decodeURIComponent(raw.replace(/\+/g, ' ')) || 'Authentication request failed. Please try again.')
      }
    }
  }, [searchParams])

  // Calculate Password Strength (0 to 4)
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

  // Handle Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.')
      setLoading(false)
    }
  }

  // Handle Step 1 Email Continue
  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAccountAlreadyExists(false)
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setStep('details')
  }

  // Handle Step 2 Final Submission (Sign in / Sign up)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    setAccountAlreadyExists(false)

    setNoAccountFound(false)
    setWrongPassword(false)
    setEmailNotConfirmed(false)

    // Password validation for signup
    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.')
        setLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.')
        setLoading(false)
        return
      }
    }

    // Cloudflare Turnstile bot verification check
    if (turnstileToken) {
      const turnstileCheck = await validateTurnstileAction(turnstileToken)
      if (!turnstileCheck.success) {
        setError(turnstileCheck.error || 'Security verification failed. Please try again.')
        setLoading(false)
        return
      }
    }

    try {
      if (mode === 'signup') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
            data: {
              display_name: displayName,
            },
          },
        })

        if (signUpError) {
          if (
            signUpError.message.toLowerCase().includes('already registered') ||
            signUpError.message.toLowerCase().includes('user already exists')
          ) {
            setAccountAlreadyExists(true)
            throw new Error('An account with this email already exists.')
          }
          throw signUpError
        }

        // Check if user already exists (Supabase returns empty identities array when account exists)
        if (signUpData?.user && (!signUpData.user.identities || signUpData.user.identities.length === 0)) {
          setAccountAlreadyExists(true)
          throw new Error('An account with this email already exists. Please sign in instead.')
        }

        setIsEmailSent(true)
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (signInError) {
          const errLower = signInError.message.toLowerCase()
          if (
            errLower.includes('email not confirmed') ||
            errLower.includes('not confirmed')
          ) {
            setEmailNotConfirmed(true)
            throw new Error('Email not confirmed. Please verify your email before logging in.')
          }

          if (
            errLower.includes('invalid login credentials') ||
            errLower.includes('invalid credentials') ||
            errLower.includes('user not found')
          ) {
            // Fast Server Action verification
            try {
              const checkData = await checkUserStatusAction(email.trim())

              if (!checkData.exists) {
                setNoAccountFound(true)
                throw new Error('No account found with this email. Please sign up.')
              } else if (!checkData.isConfirmed) {
                setEmailNotConfirmed(true)
                throw new Error('Email not confirmed. Please verify your email before logging in.')
              } else {
                setWrongPassword(true)
                throw new Error('Incorrect password. Please verify your password.')
              }
            } catch (checkErr: any) {
              if (checkErr.message && !checkErr.message.includes('fetch')) {
                throw checkErr
              }
              setWrongPassword(true)
              throw new Error('Incorrect password. Please verify your password.')
            }
          }

          throw signInError
        }

        // Strict security safeguard: if email is not confirmed, sign out immediately
        if (signInData?.user && !signInData.user.email_confirmed_at && !signInData.user.confirmed_at) {
          await supabase.auth.signOut()
          setEmailNotConfirmed(true)
          throw new Error('Please confirm your email address before logging in.')
        }

        if (nextUrl.startsWith('http://') || nextUrl.startsWith('https://')) {
          window.location.href = nextUrl
          return
        }

        router.push(nextUrl)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Unified Dark Background (#121212) */
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4 py-8 sm:py-14 select-none">

      {/* Dark Auth Card Container (#161616 background, border #262626, rounded-2xl) */}
      <div className="w-full max-w-[480px] bg-[#161616] border border-[#262626] rounded-2xl p-7 sm:p-10 shadow-2xl space-y-6 relative transition-all">

        {/* DEDICATED EMAIL CONFIRMATION SCREEN (SIGNUP) */}
        {isEmailSent ? (
          <div className="flex flex-col items-center text-center space-y-6 py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center relative">
              <Mail className="w-8 h-8 text-zinc-300" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-black font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Check your email</h1>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                We sent a confirmation link to <span className="font-semibold text-white">{email}</span>. Click the link in the email to activate your account.
              </p>
            </div>

            <div className="w-full space-y-3 pt-2">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Open Mail Inbox</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsEmailSent(false)
                  setMode('signin')
                  setStep('email')
                }}
                className="w-full py-3.5 bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white border border-[#2e2e2e] rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>

            <p className="text-xs text-zinc-500 pt-2">
              Didn't receive it?{' '}
              <button
                type="button"
                onClick={handleAuthSubmit}
                className="text-white underline font-semibold hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Resend email
              </button>
            </p>
          </div>
        ) : mode === 'forgot' ? (
          /* FORGOT PASSWORD FLOW */
          <div className="space-y-5 animate-in fade-in">
            {/* Top Back to Sign In Link */}
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setIsResetEmailSent(false)
                setError('')
                setMessage('')
              }}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold transition-colors uppercase tracking-wider cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>

            {isResetEmailSent ? (
              /* DEDICATED PASSWORD RESET EMAIL SENT SCREEN */
              <div className="flex flex-col items-center text-center space-y-6 py-2 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center relative">
                  <KeyRound className="w-8 h-8 text-zinc-300" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset link sent</h1>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                    We sent a secure password reset link to <span className="font-semibold text-white">{email}</span>. Click the link in the email to create your new password.
                  </p>
                </div>

                {message && (
                  <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                <div className="w-full space-y-3 pt-2">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Open Mail Inbox</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setIsResetEmailSent(false)
                      setError('')
                      setMessage('')
                    }}
                    className="w-full py-3.5 bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white border border-[#2e2e2e] rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>

                <p className="text-xs text-zinc-500 pt-2">
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={handleResendResetLink}
                    disabled={resetCountdown > 0 || loading}
                    className="text-white underline font-semibold hover:text-zinc-200 transition-colors disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    {resetCountdown > 0 ? `Resend in ${resetCountdown}s` : 'Resend link'}
                  </button>
                </p>
              </div>
            ) : (
              /* FORGOT PASSWORD FORM */
              <>
                <div className="flex flex-col items-center text-center space-y-3">
                  <Link href="/" prefetch={true} className="hover:opacity-80 transition-opacity">
                    <LogoIcon size={48} />
                  </Link>

                  <h1 className="text-2xl font-extrabold text-white tracking-tight">
                    Reset your password
                  </h1>
                  <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                    Enter your registered email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="bg-[#ff4053] text-black font-extrabold p-3.5 rounded-2xl text-xs text-center space-y-2 shadow-lg animate-in fade-in">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 text-black flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[12px] font-semibold text-zinc-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] px-3.5 rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
                    />
                  </div>

                  {/* Cloudflare Turnstile Verification Widget */}
                  <TurnstileWidget
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {loading ? (
                      <ButtonSpinner size={16} variant="dark" />
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </form>

                <div className="pt-3 text-center text-xs text-zinc-400 border-t border-[#262626]">
                  <span>Remember your password? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setError('')
                      setMessage('')
                    }}
                    className="text-white hover:underline font-bold transition-colors ml-1 cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              </>
            )}
          </div>
        ) : mode === 'reset' ? (
          /* RESET PASSWORD SCREEN (SET NEW PASSWORD) */
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col items-center text-center space-y-3">
              <Link href="/" prefetch={true} className="hover:opacity-80 transition-opacity">
                <LogoIcon size={48} />
              </Link>

              <div className="w-12 h-12 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center">
                <Lock className="w-6 h-6 text-zinc-300" />
              </div>

              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Create New Password
              </h1>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Choose a strong password with at least 6 characters.
              </p>
            </div>

            {error && (
              <div className="bg-[#ff4053] text-black font-extrabold p-3.5 rounded-2xl text-xs text-center space-y-2 shadow-lg animate-in fade-in">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {message && (
              <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              {/* New Password Input */}
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-zinc-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] pl-3.5 pr-10 rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
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
                          className={`h-1 flex-1 rounded-full transition-colors ${bar <= passwordStrength
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
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] pl-3.5 pr-10 rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all shadow-lg cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {loading ? (
                  <ButtonSpinner size={16} variant="dark" />
                ) : (
                  <span>Update Password &amp; Continue</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* SIGN IN / SIGN UP FLOW */
          <>
            {/* Back Button */}
            {(step === 'details' || mode === 'signup') && (
              <button
                type="button"
                onClick={() => {
                  if (step === 'details') {
                    setStep('email')
                  } else {
                    setMode('signin')
                    setStep('email')
                  }
                  setError('')
                  setAccountAlreadyExists(false)
                }}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold transition-colors uppercase tracking-wider cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {/* Header Logo + Title */}
            <div className="flex flex-col items-center text-center space-y-3">
              <Link href="/" prefetch={true} className="hover:opacity-80 transition-opacity">
                <LogoIcon size={48} />
              </Link>

              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {mode === 'signup'
                  ? step === 'email'
                    ? "Create an Account"
                    : 'Set Your Details'
                  : step === 'email'
                    ? 'Sign in to ProducerToy'
                    : 'Enter your password'}
              </h1>

              {nextUrl.includes('checkout') && (
                <p className="text-[13px] text-zinc-400 font-normal animate-in fade-in">
                  to complete your checkout
                </p>
              )}

              {(nextUrl.startsWith('http://') || nextUrl.startsWith('https://')) && (
                <p className="text-[13px] text-zinc-400 font-normal animate-in fade-in">
                  to continue to partner store
                </p>
              )}

              {step === 'details' && (
                <p className="text-xs text-zinc-400">
                  {mode === 'signin' ? (
                    <>Signing in as <span className="font-bold text-white">{email}</span></>
                  ) : (
                    <>Setting up account for <span className="font-bold text-white">{email}</span></>
                  )}
                </p>
              )}
            </div>

            {/* Coral-Red Error Pill */}
            {error && (
              <div className="bg-[#ff4053] text-black font-extrabold p-3.5 rounded-2xl text-xs text-center space-y-2 shadow-lg animate-in fade-in">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black flex-shrink-0" />
                  <span>{error}</span>
                </div>

                {accountAlreadyExists && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setStep('details')
                      setError('')
                      setAccountAlreadyExists(false)
                    }}
                    className="mt-1 px-4 py-1.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-md cursor-pointer block mx-auto"
                  >
                    Sign in with this email →
                  </button>
                )}

                {noAccountFound && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup')
                      setStep('details')
                      setError('')
                      setNoAccountFound(false)
                    }}
                    className="mt-1 px-4 py-1.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-md cursor-pointer block mx-auto"
                  >
                    Create new account →
                  </button>
                )}

                {wrongPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot')
                      setIsResetEmailSent(false)
                      setError('')
                      setMessage('')
                    }}
                    className="mt-1 px-4 py-1.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-md cursor-pointer block mx-auto"
                  >
                    Reset forgotten password →
                  </button>
                )}

                {emailNotConfirmed && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendingEmail}
                      className="px-4 py-1.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-md cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {resendingEmail ? (
                        <>
                          <ButtonSpinner size={12} variant="light" />
                          <span>Sending Link...</span>
                        </>
                      ) : (
                        <span>Resend confirmation email →</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Info / Success Message Pill */}
            {message && (
              <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs flex items-center justify-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* STEP 1: EMAIL ENTRY */}
            {step === 'email' && (
              <div className="space-y-5">

                {/* OAuth Login Buttons */}
                <div className="space-y-2.5">
                  {/* Google Login */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-[#202020] hover:bg-[#282828] text-white border border-[#2e2e2e] rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <ButtonSpinner size={16} variant="light" />
                    ) : (
                      <>
                        <GoogleIcon size={18} />
                        <span>{mode === 'signup' ? 'Continue with Google' : 'Sign in with Google'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="w-full border-t border-[#262626]"></div>
                  <span className="bg-[#161616] px-3 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest absolute">
                    OR
                  </span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailContinue} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-zinc-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] px-3.5 rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
                    />

                    {/* Forgot Password Link right below the Email input box */}
                    {mode === 'signin' && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot')
                            setIsResetEmailSent(false)
                            setError('')
                            setMessage('')
                          }}
                          className="text-[11.5px] text-zinc-400 hover:text-white underline font-semibold transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cloudflare Turnstile Verification Widget */}
                  <TurnstileWidget
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                  />

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all shadow-lg cursor-pointer"
                  >
                    Continue
                  </button>
                </form>

                {/* Bottom Toggle mode */}
                <div className="pt-3 text-center text-xs text-zinc-400 border-t border-[#262626]">
                  {mode === 'signin' ? (
                    <>
                      <span>Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup')
                          setError('')
                          setAccountAlreadyExists(false)
                        }}
                        className="text-white hover:underline font-bold transition-colors ml-1 cursor-pointer"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      <span>Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin')
                          setError('')
                          setAccountAlreadyExists(false)
                        }}
                        className="text-white hover:underline font-bold transition-colors ml-1 cursor-pointer"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS ENTRY */}
            {step === 'details' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="block text-[12px] font-semibold text-zinc-300">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="BeatProducer99"
                      className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] px-3.5 rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
                    />
                  </div>
                )}

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[12px] font-semibold text-zinc-300">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot')
                          setIsResetEmailSent(false)
                          setError('')
                          setMessage('')
                        }}
                        className="text-[11.5px] text-zinc-400 hover:text-white underline font-semibold transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] pl-3.5 pr-10 rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator (Sign Up Mode) */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`h-1 flex-1 rounded-full transition-colors ${bar <= passwordStrength
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

                {/* Confirm Password (Sign Up Mode) */}
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="block text-[12px] font-semibold text-zinc-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-11 bg-[#181818] border border-[#282828] hover:border-[#383838] focus:border-zinc-300 text-white text-[13px] pl-3.5 pr-10 rounded-md outline-none transition-colors placeholder:text-zinc-500 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Cloudflare Turnstile Verification Widget */}
                <TurnstileWidget
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all shadow-lg cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <ButtonSpinner size={16} variant="dark" />
                  ) : (
                    <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                  )}
                </button>

              </form>
            )}

            {/* Bottom Terms Notice */}
            <p className="text-[11px] text-zinc-500 text-center leading-relaxed border-t border-[#262626] pt-4">
              By continuing, you agree to ProducerToy's Terms of Service and Privacy Policy.
            </p>
          </>
        )}

      </div>

    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <ButtonSpinner size={24} variant="light" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  )
}
