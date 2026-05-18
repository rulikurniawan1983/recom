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
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data.substring(0, 500), status: res.statusCode }); }
      });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
}

(async () => {
  // 1. Get one full vet registration row
  const vet = await supaGet('/rest/v1/veterinary_registrations?limit=1&select=*');
  console.log('=== VETERINARY_REGISTRATIONS SAMPLE ===');
  console.log(JSON.stringify(vet, null, 2));

  // 2. Get registration_documents columns (via a sample row filtered to vet type)
  const docs = await supaGet("/rest/v1/registration_documents?limit=1&select=*&registration_type=eq.veterinary");
  console.log('\n=== REGISTRATION_DOCUMENTS SAMPLE (vet type) ===');
  console.log(JSON.stringify(docs, null, 2));

  // 3. Get inspection_schedules columns
  const schedules = await supaGet('/rest/v1/inspection_schedules?limit=1&select=*');
  console.log('\n=== INSPECTION_SCHEDULES SAMPLE ===');
  console.log(JSON.stringify(schedules, null, 2));

  // 4. Get tracking_logs columns
  const logs = await supaGet('/rest/v1/tracking_logs?limit=1&select=*');
  console.log('\n=== TRACKING_LOGS SAMPLE ===');
  console.log(JSON.stringify(logs, null, 2));

  // 5. Count rows in each table
  const counts = await Promise.all([
    supaGet('/rest/v1/veterinary_registrations?select=count'),
    supaGet('/rest/v1/registration_documents?select=count'),
    supaGet('/rest/v1/inspection_schedules?select=count'),
    supaGet('/rest/v1/tracking_logs?select=count'),
    supaGet('/rest/v1/nkv_registrations?select=count'),
    supaGet('/rest/v1/dokter_hewan_registrations?select=count'),
  ]);
  console.log('\n=== ROW COUNTS ===');
  console.log(JSON.stringify(counts, null, 2));
})();
