import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Build date filter
    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = { gte: startDate, lte: endDate }
    } else if (startDate) {
      dateFilter = { gte: startDate }
    } else if (endDate) {
      dateFilter = { lte: endDate }
    }

    // Get daily stats
    const { data: dailyStats } = await supabase
      .from('daily_statistics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)

    // Get pending bookings count
    const { count: pendingVaccinations } = await supabase
      .from('vaccinations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: pendingTreatments } = await supabase
      .from('treatments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: pendingConsultations } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get total counts
    const { count: totalPets } = await supabase
      .from('pets')
      .select('*', { count: 'exact', head: true })

    const { count: totalDoctors } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')

    // Get recent bookings
    const { data: recentBookings } = await supabase
      .from('vaccinations')
      .select(`
        id,
        status,
        created_at,
        pets (name),
        doctors (profiles (full_name))
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get monthly totals
    const { data: monthlyTotals } = await supabase
      .from('monthly_reports')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(12)

    return NextResponse.json({
      daily_stats: dailyStats || [],
      pending_vaccinations: pendingVaccinations || 0,
      pending_treatments: pendingTreatments || 0,
      pending_consultations: pendingConsultations || 0,
      total_pets: totalPets || 0,
      total_doctors: totalDoctors || 0,
      total_users: totalUsers || 0,
      recent_bookings: recentBookings || [],
      monthly_totals: monthlyTotals || []
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
