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

      // If Google identity is linked, persist into profiles.linked_accounts
      const googleIdentity = user.identities?.find((id) => id.provider === 'google')
      if (googleIdentity) {
        const googleEmail = googleIdentity.identity_data?.email || user.email || ''
        const googleName =
          googleIdentity.identity_data?.full_name ||
          googleIdentity.identity_data?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (googleEmail ? googleEmail.split('@')[0] : 'Google Account')

        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('linked_accounts')
            .eq('id', user.id)
            .maybeSingle()

          const currentLinked = prof?.linked_accounts || {}
          if (!currentLinked.google) {
            await supabase
              .from('profiles')
              .update({
                linked_accounts: {
                  ...currentLinked,
                  google: {
                    handle: googleName,
                    email: googleEmail,
                    connected_at: new Date().toISOString(),
                    is_permanent: true,
                  },
                },
              })
              .eq('id', user.id)
          }
        } catch (syncErr) {
          console.warn('Google identity profile sync note:', syncErr)
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/auth?error=Could%20not%20authenticate%20user`
  )
}
