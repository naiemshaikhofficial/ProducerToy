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
  const [productSlug, setProductSlug] = useState('')
  const [productName, setProductName] = useState('')

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
      setMessage('Please enter your pairing code from your plugin.')
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
        setMessage(data.message || 'Machine successfully paired! Your plugin is now unlocked.')
        if (data.productName) setProductName(data.productName)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to authorize pairing code. Please generate a new code in your plugin.')
        if (data.needsPurchase) {
          setNeedsPurchase(true)
          if (data.productSlug) setProductSlug(data.productSlug)
          if (data.productName) setProductName(data.productName)
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
              You can return to your DAW now. {productName ? `${productName} is unlocked and ready to use.` : 'Your plugin is unlocked and ready to use.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handlePair} className="w-full space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XX-XXXX-XXXX"
                className="w-full h-14 bg-[#1a1a1c] text-white text-center text-xl font-mono tracking-widest rounded-xl px-4 border border-[#2a2a2d] focus:border-[#52525b] focus:outline-none transition-all placeholder:text-[#52525b] placeholder:tracking-normal"
                disabled={status === 'loading'}
                autoFocus
              />
            </div>

            {/* Coral-Red Error Pill matching Auth page */}
            {status === 'error' && (
              <div className="bg-[#ff4053] text-black font-extrabold p-3 rounded-xl text-xs text-center flex items-center justify-center gap-2 shadow-md animate-in fade-in">
                <span>{message}</span>
              </div>
            )}

            {/* If user is NOT signed in: enforce sign-in first */}
            {!authLoading && !user ? (
              <div className="space-y-3 pt-1">
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
                href={productSlug ? `/product/${productSlug}` : '/store'}
                className="w-full h-12 bg-white text-[#121212] font-semibold text-sm rounded-xl hover:bg-[#e4e4e7] active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-white/5 flex items-center justify-center"
              >
                Purchase
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
