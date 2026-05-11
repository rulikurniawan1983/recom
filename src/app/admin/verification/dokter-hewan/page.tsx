import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminDokterVerificationClient from './dokter-verification-client'

export default async function AdminDokterVerificationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: registrations } = await supabase
    .from('dokter_hewan_registrations')
    .select(`
      *,
      profiles(full_name, email)
    `)
    .eq('status', 'submitted')
    .order('created_at', { ascending: false })

  return <AdminDokterVerificationClient registrations={registrations || []} />
}
