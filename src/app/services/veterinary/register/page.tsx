import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import VeterinaryRegistrationForm from '@/components/registration/veterinary-registration-form'

export default async function VeterinaryRegisterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <VeterinaryRegistrationForm />
}
