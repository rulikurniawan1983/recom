const fetch = require('node-fetch');
const url = 'https://mfjafisbaedvdrckijpm.supabase.co/rest/v1/rpc/get_admin_applications' // Not correct

// Actually applications endpoint is a server route, not directly accessible via REST. Need to go through Next.js.

// Instead we can test the database directly via Supabase client which we already did. That gave rows with id.

// We already saw the rows have proper UUIDs.
