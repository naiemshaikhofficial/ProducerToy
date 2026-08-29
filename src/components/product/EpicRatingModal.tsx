'use client'

import React, { useState, useEffect } from 'react'
import { X, Check, LogIn } from 'lucide-react'
import Link from 'next/link'
import { submitProductRatingAction, ProductRatingStats } from '@/actions/ratingActions'
import { useAuth } from '@/context/AuthContext'

interface EpicRatingModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productSlug: string
  productName: string
  initialRating?: number
  onRatingSuccess: (stats: ProductRatingStats) => void
}

export function EpicRatingModal({
  isOpen,
  onClose,
  productId,
  productSlug,
  productName,
  initialRating = 5,
  onRatingSuccess,
}: EpicRatingModalProps) {
  const { user } = useAuth()
  const [selectedRating, setSelectedRating] = useState<number>(initialRating || 5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (initialRating) {
      setSelectedRating(initialRating)
    }
  }, [initialRating])

  if (!isOpen) return null

  const displayRating = hoverRating ?? selectedRating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await submitProductRatingAction({
        productId,
        productSlug,
        rating: selectedRating,
        reviewText,
      })

      if (res.success && res.stats) {
        setSuccess(true)
        onRatingSuccess(res.stats)
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 1200)
      } else {
        setErrorMsg(res.message || 'Failed to submit rating.')
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl text-white select-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1 pr-6">
          <h3 className="text-lg font-bold text-white tracking-tight">Rate this Product</h3>
          <p className="text-xs text-zinc-400 truncate">{productName}</p>
        </div>

        {!user ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <LogIn className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Sign In to Rate</h4>
              <p className="text-xs text-zinc-400 max-w-xs">
                You need to be signed in to leave a verified rating for this product.
              </p>
            </div>
            <Link
              href="/auth"
              className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-colors"
            >
              Sign In / Register
            </Link>
          </div>
        ) : success ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">Thank you for your rating!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Star Picker (Static, Minimalist Epic Aesthetic) */}
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-3xl transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                  >
                    <span className={star <= displayRating ? 'text-white' : 'text-zinc-700'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-300">
                {displayRating === 5 && 'Outstanding'}
                {displayRating === 4 && 'Great'}
                {displayRating === 3 && 'Average'}
                {displayRating === 2 && 'Below Average'}
                {displayRating === 1 && 'Poor'}
              </span>
            </div>

            {/* Optional Review Text */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-zinc-400">
                Write a quick review (optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think of the sound quality and workflow?"
                rows={3}
                className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-zinc-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none transition-colors"
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-400 text-center">{errorMsg}</p>}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#222222] hover:bg-[#282828] text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
