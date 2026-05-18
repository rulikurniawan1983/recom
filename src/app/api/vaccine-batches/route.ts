import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const vaccineTypeId = searchParams.get('vaccine_type_id')
  
  let query = supabase
    .from('vaccine_batches')
    .select(`
      *,
      vaccine_types (
        id,
        name,
        manufacturer,
        target_species
      )
    `)
    .order('expiry_date', { ascending: true })
  
  if (status) {
    query = query.eq('status', status)
  }
  
  if (vaccineTypeId) {
    query = query.eq('vaccine_type_id', vaccineTypeId)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('vaccine_batches')
    .insert({
      vaccine_type_id: body.vaccine_type_id,
      batch_number: body.batch_number,
      manufacture_date: body.manufacture_date,
      expiry_date: body.expiry_date,
      initial_quantity: body.initial_quantity,
      available_quantity: body.available_quantity || body.initial_quantity,
      unit_cost: body.unit_cost,
      supplier: body.supplier,
      supplier_invoice: body.supplier_invoice,
      received_date: body.received_date,
      storage_location: body.storage_location,
      notes: body.notes
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Record incoming transaction
  await supabase
    .from('vaccine_stock_transactions')
    .insert({
      batch_id: data.id,
      transaction_type: 'incoming',
      quantity: data.initial_quantity,
      unit_cost: data.unit_cost,
      notes: 'Initial stock'
    })
  
  return NextResponse.json({ data }, { status: 201 })
}