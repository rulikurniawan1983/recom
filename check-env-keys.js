const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
const lines = content.split('\n')
let serviceKeyLine = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))
if (serviceKeyLine) {
  const key = serviceKeyLine.split('=')[1].trim()
  const parts = key.split('.')
  if (parts.length === 3) {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    console.log('Service key payload:', payload)
    console.log('Key length:', key.length)
  }
}
let anonKeyLine = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=') || l.startsWith('SUPABASE_ANON_KEY='))
if (anonKeyLine) {
  const key = anonKeyLine.split('=')[1].trim()
  const parts = key.split('.')
  if (parts.length === 3) {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    console.log('Anon key payload:', payload)
    console.log('Key length:', key.length)
  }
}
