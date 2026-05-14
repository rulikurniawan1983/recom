import { PostgrestClient } from '@supabase/postgrest-js'

const url = 'https://mfjafisbaedvdrckijpm.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamFmaXNiYWVkdmRyY2tpanBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ2NzY1NiwiZXhwIjoyMDk0MDQzNjU2fQ.SSX5_lPOdeTsHRw6Nk_KDlaSjb31uU_SnUaYdUIFJFc'

const postgrest = new PostgrestClient(`${url}/rest/v1`, {
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`
  }
})

const { data, error } = await postgrest
  .from('nkv_registrations')
  .select('id')
  .limit(1)

console.log('Data:', data)
console.log('Error:', error)
