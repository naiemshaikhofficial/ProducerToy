'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  display_name?: string | null
  full_name?: string | null
  avatar_url?: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    // 1. Instant check from localStorage for 0ms initial render
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`pt_profile_${userId}`)
        if (cached) {
          setProfile(JSON.parse(cached))
        }
      } catch {}
    }

    try {
      const supabase = createClient()
      const { data: prof } = await supabase
        .from('profiles')
        .select('display_name, full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle()

      if (prof) {
        setProfile(prof)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`pt_profile_${userId}`, JSON.stringify(prof))
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[AUTH_PROFILE_ERROR]', err)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }, [user?.id, fetchProfile])

  useEffect(() => {
    const supabase = createClient()

    // Intercept password recovery token from hash or query if arriving on home or any other page
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/reset-password')) {
      const hash = window.location.hash || ''
      const search = window.location.search || ''
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        window.location.replace(`/reset-password${search}${hash}`)
        return
      }
    }

    // 🟢 ZERO-RESOURCE INIT:
    // getSession() checks local localStorage without making an unnecessary HTTP network request to Supabase Auth.
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user || null
        setUser(currentUser)
        if (currentUser) {
          fetchProfile(currentUser.id)
        }
      } catch (err) {
        console.error('[AUTH_INIT_ERROR]', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
        // Clear all cached profile and user-specific storage when user is signed out
        if (typeof window !== 'undefined') {
          try {
            Object.keys(localStorage).forEach((key) => {
              if (
                key.startsWith('pt_profile_') ||
                key === 'pt_billing_details' ||
                key === 'pt_user_gifts' ||
                key === 'pt_pending_gifts' ||
                key === 'producertoy_user_tickets' ||
                key === 'producertoy_support_chat_session_v1' ||
                key.startsWith('sb-') ||
                key.startsWith('supabase.auth.')
              ) {
                localStorage.removeItem(key)
              }
            })
            sessionStorage.clear()
          } catch {}

          if (event === 'SIGNED_OUT') {
            window.dispatchEvent(new CustomEvent('pt:profile-updated', { detail: null }))
            window.dispatchEvent(new CustomEvent('pt:auth-changed', { detail: { user: null } }))
            const currentPath = window.location.pathname
            if (currentPath.startsWith('/account') || currentPath.startsWith('/library')) {
              window.location.replace('/auth')
            }
          }
        }
      }
      setLoading(false)

      // Automatically route user to reset-password screen if triggered by recovery link
      if (event === 'PASSWORD_RECOVERY') {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/reset-password')) {
          const hash = window.location.hash || ''
          const search = window.location.search || ''
          window.location.replace(`/reset-password${hash}${search ? (hash ? '&' : '?') + search.replace(/^\?/, '') : ''}`)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // Listen for realtime custom event when user edits profile anywhere (e.g. Account Settings)
  useEffect(() => {
    const handleProfileUpdated = (event: any) => {
      if (event.detail) {
        setProfile((prev) => {
          const updated = { ...prev, ...event.detail }
          if (user?.id && typeof window !== 'undefined') {
            try {
              localStorage.setItem(`pt_profile_${user.id}`, JSON.stringify(updated))
            } catch {}
          }
          return updated
        })
      } else {
        setProfile(null)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('pt:profile-updated', handleProfileUpdated)
      return () => {
        window.removeEventListener('pt:profile-updated', handleProfileUpdated)
      }
    }
  }, [user?.id])

  const signOut = async () => {
    const supabase = createClient()
    if (typeof window !== 'undefined') {
      try {
        // Thoroughly clear all user-specific data from localStorage and sessionStorage
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith('pt_profile_') ||
            key === 'pt_billing_details' ||
            key === 'pt_user_gifts' ||
            key === 'pt_pending_gifts' ||
            key === 'producertoy_user_tickets' ||
            key === 'producertoy_support_chat_session_v1' ||
            key.startsWith('sb-') ||
            key.startsWith('supabase.auth.')
          ) {
            localStorage.removeItem(key)
          }
        })
        sessionStorage.clear()
      } catch {}
    }
    
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pt:profile-updated', { detail: null }))
      window.dispatchEvent(new CustomEvent('pt:auth-changed', { detail: { user: null } }))

      // If user logs out while on /account or /library, instantly redirect to /auth
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/account') || currentPath.startsWith('/library')) {
        window.location.replace('/auth')
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
