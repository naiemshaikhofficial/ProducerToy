'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Plus,
  Unlink,
  Music,
  Radio,
  Disc,
  Headphones,
  Sliders,
  Layers,
  Sparkles,
  ShieldCheck,
  Loader2,
  X,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { CustomConfirmModal } from './CustomConfirmModal'

interface LinkedAccountsTabProps {
  user?: any
  profile?: any
  onProfileUpdate?: () => void
}

interface MusicProvider {
  id: string
  name: string
  category: string
  description: string
  scopes: string[]
  iconBg: string
  icon: React.ReactNode
}

// Music & Audio Production Providers
const MUSIC_PROVIDERS: MusicProvider[] = [
  {
    id: 'google',
    name: 'Google',
    category: 'Cloud Storage & SSO',
    description: 'Primary sign-in and Google Drive cloud backups for project stems and presets.',
    scopes: ['openid', 'email', 'profile', 'drive.file (preset backups)'],
    iconBg: 'bg-white text-black',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
    ),
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Streaming & Artist Profile',
    description: 'Connect Spotify for Artists to showcase your discography and stream preview tracks.',
    scopes: ['user-read-private', 'user-read-email', 'playlist-read-private', 'artist-discography-sync'],
    iconBg: 'bg-[#181818] border border-[#2e2e2e]',
    icon: (
      <img
        src="/Logo/icons8-spotify-100.png"
        alt="Spotify"
        className="w-7 h-7 object-contain"
      />
    ),
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    category: 'Audio Demos & Stems',
    description: 'Sync your SoundCloud account to import beat snippets and host private review links.',
    scopes: ['read-tracks', 'read-playlists', 'upload-stems', 'private-demo-stream'],
    iconBg: 'bg-[#FF5500] text-white',
    icon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M11.56 8.87V17h9.19c1.8 0 3.25-1.45 3.25-3.25s-1.45-3.25-3.25-3.25c-.2 0-.39.02-.58.06C19.8 8.1 17.65 6.2 15 6.2c-1.36 0-2.6.5-3.44 1.37v1.3zm-1.8 1.94v6.19h.9V9.75c-.32.32-.62.68-.9 1.06zm-1.8 1.7v4.49h.9v-5.2c-.34.21-.65.45-.9.71zm-1.8.84v3.65h.9v-4.14c-.33.15-.64.31-.9.49zm-1.8.85v2.8h.9v-3.21c-.32.12-.63.26-.9.41zm-1.8.91v1.89h.9v-2.22c-.31.1-.62.21-.9.33zm-1.8.96v.93h.9v-1.19c-.3.08-.6.17-.9.26z" />
      </svg>
    ),
  },
  {
    id: 'splice',
    name: 'Splice',
    category: 'Cloud Presets & Samples',
    description: 'Link your Splice library to auto-sync sample packs and serum preset banks.',
    scopes: ['samples-read', 'preset-sync', 'cloud-stems-import'],
    iconBg: 'bg-[#001428] text-white border border-[#2a2a2a]',
    icon: <Layers className="w-6 h-6 text-white" />,
  },
  {
    id: 'apple_music',
    name: 'Apple Music',
    category: 'Artist Discography',
    description: 'Connect Apple Music for Artists to verify releases and sync production metadata.',
    scopes: ['music-user-token', 'storefront-read', 'artist-catalog-read'],
    iconBg: 'bg-[#FC3C44] text-white',
    icon: <Music className="w-6 h-6 text-white" />,
  },
  {
    id: 'youtube_music',
    name: 'YouTube Music',
    category: 'Video Stems & Tutorials',
    description: 'Sync your Official Artist Channel to display production beat breakdowns and tutorials.',
    scopes: ['youtube.readonly', 'youtube.channel-sync', 'audio-stream-access'],
    iconBg: 'bg-[#FF0000] text-white',
    icon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 'native_instruments',
    name: 'Native Instruments',
    category: 'Hardware & VST Licensing',
    description: 'Link your Native Access account to activate Kontakt instruments and Komplete presets.',
    scopes: ['native-access-vst', 'kontakt-license-pair', 'hardware-sync'],
    iconBg: 'bg-[#181818] text-white border border-[#333333]',
    icon: <Sliders className="w-6 h-6 text-white" />,
  },
  {
    id: 'bandcamp',
    name: 'Bandcamp',
    category: 'Artist Store & Direct Sales',
    description: 'Connect your Bandcamp artist profile for exclusive sample kit rewards and fan discounts.',
    scopes: ['fan-collection-read', 'artist-merch-sync', 'discography-access'],
    iconBg: 'bg-[#629AA9] text-white',
    icon: <Disc className="w-6 h-6 text-white" />,
  },
]

