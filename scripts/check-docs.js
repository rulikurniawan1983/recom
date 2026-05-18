const https = require('https');

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamFmaXNiYWVkdmRyY2tpanBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ2NzY1NiwiZXhwIjoyMDk0MDQzNjU2fQ.SSX5_lPOdeTsHRw6Nk_KDlaSjb31uT_SnUaYdUIFJFc';
const BASE = 'mfjafisbaedvdrckijpm.supabase.co';

function supaGet(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: BASE,
      path,
      method: 'GET',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'return=representation'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data.substring(0, 500), status: res.statusCode, headers: JSON.stringify(res.headers) }); }
      });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
}

(async () => {
  // Count rows in key tables
  const allDocs = await supaGet('/rest/v1/registration_documents?select=id,registration_id,registration_type,status,file_name,uploaded_at');
  console.log('=== ALL REGISTRATION_DOCUMENTS ===');
  console.log(JSON.stringify(allDocs, null, 2));
  
  const allVets = await supaGet('/rest/v1/veterinary_registrations?select=id,registration_number,status,user_id,pet_name');
  console.log('\n=== ALL VETS ===');
  console.log(JSON.stringify(allVets, null, 2));
})();
