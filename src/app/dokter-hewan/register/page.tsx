import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DokterHewanRegistrationForm from '@/components/registration/dokter-hewan-registration-form'

export default async function DokterHewanRegisterPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <DokterHewanRegistrationForm />
}