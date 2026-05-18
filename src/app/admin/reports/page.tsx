'use client'
import { useState, useEffect, useMemo } from 'react'
import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  FileText, Download, Calendar, Syringe, Stethoscope, Video,
  ArrowUpRight, Users, Activity, ChevronRight
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ReportRow {
  month: string
  year: number
  month_num: number
  vaccinations: number
  treatments: number
  consultations: number
  rabies_cases: number
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [months, setMonths] = useState<number>(12)
  const [year, setYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login') }
    })
  }, [router])

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      const from = `${year}-01-01T00:00:00`
      const to = `${year}-12-31T23:59:59`

      const [vacc, treat, consult] = await Promise.all([
        supabase.from('vaccinations').select('vaccination_date, vaccine_type').gte('vaccination_date', `${year}-01-01`).lte('vaccination_date', `${year}-12-31`),
        supabase.from('treatments').select('created_at').gte('created_at', from).lte('created_at', to),
        supabase.from('consultations').select('scheduled_date').gte('scheduled_date', `${year}-01-01`).lte('scheduled_date', `${year}-12-31`),
      ])

      const monthCount: Record<number, { v: number; t: number; c: number; rabies: number }> = {}
      for (let i = 1; i <= 12; i++) {
        monthCount[i] = { v: 0, t: 0, c: 0, rabies: 0 }
      }

      ;(vacc.data || []).forEach((item: any) => {
        const d = new Date(item.vaccination_date)
        const m = d.getMonth() + 1
        monthCount[m].v++
        if (item.vaccine_type && item.vaccine_type.toLowerCase().includes('rabies')) {
          monthCount[m].rabies++
        }
      })
      ;(treat.data || []).forEach((item: any) => {
        const d = new Date(item.created_at)
        monthCount[d.getMonth() + 1].t++
      })
      ;(consult.data || []).forEach((item: any) => {
        const d = new Date(item.scheduled_date)
        monthCount[d.getMonth() + 1].c++
      })

      const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
      const reportRows: ReportRow[] = Object.entries(monthCount)
        .slice(-months)
        .map(([m, v]) => ({
          month: monthNames[parseInt(m) - 1],
          year,
          month_num: parseInt(m),
          vaccinations: v.v,
          treatments: v.t,
          consultations: v.c,
          rabies_cases: v.rabies,
        }))
      setRows(reportRows)
      setLoading(false)
    })()
  }, [year, months])

  const totals = useMemo(() => ({
    vacc: rows.reduce((s, r) => s + r.vaccinations, 0),
    treat: rows.reduce((s, r) => s + r.treatments, 0),
    consult: rows.reduce((s, r) => s + r.consultations, 0),
    rabies: rows.reduce((s, r) => s + r.rabies_cases, 0),
  }), [rows])

  const handleExportCSV = () => {
    downloadCSV(`laporan_${year}.csv`, rows)
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Veteriner</h1>
          <p className="text-gray-500 mt-1">Laporan bulanan vaksinasi, pengobatan, dan kasus rabies</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg bg-white text-sm"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={months}
            onChange={e => setMonths(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg bg-white text-sm"
          >
            <option value={3}>3 bulan terakhir</option>
            <option value={6}>6 bulan terakhir</option>
            <option value={12}>12 bulan terakhir</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Vaksinasi', value: totals.vacc, icon: <Syringe className="h-5 w-5 text-blue-600" />, color: 'bg-blue-100' },
          { label: 'Total Pengobatan', value: totals.treat, icon: <Stethoscope className="h-5 w-5 text-yellow-600" />, color: 'bg-yellow-100' },
          { label: 'Total Konsultasi', value: totals.consult, icon: <Video className="h-5 w-5 text-purple-600" />, color: 'bg-purple-100' },
          { label: 'Kasus Rabies', value: totals.rabies, icon: <Activity className="h-5 w-5 text-red-600" />, color: 'bg-red-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Rincian Bulanan</h2>
          <span className="text-sm text-gray-500">{year}</span>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat laporan...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vaksinasi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pengobatan</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Konsultasi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kasus Rabies</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map(r => (
                  <tr key={`${r.year}-${r.month_num}`} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium">{r.month} {r.year}</td>
                    <td className="px-6 py-3 text-sm text-right">{r.vaccinations}</td>
                    <td className="px-6 py-3 text-sm text-right">{r.treatments}</td>
                    <td className="px-6 py-3 text-sm text-right">{r.consultations}</td>
                    <td className="px-6 py-3 text-sm text-right">
                      <span className={r.rabies_cases > 0 ? 'text-red-600 font-semibold' : ''}>{r.rabies_cases}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-semibold">
                      {r.vaccinations + r.treatments + r.consultations}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-3 text-sm">TOTAL</td>
                  <td className="px-6 py-3 text-sm text-right">{totals.vacc}</td>
                  <td className="px-6 py-3 text-sm text-right">{totals.treat}</td>
                  <td className="px-6 py-3 text-sm text-right">{totals.consult}</td>
                  <td className="px-6 py-3 text-sm text-right text-red-600">{totals.rabies}</td>
                  <td className="px-6 py-3 text-sm text-right">{totals.vacc + totals.treat + totals.consult}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
        }

        {rows.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada data untuk tahun ini</p>
          </div>
        )}
      </div>

      {/* Export note */}
      <p className="text-xs text-gray-400">
        Export CSV memudahkan pelaporan untuk keperluan dinas kesehatan hewan. File berformat .csv dapat dibuka di Excel atau Google Sheets.
      </p>
    </div>
  )
}
