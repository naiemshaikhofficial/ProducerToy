'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

function PairForm() {
  const searchParams = useSearchParams()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

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

    setStatus('loading')
    setMessage('')

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
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Network error connecting to licensing engine.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white px-4 py-12 selection:bg-[#34363d] selection:text-white">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        {/* ProducerToy Key Bear Mascot Logo */}
        <div className="relative w-28 h-28 mb-6 transition-transform duration-300 hover:scale-105">
          <Image
            src="/images/producertoy-key-bear.png"
            alt="ProducerToy Mascot"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Pair Machine
        </h1>
        <p className="text-sm text-[#a0a0a0] mb-8 leading-relaxed max-w-sm">
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

            {status === 'error' && (
              <div className="text-xs text-rose-400 bg-rose-500/10 rounded-lg p-3 leading-relaxed border border-rose-500/20">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full h-12 bg-white text-[#121212] font-semibold text-sm rounded-xl hover:bg-[#e4e4e7] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-white/5"
            >
              {status === 'loading' ? 'Authorizing Machine...' : 'Authorize Machine'}
            </button>
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
