const https = require('https');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamFmaXNiYWVkdmRyY2tpanBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ2NzY1NiwiZXhwIjoyMDk0MDQzNjU2fQ.SSX5_lPOdeTsHRw6Nk_KDlaSjb31uT_SnUaYdUIFJFc';

function listObjects(bucket) {
  return new Promise(resolve => {
    const options = {
      hostname: 'mfjafisbaedvdrckijpm.supabase.co',
      path: `/storage/v1/object/${encodeURIComponent(bucket)}/`,
      method: 'GET',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data.substring(0,1000) }); }
      });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
}

(async () => {
  const buckets = ['registration-documents', 'dokumen', 'recommendation', 'pet-photos'];
  for (const bucket of buckets) {
    const objs = await listObjects(bucket);
    console.log(`\n=== ${bucket} ===`);
    if (Array.isArray(objs)) {
      objs.slice(0, 5).forEach(o => console.log(o.name || o));
    } else {
      console.log(JSON.stringify(objs));
    }
  }
  
  // Try URL generation for vet reg
  console.log('\n=== Test URL gen ===');
  const testUrl = await new Promise(resolve => {
    const options = {
      hostname: 'mfjafisbaedvdrckijpm.supabase.co',
      path: '/storage/v1/object/public/registration-documents/registrations/e9c25277-2c01-4340-b494-7b092e78c86e/test.pdf',
      method: 'HEAD',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    };
    const req = https.request(options, res => {
      resolve({ status: res.statusCode, headers: JSON.stringify(res.headers).substring(0, 300) });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
  console.log(testUrl);
})();
