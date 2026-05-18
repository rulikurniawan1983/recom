import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batch_id')
  const limit = parseInt(searchParams.get('limit') || '100')
  
  let query = supabase
    .from('vaccine_stock_transactions')
    .select(`
      *,
      vaccine_batches (
        id,
        batch_number,
        vaccine_types (
          name
        )
      ),
      profiles:created_by (
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (batchId) {
    query = query.eq('batch_id', batchId)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}