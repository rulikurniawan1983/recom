require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBucket() {
  try {
    // Try to list files in the registration-documents bucket
    const { data, error } = await supabase
      .storage
      .from('registration-documents')
      .list();

    if (error) {
      // If bucket doesn't exist, we'll get an error
      if (error.message.includes('Bucket not found')) {
        console.log('Bucket "registration-documents" does not exist');
        return false;
      }
      console.error('Error accessing bucket:', error);
      return false;
    }

    console.log('Bucket "registration-documents" exists');
    console.log('Files in bucket:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

checkBucket();