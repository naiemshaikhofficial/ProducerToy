'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

function PairForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [needsPurchase, setNeedsPurchase] = useState(false)
  const [productSlug, setProductSlug] = useState('proverb')

  useEffect(() => {
    const urlCode = searchParams?.get('code')
    if (urlCode) {
      setCode(urlCode.toUpperCase())
    }
  }, [searchParams])

  const handlePair = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!code.trim()) {
      setStatus('error')
      setMessage('Please enter your pairing code from ProVerb.')
      return
    }

    if (!user) {
      const targetUrl = `/auth?next=${encodeURIComponent('/pair' + (code ? `?code=${code}` : ''))}`
      router.push(targetUrl)
      return
    }

    setStatus('loading')
    setMessage('')
    setNeedsPurchase(false)

    try {
      const res = await fetch('/api/v1/license/pair/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Machine successfully paired! ProVerb is now unlocked.')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to authorize pairing code. Please generate a new code in ProVerb.')
        if (data.needsPurchase) {
          setNeedsPurchase(true)
          if (data.productSlug) {
            setProductSlug(data.productSlug)
          }
        }
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Network error connecting to licensing engine.')
    }
  }

  const handleSignInRedirect = () => {
    const targetUrl = `/auth?next=${encodeURIComponent('/pair' + (code ? `?code=${code}` : ''))}`
    router.push(targetUrl)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white px-4 py-12 selection:bg-[#34363d] selection:text-white">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        {/* ProducerToy Key Bear Mascot Logo */}
        <div className="mb-5 transition-transform duration-300 hover:scale-105">
          <Image
            src="/images/producertoy-key-bear.webp"
            alt="ProducerToy Mascot"
            width={120}
            height={105}
            className="object-contain drop-shadow-2xl mx-auto"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Pair Machine
        </h1>
        <p className="text-sm text-[#a0a0a0] mb-6 leading-relaxed max-w-sm">
          Enter your single-use code to pair your audio workstation with your ProducerToy account.
        </p>

        {status === 'success' ? (
          <div className="w-full bg-[#1c1c1e] rounded-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mx-auto mb-3">
              ✓
            </div>
            <h2 className="text-base font-semibold text-white mb-1">
              Machine Authorized
            </h2>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              You can return to your DAW now. ProVerb is unlocked and ready to use.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePair} className="w-full space-y-4">
            {/* Account Info Pill */}
            {!authLoading && user && (
              <div className="flex items-center justify-between bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-[#a1a1aa] mb-2">
                <span className="truncate">
                  Signed in as <strong className="text-white font-medium">{user.email}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleSignInRedirect}
                  className="ml-2 text-xs text-[#71717a] hover:text-white transition-colors cursor-pointer flex-shrink-0"
                >
                  Switch
                </button>
              </div>
            )}

            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="PV-XXXX-XXXX"
                className="w-full h-14 bg-[#1a1a1c] text-white text-center text-xl font-mono tracking-widest rounded-xl px-4 border border-[#2a2a2d] focus:border-[#52525b] focus:outline-none transition-all placeholder:text-[#52525b] placeholder:tracking-normal"
                disabled={status === 'loading'}
                autoFocus
              />
            </div>

            {/* Error Message with Auth-style subtle rose pill */}
            {status === 'error' && (
              <div className="text-xs text-rose-400 bg-rose-500/10 rounded-lg p-3 leading-relaxed border border-rose-500/20 text-left">
                {message}
              </div>
            )}

            {/* If user is NOT signed in: enforce sign-in first */}
            {!authLoading && !user ? (
              <div className="space-y-3 pt-1">
                <div className="text-xs text-[#a1a1aa] bg-[#18181b] rounded-xl p-3 leading-relaxed border border-[#27272a] text-center">
                  Sign in required. Only accounts that have ProVerb in their library can authorize machines.
                </div>
                <button
                  type="button"
                  onClick={handleSignInRedirect}
                  className="w-full h-12 bg-white text-[#121212] font-semibold text-sm rounded-xl hover:bg-[#e4e4e7] active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-white/5"
                >
                  Sign In to Authorize
                </button>
              </div>
            ) : needsPurchase ? (
              /* If user doesn't have the product in library */
              <Link
                href={`/product/${productSlug}`}
                className="w-full h-12 bg-white text-[#121212] font-semibold text-sm rounded-xl hover:bg-[#e4e4e7] active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-white/5 flex items-center justify-center"
              >
                Get ProVerb Free & Add to Library
              </Link>
            ) : (
              /* Authenticated user ready to authorize */
              <button
                type="submit"
                disabled={status === 'loading' || authLoading}
                className="w-full h-12 bg-white text-[#121212] font-semibold text-sm rounded-xl hover:bg-[#e4e4e7] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-white/5"
              >
                {status === 'loading' ? 'Authorizing Machine...' : 'Authorize Machine'}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default function PairPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
      <PairForm />
    </Suspense>
  )
}
