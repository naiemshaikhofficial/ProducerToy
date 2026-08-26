import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ exists: false, isConfirmed: false })
    }

    const cleanEmail = email.trim().toLowerCase()
    const admin = getAdminClient()

    // 1. Try checking via auth admin listUsers
    try {
      const { data, error } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })

      if (!error && data?.users) {
        const matched = (data.users as any[]).find(
          (u: any) => u.email?.toLowerCase() === cleanEmail
        )

        if (matched) {
          const isConfirmed = Boolean(matched.email_confirmed_at || matched.confirmed_at)
          return NextResponse.json({
            exists: true,
            isConfirmed,
          })
        }
      }
    } catch (adminErr) {
      console.warn('Admin listUsers note:', adminErr)
    }

    // 2. Check profiles table as fallback
    try {
      const { data: prof } = await admin
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (prof) {
        return NextResponse.json({
          exists: true,
          isConfirmed: true,
        })
      }
    } catch (profErr) {
      console.warn('Profiles check note:', profErr)
    }

    return NextResponse.json({ exists: false, isConfirmed: false })
  } catch (err: any) {
    return NextResponse.json({ exists: false, isConfirmed: false })
  }
}
