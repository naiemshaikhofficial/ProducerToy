'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { getUserGiftsAction, GiftRecord } from '@/actions/giftActions'
import { createClient } from '@/lib/supabase/client'

interface GiftContextType {
  gifts: GiftRecord[]
  unopenedCount: number
  receivedGifts: GiftRecord[]
  sentGifts: GiftRecord[]
  isLoading: boolean
  refreshGifts: () => Promise<void>
}

const GiftContext = createContext<GiftContextType | undefined>(undefined)

export function GiftProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [gifts, setGifts] = useState<GiftRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshGifts = useCallback(async () => {
    if (!user) {
      // Check local storage for test guest gifts if present
      try {
        const localGifts: any[] = JSON.parse(localStorage.getItem('pt_user_gifts') || '[]')
        if (localGifts.length > 0) {
          setGifts(
            localGifts.map((g) => ({
              id: g.id || `local-${Math.random()}`,
              product_id: g.product_id || '',
              product_name: g.product_name || 'Audio Pack',
              product_slug: g.product_slug || '',
              cover_image: g.cover_image || '',
              sender_email: g.sender_email || '',
              sender_name: g.sender_name || 'Producer',
              recipient_email: g.recipient_email || '',
              claim_code: g.claim_code || '',
              status: g.status || 'unopened',
              created_at: g.created_at || new Date().toISOString(),
            }))
          )
          return
        }
      } catch {}
      setGifts([])
      return
    }

    try {
      setIsLoading(true)
      const res = await getUserGiftsAction()
      if (res.success && res.gifts) {
        setGifts(res.gifts)
      }
    } catch (err) {
      console.warn('Failed to fetch gifts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Fetch on mount or auth change
  useEffect(() => {
    refreshGifts()
  }, [refreshGifts])

  // Refresh on tab focus
  useEffect(() => {
    const handleFocus = () => {
      refreshGifts()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshGifts])

  // Supabase Realtime Subscription for instant live updates when someone sends a gift
  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    const channel = supabase
      .channel('realtime_user_gifts_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gifts',
        },
        () => {
          refreshGifts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refreshGifts])

  const userEmail = (user?.email || '').toLowerCase()

  const receivedGifts = useMemo(() => {
    if (!user) return []
    return gifts.filter(
      (g) =>
        (g.recipient_id && g.recipient_id === user.id) ||
        (g.recipient_email && g.recipient_email.toLowerCase() === userEmail)
    )
  }, [gifts, user, userEmail])

  const sentGifts = useMemo(() => {
    if (!user) return []
    return gifts.filter(
      (g) =>
        (g.sender_id && g.sender_id === user.id) ||
        (g.sender_email && g.sender_email.toLowerCase() === userEmail)
    )
  }, [gifts, user, userEmail])

  const unopenedCount = useMemo(() => {
    // Count unopened gifts addressed to current user
    if (!user) {
      return gifts.filter((g) => g.status === 'unopened').length
    }
    return receivedGifts.filter((g) => g.status === 'unopened').length
  }, [receivedGifts, gifts, user])

  return (
    <GiftContext.Provider
      value={{
        gifts,
        unopenedCount,
        receivedGifts,
        sentGifts,
        isLoading,
        refreshGifts,
      }}
    >
      {children}
    </GiftContext.Provider>
  )
}

export function useGifts() {
  const context = useContext(GiftContext)
  if (!context) {
    throw new Error('useGifts must be used within a GiftProvider')
  }
  return context
}
