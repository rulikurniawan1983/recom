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
        try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data.substring(0, 500), status: res.statusCode }); }
      });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
}

(async () => {
  // Check all document types in registration_documents
  const docTypes = await supaGet('/rest/v1/registration_documents?select=registration_type&limit=100');
  console.log('Doc types:', JSON.stringify(docTypes, null, 2));
  
  // Check the vet registration registration_documents via registration_documents table
  const vetDocs = await supaGet('/rest/v1/registration_documents?registration_id=eq.e9c25277-2c01-4340-b494-7b092e78c86e&select=*');
  console.log('Vet docs (by id):', JSON.stringify(vetDocs));
  
  // Check storage bucket
  const buckets = await supaGet('/storage/buckets');
  console.log('Buckets:', JSON.stringify(buckets, null, 2));
  
  // Check the dokumen bucket
  const dokumenBucket = await supaGet('/storage/buckets/dokumen');
  console.log('Dokumen bucket:', JSON.stringify(dokumenBucket));
})();
