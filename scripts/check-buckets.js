const https = require('https');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamFmaXNiYWVkdmRyY2tpanBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ2NzY1NiwiZXhwIjoyMDk0MDQzNjU2fQ.SSX5_lPOdeTsHRw6Nk_KDlaSjb31uT_SnUaYdUIFJFc';

const BUCKETS_TO_CHECK = [
  'registration-documents',
  'documents',
  'dokumen',
  'recommendation',
  'registrations',
  'veterinary-registrations'
];

function listBuckets() {
  return new Promise(resolve => {
    const options = {
      hostname: 'mfjafisbaedvdrckijpm.supabase.co',
      path: '/storage/v1/bucket',
      method: 'GET',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data.substring(0, 500) }); }
      });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
}

(async () => {
  const buckets = await listBuckets();
  console.log('All buckets:', JSON.stringify(buckets, null, 2));
  
  for (const bucket of (buckets || [])) {
    const name = bucket.name;
    console.log('\n=== Bucket:', name, '===');
    const paths = ['', 'registrations/', 'registrations/e9c25277-2c01-4340-b494-7b092e78c86e/'];
    for (const path of paths) {
      const fullPath = `/storage/v1/object/list/${encodeURIComponent(name)}?prefix=${encodeURIComponent(path)}`;
      const files = await new Promise(resolve => {
        const options = {
          hostname: 'mfjafisbaedvdrckijpm.supabase.co',
          path: fullPath,
          method: 'GET',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
        };
        const req = https.request(options, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data.substring(0, 500) }); }
          });
        });
        req.on('error', e => resolve({ error: e.message }));
        req.end();
      });
      console.log(JSON.stringify(files));
    }
  }
})();
