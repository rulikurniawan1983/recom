import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { business_unit, product_type, documents } = body

  // Create business unit
  const { data: bu, error: buError } = await supabase
    .from('business_units')
    .insert({
      ...business_unit,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (buError) {
    return NextResponse.json({ error: buError.message }, { status: 400 })
  }

  // Create product type
  const { data: product, error: productError } = await supabase
    .from('product_types')
    .insert({
      ...product_type,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 400 })
  }

  // Generate registration number
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  const regNumber = `NKV-${year}-${random}`

  // Create registration
  const { data: registration, error: regError } = await supabase
    .from('nkv_registrations')
    .insert({
      user_id: user.id,
      business_unit_id: bu.id,
      product_type_id: product.id,
      registration_number: regNumber,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (regError) {
    return NextResponse.json({ error: regError.message }, { status: 400 })
  }

  return NextResponse.json({ registration })
}