import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminVerificationClient from './verification-client'

export default async function AdminVerificationPage() {
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
    .from('nkv_registrations')
    .select(`
      *,
      profiles(full_name, email),
      business_units(name),
      registration_documents(*)
    `)
    .eq('status', 'submitted')
    .order('created_at', { ascending: false })

  return <AdminVerificationClient registrations={registrations || []} />
}