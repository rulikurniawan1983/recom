'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, AlertTriangle, Calendar, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { VaccineType, VaccineBatch, VaccineStockSummary, VaccineExpiryAlert } from '@/lib/types'

export default function VaccineStockPage() {
  const router = useRouter()
  const [stockSummary, setStockSummary] = useState<VaccineStockSummary[]>([])
  const [batches, setBatches] = useState<VaccineBatch[]>([])
  const [expiryAlerts, setExpiryAlerts] = useState<VaccineExpiryAlert[]>([])
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [summaryRes, batchesRes, alertsRes, typesRes] = await Promise.all([
        fetch('/api/vaccine-stock/summary'),
        fetch('/api/vaccine-batches'),
        fetch('/api/vaccine-stock/expiry-alerts'),
        fetch('/api/vaccine-types')
      ])

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setStockSummary(data.data || [])
      }

      if (batchesRes.ok) {
        const data = await batchesRes.json()
        setBatches(data.data || [])
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json()
        setExpiryAlerts(data.data || [])
      }

      if (typesRes.ok) {
        const data = await typesRes.json()
        setVaccineTypes(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'depleted': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getExpiryStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800'
      case 'expiring_soon': return 'bg-orange-100 text-orange-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const filteredBatches = batches.filter(b => 
    !searchQuery || 
    b.vaccine_types?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.batch_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 h-14 lg:hidden px-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">Manajemen Stok Vaksin</span>
      </header>

      <main className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Stok Vaksin</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola inventori vaksin dan stok</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Jenis Vaksin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{vaccineTypes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Batch Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{batches.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Peringatan Kadaluarsa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{expiryAlerts.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Stok</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Vaksin</TableHead>
                      <TableHead>Jenis Hewan</TableHead>
                      <TableHead className="text-right">Stok Tersedia</TableHead>
                      <TableHead className="text-right">Batch Aktif</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockSummary.map(item => (
                      <TableRow key={item.vaccine_type_id}>
                        <TableCell className="font-medium">{item.vaccine_name}</TableCell>
                        <TableCell>{item.target_species || '-'}</TableCell>
                        <TableCell className="text-right">{item.total_available}</TableCell>
                        <TableCell className="text-right">{item.active_batches}</TableCell>
                        <TableCell>
                          <Badge className={item.stock_status === 'low' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                            {item.stock_status === 'low' ? 'Stok Rendah' : 'Normal'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Expiry Alerts */}
          {expiryAlerts.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Peringatan Kadaluarsa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jenis Vaksin</TableHead>
                        <TableHead>No. Batch</TableHead>
                        <TableHead>Kadaluarsa</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiryAlerts.map((alert, i) => (
                        <TableRow key={i}>
                          <TableCell>{alert.vaccine_name}</TableCell>
                          <TableCell className="font-mono text-sm">{alert.batch_number}</TableCell>
                          <TableCell>{new Date(alert.expiry_date).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>{alert.available_quantity}</TableCell>
                          <TableCell>
                            <Badge className={getExpiryStatusColor(alert.expiry_status)}>
                              {alert.expiry_status === 'expired' ? 'Kadaluarsa' : 'Akan Kadaluarsa'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batches Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>Semua Batch Vaksin</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Cari jenis vaksin atau batch..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Vaksin</TableHead>
                      <TableHead>No. Batch</TableHead>
                      <TableHead className="text-right">Stok Awal</TableHead>
                      <TableHead className="text-right">Tersedia</TableHead>
                      <TableHead className="text-right">Dipesan</TableHead>
                      <TableHead>Kadaluarsa</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map(batch => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.vaccine_types?.name}</TableCell>
                        <TableCell className="font-mono text-sm">{batch.batch_number}</TableCell>
                        <TableCell className="text-right">{batch.initial_quantity}</TableCell>
                        <TableCell className="text-right">{batch.available_quantity}</TableCell>
                        <TableCell className="text-right">{batch.reserved_quantity}</TableCell>
                        <TableCell>{new Date(batch.expiry_date).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status === 'active' ? 'Aktif' :
                             batch.status === 'low_stock' ? 'Stok Rendah' :
                             batch.status === 'expired' ? 'Kadaluarsa' :
                             batch.status === 'depleted' ? 'Habis' : batch.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}