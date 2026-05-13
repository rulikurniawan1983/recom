export type UserRole = 'admin' | 'user'

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
  verified: boolean
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