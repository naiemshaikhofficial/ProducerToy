'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Laptop,
  Check,
  AlertCircle,
  X,
  Key,
  ExternalLink,
  Trash2,
  Sparkles,
  ArrowRight,
  Monitor
} from 'lucide-react'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'

interface PluginActivationModalProps {
  isOpen: boolean
  initialCode?: string
  onClose: () => void
  onSuccess?: () => void
}

interface ActiveDevice {
  id: string
  device_name: string
  os: string
  activated_at: string
  product_id?: string
  products?: {
    name: string
  }
}

export function PluginActivationModal({
  isOpen,
  initialCode = '',
  onClose,
  onSuccess,
}: PluginActivationModalProps) {
  const [pairingCode, setPairingCode] = useState(initialCode)
  const [isClaiming, setIsClaiming] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{
    productName: string
    deviceName: string
    maskedEmail: string
    seatsUsed: number
    maxSeats: number
  } | null>(null)

  const [activeDevices, setActiveDevices] = useState<ActiveDevice[]>([])
  const [isLoadingDevices, setIsLoadingDevices] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [needsPurchaseUrl, setNeedsPurchaseUrl] = useState<string | null>(null)

  useEffect(() => {
    if (initialCode) {
      setPairingCode(initialCode.toUpperCase().trim())
    }
  }, [initialCode])

  useEffect(() => {
    if (isOpen) {
      fetchDevices()
    } else {
      setErrorMessage(null)
      setSuccessInfo(null)
      setNeedsPurchaseUrl(null)
    }
  }, [isOpen])

  const fetchDevices = async () => {
    try {
      setIsLoadingDevices(true)
      const res = await fetch('/api/license/devices')
      const data = await res.json()
      if (data.success && data.devices) {
        setActiveDevices(data.devices)
      }
    } catch (e) {
      console.warn('Could not fetch active devices:', e)
    } finally {
      setIsLoadingDevices(false)
    }
  }

  const handleClaim = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!pairingCode.trim()) return

    setIsClaiming(true)
    setErrorMessage(null)
    setSuccessInfo(null)
    setNeedsPurchaseUrl(null)

    try {
      const res = await fetch('/api/license/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairingCode: pairingCode.trim().toUpperCase() }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccessInfo({
          productName: data.productName,
          deviceName: data.deviceName,
          maskedEmail: data.maskedEmail,
          seatsUsed: data.seatsUsed,
          maxSeats: data.maxSeats,
        })
        fetchDevices()
        if (onSuccess) onSuccess()
      } else {
        setErrorMessage(data.error || 'Failed to claim activation code.')
        if (data.needsPurchase && data.productSlug) {
          setNeedsPurchaseUrl(`/product/${data.productSlug}`)
        }
        if (data.seatLimitReached && data.activeDevices) {
          setActiveDevices(data.activeDevices)
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error claiming activation.')
    } finally {
      setIsClaiming(false)
    }
  }

  const handleDeactivate = async (activationId: string) => {
    try {
      setDeactivatingId(activationId)
      const res = await fetch('/api/license/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationId }),
      })
      const data = await res.json()
      if (data.success) {
        setActiveDevices((prev) => prev.filter((d) => d.id !== activationId))
        setErrorMessage(null)
      } else {
        setErrorMessage(data.error || 'Failed to deactivate seat')
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error communicating with license server')
    } finally {
      setDeactivatingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden p-6 text-zinc-100">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white shadow-inner">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Plugin Activation & Device Seats
            </h2>
            <p className="text-xs text-zinc-400">
              Producer Toy Secure Hardware Entitlement Service
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {successInfo ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl mb-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Check className="w-4 h-4" />
              <span>Plugin Successfully Unlocked!</span>
            </div>
            <p className="text-xs text-zinc-300">
              <strong>{successInfo.productName}</strong> has been authorized for{' '}
              <span className="text-emerald-300 font-mono">
                "{successInfo.deviceName}"
              </span>
              . Your plugin in your DAW will now automatically register and turn active.
            </p>
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-emerald-800/30">
              <span>Account: {successInfo.maskedEmail}</span>
              <span className="text-zinc-300 font-medium">
                Seats Used: {successInfo.seatsUsed} / {successInfo.maxSeats}
              </span>
            </div>
          </div>
        ) : (
          /* Form for Entering Pairing Code */
          <form onSubmit={handleClaim} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Desktop Pairing Challenge Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TOY-8942"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-3 text-base font-mono font-bold tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all uppercase"
                  maxLength={12}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Open ProVerb in your DAW, click <strong>Activate via Producer Toy</strong>, and enter the code shown.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>{errorMessage}</span>
                  {needsPurchaseUrl && (
                    <div>
                      <a
                        href={needsPurchaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-white hover:text-zinc-300 underline underline-offset-2 font-semibold mt-1"
                      >
                        Buy ProVerb on Producer Toy <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isClaiming || !pairingCode.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isClaiming ? (
                <>
                  <ButtonSpinner />
                  <span>Verifying & Signing Entitlement...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activate Device Seat</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Active Device Seats Section */}
        <div className="pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-zinc-400" />
              <span>Active Hardware Seats</span>
            </h3>
            <span className="text-[11px] text-zinc-500">
              {activeDevices.length} registered
            </span>
          </div>

          {isLoadingDevices ? (
            <div className="py-4 text-center text-xs text-zinc-500">
              Loading active devices...
            </div>
          ) : activeDevices.length === 0 ? (
            <div className="py-4 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800/40">
              No devices currently activated. Activate your first device above!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activeDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center justify-between p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                      <Laptop className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200">
                        {dev.device_name || 'Studio PC'}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {dev.products?.name ? `${dev.products.name} • ` : ''}
                        {dev.os || 'Windows'} •{' '}
                        {new Date(dev.activated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeactivate(dev.id)}
                    disabled={deactivatingId === dev.id}
                    title="Deactivate this seat to free it for another machine"
                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deactivatingId === dev.id ? (
                      <ButtonSpinner />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Standard: 3 Hardware Seats per License</span>
          <a
            href="https://producertoy.com/support"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            Licensing Support <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
