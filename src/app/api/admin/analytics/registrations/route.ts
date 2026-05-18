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

    const { data: nkv } = await supabase
      .from('nkv_registrations')
      .select(`
        id, registration_number, status, created_at, approved_at,
        profiles (full_name, email)
      `)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .order('created_at', { ascending: false })

    const { data: vet } = await supabase
      .from('veterinary_registrations')
      .select(`
        id, registration_number, status, created_at, approved_at,
        profiles (full_name, email)
      `)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .order('created_at', { ascending: false })

    const { data: dh } = await supabase
      .from('dokter_hewan_registrations')
      .select(`
        id, registration_number, status, created_at, approved_at,
        profiles (full_name, email)
      `)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)
      .order('created_at', { ascending: false })

    const combined: any[] = []
    ;(nkv || []).forEach(r => combined.push({ ...r, type: 'NKV' }))
    ;(vet || []).forEach(r => combined.push({ ...r, type: 'Veterinary' }))
    ;(dh || []).forEach(r => combined.push({ ...r, type: 'Dokter Hewan' }))

    return NextResponse.json({ data: combined })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
