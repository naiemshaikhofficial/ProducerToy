'use client'

import React, { useState, useEffect } from 'react'
import { Check, AlertCircle, X, Trash2, ArrowRight } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full max-w-sm bg-[#141414] border border-[#282828] rounded-2xl shadow-2xl p-5 space-y-4 text-white animate-in zoom-in-95 duration-150 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Plugin Activation</h3>
            <p className="text-xs text-zinc-400">Unlock ProVerb on this machine</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {successInfo ? (
          <div className="p-3.5 bg-[#181818] border border-[#262626] rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Check className="w-4 h-4" />
              <span>Plugin Activated</span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Authorized for <strong className="text-white font-mono">{successInfo.deviceName}</strong>. ProVerb in your DAW will now unlock automatically.
            </p>
            <div className="flex items-center justify-between text-[10.5px] text-zinc-500 pt-2 border-t border-[#242424]">
              <span>{successInfo.maskedEmail}</span>
              <span>Seats: {successInfo.seatsUsed} / {successInfo.maxSeats}</span>
            </div>
          </div>
        ) : (
          /* Form for Entering Pairing Code */
          <form onSubmit={handleClaim} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Pairing Code
              </label>
              <input
                type="text"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                placeholder="e.g. TOY-8942"
                className="w-full bg-[#181818] border border-[#2c2c2c] rounded-xl px-3.5 py-2 text-sm font-mono font-semibold tracking-wider text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all uppercase"
                maxLength={12}
                autoFocus
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                In ProVerb &rarr; Click <strong>Activate via Producer Toy</strong>
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-[#1e1416] border border-[#3e1f24] rounded-xl text-xs text-rose-300 space-y-1">
                <div>{errorMessage}</div>
                {needsPurchaseUrl && (
                  <a
                    href={needsPurchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-white hover:underline font-semibold text-[11px]"
                  >
                    Buy ProVerb on Producer Toy <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isClaiming || !pairingCode.trim()}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-white hover:bg-zinc-200 text-black active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isClaiming ? (
                <>
                  <ButtonSpinner />
                  <span>Activating...</span>
                </>
              ) : (
                <span>Activate Device</span>
              )}
            </button>
          </form>
        )}

        {/* Active Device Seats (Clean & Compact) */}
        {activeDevices.length > 0 && (
          <div className="pt-3 border-t border-[#242424] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
              <span>Active Device</span>
              <span>{activeDevices.length} / 1</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {activeDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center justify-between p-2 bg-[#181818] border border-[#242424] rounded-lg text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-white truncate text-[11px]">
                      {dev.device_name || 'Studio PC'}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {dev.os || 'Windows'} • {new Date(dev.activated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeactivate(dev.id)}
                    disabled={deactivatingId === dev.id}
                    title="Deactivate seat"
                    className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  >
                    {deactivatingId === dev.id ? <ButtonSpinner /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Single device license</span>
          <a
            href="https://producertoy.com/support"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  )
}
