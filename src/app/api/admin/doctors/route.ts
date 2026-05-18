import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: doctors, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching doctors:', error.message);
      return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
    }

    return NextResponse.json({ doctors: (doctors || []) });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/doctors:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const { data: doctor, error } = await supabase
      .from('doctors')
      .insert({
        user_id: null,
        license_number: body.license_number,
        specialization: body.specialization || null,
        years_of_experience: body.years_of_experience || null,
        biography: body.biography || null,
        profile_picture_url: body.profile_picture_url || null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating doctor:', error.message);
      return NextResponse.json(
        { error: 'Failed to create doctor: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ doctor }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/doctors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
