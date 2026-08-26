'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon } from '@/components/Logo'
import { ChevronLeft, Eye, EyeOff, Mail, CheckCircle2, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

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

// Spotify Icon
function SpotifyIcon({ size = 20 }: { size?: number }) {
  return (
    <img
      src="/Logo/icons8-spotify-100.png"
      alt="Spotify"
      width={size}
      height={size}
      className="flex-shrink-0 object-contain"
    />
  )
}

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/'
  const supabase = createClient()

  // Navigation mode ('signin' | 'signup') & Step ('email' | 'details')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [step, setStep] = useState<'email' | 'details'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  // UI feedback states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [accountAlreadyExists, setAccountAlreadyExists] = useState(false)

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
        setError('Supabase email confirmation rate limit reached. In Supabase Dashboard -> Auth -> Providers -> Email, please disable "Confirm email" to enable instant login.')
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

  // Handle Spotify OAuth Login
  const handleSpotifyLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: callbackUrl,
          scopes: 'user-read-email playlist-read-private',
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Spotify authentication failed.')
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

  // Handle Step 2 Final Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    setAccountAlreadyExists(false)

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

    try {
      if (mode === 'signup') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
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
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
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
    /* Unified Epic Games Dark Background (#121212) */
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4 py-8 sm:py-14 select-none">
      
      {/* Epic Games Dark Auth Card Container (#161616 background, border #262626, rounded-2xl) */}
      <div className="w-full max-w-[480px] bg-[#161616] border border-[#262626] rounded-2xl p-7 sm:p-10 shadow-2xl space-y-6 relative transition-all">
        
        {/* DEDICATED EMAIL CONFIRMATION SCREEN */}
        {isEmailSent ? (
          <div className="flex flex-col items-center text-center space-y-6 py-2">
            <div className="w-16 h-16 rounded-full bg-[#202020] border border-[#2e2e2e] flex items-center justify-center relative">
              <Mail className="w-8 h-8 text-zinc-300" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
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
                className="w-full py-3.5 bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white border border-[#2e2e2e] rounded-full font-bold text-xs uppercase tracking-wider transition-all"
              >
                Back to Sign In
              </button>
            </div>

            <p className="text-xs text-zinc-500 pt-2">
              Didn't receive it?{' '}
              <button
                type="button"
                onClick={handleAuthSubmit}
                className="text-white underline font-semibold hover:text-zinc-200 transition-colors"
              >
                Resend email
              </button>
            </p>
          </div>
        ) : (
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
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold transition-colors uppercase tracking-wider"
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

            {/* Epic Games Dark Theme Error Container (No ugly green/white borders) */}
            {error && (
              <div className="bg-[#241818] border border-[#ff4053]/30 text-[#ff4053] p-3.5 rounded-xl text-xs text-center space-y-2 animate-in fade-in">
                <div className="flex items-center justify-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-[#ff4053]" />
                  <span>{error}</span>
                </div>
                {accountAlreadyExists && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setError('')
                      setAccountAlreadyExists(false)
                    }}
                    className="w-full mt-2 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-[11px] rounded-lg uppercase tracking-wider transition-all"
                  >
                    Switch to Sign In
                  </button>
                )}
              </div>
            )}

            {message && (
              <div className="bg-[#1e241e] border border-[#203420] text-zinc-200 p-3.5 rounded-xl text-xs text-center animate-in fade-in">
                {message}
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
                    className="w-full py-3.5 bg-[#202020] hover:bg-[#282828] text-white border border-[#2e2e2e] rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
                  >
                    <GoogleIcon size={18} />
                    <span>{mode === 'signup' ? 'Continue with Google' : 'Sign in with Google'}</span>
                  </button>

                  {/* Spotify Login */}
                  <button
                    type="button"
                    onClick={handleSpotifyLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-[#202020] hover:bg-[#282828] text-white border border-[#2e2e2e] rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
                  >
                    <SpotifyIcon size={18} />
                    <span>{mode === 'signup' ? 'Continue with Spotify' : 'Sign in with Spotify'}</span>
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
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#202020] text-white text-xs px-4 py-3.5 rounded-xl border border-[#2e2e2e] focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-500"
                    />
                  </div>

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
                        className="text-white hover:underline font-bold transition-colors ml-1"
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
                        className="text-white hover:underline font-bold transition-colors ml-1"
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
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="BeatProducer99"
                      className="w-full bg-[#202020] text-white text-xs px-4 py-3 rounded-xl border border-[#2e2e2e] focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-500"
                    />
                  </div>
                )}

                {/* Password Input */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#202020] text-white text-xs pl-4 pr-10 py-3 rounded-xl border border-[#2e2e2e] focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
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

                {/* Confirm Password (Sign Up Mode) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#202020] text-white text-xs pl-4 pr-10 py-3 rounded-xl border border-[#2e2e2e] focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="text-right">
                    <Link href="#" className="text-xs text-zinc-400 hover:text-white transition-colors underline">
                      Forgot password?
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-full tracking-wider uppercase transition-all shadow-lg cursor-pointer mt-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Processing...</span>
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
    <Suspense fallback={<div className="min-h-screen bg-[#121212] flex items-center justify-center text-white text-xs font-mono">Loading...</div>}>
      <AuthForm />
    </Suspense>
  )
}
