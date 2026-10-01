import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  let next = requestUrl.searchParams.get('next')

  if (!next) {
    next = type === 'recovery' ? '/reset-password' : '/'
  } else if (next.includes('mode=reset') || type === 'recovery') {
    next = '/reset-password'
  }

  // Resolve canonical origin: check x-forwarded-host / proto for proxies like Vercel & Cloudflare
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const isLocalEnv = process.env.NODE_ENV === 'development'

  const origin = isLocalEnv
    ? requestUrl.origin
    : forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin.replace(/^http:\/\//, 'https://')

  const redirectTarget = next.startsWith('http://') || next.startsWith('https://')
    ? next
    : `${origin}${next.startsWith('/') ? next : `/${next}`}`

  const response = NextResponse.redirect(redirectTarget)

  if (code) {
    const isProdDomain = !isLocalEnv && (forwardedHost?.includes('producertoy.com') || requestUrl.hostname.includes('producertoy.com'))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://voalgeyexfhfitlyorfl.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_AFTgvwUXdDPCgTny9uDIuQ_NGiDyAJD',
      {
        cookies: {
          getAll() {
            return request.headers.get('cookie')?.split('; ').map((c) => {
              const [name, ...v] = c.split('=')
              return { name, value: v.join('=') }
            }) || []
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                domain: isProdDomain ? '.producertoy.com' : options?.domain,
              })
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      const user = data.user

      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        const currentLinked = prof?.linked_accounts || {}
        let updatedLinked = { ...currentLinked }
        let needsUpdate = false

        // Sync Google identity
        const googleIdentity = user.identities?.find((id) => id.provider === 'google')
        if (googleIdentity && !currentLinked.google) {
          const googleEmail = googleIdentity.identity_data?.email || user.email || ''
          const googleName =
            googleIdentity.identity_data?.full_name ||
            googleIdentity.identity_data?.name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (googleEmail ? googleEmail.split('@')[0] : 'Google Account')

          updatedLinked.google = {
            handle: googleName,
            email: googleEmail,
            connected_at: new Date().toISOString(),
            is_permanent: true,
          }
          needsUpdate = true
        }

        // Sync Spotify identity
        const spotifyIdentity = user.identities?.find((id) => id.provider === 'spotify')
        if (spotifyIdentity && !currentLinked.spotify) {
          const spotifyEmail = spotifyIdentity.identity_data?.email || user.email || ''
          const spotifyName =
            spotifyIdentity.identity_data?.full_name ||
            spotifyIdentity.identity_data?.name ||
            spotifyIdentity.identity_data?.user_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            'Spotify Artist'

          updatedLinked.spotify = {
            handle: spotifyName,
            email: spotifyEmail,
            connected_at: new Date().toISOString(),
          }
          needsUpdate = true
        }

        if (needsUpdate) {
          await supabase
            .from('profiles')
            .update({
              linked_accounts: updatedLinked,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
        }
      } catch (syncErr) {
        console.warn('OAuth callback profile sync note:', syncErr)
      }

      return response
    }
  }

  return NextResponse.redirect(
    `${origin}/auth?error=Could%20not%20authenticate%20user`
  )
}
