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
    const today = searchParams.get('today') || new Date().toISOString().split('T')[0]
    const startOfDay = `${today}T00:00:00`
    const endOfDay = `${today}T23:59:59`

    const [
      { count: todayVacc },
      { count: todayTreat },
      { count: todayConsult },
      { count: todayVaccCompleted },
      { count: todayTreatCompleted },
      { count: todayConsultCompleted },
      { count: totalVacc },
      { count: totalTreat },
      { count: totalConsult },
      { count: activePets },
      { count: activeDoctors },
    ] = await Promise.all([
      supabase.from('vaccinations').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay).lte('created_at', endOfDay),
      supabase.from('treatments').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay).lte('created_at', endOfDay),
      supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay).lte('created_at', endOfDay),
      supabase.from('vaccinations').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay).lte('created_at', endOfDay).eq('status', 'completed'),
      supabase.from('treatments').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay).lte('created_at', endOfDay).eq('status', 'completed'),
      supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay).lte('created_at', endOfDay).eq('status', 'completed'),
      supabase.from('vaccinations').select('*', { count: 'exact', head: true }),
      supabase.from('treatments').select('*', { count: 'exact', head: true }),
      supabase.from('consultations').select('*', { count: 'exact', head: true }),
      supabase.from('pets').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])

    // Upcoming today's schedules
    const { data: todayVaccScheds } = await supabase
      .from('vaccination_schedules')
      .select('*')
      .eq('date', today)
      .eq('is_active', true)
      .order('start_time')

    const { data: todayTreatScheds } = await supabase
      .from('treatment_schedules')
      .select('*')
      .eq('date', today)
      .eq('is_active', true)
      .order('start_time')

    const { data: todayConsultScheds } = await supabase
      .from('consultation_schedules')
      .select('*')
      .eq('date', today)
      .eq('is_active', true)
      .order('start_time')

    return NextResponse.json({
      date: today,
      today: {
        vaccinations_created: todayVacc || 0,
        treatments_created: todayTreat || 0,
        consultations_created: todayConsult || 0,
        vaccinations_completed: todayVaccCompleted || 0,
        treatments_completed: todayTreatCompleted || 0,
        consultations_completed: todayConsultCompleted || 0,
      },
      totals: {
        vaccinations: totalVacc || 0,
        treatments: totalTreat || 0,
        consultations: totalConsult || 0,
        active_pets: activePets || 0,
        active_doctors: activeDoctors || 0,
      },
      schedules: {
        vaccinations: todayVaccScheds || [],
        treatments: todayTreatScheds || [],
        consultations: todayConsultScheds || [],
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/daily-stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
