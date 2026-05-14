'use client'

import { FileText, Syringe, Stethoscope, Video, Clock } from 'lucide-react'

interface HistoryListProps {
  vaccinations: any[]
  treatments: any[]
  consultations: any[]
}

export default function HistoryList({ vaccinations, treatments, consultations }: HistoryListProps) {
  const allRecords = [
    ...vaccinations.map(v => ({
      ...v,
      type: 'vaccination',
      title: `Vaksinasi: ${v.pets?.name}`,
      subtitle: `Dr. ${v.doctors?.profiles?.full_name}`,
      date: v.vaccination_date,
      status: v.status
    })),
    ...treatments.map(t => ({
      ...t,
      type: 'treatment',
      title: `Pengobatan: ${t.pets?.name}`,
      subtitle: `Dr. ${t.doctors?.profiles?.full_name}`,
      date: t.created_at,
      status: t.status
    })),
    ...consultations.map(c => ({
      ...c,
      type: 'consultation',
      title: `Konsultasi: ${c.pets?.name}`,
      subtitle: `Dr. ${c.doctors?.profiles?.full_name}`,
      date: c.scheduled_date,
      status: c.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return <Syringe className="h-5 w-5 text-green-600" />
      case 'treatment': return <Stethoscope className="h-5 w-5 text-yellow-600" />
      case 'consultation': return <Video className="h-5 w-5 text-purple-600" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4">
      {allRecords.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada riwayat</h3>
          <p className="text-gray-500">Mulai menggunakan layanan untuk melihat riwayat di sini.</p>
        </div>
      ) : (
        allRecords.map((record) => (
          <div key={`${record.type}-${record.id}`} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  {getIcon(record.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{record.title}</h4>
                  <p className="text-sm text-gray-600">{record.subtitle}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(record.date)}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {record.status === 'pending' ? 'Menunggu' :
                 record.status === 'confirmed' ? 'Terkonfirmasi' :
                 record.status === 'completed' ? 'Selesai' :
                 record.status === 'cancelled' ? 'Dibatalkan' : record.status}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
