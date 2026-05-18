import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const month = searchParams.get('month')

    const startDate = month && month !== 'all'
      ? `${year}-${month.padStart(2, '0')}-01`
      : `${year}-01-01`
    const endDate = month && month !== 'all'
      ? `${year}-${month.padStart(2, '0')}-31`
      : `${year}-12-31`

    const { data, error } = await supabase
      .from('consultations')
      .select(`
        id, status, consultation_type, scheduled_date, created_at,
        pets (name, species),
        doctors (profiles (full_name))
      `)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data || [] })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
