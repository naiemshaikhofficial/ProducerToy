'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#090a0f',
      color: '#f4f4f5',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: '#12131a',
        border: '1px solid #27272a',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          color: '#00f0ff',
          fontSize: '24px'
        }}>
          ⚡
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Pair Audio Workstation
        </h1>
        <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 28px 0', lineHeight: 1.5 }}>
          Authorize this machine with your ProducerToy account to instantly unlock ProVerb.
        </p>

        {status === 'success' ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            color: '#10b981',
            fontSize: '15px',
            lineHeight: 1.5
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
            <strong>Machine Successfully Authorized</strong>
            <p style={{ margin: '8px 0 0 0', color: '#a1a1aa', fontSize: '13px' }}>
              You can return to ProVerb now. The plugin will activate automatically within seconds.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePair}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="PV-XXXX-XXXX"
                style={{
                  width: '100%',
                  background: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  fontSize: '20px',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  color: '#ffffff',
                  letterSpacing: '2px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                disabled={status === 'loading'}
                autoFocus
              />
            </div>

            {status === 'error' && (
              <div style={{
                color: '#ef4444',
                fontSize: '13px',
                marginBottom: '16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '10px 14px',
                borderRadius: '8px'
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                background: status === 'loading' ? '#3f3f46' : '#00f0ff',
                color: '#05070a',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              {status === 'loading' ? 'Authorizing Machine...' : 'Authorize Machine'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '28px', borderTop: '1px solid #27272a', paddingTop: '16px', fontSize: '12px', color: '#71717a' }}>
          ProducerToy Dynamic Cryptographic Licensing • Ed25519
        </div>
      </div>
    </div>
  )
}

export default function PairPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#090a0f' }} />}>
      <PairForm />
    </Suspense>
  )
}
