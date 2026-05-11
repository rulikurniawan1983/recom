import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import RegistrationForm from '@/components/registration/registration-form'

export default async function RegistrationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <RegistrationForm />
}