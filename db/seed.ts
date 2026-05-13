import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load .env file
dotenv.config()

// Get Supabase URL and service key from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

// Try multiple possible env variable names for the service key
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                   process.env.SUPABASE_KEY ||
                   process.env.SUPABASE_SERVICE_KEY

// Print warning if no service key found
if (!serviceKey) {
  console.error('❌ ERROR: No Supabase service key found.')
  console.error('   Add one of these to your .env file:')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (recommended)')
  console.error('   - SUPABASE_KEY')
  console.error('   - SUPABASE_SERVICE_KEY')
  console.error('\n   You can find the service role key in your Supabase dashboard:')
  console.error('   Settings → API → Service Role Key (public)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

const STATUS_LIST = [
  'submitted',
  'document_verification',
  'field_inspection',
  'assessment',
  'approved'
] as const

// Generate a random 6-character alphanumeric suffix
function randomSuffix() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Format date to Indonesian locale
function formatDate(date: Date) {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n')

  // Get first available user
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .limit(1)

  if (profileError || !profiles || profiles.length === 0) {
    console.error('❌ No users found in profiles table. Create a user first.')
    process.exit(1)
  }

  const userId = profiles[0].id
  console.log(`✅ Using user: ${profiles[0].full_name} (${profiles[0].email})`)

  // Get or create a business unit
  let { data: businessUnits } = await supabase
    .from('business_units')
    .select('id, name')
    .limit(1)

  let businessUnitId: string
  if (!businessUnits || businessUnits.length === 0) {
    console.log('📦 Creating sample business unit...')
    const { data: bu, error: buError } = await supabase
      .from('business_units')
      .insert({
        name: 'PT. Sejahtera Abadi',
        address: 'Jl. Merdeka No. 123, Bogor',
        phone: '081234567890',
        email: 'info@sejahtera.com',
        business_type: 'Peternakan',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (buError) {
      console.error('❌ Error creating business unit:', buError.message)
      // Continue without business unit - we'll try with null
      businessUnitId = ''
    } else {
      businessUnitId = bu.id
      console.log(`✅ Business unit created: ${bu.name}`)
    }
  } else {
    businessUnitId = businessUnits[0].id
    console.log(`✅ Using business unit: ${businessUnits[0].name}`)
  }

  // Get or create a product type
  let { data: productTypes } = await supabase
    .from('product_types')
    .select('id, name')
    .limit(1)

  let productTypeId: string
  if (!productTypes || productTypes.length === 0) {
    console.log('📦 Creating sample product type...')
    const { data: pt, error: ptError } = await supabase
      .from('product_types')
      .insert({
        name: 'Daging Sapi',
        description: 'Produk daging sapi segar',
        category: 'hewan',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (ptError) {
      console.error('❌ Error creating product type:', ptError.message)
      productTypeId = ''
    } else {
      productTypeId = pt.id
      console.log(`✅ Product type created: ${pt.name}`)
    }
  } else {
    productTypeId = productTypes[0].id
    console.log(`✅ Using product type: ${productTypes[0].name}`)
  }

  // Seed NKV Registration
  const nkvNumber = `NKV-${new Date().getFullYear()}-${randomSuffix()}`
  console.log(`\n📝 Creating NKV registration: ${nkvNumber}`)

  const nkvInsertData: any = {
    user_id: userId,
    registration_number: nkvNumber,
    status: 'submitted',
    business_name: 'PT. Contoh Usaha',
    business_address: 'Jl. Merdeka No. 123, Bogor',
    business_phone: '081234567890',
    business_email: 'contoh@email.com',
    business_type: 'PeternakanAyam',
    product_type: 'Daging Ayam',
    product_description: 'Produksi daging ayam broiler',
    verification_notes: 'Permohonan sedang diverifikasi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Add foreign keys only if we have them
  if (businessUnitId) {
    nkvInsertData.business_unit_id = businessUnitId
  }
  if (productTypeId) {
    nkvInsertData.product_type_id = productTypeId
  }

  const { data: nkvReg, error: nkvError } = await supabase
    .from('nkv_registrations')
    .insert(nkvInsertData)
    .select()
    .single()

  if (nkvError) {
    console.error('❌ Error creating NKV registration:', nkvError.message)
  } else {
    console.log(`✅ NKV registration created with ID: ${nkvReg.id}`)

    // Create tracking logs for NKV
    const nkvLogs = [
      { status: 'submitted', notes: 'Permohonan baru diajukan' },
      { status: 'document_verification', notes: 'Dokumen telah diterima dan sedang diverifikasi' },
      { status: 'field_inspection', notes: 'Tim inspeksi melakukan pengecekan lapangan' },
      { status: 'assessment', notes: 'Penilaian hasil inspeksi sedang dilakukan' },
      { status: 'approved', notes: 'Permohonan telah disetujui, sertifikat siap diterbitkan' }
    ]

    for (const log of nkvLogs) {
      // Use a time offset to make dates realistic (each step 2 days apart)
      const logDate = new Date()
      logDate.setDate(logDate.getDate() - (nkvLogs.length - nkvLogs.indexOf(log)) * 2)

      const { error: logError } = await supabase
        .from('tracking_logs')
        .insert({
          nkv_registration_id: nkvReg.id,
          registration_type: 'NKV',
          status: log.status,
          notes: log.notes,
          created_at: logDate.toISOString()
        })

      if (logError) {
        console.error(`  ❌ Failed to create log for ${log.status}:`, logError.message)
      } else {
        console.log(`  ✅ Log: ${log.status} (${formatDate(logDate)})`)
      }
    }
  }

  // Seed Dokter Hewan Registration
  const dokterNumber = `DKH-${new Date().getFullYear()}-${randomSuffix()}`
  console.log(`\n📝 Creating Dokter Hewan registration: ${dokterNumber}`)

  const { data: dokterReg, error: dokterError } = await supabase
    .from('dokter_hewan_registrations')
    .insert({
      user_id: userId,
      registration_number: dokterNumber,
      status: 'assessment',
      full_name: 'Dr. Ahmad Wijaya',
      birth_place_date: '1985-03-15',
      ktp_address: 'Jl. Sudirman No. 456, Bogor',
      clinic_address: 'Jl. Veteran No. 78, Bogor',
      phone: '085678901234',
      email: 'ahmadwijaya@email.com',
      verification_notes: 'Asesmen sedang dilakukan oleh tim validator',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (dokterError) {
    console.error('❌ Error creating Dokter Hewan registration:', dokterError.message)
  } else {
    console.log(`✅ Dokter Hewan registration created with ID: ${dokterReg.id}`)

    // Create tracking logs for Dokter Hewan (up to assessment)
    const dokterLogs = [
      { status: 'submitted', notes: 'Permohonan sertifikasi dokter hewan baru diajukan', daysAgo: 7 },
      { status: 'document_verification', notes: 'Dokumen ijazah dan STR telah diverifikasi', daysAgo: 6 },
      { status: 'field_inspection', notes: 'Pemeriksaan klinis dilakukan di lokasi praktek', daysAgo: 5 },
      { status: 'assessment', notes: 'Asesmen kompetensi sedang dinilai', daysAgo: 0 }
    ]

    for (const log of dokterLogs) {
      const logDate = new Date()
      logDate.setDate(logDate.getDate() - (log.daysAgo || 0))

      const { error: logError } = await supabase
        .from('tracking_logs')
        .insert({
          dokter_hewan_registration_id: dokterReg.id,
          registration_type: 'Dokter Hewan',
          status: log.status,
          notes: log.notes,
          created_at: logDate.toISOString()
        })

      if (logError) {
        console.error(`  ❌ Failed to create log for ${log.status}:`, logError.message)
      } else {
        console.log(`  ✅ Log: ${log.status} (${formatDate(logDate)})`)
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('🎉 Seed completed!')
  console.log('='.repeat(50))
  console.log('\n📋 Sample Tracking Numbers:')
  console.log(`   NKV: ${nkvNumber}`)
  console.log(`   Dokter Hewan: ${dokterNumber}`)
  console.log('\n💡 Use these numbers to test the tracking modal.')
  console.log('\n⚠️  Note: These are linked to the first user in your profiles table.')
  console.log('   If you register a new application, you will get a different tracking number.\n')
}

seedDatabase().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
