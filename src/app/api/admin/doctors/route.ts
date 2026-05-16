import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: doctors, error } = await supabase
      .from('doctors')
      .select('*, profiles (full_name, email)')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching doctors (raw):', JSON.stringify(error));
      // Try without joining profile just to return something
      const { data: rawDoctors } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: true });
      return NextResponse.json({ doctors: (rawDoctors as any[]) || [] });
    }

    // Strip profile profiles field so it maps cleanly
    const cleaned = (doctors || []).map((d: any) => {
      const profile = d.profiles && typeof d.profiles === 'object' && !Array.isArray(d.profiles)
        ? d.profiles
        : (d.profiles && Array.isArray(d.profiles) ? d.profiles[0] : null);
      return {
        id: d.id,
        license_number: d.license_number,
        specialization: d.specialization,
        years_of_experience: d.years_of_experience,
        biography: d.biography,
        is_active: d.is_active,
        created_at: d.created_at,
        profiles: {
          full_name: profile?.full_name ?? null,
          email: profile?.email ?? '',
        },
      };
    });
    return NextResponse.json({ doctors: cleaned });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/doctors:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error?.message },
      { status: 500 }
    );
  }
}
