'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  X, Upload, FileText, Loader2,
  ArrowUpCircle, MapPin, Phone, Mail, Calendar, Clock,
  CheckCircle2, FileSignature, IdCard, Building2,
  Stethoscope, PawPrint, User, Eye, AlertCircle, Edit3, History, Scale
} from 'lucide-react';
import type { NKVRegistration, DokterHewanRegistration, VeterinaryRegistration } from '@/lib/types';
import { uploadRegistrationDocument, validateFileSize } from '@/lib/storage';

type Registration = (NKVRegistration & { type: 'NKV' }) | (DokterHewanRegistration & { type: 'Dokter Hewan' }) | (VeterinaryRegistration & { type: 'Veterinary' });

// ── Reusable Pieces ──────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: 'draft',                 label: 'Draft' },
  { key: 'submitted',             label: 'Diajukan' },
  { key: 'document_verification', label: 'Verifikasi Dokumen' },
  { key: 'field_inspection',      label: 'Pemeriksaan Lapangan' },
  { key: 'assessment',            label: 'Penilaian' },
  { key: 'approved',              label: 'Disetujui' },
  { key: 'rejected',              label: 'Ditolak' },
] as const;

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Diajukan',
    document_verification: 'Verifikasi Dokumen',
    field_inspection: 'Pemeriksaan Lapangan',
    assessment: 'Penilaian',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    revision_requested: 'Perlu Revisi'
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-700 text-gray-300 border border-gray-600',
    submitted: 'bg-blue-900/50 text-blue-300 border border-blue-700',
    document_verification: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
    field_inspection: 'bg-purple-900/50 text-purple-300 border border-purple-700',
    assessment: 'bg-orange-900/50 text-orange-300 border border-orange-700',
    approved: 'bg-green-900/50 text-green-300 border border-green-700',
    rejected: 'bg-red-900/50 text-red-300 border border-red-700',
    revision_requested: 'bg-red-900/50 text-red-300 border border-red-700',
  };
  return colors[status] || 'bg-gray-700 text-gray-300 border border-gray-600';
}

let activeStep = -1;
let activeKey = '';
// Scoped to StyledStatusPipeline — declared outside so getDerivedState works
let DYN_activeStep = -1;
let DYN_activeKey = '';

function useActiveStep(status: string) {
  const completedSet = new Set<string>();
  let idx = -1;
  for (let i = 0; i < STATUS_STEPS.length; i++) {
    if (STATUS_STEPS[i].key === status || (status === 'revision_requested' && STATUS_STEPS[i].key === 'submitted')) {
      idx = i;
      break;
    }
    completedSet.add(STATUS_STEPS[i].key);
  }
  // revision_requested overrides: show at the end
  if (status === 'revision_requested') {
    completedSet.add('revision_requested');
    idx = STATUS_STEPS.length - 1;
  }
  return { activeStep: idx, completedSet, statusLabel: getStatusLabel(status) };
}

/** Utility helpers used inside the component */
const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const fmtDateTime = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const isPast = (d: string | null | undefined) => d ? new Date(d) < new Date() : false;

