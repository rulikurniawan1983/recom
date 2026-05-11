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
  status: RegistrationStatus
  company_documents: RegistrationDocument[]
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
}

export interface RegistrationDocument {
  id: string
  registration_id: string
  document_type: string
  file_url: string
  file_name: string
  uploaded_at: string
  verified: boolean
}

export interface InspectionSchedule {
  id: string
  registration_id: string
  inspector_id: string
  scheduled_date: string
  scheduled_time: string
  location: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
}