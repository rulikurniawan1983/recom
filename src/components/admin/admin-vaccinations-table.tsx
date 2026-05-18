'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Calendar, Clock, User, MapPin, Package, Plus, Trash2, Stethoscope } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Doctor {
  id: string
  profiles: { full_name: string | null }
}

interface VaccinationScheduleItem {
  id: string
  date: string
  start_time: string
  end_time: string
  max_patients: number
  current_patients: number
  location: string | null
  doctors: Doctor
}

interface VaccinationStock {
  id: string
  vaccine_type: string
  batch_number: string
  total_doses: number
  used_doses: number
  expiry_date: string | null
  created_at: string
}

interface Vaccination {
  id: string
  vaccination_date: string
  status: string
  vaccine_type: string
  batch_number: string | null
  notes: string | null
  admin_notes: string | null
  qr_code: string | null
  ticket_id: string | null
  pets: { name: string; species: string; breed: string | null }
  doctors: { id: string; profiles: { full_name: string | null } } | null
  schedule_id: string | null
}

interface AdminVaccinationsTableProps {
  vaccinations: Vaccination[]
  doctors?: Doctor[]
  loading?: boolean
  onBack?: () => void
}

export default function AdminVaccinationsTable({
  vaccinations, doctors = [], loading, onBack
}: AdminVaccinationsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<Vaccination | null>(null)

  // Schedule tab
  const [showSchedule, setShowSchedule] = useState(false)
  const [schedules, setSchedules] = useState<VaccinationScheduleItem[]>([])
  const [newSchedule, setNewSchedule] = useState({ doctor_id: '', date: '', start_time: '', end_time: '', max_patients: '20', location: '' })
  const [creatingSchedule, setCreatingSchedule] = useState(false)

  // Stock tab
  const [showStock, setShowStock] = useState(false)
  const [stock, setStock] = useState<VaccinationStock[]>([])
  const [newStock, setNewStock] = useState({ vaccine_type: '', batch_number: '', total_doses: '', expiry_date: '' })
  const [creatingStock, setCreatingStock] = useState(false)

  const filteredVaccinations = vaccinations.filter(v => {
    return v.pets?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      && (statusFilter === 'all' || v.status === statusFilter)
  })

  const loadSchedules = async () => {
    const { data } = await supabase
      .from('vaccination_schedules')
      .select('*, doctors (id, profiles (full_name))')
      .order('date', { ascending: false })
      .limit(50)
    if (data) setSchedules(data as unknown as VaccinationScheduleItem[])
  }

  const loadStock = async () => {
    const { data } = await supabase.from('vaccination_stock').select('*').order('created_at', { ascending: false })
    if (data) setStock(data as unknown as VaccinationStock[])
  }

  const handleTab = (tab: 'list' | 'schedule' | 'stock') => {
    if (tab === 'schedule') { setShowSchedule(true); setShowStock(false); loadSchedules() }
    else if (tab === 'stock') { setShowStock(true); setShowSchedule(false); loadStock() }
    else { setShowSchedule(false); setShowStock(false) }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800', no_show: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      pending: 'Menunggu', confirmed: 'Terkonfirmasi', completed: 'Selesai', cancelled: 'Dibatalkan', no_show: 'Tidak Hadir',
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>
  }

  const handleStatusUpdate = async (vaccinationId: string, newStatus: string) => {
    setUpdating(vaccinationId)
    try {
      const res = await fetch(`/api/vaccinations/${vaccinationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) window.location.reload()
      else alert('Gagal memperbarui status')
    } catch { alert('Terjadi kesalahan') } finally { setUpdating(null) }
  }

  const handleCreateSchedule = async () => {
    if (!newSchedule.doctor_id || !newSchedule.date || !newSchedule.start_time || !newSchedule.end_time) {
      alert('Semua field harus diisi')
      return
    }
    setCreatingSchedule(true)
    try {
      const res = await fetch('/api/vaccination-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: newSchedule.doctor_id,
          date: newSchedule.date,
          start_time: newSchedule.start_time,
          end_time: newSchedule.end_time,
          max_patients: parseInt(newSchedule.max_patients) || 20,
          location: newSchedule.location || null,
        }),
      })
      if (res.ok) {
        setNewSchedule({ doctor_id: '', date: '', start_time: '', end_time: '', max_patients: '20', location: '' })
        loadSchedules()
        alert('Jadwal berhasil dibuat')
      } else {
        const err = await res.json()
        alert(err.error || 'Gagal membuat jadwal')
      }
    } catch { alert('Terjadi kesalahan') } finally { setCreatingSchedule(false) }
  }

  const handleCreateStock = async () => {
    if (!newStock.vaccine_type || !newStock.batch_number || !newStock.total_doses) {
      alert('Jenis vaksin, nomor batch, dan jumlah dosis wajib diisi')
      return
    }
    setCreatingStock(true)
    try {
      const { error } = await supabase.from('vaccination_stock').insert({
        vaccine_type: newStock.vaccine_type,
        batch_number: newStock.batch_number,
        total_doses: parseInt(newStock.total_doses),
        used_doses: 0,
        expiry_date: newStock.expiry_date || null,
      })
      if (!error) {
        setNewStock({ vaccine_type: '', batch_number: '', total_doses: '', expiry_date: '' })
        loadStock()
      } else alert('Gagal menambah stok')
    } catch { alert('Terjadi kesalahan') } finally { setCreatingStock(false) }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button onClick={() => handleTab('list')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            !showSchedule && !showStock ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Daftar Vaksinasi
        </button>
        <button onClick={() => handleTab('schedule')}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-1 ${
            showSchedule ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          <Calendar className="h-4 w-4" /> Jadwal Vaksinasi
        </button>
        <button onClick={() => handleTab('stock')}
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-1 ${
            showStock ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          <Package className="h-4 w-4" /> Stok Vaksin
        </button>
      </div>

      {/* ─── LIST VIEW ─── */}
      {!showSchedule && !showStock && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Vaksinasi</h1>
            {onBack && (
              <button onClick={onBack} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Kembali ke Dashboard
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari nama hewan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="confirmed">Terkonfirmasi</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hewan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jadwal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket / QR</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVaccinations.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{v.pets?.name}</div>
                        <div className="text-sm text-gray-500">{v.pets?.species} {v.pets?.breed && '• ' + v.pets.breed}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{formatDate(v.vaccination_date)}</div>
                        {v.doctors && <div className="text-xs text-gray-500">Dr. {v.doctors.profiles?.full_name}</div>}
                      </td>
                      <td className="px-6 py-4">
                        {v.doctors ? <span className="text-sm">Dr. {v.doctors.profiles?.full_name}</span> : <span className="text-sm text-gray-400">Belum ditugaskan</span>}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(v.status)}</td>
                      <td className="px-6 py-4">
                        {v.ticket_id ? (
                          <div className="text-xs">
                            <div className="font-mono text-gray-700">{v.ticket_id}</div>
                            {v.qr_code && <div className="text-gray-500 truncate max-w-[140px]" title={v.qr_code}>{v.qr_code}</div>}
                          </div>
                        ) : <span className="text-sm text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          {v.status === 'pending' && (
                            <>
                              <button onClick={() => handleStatusUpdate(v.id, 'confirmed')} disabled={updating === v.id} className="text-green-600 hover:text-green-800">
                                {updating === v.id ? '...' : 'Konfirmasi'}
                              </button>
                              <button onClick={() => handleStatusUpdate(v.id, 'cancelled')} disabled={updating === v.id} className="text-red-600 hover:text-red-800">
                                Batalkan
                              </button>
                            </>
                          )}
                          {v.status === 'confirmed' && (
                            <button onClick={() => handleStatusUpdate(v.id, 'completed')} disabled={updating === v.id} className="text-green-600 hover:text-green-800">
                              Selesai / Hadir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredVaccinations.length === 0 && (
              <div className="text-center py-12 text-gray-500">Tidak ada data vaksinasi</div>
            )}
          </div>
        </>
      )}

      {/* ─── SCHEDULE TAB ─── */}
      {showSchedule && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Manajemen Jadwal Vaksinasi</h2>
            <button onClick={() => setShowSchedule(false)} className="text-sm text-gray-500 hover:text-gray-700">Tutup</button>
          </div>

          {/* Create Schedule */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2"><Plus className="h-4 w-4" /> Buat Jadwal Baru</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <select value={newSchedule.doctor_id} onChange={e => setNewSchedule(p => ({ ...p, doctor_id: e.target.value }))} className="px-3 py-2 border rounded-lg bg-white text-sm">
                <option value="">Pilih Dokter</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>Dr. {d.profiles?.full_name}</option>
                ))}
              </select>
              <input type="date" value={newSchedule.date} onChange={e => setNewSchedule(p => ({ ...p, date: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="time" value={newSchedule.start_time} onChange={e => setNewSchedule(p => ({ ...p, start_time: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="time" value={newSchedule.end_time} onChange={e => setNewSchedule(p => ({ ...p, end_time: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
              <button onClick={handleCreateSchedule} disabled={creatingSchedule} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm disabled:opacity-50">
                {creatingSchedule ? 'Membuat...' : 'Tambah Jadwal'}
              </button>
            </div>
          </div>

          {/* Schedule List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Jam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Dokter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Kapasitas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Lokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedules.map(sch => (
                  <tr key={sch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{formatDate(sch.date)}</td>
                    <td className="px-6 py-4 text-sm">{sch.start_time} – {sch.end_time}</td>
                    <td className="px-6 py-4 text-sm">Dr. {sch.doctors?.profiles?.full_name}</td>
                    <td className="px-6 py-4 text-sm">
                      {sch.current_patients}/{sch.max_patients} pasien
                      <div className="w-full h-1.5 bg-gray-200 rounded mt-1">
                        <div className={`h-1.5 rounded ${(sch.current_patients / sch.max_patients) >= 1 ? 'bg-red-500' : (sch.current_patients / sch.max_patients) >= 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, (sch.current_patients / sch.max_patients) * 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{sch.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {schedules.length === 0 && <div className="text-center py-8 text-gray-500">Belum ada jadwal vaksinasi</div>}
          </div>
        </div>
      )}

      {/* ─── STOCK TAB ─── */}
      {showStock && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Manajemen Stok Vaksin</h2>
            <button onClick={() => setShowStock(false)} className="text-sm text-gray-500 hover:text-gray-700">Tutup</button>
          </div>

          {/* Add Stock */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Stok Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Jenis Vaksin *"
                value={newStock.vaccine_type}
                onChange={e => setNewStock(p => ({ ...p, vaccine_type: e.target.value }))}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Nomor Batch *"
                value={newStock.batch_number}
                onChange={e => setNewStock(p => ({ ...p, batch_number: e.target.value }))}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Jumlah Dosis *"
                value={newStock.total_doses}
                onChange={e => setNewStock(p => ({ ...p, total_doses: e.target.value }))}
                min={1}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="date"
                placeholder="Kadaluarsa"
                value={newStock.expiry_date}
                onChange={e => setNewStock(p => ({ ...p, expiry_date: e.target.value }))}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <button onClick={handleCreateStock} disabled={creatingStock} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50">
                {creatingStock ? 'Menyimpan...' : 'Tambah Stok'}
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Jenis Vaksin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">No. Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Stok</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Kadaluarsa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Ditambahkan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stock.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{s.vaccine_type}</td>
                    <td className="px-6 py-4 text-sm font-mono">{s.batch_number}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-semibold ${
                        (s.total_doses - s.used_doses) <= 5 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {s.total_doses - s.used_doses}
                      </span>
                      <span className="text-gray-400"> / {s.total_doses} tersisa</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {s.expiry_date ? (
                        <span className={new Date(s.expiry_date) < new Date() ? 'text-red-600' : ''}>
                          {formatDate(s.expiry_date)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stock.length === 0 && <div className="text-center py-8 text-gray-500">Belum ada data stok vaksin</div>}
          </div>
        </div>
      )}
    </div>
  )
}
