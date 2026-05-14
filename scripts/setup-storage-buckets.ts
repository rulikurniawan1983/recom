import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                   process.env.SUPABASE_KEY ||
                   process.env.SUPABASE_SERVICE_KEY

if (!serviceKey) {
  console.error('❌ ERROR: No Supabase service key found.')
  console.error('   Add one of these to your .env file:')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (recommended)')
  console.error('   - SUPABASE_KEY')
  console.error('   - SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

const buckets = [
  {
    name: 'pet-photos',
    public: false,
    description: 'Pet profile pictures and photos'
  },
  {
    name: 'pet-documents',
    public: false,
    description: 'Pet health documents (vaccination cards, certificates, lab results)'
  },
  {
    name: 'medical-attachments',
    public: false,
    description: 'Attachments for treatments and consultations'
  },
  {
    name: 'doctor-documents',
    public: false,
    description: 'Doctor verification documents'
  }
]

async function setupStorage() {
  console.log('📦 Setting up storage buckets...\n')

  for (const bucket of buckets) {
    try {
      console.log(`Creating bucket: ${bucket.name}`)
      const { data, error } = await supabase.storage
        .createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'video/mp4',
            'video/webm',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ]
        })

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ✅ Bucket "${bucket.name}" already exists`)
        } else {
          console.error(`  ❌ Error creating bucket "${bucket.name}":`, error.message)
        }
      } else {
        console.log(`  ✅ Bucket "${bucket.name}" created successfully`)
      }
    } catch (err: any) {
      console.error(`  ❌ Unexpected error for bucket "${bucket.name}":`, err.message)
    }
  }

  // Set up storage policies
  console.log('\n🔐 Setting up storage RLS policies...\n')

  // Policy for pet-photos bucket
  await setupBucketPolicies('pet-photos')
  await setupBucketPolicies('pet-documents')
  await setupBucketPolicies('medical-attachments')
  await setupBucketPolicies('doctor-documents')

  console.log('\n✅ Storage setup completed!')
}

async function setupBucketPolicies(bucketName: string) {
  // Storage policies are managed via SQL migrations (RLS)
  // This function is placeholder for any additional bucket configuration
  console.log(`  ✅ Policies for "${bucketName}" managed via database RLS`)
}

setupStorage().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
