import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Syringe, Stethoscope, Video, Calendar, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DoctorsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('id', user.id)
    .single()

  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profiles (full_name, email)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching doctors:', error.message)
  }

  const cleanedDoctors = (doctors || []).map((d: any) => ({
    id: d.id,
    license_number: d.license_number,
    specialization: d.specialization,
    years_of_experience: d.years_of_experience,
    biography: d.biography,
    profiles: Array.isArray(d.profiles) ? d.profiles[0] : d.profiles,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dokter Hewan</h2>
        <p className="text-gray-500 mt-1">
          Pilih dokter hewan untuk vaksinasi, pengobatan, atau konsultasi
        </p>
      </div>

      {cleanedDoctors.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <UserPlus className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada dokter terdaftar
          </h3>
          <p className="text-gray-500">
            Admin belum menambahkan dokter hewan ke sistem.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cleanedDoctors.map((doctor: any) => (
            <div
              key={doctor.id}
              className="bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserPlus className="h-7 w-7 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {doctor.profiles?.full_name || 'Dokter Hewan'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {doctor.specialization || 'Dokter Hewan Umum'}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      Lisensi: {doctor.license_number}
                    </p>
                  </div>
                </div>

                {doctor.years_of_experience && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {doctor.years_of_experience} tahun pengalaman
                  </div>
                )}

                {doctor.biography && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {doctor.biography}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Booking dengan dokter ini:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    <Link
                      href={`/dashboard/vaccinations?doctor=${doctor.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      <Syringe className="h-3.5 w-3.5 text-teal-600" />
                      Booking Vaksinasi
                    </Link>
                    <Link
                      href={`/dashboard/treatments?doctor=${doctor.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <Stethoscope className="h-3.5 w-3.5 text-orange-600" />
                      Booking Pengobatan
                    </Link>
                    <Link
                      href={`/dashboard/consultations?doctor=${doctor.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <Video className="h-3.5 w-3.5 text-purple-600" />
                      Booking Konsultasi
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
