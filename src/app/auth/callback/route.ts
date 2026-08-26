import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
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

      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/auth?error=Could%20not%20authenticate%20user`
  )
}