// ─────────────────────────────────────────────────────────────────────────────
// Status Pipeline — shows completed / current / remaining steps
// ─────────────────────────────────────────────────────────────────────────────
function StatusPipeline({ currentStatus }: { currentStatus: string }) {
  const statusOrder = ['draft', 'submitted', 'document_verification', 'field_inspection', 'assessment'];
  const isFinal = currentStatus === 'approved' || currentStatus === 'rejected' || currentStatus === 'revision_requested';

  // Normalise revision_requested → position after assessment
  let effectiveIndex = 0;
  if (currentStatus === 'approved') effectiveIndex = 5;
  else if (currentStatus === 'rejected') effectiveIndex = 5;
  else if (currentStatus === 'revision_requested') effectiveIndex = 6;
  else effectiveIndex = statusOrder.indexOf(currentStatus);

  const effectiveStatus = (currentStatus === 'revision_requested') ? 'revision_requested' : currentStatus;

  return (
    <div className="w-full pt-2">
      {/* Labels row */}
      <div className="flex items-center justify-between mb-1.5">
        {STATUS_STEPS.map((step, i) => {
          const isActive = (effectiveIndex === i) && currentStatus !== 'approved' && currentStatus !== 'rejected';
          const isDone = currentStatus === 'approved' || currentStatus === 'rejected'
            ? i < statusOrder.length : i < effectiveIndex;
          const isRejected = currentStatus === 'rejected' && i === statusOrder.length;
          const isRevision = effectiveIndex === 6 && i === 6;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 min-w-0" style={{ paddingLeft: i === 0 ? 0 : '0.5rem' }}>
              <span className={`text-[10px] font-medium text-center leading-tight ${isDone || isActive || isRejected || isRevision
                ? 'text-white'
                : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="flex items-center relative">
        {STATUS_STEPS.map((step, i) => {
          let cls = 'h-1.5 flex-1';
          if (i === 0) cls += ' rounded-l-full';
          else if (i === STATUS_STEPS.length - 1) cls += ' rounded-r-full';
          else cls += '';

          const activeLabel = effectiveStatus;
          let bg = 'bg-gray-700';
          if (activeLabel === 'approved' && i < statusOrder.length) bg = 'bg-green-600';
          else if (activeLabel === 'rejected' && i <= statusOrder.length) bg = 'bg-red-600';
          else if (activeLabel === 'revision_requested') {
            if (i < statusOrder.length) bg = 'bg-red-900';
            else if (i === 6) bg = 'bg-red-500';
          } else {
            if (i < effectiveIndex) bg = 'bg-blue-600';
            else if (i === effectiveIndex) bg = getBgForStatus(currentStatus);
          }
          return <div key={step.key} className={cls + ' ' + bg} />;
        })}
      </div>
    </div>
  );
}

function getBgForStatus(status: string): string {
  const m: Record<string, string> = {
    submitted: 'bg-blue-500',
    document_verification: 'bg-yellow-500',
    field_inspection: 'bg-purple-500',
    assessment: 'bg-orange-500',
  };
  return m[status] || 'bg-blue-500';
}

// ─────────────────────────────────────────────────────────────────────────────
// Document List Table
// ─────────────────────────────────────────────────────────────────────────────
function DocumentTable({ docs }: { docs: { id: string; document_type: string; file_url: string; file_name: string; uploaded_at: string; status: string; admin_notes: string | null }[] }) {
  if (!docs || docs.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-2 px-3 text-gray-400 font-medium">Tipe</th>
            <th className="text-left py-2 px-3 text-gray-400 font-medium">Nama File</th>
            <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
            <th className="text-left py-2 px-3 text-gray-400 font-medium">Diunggah</th>
            <th className="text-left py-2 px-3 text-gray-400 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => {
            const statusColor = doc.status === 'approved' ? 'text-green-400'
              : doc.status === 'rejected' ? 'text-red-400'
                : doc.status === 'revision_requested' ? 'text-orange-400'
                  : 'text-yellow-400';
            return (
              <tr key={doc.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td className="py-2.5 px-3 text-gray-200 capitalize">
                  {doc.document_type?.replace(/-/g, ' ') || 'Dokumen'}
                </td>
                <td className="py-2.5 px-3 text-gray-300 truncate max-w-[200px]">{doc.file_name || '—'}</td>
                <td className="py-2.5 px-3">
                  <span className={statusColor + ' capitalize'}>{doc.status === 'approved' ? 'Disetujui' : doc.status === 'rejected' ? 'Ditolak' : doc.status === 'revision_requested' ? 'Perlu Revisi' : 'Menunggu'}</span>
                </td>
                <td className="py-2.5 px-3 text-gray-400">{fmtDate(doc.uploaded_at)}</td>
                <td className="py-2.5 px-3">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline text-xs">Lihat</a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tracking Log Timeline
// ─────────────────────────────────────────────────────────────────────────────
function TrackingTimeline({ logs }: {
  logs: { id: string; status: string; created_at: string }[]
}) {
  if (!logs || logs.length === 0) return null;
  const sorted = [...logs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return (
    <div className="relative pl-6 border-l border-gray-700">
      {sorted.map((log, i) => (
        <div key={log.id} className="relative pb-5 last:pb-0">
          <div className="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full border-2 border-gray-600 bg-gray-800" />
          {i < sorted.length - 1 && <div className="absolute left-[calc(-9px+3.5px/2)] top-5 w-px h-full bg-gray-700" />}
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-200">{getStatusLabel(log.status)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{fmtDateTime(log.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function FieldRow({ label, value, isMono = false }: { label: string; value: React.ReactNode; isMono?: boolean }) {
  return (
    <div className="py-1.5 border-b border-gray-800/60 last:border-b-0">
      <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
      <p className={`mt-0.5 text-sm ${isMono ? 'font-mono text-blue-300' : 'text-gray-200'}`}>{value || '—'}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-blue-300 tracking-wide uppercase">
      <Icon className="h-4 w-4" />
      {title}
    </h3>
  );
}

function InfoCard({ title, icon: Icon, children, colSpan = 1 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; colSpan?: 1 | 2;
}) {
  return (
    <div className={`bg-gray-800/60 border border-gray-700 rounded-xl p-4 ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-3 pb-2 border-b border-gray-700">
        <Icon className="h-4 w-4 text-blue-400" />
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MODAL
// ─────────────────────────────────────────────────────────────────────────────

interface RegistrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onResubmit?: (id: string, files: Array<{ file_name: string; file_url: string; document_type: string }>) => Promise<void>;
}

const DOCUMENT_OPTIONS = [
  { value: 'surat-pernyataan', label: 'Surat Pernyataan Revisi' },
  { value: 'dokumen-pendukung', label: 'Dokumen Pendukung' },
  { value: 'surat-izin', label: 'Surat Izin Usaha' },
  { value: 'sertifikat', label: 'Sertifikat' },
  { value: 'foto', label: 'Foto / Pas Foto' },
  { value: 'dokumen-lain', label: 'Dokumen Lainnya' },
] as const;

export default function RegistrationDetailModal({
  isOpen, onClose, registration, onUpdate, onDelete, onResubmit,
}: RegistrationDetailModalProps) {
  interface FormData {
    business_name?: string; business_address?: string; business_phone?: string;
    business_email?: string; business_type?: string; product_type?: string; product_description?: string;
    full_name?: string; phone?: string; email?: string; clinic_address?: string;
    nib_number?: string; strv_number?: string;
    petName?: string; petType?: string; petBreed?: string; petAge?: string;
    petGender?: string; ownerName?: string; ownerPhone?: string; ownerAddress?: string;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResubmitConfirm, setShowResubmitConfirm] = useState(false);
  const [resubmitFiles, setResubmitFiles] = useState<Array<{ file: File; documentType: string; fileUrl: string | null; uploading: boolean }>>([]);
  const [resubmitUploading, setResubmitUploading] = useState(false);

  const effectiveStatus = registration.status;
  const statusLabel = getStatusLabel(effectiveStatus);
  const statusPipeline = useActiveStep(effectiveStatus);
  const isRejected = effectiveStatus === 'rejected';
  const displayStatus = effectiveStatus === 'revision_requested' ? 'Perlu Revisi' : statusLabel;

  const canEdit = effectiveStatus === 'draft' || effectiveStatus === 'submitted';
  const canDelete = effectiveStatus === 'draft';
  const canResubmit = effectiveStatus === 'revision_requested';
  const hasDocs = (reg: Registration) =>
    reg.type === 'NKV' || reg.type === 'Veterinary'
      ? !!(reg as NKVRegistration).recommendation_file_url
      : !!(reg as DokterHewanRegistration).color_photo_url ||
        !!(reg as DokterHewanRegistration).diploma_url ||
        !!(reg as DokterHewanRegistration).competency_cert_url ||
        !!(reg as DokterHewanRegistration).professional_recommendation_url;

  const handleClose = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setResubmitFiles([]);
    onClose();
  };

  const handleEdit = () => {
    if (!canEdit) return;
    setIsEditing(true);
    if (registration.type === 'NKV') {
      setFormData({
        business_name: registration.business_name || '', business_address: registration.business_address || '',
        business_phone: registration.business_phone || '', business_email: registration.business_email || '',
        business_type: registration.business_type || '', product_type: registration.product_type || '',
        product_description: registration.product_description || '',
      });
    } else if (registration.type === 'Dokter Hewan') {
      setFormData({
        full_name: registration.full_name || '', phone: registration.phone || '',
        email: registration.email || '', clinic_address: registration.clinic_address || '',
        nib_number: registration.nib_number || '', strv_number: registration.strv_number || '',
      });
    } else if (registration.type === 'Veterinary') {
      setFormData({
        petName: registration.pet_name || '', petType: registration.pet_type || '',
        petBreed: registration.pet_breed || '', petAge: registration.pet_age || '',
        petGender: registration.pet_gender || '', ownerName: registration.owner_name || '',
        ownerPhone: registration.owner_phone || '', ownerAddress: registration.owner_address || '',
      });
    }
  };

  const saveRegistrationData = async () => {
    if (!registration.id) return;
    setLoading(true);
    setError(null); setSuccess(null);
    try {
      const endpoint = registration.type === 'NKV' ? `/api/nkv/${registration.id}`
        : registration.type === 'Dokter Hewan' ? `/api/dokter-hewan/${registration.id}`
          : `/api/veterinary/${registration.id}`;
      const response = await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (response.ok) {
        setSuccess('Permohonan berhasil diperbarui');
        setIsEditing(false);
        await onUpdate(registration.id, formData as Record<string, unknown>);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Gagal memperbarui permohonan');
      }
    } catch { setError('Terjadi kesalahan saat memperbarui permohonan'); }
    finally { setLoading(false); }
  };

  const deleteRegistration = async () => {
    if (!registration.id) return;
    setShowDeleteConfirm(false);
    setLoading(true);
    setError(null);
    try {
      const endpoint = registration.type === 'NKV' || registration.type === 'Dokter Hewan'
        ? `${registration.type === 'NKV' ? '/api/nkv' : '/api/dokter-hewan'}/${registration.id}`
        : '';
      if (!endpoint) { setLoading(false); return; }
      const response = await fetch(endpoint, { method: 'DELETE' });
      if (response.ok) { await onDelete(registration.id); onClose(); }
      else { const errorData = await response.json(); setError(errorData.error || 'Gagal menghapus'); setLoading(false); }
    } catch { setError('Terjadi kesalahan saat menghapus'); setLoading(false); }
  };

  const handleAddResubmitFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFileSize(file)) { setError('Ukuran file melebihi 1 MB'); e.target.value = ''; return; }
    const docInput = e.target as HTMLInputElement & { dataset: { docType?: string } };
    const docType = docInput.dataset.docType || 'Dokumen Lainnya';
    setResubmitFiles(prev => [...prev, { file, documentType: docType, fileUrl: null, uploading: false }]);
    setError(null); e.target.value = '';
  }, []);

  const handleRemoveResubmitFile = useCallback((index: number) => setResubmitFiles(prev => prev.filter((_, i) => i !== index)), []);

  const handleResubmitFiles = async () => {
    if (!registration.id || !onResubmit) return;
    setResubmitUploading(true);
    setError(null);
    try {
      const uploadResults = await Promise.all(
        resubmitFiles.map(async (item) => {
          try { return { ...item, fileUrl: await uploadRegistrationDocument(item.file, registration.id, item.documentType), uploading: false } }
          catch { return { ...item, fileUrl: null, uploading: false } }
        })
      );
      const succeeded = uploadResults.filter(r => r.fileUrl !== null);
      if (succeeded.length === 0 && resubmitFiles.length > 0) { setError('Gagal mengunggah semua dokumen'); setResubmitUploading(false); return; }
      await onResubmit(registration.id, succeeded.map(r => ({ file_name: r.file.name, file_url: r.fileUrl!, document_type: r.documentType })));
      setSuccess('Permohonan berhasil diajukan kembali');
      setResubmitFiles([]); onClose();
    } catch { setError('Terjadi kesalahan saat mengajukan ulang'); }
    finally { setResubmitUploading(false); }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-3 sm:p-4 z-50" onClick={handleClose}>
      {/* ── Modal Shell ─────────────────────────────────────────────── */}
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="px-6 py-5 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-700/50">
                  {registration.type}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(registration.status)}`}>
                  {effectiveStatus === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                  {effectiveStatus === 'rejected' && <AlertCircle className="h-3 w-3" />}
                  {effectiveStatus === 'revision_requested' && <AlertCircle className="h-3 w-3" />}
                  {displayStatus}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">{registration.registration_number}</h2>
              <p className="text-xs text-gray-400 mt-1">
                Diajukan {fmtDate(registration.created_at)}
                {registration.updated_at &&
                  <span className="ml-3">· Diperbarui {fmtDate(registration.updated_at)}</span>}
                {registration.approved_at &&
                  <span className="ml-3 text-green-400">· Disetujui {fmtDate(registration.approved_at)}</span>}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status Pipeline */}
          <div className="mt-4 px-1">
            <StatusPipeline currentStatus={effectiveStatus} />
          </div>
        </div>

        {/* ── Alerts ─────────────────────────────────────────────────── */}
        {(error || success) && (
          <div className="px-6 pt-3 space-y-2 shrink-0">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 text-red-200 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-900/30 border border-green-700/50 text-green-200 rounded-lg flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                {success}
              </div>
            )}
          </div>
        )}

        {/* ── Confirmations ─────────────────────────────────────────── */}
        {showDeleteConfirm && (
          <div className="px-6 pt-3 shrink-0">
            <div className="p-4 bg-red-900/40 border-2 border-red-600/70 rounded-xl">
              <h4 className="font-semibold text-red-100 flex items-center gap-2"><AlertCircle className="h-4 w-4" />Konfirmasi Hapus</h4>
              <p className="text-sm text-red-200 mt-1">Yakin ingin menghapus <strong className="text-white">{registration.registration_number}</strong>? Tindakan ini permanen dan tidak dapat dibatalkan.</p>
              <div className="flex gap-2 justify-end mt-3">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={loading} className="border-gray-600 text-gray-300 hover:bg-gray-700">Batal</Button>
                <Button variant="destructive" size="sm" onClick={deleteRegistration} disabled={loading}>
                  {loading ? 'Menghapus…' : 'Ya, Hapus'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showResubmitConfirm && (
          <div className="px-6 pt-3 shrink-0">
            <div className="p-4 bg-blue-900/40 border-2 border-blue-600/70 rounded-xl">
              <h4 className="font-semibold text-blue-100 flex items-center gap-2"><FileSignature className="h-4 w-4" />Konfirmasi Ajukan Ulang</h4>
              <p className="text-sm text-blue-300 mt-1 mb-3">
                Mengajukan ulang <strong className="text-white">{registration.registration_number}</strong> akan mengembalikan status menjadi <strong>"Diajukan"</strong> dan menunggu verifikasi admin.
              </p>
              <div className="mb-3">
                <label className="block text-xs font-medium text-blue-200 mb-1.5">Dokumen Revisi</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {resubmitFiles.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-blue-900/30 px-2.5 py-1.5 rounded-lg border border-blue-900/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span className="text-sm text-blue-100 truncate">{item.file.name}</span>
                        <span className="text-[10px] text-blue-400 shrink-0">({item.documentType})</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.uploading && <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />}
                        {item.fileUrl && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                        {!item.fileUrl && !item.uploading && <X className="h-3.5 w-3.5 text-red-400" />}
                        <button onClick={() => handleRemoveResubmitFile(i)} className="text-gray-400 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <select
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-200"
                    id="resubmit-doc-type"
                  >
                    <option value="">Pilih tipe dokumen</option>
                    {DOCUMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer flex items-center gap-2 transition-colors">
                    <Upload className="h-4 w-4" />Pilih File
                    <input
                      type="file" className="hidden" accept=".pdf,.jpg,.png,.jpeg"
                      onChange={(e) => {
                        const select = document.getElementById('resubmit-doc-type') as HTMLSelectElement;
                        const docType = select?.value || 'Dokumen Lainnya';
                        const clonedEvent = { ...e, target: { ...e.target, dataset: { docType } } } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleAddResubmitFile(clonedEvent);
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-blue-400/60 mt-1">Maks. 1 MB per file — format: PDF, JPG, PNG</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowResubmitConfirm(false)} disabled={resubmitUploading} className="border-gray-600 text-gray-300 hover:bg-gray-700">Batal</Button>
                <Button size="sm" onClick={handleResubmitFiles} disabled={resubmitUploading || resubmitFiles.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {resubmitUploading ? 'Mengunggah…' : 'Ya, Ajukan Ulang'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Body (scrollable) ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── METADATA GRID ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { key: 'ID', label: 'ID', value: registration.id, mono: true },
              { key: 'Nomor Reg', label: 'Nomor Registrasi', value: registration.registration_number },
              { key: 'Jenis', label: 'Jenis Permohonan', value: registration.type },
              { key: 'Status', label: 'Status', value: displayStatus, highlight: true },
              { key: 'Dibuat', label: 'Dibuat', value: fmtDateTime(registration.created_at), icon: Calendar },
              { key: 'Diperbarui', label: 'Diperbarui', value: fmtDateTime(registration.updated_at), icon: Clock },
              { key: 'Disetujui', label: 'Tanggal Disetujui', value: fmtDate(registration.approved_at), icon: CheckCircle2 },
              { key: 'Pengguna', label: 'Daftar oleh', value: registration.profiles?.full_name || '—', icon: User },
            ].map(field => (
              <div key={field.key} className="bg-gray-800/50 border border-gray-700/60 rounded-lg px-3.5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{field.label}</p>
                <p className={`mt-0.5 text-sm ${field.highlight ? 'font-bold ' + getStatusColor(registration.status).split('border')[0] : field.mono ? 'font-mono text-blue-300' : 'text-gray-200'}`}>
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          {isRejected && registration.verification_notes && (
            <div className="p-4 bg-red-900/25 border border-red-800/60 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                <AlertCircle className="h-4 w-4" />Alasan Penolakan
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{registration.verification_notes}</p>
            </div>
          )}

          {registration.status === 'revision_requested' && registration.verification_notes && (
            <div className="p-4 bg-orange-900/25 border border-orange-800/60 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-orange-400">
                <Edit3 className="h-4 w-4" />Catatan Revisi Admin
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{registration.verification_notes}</p>
            </div>
          )}

          {/* ── DETAILS PER TYPE ───────────────────────────────────────── */}
          {!isEditing && registration.type === 'NKV' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoCard title="Informasi Usaha" icon={Building2}>
                <FieldRow label="Nama Unit Usaha" value={registration.business_name} />
                <FieldRow label="Alamat" value={<span className="flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0"/><span>{registration.business_address || '—'}</span></span>} />
                <FieldRow label="Telepon" value={registration.business_phone} />
                <FieldRow label="Email" value={registration.business_email} />
                <FieldRow label="Jenis Usaha" value={registration.business_type?.replace(/-/g, ' ')} />
              </InfoCard>
              <InfoCard title="Detail Produk" icon={ArrowUpCircle}>
                <FieldRow label="Jenis Produk" value={registration.product_type?.replace(/-/g, ' ')} />
                <FieldRow label="Kategori Produk" value={registration.product_type} />
                <FieldRow label="Unit Usaha" value={registration.business_units?.name || '—'} />
                <FieldRow label="ID Unit Usaha" value={registration.business_unit_id || '—'} isMono />
                <FieldRow label="ID Produk" value={registration.product_type_id || '—'} isMono />
                <FieldRow label="Deskripsi" value={<span className="whitespace-pre-wrap">{registration.product_description || '—'}</span>} />
              </InfoCard>
            </div>
          )}

          {!isEditing && registration.type === 'Dokter Hewan' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoCard title="Data Pribadi" icon={User}>
                <FieldRow label="Nama Lengkap" value={registration.full_name} />
                <FieldRow label="Tempat / Tanggal Lahir" value={<span className="flex items-start gap-1.5"><Calendar className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0"/><span>{registration.birth_place_date || '—'}</span></span>} />
                <FieldRow label="Alamat KTP" value={<span className="flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0"/><span>{registration.ktp_address || '—'}</span></span>} />
                <FieldRow label="Telepon" value={registration.phone} />
                <FieldRow label="Email" value={registration.email} />
              </InfoCard>
              <InfoCard title="Praksis & Izin" icon={Stethoscope}>
                <FieldRow label="Alamat Klinik" value={<span className="flex items-start gap-1.5"><Building2 className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0"/><span>{registration.clinic_address || '—'}</span></span>} />
                <FieldRow label="NIB" value={<span className="font-mono text-blue-300">{registration.nib_number || '—'}</span>} />
                <FieldRow label="STRV" value={<span className="font-mono text-blue-300">{registration.strv_number || '—'}</span>} />
                <FieldRow label="Status" value={<span className={getStatusColor(registration.status)}>{displayStatus}</span>} />
              </InfoCard>
            </div>
          )}

          {!isEditing && registration.type === 'Veterinary' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoCard title="Data Hewan Peliharaan" icon={PawPrint}>
                <FieldRow label="Nama" value={registration.pet_name} />
                <FieldRow label="Jenis" value={registration.pet_type} />
                <FieldRow label="Ras" value={registration.pet_breed || '—'} />
                <FieldRow label="Umur" value={registration.pet_age || '—'} />
                <FieldRow label="Jenis Kelamin" value={registration.pet_gender ? registration.pet_gender.charAt(0).toUpperCase() + registration.pet_gender.slice(1) : '—'} />
              </InfoCard>
              <InfoCard title="Data Pemilik" icon={User}>
                <FieldRow label="Nama Pemilik" value={registration.owner_name} />
                <FieldRow label="Telepon" value={registration.owner_phone} />
                <FieldRow label="Alamat" value={<span className="flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0"/><span>{registration.owner_address || '—'}</span></span>} />
                <FieldRow label="Status" value={<span className={getStatusColor(registration.status)}>{displayStatus}</span>} />
              </InfoCard>
            </div>
          )}

          {/* ── ADMIN / INSPECTION NOTES ─────────────────────────────── */}
          {(registration.verification_notes
            || registration.inspection_date
            || registration.inspection_notes
            || registration.assessment_score !== null
            || registration.assessment_notes
            || registration.inspector_id
          ) && (
            <div className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-4 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-amber-300 tracking-wide uppercase">
                <Scale className="h-4 w-4" /> Catatan Admin & Hasil Pemeriksaan
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Catatan Verifikasi</p>
                  <p className="text-sm text-gray-300 mt-0.5">{registration.verification_notes || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pengawas Lapangan</p>
                  <p className="text-sm text-gray-300 mt-0.5 font-mono">{registration.inspector_id || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal Pemeriksaan Lapangan</p>
                  <p className="text-sm text-gray-300 mt-0.5">{fmtDate(registration.inspection_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Catatan Pemeriksaan</p>
                  <p className="text-sm text-gray-300 mt-0.5 whitespace-pre-wrap">{registration.inspection_notes || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nilai Penilaian</p>
                  <p className={`text-sm mt-0.5 font-bold ${registration.assessment_score !== null ? 'text-green-400' : 'text-gray-500'}`}>
                    {registration.assessment_score !== null ? `${registration.assessment_score} / 100` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Catatan Penilaian</p>
                  <p className="text-sm text-gray-300 mt-0.5 whitespace-pre-wrap">{registration.assessment_notes || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS TABLE ────────────────────────────────────────── */}
          {(((registration.type === 'NKV' || registration.type === 'Veterinary') && registration.recommendation_file_url) ||
            (registration.type === 'Dokter Hewan' && hasDocs(registration))) && !isEditing && (
            <div className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-green-300 tracking-wide uppercase mb-3">
                <FileText className="h-4 w-4" /> Dokumen yang Diunggah
              </h3>

              {/* NKV — just recommendation file */}
              {registration.type === 'NKV' && registration.recommendation_file_url && (
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-200">Rekomendasi</span>
                  </div>
                  <a href={registration.recommendation_file_url!} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> Lihat
                  </a>
                </div>
              )}

              {/* NKV — recommendation file simple list */}
              {registration.type === 'NKV' && registration.recommendation_file_url && (
                <div className="border-t border-gray-700 pt-3 mt-3 space-y-3">
                  {/* spacer if dokter hewan already handled inline — NKV handled by inline link above */}
                </div>
              )}

              {/* Registration Documents Table */}
              {registration.registration_documents && registration.registration_documents.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Riwayat Dokumen Upload</p>
                  <DocumentTable docs={registration.registration_documents as Parameters<typeof DocumentTable>[0]['docs']} />
                </div>
              )}
            </div>
          )}

          {!hasDocs(registration) && !isEditing && registration.type === 'NKV' && !registration.recommendation_file_url && (
            <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-700 rounded-xl">
              Belum ada dokumen atau rekomendasi yang diunggah untuk permohonan ini.
            </div>
          )}

          {/* ── TRACKING TIMELINE ─────────────────────────────────────── */}
          {registration.tracking_logs && registration.tracking_logs.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-purple-300 tracking-wide uppercase mb-4">
                <History className="h-4 w-4" /> Riwayat Status
              </h3>
              <TrackingTimeline logs={registration.tracking_logs} />
            </div>
          )}

          {/* ── EDIT MODE ─────────────────────────────────────────────── */}
          {isEditing && (
            <div className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-4 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-yellow-300 tracking-wide uppercase">
                <Edit3 className="h-4 w-4" /> Edit Data Permohonan
              </h3>
              {registration.type === 'NKV' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nama Unit Usaha</label>
                    <Input value={formData.business_name || ''} onChange={e => setFormData({ ...formData, business_name: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Telepon</label>
                    <Input value={formData.business_phone || ''} onChange={e => setFormData({ ...formData, business_phone: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Alamat</label>
                    <Textarea value={formData.business_address || ''} onChange={e => setFormData({ ...formData, business_address: e.target.value })} rows={2} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                    <Input type="email" value={formData.business_email || ''} onChange={e => setFormData({ ...formData, business_email: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Jenis Usaha</label>
                    <select value={formData.business_type || ''} onChange={e => setFormData({ ...formData, business_type: e.target.value })} className="w-full rounded-lg border border-gray-600 px-3 py-2 bg-gray-800 text-white text-sm" required>
                      <option value="">Pilih jenis usaha</option>
                      <option value="rph-ruminansia">RPH Ruminansia</option>
                      <option value="rph-babi">RPH Babi</option>
                      <option value="rpu">Rumah Potong Unggas (RPU)</option>
                      <option value="rph-lainnya">RPH Lainnya</option>
                      <option value="budidaya-unggas-petelur">Budidaya unggas petelur</option>
                      <option value="budidaya-unggas-perah">Budidaya unggas perah</option>
                      <option value="pengolahan-daging">Pengolahan daging</option>
                      <option value="pengolahan-susu">Pengolahan susu</option>
                      <option value="pengolahan-telur">Pengolahan telur</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Jenis Produk</label>
                    <select value={formData.product_type || ''} onChange={e => setFormData({ ...formData, product_type: e.target.value })} className="w-full rounded-lg border border-gray-600 px-3 py-2 bg-gray-800 text-white text-sm">
                      <option value="">Pilih jenis produk</option>
                      <option value="daging-sapi">Daging Sapi</option>
                      <option value="daging-kambing">Daging Kambing</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Deskripsi Produk</label>
                    <Textarea value={formData.product_description || ''} onChange={e => setFormData({ ...formData, product_description: e.target.value })} rows={3} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                </div>
              )}
              {registration.type === 'Dokter Hewan' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nama Lengkap</label>
                    <Input value={formData.full_name || ''} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Telepon</label>
                    <Input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                    <Input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Alamat Klinik</label>
                    <Textarea value={formData.clinic_address || ''} onChange={e => setFormData({ ...formData, clinic_address: e.target.value })} rows={2} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">NIB</label>
                    <Input value={formData.nib_number || ''} onChange={e => setFormData({ ...formData, nib_number: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">STRV</label>
                    <Input value={formData.strv_number || ''} onChange={e => setFormData({ ...formData, strv_number: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                </div>
              )}
              {registration.type === 'Veterinary' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nama Hewan</label>
                    <Input value={formData.petName || ''} onChange={e => setFormData({ ...formData, petName: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Jenis Hewan</label>
                    <Input value={formData.petType || ''} onChange={e => setFormData({ ...formData, petType: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Ras</label>
                    <Input value={formData.petBreed || ''} onChange={e => setFormData({ ...formData, petBreed: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Umur</label>
                    <Input value={formData.petAge || ''} onChange={e => setFormData({ ...formData, petAge: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Jenis Kelamin</label>
                    <select value={formData.petGender || ''} onChange={e => setFormData({ ...formData, petGender: e.target.value })} className="w-full rounded-lg border border-gray-600 px-3 py-2 bg-gray-800 text-white text-sm">
                      <option value="">Pilih</option>
                      <option value="jantan">Jantan</option>
                      <option value="betina">Betina</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nama Pemilik</label>
                    <Input value={formData.ownerName || ''} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Telepon</label>
                    <Input value={formData.ownerPhone || ''} onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Alamat Pemilik</label>
                    <Textarea value={formData.ownerAddress || ''} onChange={e => setFormData({ ...formData, ownerAddress: e.target.value })} rows={2} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2 border-t border-gray-700">
                <Button onClick={saveRegistrationData} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  {loading ? 'Menyimpan…' : 'Simpan Perubahan'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Batal
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-gray-500">
            {canEdit && 'Anda dapat mengedit data ini sebelum disubmit ke admin.'}
            {canResubmit && 'Admin meminta revisi dokumen.'}
            {isRejected && 'Permohonan telah ditolak.'}
            {effectiveStatus === 'approved' && 'Permohonan telah disetujui secara resmi.'}
            {!canEdit && !canResubmit && !isRejected && effectiveStatus !== 'approved' &&
              `Status "${displayStatus}" — pengeditan tidak tersedia.`}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">Tutup</Button>
            {canEdit && !isEditing && (
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Edit3 className="h-4 w-4 mr-1.5" />Edit Permohonan
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Hapus Permohonan</Button>
            )}
            {canResubmit && onResubmit && (
              <Button onClick={() => setShowResubmitConfirm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <FileSignature className="h-4 w-4 mr-1.5" />Ajukan Ulang
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
