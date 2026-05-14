const url = 'https://mfjafisbaedvdrckijpm.supabase.co/rest/v1/nkv_registrations?select=id&limit=1'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamFmaXNiYWVkdmRyY2tpanBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ2NzY1NiwiZXhwIjoyMDk0MDQzNjU2fQ.SSX5_lPOdeTsHRw6Nk_KDlaSjb31uU_SnUaYdUIFJFc'

fetch(url, {
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Data:', data))
  .catch(err => console.error('Error:', err))
