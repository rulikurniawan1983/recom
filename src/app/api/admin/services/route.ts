import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      );
    }

    return NextResponse.json({ services: services || [] });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const { name, description, icon, color, bgColor, isActive } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        name,
        description: description || null,
        icon: icon || 'FileText',
        color: color || 'blue',
        bgColor: bgColor || 'bg-blue-100',
        isActive: isActive ?? true,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating service:', error.message);
      return NextResponse.json(
        { error: 'Failed to create service' },
        { status: 500 }
      );
    }

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
