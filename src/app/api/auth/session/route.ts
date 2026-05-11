import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { session } = await request.json()

    if (!session?.access_token || !session?.refresh_token) {
      return NextResponse.json(
        { error: 'Valid session with access_token and refresh_token required' },
        { status: 400 }
      )
    }

    const expiresIn = session.expires_in || 3600
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    const response = NextResponse.json({ success: true })

    // Set cookies using standard @supabase/supabase-js cookie names
    // These are the exact cookie names @supabase/ssr expects
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      expires: expiresAt,
    }

    response.cookies.set('sb-access-token', session.access_token, cookieOptions)
    response.cookies.set('sb-refresh-token', session.refresh_token, cookieOptions)

    return response
  } catch (error) {
    console.error('Session sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync session' },
      { status: 500 }
    )
  }
}