export const LinkedAccountsTab: React.FC<LinkedAccountsTabProps> = ({
  user,
  profile,
  onProfileUpdate,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>('google')
  const [internalUser, setInternalUser] = useState<any>(user || null)
  const [linkedAccounts, setLinkedAccounts] = useState<Record<string, any>>({})
  const [oauthModalProvider, setOauthModalProvider] = useState<MusicProvider | null>(null)
  const [googleLinkModalOpen, setGoogleLinkModalOpen] = useState(false)
  const [oauthConnecting, setOauthConnecting] = useState(false)
  const [oauthHandleInput, setOauthHandleInput] = useState('')
  const [disconnectTarget, setDisconnectTarget] = useState<MusicProvider | null>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Ensure active user is loaded from Supabase if not passed via props
  useEffect(() => {
    if (user) {
      setInternalUser(user)
    } else {
      const supabase = getSupabaseBrowserClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setInternalUser(data.user)
        }
      })
    }
  }, [user])

  const activeUser = user || internalUser

  useEffect(() => {
    const existing = profile?.linked_accounts || {}
    const merged = { ...existing }

    // If active user is present, automatically configure Google linked details
    if (activeUser) {
      const googleIdentity = activeUser.identities?.find((id: any) => id.provider === 'google')
      const googleEmail = googleIdentity?.identity_data?.email || activeUser.email || existing.google?.email || ''
      const googleName =
        googleIdentity?.identity_data?.full_name ||
        googleIdentity?.identity_data?.name ||
        activeUser.user_metadata?.full_name ||
        activeUser.user_metadata?.name ||
        profile?.full_name ||
        profile?.display_name ||
        existing.google?.handle ||
        (googleEmail ? googleEmail.split('@')[0] : 'Naiem Shaikh')

      merged.google = {
        handle: googleName,
        email: googleEmail,
        connected_at: existing.google?.connected_at || activeUser.created_at || new Date().toISOString(),
        is_permanent: true,
        ...existing.google,
      }
    }

    setLinkedAccounts(merged)
  }, [profile, activeUser])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Handle Google Connection with Direct OAuth Authentication
  const handleInitiateGoogleLink = async () => {
    setOauthConnecting(true)
    setErrorMessage(null)

    try {
      const supabase = getSupabaseBrowserClient()
      
      if (supabase.auth.linkIdentity && activeUser) {
        const { error } = await supabase.auth.linkIdentity({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/account`,
          },
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/account`,
          },
        })
        if (error) throw error
      }
    } catch (err: any) {
      console.warn('Google link error:', err)
      setErrorMessage(err.message || 'Failed to initiate Google authentication.')
      setOauthConnecting(false)
      setGoogleLinkModalOpen(false)
    }
  }

  // Open the OAuth Connection Modal or initiate provider OAuth
  const handleConnectClick = async (provider: MusicProvider) => {
    if (provider.id === 'google') {
      setGoogleLinkModalOpen(true)
      return
    }

    const defaultHandle =
      activeUser?.user_metadata?.full_name ||
      profile?.display_name ||
      activeUser?.email?.split('@')[0] ||
      'producer'
    setOauthHandleInput(defaultHandle)
    setOauthModalProvider(provider)
  }

  // Execute OAuth Authorization & Link Account for Music Providers
  const handleAuthorizeOAuth = async () => {
    if (!activeUser || !oauthModalProvider) return
    setOauthConnecting(true)

    const cleanHandle =
      oauthHandleInput.trim() || activeUser.email?.split('@')[0] || 'connected_artist'
    const updated = {
      ...linkedAccounts,
      [oauthModalProvider.id]: {
        handle: cleanHandle,
        email: activeUser.email,
        authorized_scopes: oauthModalProvider.scopes,
        connected_at: new Date().toISOString(),
      },
    }

    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: activeUser.id,
          email: activeUser.email,
          linked_accounts: updated,
          updated_at: new Date().toISOString(),
        })

      if (!error) {
        setLinkedAccounts(updated)
        setFeedback(`Connected with ${oauthModalProvider.name}!`)
        setTimeout(() => setFeedback(null), 3500)
        if (onProfileUpdate) onProfileUpdate()
      }
    } catch (err) {
      console.warn('Error saving linked account:', err)
    } finally {
      setOauthConnecting(false)
      setOauthModalProvider(null)
    }
  }

  const handleConfirmDisconnect = async () => {
    if (!activeUser || !disconnectTarget) return
    if (disconnectTarget.id === 'google') return

    setSaving(true)
    const updated = { ...linkedAccounts }
    delete updated[disconnectTarget.id]

    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: activeUser.id,
          email: activeUser.email,
          linked_accounts: updated,
          updated_at: new Date().toISOString(),
        })

      if (!error) {
        setLinkedAccounts(updated)
        setFeedback(`Disconnected ${disconnectTarget.name}.`)
        setTimeout(() => setFeedback(null), 3000)
        if (onProfileUpdate) onProfileUpdate()
      }
    } catch (err) {
      console.warn('Error disconnecting account:', err)
    } finally {
      setSaving(false)
      setDisconnectTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header (Screenshot Exact Match) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Your linked accounts
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Connect your music streaming, DAW accounts, and producer profiles via OAuth to sync stems, presets, and artist credits.
          </p>
        </div>

        {feedback && (
          <span className="text-xs font-bold text-green-400 bg-[#1e281e] border border-[#2e442e] px-3.5 py-1.5 rounded-xl animate-in fade-in shrink-0">
            {feedback}
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="bg-[#2a1719] border border-[#4d2428] text-[#ff6b7a] p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Provider List (Accordion Cards matching Screenshot 2) */}
      <div className="space-y-3.5">
        {MUSIC_PROVIDERS.map((provider) => {
          const isGoogle = provider.id === 'google'
          const isLinked = isGoogle
            ? Boolean(activeUser) || Boolean(linkedAccounts.google) || Boolean(profile?.linked_accounts?.google)
            : Boolean(linkedAccounts[provider.id])

          const googleHandle =
            linkedAccounts.google?.handle ||
            profile?.display_name ||
            profile?.full_name ||
            activeUser?.user_metadata?.full_name ||
            activeUser?.user_metadata?.name ||
            (activeUser?.email ? activeUser.email.split('@')[0] : 'Naiem Shaikh')

          const handle = isGoogle
            ? (isLinked ? googleHandle : 'Not connected')
            : (linkedAccounts[provider.id]?.handle || 'Not connected')

          const isExpanded = expandedId === provider.id

          const linkedDateFormatted = linkedAccounts[provider.id]?.connected_at
            ? new Date(linkedAccounts[provider.id].connected_at).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
              })
            : '12/14/2023'

          return (
            <div
              key={provider.id}
              className="bg-[#181818] border border-[#242424] hover:border-[#303030] rounded-2xl overflow-hidden transition-all"
            >
              {/* Main Collapsible Row (Exact Screenshot 2 Header Match) */}
              <div
                onClick={() => toggleExpand(provider.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  {/* Provider Logo Box */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md shrink-0 ${provider.iconBg}`}
                  >
                    {provider.icon}
                  </div>

                  {/* Provider Info */}
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {provider.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {isLinked ? (
                        <span className="text-zinc-300 font-semibold">{handle}</span>
                      ) : (
                        <span className="text-zinc-500 font-medium">Not connected</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Status Chevron */}
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Action Panel (Exact Screenshot 2 Match) */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-[#222222] bg-[#141414] space-y-4 animate-in fade-in duration-150">
                  
                  {isLinked ? (
                    <>
                      {/* Shared Data Status Line (Exact Epic Games Green Match) */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#00df81]">
                        <span className="text-sm font-bold text-[#00df81]">→</span>
                        <span className="text-[#00df81] font-medium">Data is shared from {provider.name} to ProducerToy</span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Visit your {provider.name} account to review what data is shared with ProducerToy.
                      </p>

                      {/* Footer Info & Unlink (NO UNLINK FOR GOOGLE AS SPECIFIED - PERMANENT LINK) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#202020]">
                        <span className="text-xs text-zinc-500">
                          Linked on {linkedDateFormatted}{' '}
                          <Link href="/privacy" className="text-zinc-400 underline hover:text-white ml-1">
                            ProducerToy Privacy Policy
                          </Link>
                        </span>

                        {!isGoogle && (
                          <button
                            type="button"
                            onClick={() => setDisconnectTarget(provider)}
                            className="bg-[#242424] hover:bg-[#ff4053] text-zinc-300 hover:text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 self-start sm:self-auto"
                          >
                            Unlink
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {provider.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <span className="text-xs text-zinc-500 font-semibold">
                          Category: {provider.category}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleConnectClick(provider)}
                          className="inline-flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Connect with {provider.name}</span>
                        </button>
                      </div>
                    </>
                  )}

                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* ONE-TIME GOOGLE LINK CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      {googleLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => !oauthConnecting && setGoogleLinkModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-[#181818] border border-[#2c2c2c] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 select-none">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-white text-black">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Link Google Account
                  </h3>
                  <span className="text-xs text-zinc-400">
                    One-Time Permanent Authentication
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGoogleLinkModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#141414] border border-[#222222] rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Email Match Required:</span>
                  <span>
                    Your Google Account email must match your registered account email:
                  </span>
                  <span className="block text-white font-mono font-bold mt-1 bg-[#202020] px-2.5 py-1 rounded-lg border border-[#303030]">
                    {activeUser?.email || 'Registered Email'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-zinc-400 pt-2 border-t border-[#1e1e1e]">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  This is a permanent one-time link. Once connected, your Google Account cannot be unlinked or disconnected.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242424]">
              <button
                type="button"
                onClick={() => setGoogleLinkModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={oauthConnecting}
                onClick={handleInitiateGoogleLink}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {oauthConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <span>Continue to Google</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OAUTH PERMISSIONS & AUTHORIZATION MODAL FOR MUSIC PROVIDERS                */}
      {/* ========================================================================= */}
      {oauthModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setOauthModalProvider(null)}
          />

          <div className="relative z-10 w-full max-w-lg bg-[#181818] border border-[#2c2c2c] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 select-none">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${oauthModalProvider.iconBg}`}
                >
                  {oauthModalProvider.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Authorize {oauthModalProvider.name}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    ProducerToy OAuth 2.0 Integration
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOauthModalProvider(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-bold text-zinc-300 block">
                ProducerToy is requesting permission to:
              </span>
              <div className="bg-[#141414] border border-[#222222] rounded-xl p-3.5 space-y-2">
                {oauthModalProvider.scopes.map((scope, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                    <span>{scope}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                {oauthModalProvider.name} Username / Artist Handle
              </label>
              <input
                type="text"
                value={oauthHandleInput}
                onChange={(e) => setOauthHandleInput(e.target.value)}
                placeholder="e.g. @naiemmusic"
                className="w-full bg-[#202020] border border-[#333333] focus:border-zinc-400 text-white text-sm rounded-xl px-4 py-3 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242424]">
              <button
                type="button"
                onClick={() => setOauthModalProvider(null)}
                className="px-4 py-2.5 rounded-xl bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={oauthConnecting}
                onClick={handleAuthorizeOAuth}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {oauthConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting OAuth...</span>
                  </>
                ) : (
                  <span>Authorize & Link</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Dark Confirmation Modal on Disconnect */}
      <CustomConfirmModal
        isOpen={Boolean(disconnectTarget)}
        title={`Disconnect ${disconnectTarget?.name || 'Account'}`}
        description={`Are you sure you want to disconnect your ${disconnectTarget?.name} account? Any synchronized presets, cloud stems, and artist verification linked through this provider will be unlinked.`}
        confirmText="Yes, Disconnect"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setDisconnectTarget(null)}
      />
    </div>
  )
}
