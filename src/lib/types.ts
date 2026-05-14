export type UserRole = 'admin' | 'user' | 'doctor'

export type RegistrationStatus =
  | 'draft'
  | 'submitted'
  | 'document_verification'
  | 'field_inspection'
  | 'assessment'
  | 'approved'
  | 'rejected'
  | 'revision_requested'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  phone: string | null
  company_name: string | null
  created_at: string
  updated_at: string
}

export interface BusinessUnit {
  id: string
  name: string
  address: string
  phone: string
  email: string
  business_type: string
  created_at: string
}

export interface ProductType {
  id: string
  name: string
  description: string | null
  category: string
  created_at: string
}

// ============================================
// VETERINARY SERVICE TYPES
// ============================================

export interface Doctor {
  id: string
  user_id: string
  license_number: string
  specialization: string | null
  years_of_experience: number | null
  biography: string | null
  profile_picture_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string | null
    email: string
  }
}

export interface Pet {
  id: string
  user_id: string
  name: string
  species: string
  breed: string | null
  age_years: number
  age_months: number
  gender: 'jantan' | 'betina' | 'lainnya'
  weight_kg: number | null
  color: string | null
  distinctive_features: string | null
  health_history: string | null
  vaccination_history: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VaccinationSchedule {
  id: string
  doctor_id: string
  date: string
  start_time: string
  end_time: string
  max_patients: number
  current_patients: number
  location: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  doctors?: Doctor
}

export interface Vaccination {
  id: string
  pet_id: string
  user_id: string
  doctor_id: string | null
  schedule_id: string | null
  vaccination_date: string
  batch_number: string | null
  vaccine_type: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  qr_code: string | null
  ticket_id: string | null
  notes: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  pets?: Pet
  doctors?: Doctor
  vaccination_schedules?: VaccinationSchedule
}

export interface TreatmentSchedule {
  id: string
  doctor_id: string
  date: string
  start_time: string
  end_time: string
  max_patients: number
  current_patients: number
  location: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  doctors?: Doctor
}

export interface Treatment {
  id: string
  pet_id: string
  user_id: string
  doctor_id: string
  schedule_id: string | null
  symptoms: string
  medical_history: string | null
  photos_urls: string[] | null
  videos_urls: string[] | null
  diagnosis: string | null
  prescription: string | null
  treatment_notes: string | null
  follow_up_date: string | null
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  created_at: string
  updated_at: string
  pets?: Pet
  doctors?: Doctor
  treatment_schedules?: TreatmentSchedule
}

export interface ConsultationSchedule {
  id: string
  doctor_id: string
  date: string
  start_time: string
  end_time: string
  max_patients: number
  current_patients: number
  consultation_type: 'online' | 'offline' | 'both'
  meeting_link: string | null
  location: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  doctors?: Doctor
}

export interface Consultation {
  id: string
  pet_id: string
  user_id: string
  doctor_id: string
  schedule_id: string | null
  consultation_type: 'online' | 'offline'
  scheduled_date: string
  scheduled_time: string
  meeting_link: string | null
  location: string | null
  documents_urls: string[] | null
  symptoms: string | null
  consultation_notes: string | null
  diagnosis: string | null
  prescription: string | null
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  is_rated: boolean
  rating: number | null
  review: string | null
  created_at: string
  updated_at: string
  pets?: Pet
  doctors?: Doctor
  consultation_schedules?: ConsultationSchedule
}

export interface MedicalRecord {
  id: string
  pet_id: string
  record_type: 'vaccination' | 'treatment' | 'consultation' | 'checkup' | 'surgery'
  reference_id: string | null
  doctor_id: string | null
  date: string
  findings: string | null
  diagnosis: string | null
  prescription: string | null
  recommendations: string | null
  attachments: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
  pets?: Pet
  doctors?: Doctor
}

export interface Notification {
  id: string
  user_id: string
  type: 'booking_confirmed' | 'reminder' | 'status_update' | 'system'
  title: string
  message: string
  data: Record<string, any> | null
  is_read: boolean
  created_at: string
  read_at: string | null
}

export interface PetDocument {
  id: string
  pet_id: string
  user_id: string
  file_name: string
  file_url: string
  file_type: string | null
  document_type: string | null
  description: string | null
  uploaded_at: string
  created_at: string
}

// ============================================
// EXISTING TYPES (NKV & Dokter Hewan)
// ============================================

export interface NKVRegistration {
  id: string
  user_id: string
  business_unit_id: string | null
  product_type_id: string | null
  registration_number: string
  business_name: string | null
  business_address: string | null
  business_phone: string | null
  business_email: string | null
  business_type: string | null
  product_type: string | null
  product_description: string | null
  status: RegistrationStatus
  verification_notes: string | null
  inspector_id: string | null
  inspection_date: string | null
  inspection_notes: string | null
  assessment_score: number | null
  assessment_notes: string | null
  recommendation_file_url: string | null
  created_at: string
  updated_at: string
  approved_at: string | null
  profiles?: {
    full_name: string | null
    email: string
  }
  business_units?: {
    name: string
  }
  registration_documents?: RegistrationDocument[]
  tracking_logs?: Array<{
    id: string
    status: string
    created_at: string
  }>
}

export interface DokterHewanRegistration {
  id: string
  user_id: string
  registration_number: string
  full_name: string
  birth_place_date: string | null
  ktp_address: string | null
  clinic_address: string
  phone: string | null
  email: string | null
  color_photo_url: string | null
  diploma_url: string | null
  competency_cert_url: string | null
  professional_recommendation_url: string | null
  nib_number: string | null
  strv_number: string | null
  status: RegistrationStatus
  verification_notes: string | null
  inspector_id: string | null
  inspection_date: string | null
  inspection_notes: string | null
  assessment_score: number | null
  assessment_notes: string | null
  recommendation_file_url: string | null
  created_at: string
  updated_at: string
  approved_at: string | null
  profiles?: {
    full_name: string | null
    email: string
  }
  registration_documents?: RegistrationDocument[]
  tracking_logs?: Array<{
    id: string
    status: string
    created_at: string
  }>
}

export interface RegistrationDocument {
  id: string
  registration_id: string
  registration_type: string
  document_type: string
  file_url: string
  file_name: string
  uploaded_at: string
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
  verified_at?: string
  admin_notes?: string | null
}

export interface InspectionSchedule {
  id: string
  registration_id: string
  registration_type: string
  inspector_id: string
  scheduled_date: string
  scheduled_time: string
  location: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
}
