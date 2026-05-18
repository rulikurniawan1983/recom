import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import NKVRegistrationForm from '@/components/registration/nkv-registration-form'

export default async function NKVRegisterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <NKVRegistrationForm />
}
