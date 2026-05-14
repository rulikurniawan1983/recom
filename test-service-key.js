import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mfjafisbaedvdrckijpm.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamFmaXNiYWVkdmRyY2tpanBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ2NzY1NiwiZXhwIjoyMDk0MDQzNjU2fQ.SSX5_lPOdeTsHRw6Nk_KDlaSjb31uU_SnUaYdUIFJFc'

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  try {
    const { data, error } = await supabase.from('nkv_registrations').select('id').limit(1)
    console.log('Data:', data)
    console.log('Error:', error)
  } catch (e) {
    console.error('Exception:', e)
  }
}

main()
