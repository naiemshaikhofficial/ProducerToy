'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
        setUser(session?.user || null)
      } catch (err) {
        console.error('[AUTH_INIT_ERROR]', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
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
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
