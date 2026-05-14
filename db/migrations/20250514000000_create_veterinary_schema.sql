-- ============================================
-- VETERINARY HEALTHCARE SERVICE SCHEMA
-- Pelayanan Kesehatan Hewan
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. DOCTORS TABLE (Dokter Hewan)
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  specialization VARCHAR(200),
  years_of_experience INTEGER,
  biography TEXT,
  profile_picture_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. PETS TABLE (Hewan Peliharaan)
-- ============================================
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  species VARCHAR(100) NOT NULL, -- e.g., Anjing, Kucing, Sapi, Kambing
  breed VARCHAR(150),
  age_years INTEGER DEFAULT 0,
  age_months INTEGER DEFAULT 0,
  gender VARCHAR(20) CHECK (gender IN ('jantan', 'betina', 'lainnya')),
  weight_kg DECIMAL(5,2),
  color VARCHAR(100),
  distinctive_features TEXT,
  health_history TEXT,
  vaccination_history TEXT, -- JSON format for quick reference
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. VACCINATION SCHEDULES (Jadwal Vaksinasi)
-- ============================================
CREATE TABLE IF NOT EXISTS vaccination_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_patients INTEGER DEFAULT 20,
  current_patients INTEGER DEFAULT 0,
  location VARCHAR(200), -- clinic location
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, date, start_time)
);

-- ============================================
-- 4. VACCINATIONS (Vaksinasi Rabies)
-- ============================================
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  schedule_id UUID REFERENCES vaccination_schedules(id) ON DELETE SET NULL,
  vaccination_date DATE NOT NULL,
  batch_number VARCHAR(100),
  vaccine_type VARCHAR(100) DEFAULT 'Rabies',
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')
  ),
  qr_code VARCHAR(200) UNIQUE,
  ticket_id VARCHAR(100) UNIQUE,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. TREATMENT SCHEDULES (Jadwal Pengobatan)
-- ============================================
CREATE TABLE IF NOT EXISTS treatment_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_patients INTEGER DEFAULT 10,
  current_patients INTEGER DEFAULT 0,
  location VARCHAR(200),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, date, start_time)
);

-- ============================================
-- 6. TREATMENTS (Pengobatan Hewan)
-- ============================================
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES treatment_schedules(id) ON DELETE SET NULL,
  symptoms TEXT NOT NULL,
  medical_history TEXT,
  photos_urls TEXT[], -- Array of photo URLs
  videos_urls TEXT[], -- Array of video URLs
  diagnosis TEXT,
  prescription TEXT,
  treatment_notes TEXT,
  follow_up_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')
  ),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (
    payment_status IN ('unpaid', 'paid', 'refunded')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. CONSULTATION SCHEDULES (Jadwal Konsultasi)
-- ============================================
CREATE TABLE IF NOT EXISTS consultation_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_patients INTEGER DEFAULT 15,
  current_patients INTEGER DEFAULT 0,
  consultation_type VARCHAR(20) CHECK (
    consultation_type IN ('online', 'offline', 'both')
  ) DEFAULT 'both',
  meeting_link TEXT, -- for online consultations
  location VARCHAR(200), -- for offline
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, date, start_time)
);

-- ============================================
-- 8. CONSULTATIONS (Konsultasi)
-- ============================================
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES consultation_schedules(id) ON DELETE SET NULL,
  consultation_type VARCHAR(20) NOT NULL CHECK (
    consultation_type IN ('online', 'offline')
  ),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  meeting_link TEXT, -- for online
  location VARCHAR(200), -- for offline
  documents_urls TEXT[], -- medical documents
  symptoms TEXT,
  consultation_notes TEXT,
  diagnosis TEXT,
  prescription TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')
  ),
  is_rated BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. MEDICAL RECORDS (Riwayat Medis)
-- ============================================
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL CHECK (
    record_type IN ('vaccination', 'treatment', 'consultation', 'checkup', 'surgery')
  ),
  reference_id UUID, -- ID of vaccination/treatment/consultation
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  findings TEXT,
  diagnosis TEXT,
  prescription TEXT,
  recommendations TEXT,
  attachments TEXT[], -- URLs to files
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. NOTIFICATIONS (Notifikasi)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('booking_confirmed', 'reminder', 'status_update', 'system')
  ),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- additional data (booking id, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 11. PET DOCUMENTS (Dokumen Hewan)
-- ============================================
CREATE TABLE IF NOT EXISTS pet_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  document_type VARCHAR(100), -- e.g., 'health_certificate', 'vaccination_card', 'lab_result'
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Pets indexes
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_is_active ON pets(is_active);

-- Vaccinations indexes
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_user_id ON vaccinations(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_status ON vaccinations(status);
CREATE INDEX IF NOT EXISTS idx_vaccinations_date ON vaccinations(vaccination_date);
CREATE INDEX IF NOT EXISTS idx_vaccinations_qr_code ON vaccinations(qr_code);
CREATE INDEX IF NOT EXISTS idx_vaccinations_ticket_id ON vaccinations(ticket_id);

-- Treatments indexes
CREATE INDEX IF NOT EXISTS idx_treatments_pet_id ON treatments(pet_id);
CREATE INDEX IF NOT EXISTS idx_treatments_user_id ON treatments(user_id);
CREATE INDEX IF NOT EXISTS idx_treatments_doctor_id ON treatments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_treatments_status ON treatments(status);

-- Consultations indexes
CREATE INDEX IF NOT EXISTS idx_consultations_pet_id ON consultations(pet_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(scheduled_date);

-- Schedules indexes
CREATE INDEX IF NOT EXISTS idx_vaccination_schedules_doctor_date ON vaccination_schedules(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_treatment_schedules_doctor_date ON treatment_schedules(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_consultation_schedules_doctor_date ON consultation_schedules(doctor_id, date);

-- Medical records indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(date);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_pet_documents_pet_id ON pet_documents(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_documents_user_id ON pet_documents(user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccination_schedules_updated_at BEFORE UPDATE ON vaccination_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON vaccinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_schedules_updated_at BEFORE UPDATE ON treatment_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_schedules_updated_at BEFORE UPDATE ON consultation_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DOCTORS POLICIES
-- ============================================

-- Public can view active doctors
CREATE POLICY "Public can view active doctors" ON doctors
  FOR SELECT USING (
    is_active = true OR
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own profile" ON doctors
  FOR UPDATE USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- Admins can insert/update/delete doctors
CREATE POLICY "Admins can manage doctors" ON doctors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PETS POLICIES
-- ============================================

-- Users can manage their own pets
CREATE POLICY "Users can manage own pets" ON pets
  FOR ALL USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- Admins can view all pets
CREATE POLICY "Admins can view all pets" ON pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Doctors can view pets for their appointments
CREATE POLICY "Doctors can view assigned pets" ON pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vaccinations
      WHERE vaccinations.pet_id = pets.id
      AND vaccinations.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM treatments
      WHERE treatments.pet_id = pets.id
      AND treatments.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.pet_id = pets.id
      AND consultations.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    )
  );

-- ============================================
-- VACCINATION SCHEDULES POLICIES
-- ============================================

-- Public can view active schedules
CREATE POLICY "Public can view vaccination schedules" ON vaccination_schedules
  FOR SELECT USING (
    is_active = true
  );

-- Doctors can manage their own schedules
CREATE POLICY "Doctors can manage own vaccination schedules" ON vaccination_schedules
  FOR ALL USING (
    auth.uid() = (
      SELECT user_id FROM doctors WHERE doctors.id = doctor_id
    )
  ) WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM doctors WHERE doctors.id = doctor_id
    )
  );

-- Admins can manage all schedules
CREATE POLICY "Admins can manage all vaccination schedules" ON vaccination_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- VACCINATIONS POLICIES
-- ============================================

-- Users can manage their own vaccinations
CREATE POLICY "Users can manage own vaccinations" ON vaccinations
  FOR ALL USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- Users can view their pet's vaccination via pets (cascade)

-- Doctors can view vaccinations assigned to them
CREATE POLICY "Doctors can view assigned vaccinations" ON vaccinations
  FOR SELECT USING (
    doctor_id = (
      SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
    )
  );

-- Admins can manage all vaccinations
CREATE POLICY "Admins can manage all vaccinations" ON vaccinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- TREATMENT SCHEDULES POLICIES
-- ============================================

CREATE POLICY "Public can view treatment schedules" ON treatment_schedules
  FOR SELECT USING (
    is_active = true
  );

CREATE POLICY "Doctors can manage own treatment schedules" ON treatment_schedules
  FOR ALL USING (
    auth.uid() = (
      SELECT user_id FROM doctors WHERE doctors.id = doctor_id
    )
  ) WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM doctors WHERE doctors.id = doctor_id
    )
  );

CREATE POLICY "Admins can manage all treatment schedules" ON treatment_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- TREATMENTS POLICIES
-- ============================================

-- Users can manage their own treatments
CREATE POLICY "Users can manage own treatments" ON treatments
  FOR ALL USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- Doctors can view treatments assigned to them
CREATE POLICY "Doctors can view assigned treatments" ON treatments
  FOR SELECT USING (
    doctor_id = (
      SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
    )
  );

-- Doctors can update treatment status and add notes
CREATE POLICY "Doctors can update assigned treatments" ON treatments
  FOR UPDATE USING (
    doctor_id = (
      SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
    )
  ) WITH CHECK (
    doctor_id = (
      SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
    )
  );

-- Admins can manage all treatments
CREATE POLICY "Admins can manage all treatments" ON treatments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- CONSULTATION SCHEDULES POLICIES
-- ============================================

CREATE POLICY "Public can view consultation schedules" ON consultation_schedules
  FOR SELECT USING (
    is_active = true
  );

CREATE POLICY "Doctors can manage own consultation schedules" ON consultation_schedules
  FOR ALL USING (
    auth.uid() = (
      SELECT user_id FROM doctors WHERE doctors.id = doctor_id
    )
  ) WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM doctors WHERE doctors.id = doctor_id
    )
  );

CREATE POLICY "Admins can manage all consultation schedules" ON consultation_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- CONSULTATIONS POLICIES
-- ============================================

-- Users can manage their own consultations
CREATE POLICY "Users can manage own consultations" ON consultations
  FOR ALL USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- Doctors can view consultations assigned to them
CREATE POLICY "Doctors can view assigned consultations" ON consultations
  FOR SELECT USING (
    doctor_id = (
      SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
    )
  );

-- Doctors can update consultations assigned to them
CREATE POLICY "Doctors can update assigned consultations" ON consultations
  FOR UPDATE USING (
    doctor_id = (
      SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
    )
  ) WITH CHECK (
    doctor_id = (
      SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
    )
  );

-- Admins can manage all consultations
CREATE POLICY "Admins can manage all consultations" ON consultations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- MEDICAL RECORDS POLICIES
-- ============================================

-- Users can view medical records for their pets
CREATE POLICY "Users can view own pet medical records" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = medical_records.pet_id
      AND pets.user_id = auth.uid()
    )
  );

-- Doctors can view medical records for their patients
CREATE POLICY "Doctors can view patient medical records" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vaccinations
      WHERE vaccinations.pet_id = medical_records.pet_id
      AND vaccinations.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM treatments
      WHERE treatments.pet_id = medical_records.pet_id
      AND treatments.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.pet_id = medical_records.pet_id
      AND consultations.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    )
  );

-- Admins can manage all medical records
CREATE POLICY "Admins can manage medical records" ON medical_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Doctors can insert medical records for their patients
CREATE POLICY "Doctors can insert medical records" ON medical_records
  FOR INSERT WITH CHECK (
    doctor_id = (
      SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM vaccinations
      WHERE vaccinations.pet_id = medical_records.pet_id
      AND vaccinations.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM treatments
      WHERE treatments.pet_id = medical_records.pet_id
      AND treatments.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.pet_id = medical_records.pet_id
      AND consultations.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    )
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can manage their own notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- System can insert notifications for users (via service role)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    true -- Allow service role to insert
  );

-- Admins can view all notifications (for monitoring)
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PET DOCUMENTS POLICIES
-- ============================================

-- Users can manage their pet documents
CREATE POLICY "Users can manage pet documents" ON pet_documents
  FOR ALL USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );

-- Doctors can view pet documents for their appointments
CREATE POLICY "Doctors can view pet documents" ON pet_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vaccinations
      WHERE vaccinations.pet_id = pet_documents.pet_id
      AND vaccinations.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM treatments
      WHERE treatments.pet_id = pet_documents.pet_id
      AND treatments.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    ) OR EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.pet_id = pet_documents.pet_id
      AND consultations.doctor_id = (
        SELECT id FROM doctors WHERE doctors.user_id = auth.uid()
      )
    )
  );

-- Admins can view all pet documents
CREATE POLICY "Admins can view all pet documents" ON pet_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS FOR QR CODE AND TICKET GENERATION
-- ============================================

-- Function to generate unique QR code for vaccination
CREATE OR REPLACE FUNCTION generate_vaccination_qr_code(vaccination_id UUID)
RETURNS VARCHAR(200)
LANGUAGE plpgsql
AS $$
DECLARE
  qr_code VARCHAR(200);
BEGIN
  -- Generate QR code: VAX-{timestamp}-{random}
  qr_code := 'VAX-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' ||
             SUBSTRING(MD5(RANDOM()::TEXT), 1, 8);
  UPDATE vaccinations
  SET qr_code = qr_code
  WHERE id = vaccination_id;
  RETURN qr_code;
END;
$$;

-- Function to generate unique ticket ID for vaccination
CREATE OR REPLACE FUNCTION generate_vaccination_ticket(vaccination_id UUID)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
  ticket_id VARCHAR(100);
BEGIN
  -- Generate ticket: VAX-{year}-{sequential}
  ticket_id := 'VAX-' || EXTRACT(YEAR FROM NOW()) || '-' ||
               LPAD(
                 (SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_id FROM 14) AS INTEGER)), 0) + 1
                  FROM vaccinations
                  WHERE ticket_id LIKE 'VAX-' || EXTRACT(YEAR FROM NOW()) || '%'),
                 6, '0'
               );
  UPDATE vaccinations
  SET ticket_id = ticket_id
  WHERE id = vaccination_id;
  RETURN ticket_id;
END;
$$;

-- Trigger to auto-generate QR code and ticket ID on vaccination insert
CREATE OR REPLACE FUNCTION set_vaccination_codes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := generate_vaccination_qr_code(NEW.id);
  END IF;
  IF NEW.ticket_id IS NULL THEN
    NEW.ticket_id := generate_vaccination_ticket(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vaccination_codes_trigger
  BEFORE INSERT ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION set_vaccination_codes();

-- ============================================
-- FUNCTION TO UPDATE SCHEDULE COUNTS
-- ============================================

CREATE OR REPLACE FUNCTION update_vaccination_schedule_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE vaccination_schedules
    SET current_patients = current_patients + 1
    WHERE id = NEW.schedule_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE vaccination_schedules
    SET current_patients = current_patients - 1
    WHERE id = OLD.schedule_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vaccination_schedule_count_trigger
  AFTER INSERT OR DELETE ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION update_vaccination_schedule_count();

-- Similar for treatment schedules
CREATE OR REPLACE FUNCTION update_treatment_schedule_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE treatment_schedules
    SET current_patients = current_patients + 1
    WHERE id = NEW.schedule_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE treatment_schedules
    SET current_patients = current_patients - 1
    WHERE id = OLD.schedule_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_treatment_schedule_count_trigger
  AFTER INSERT OR DELETE ON treatments
  FOR EACH ROW
  EXECUTE FUNCTION update_treatment_schedule_count();

-- Similar for consultation schedules
CREATE OR REPLACE FUNCTION update_consultation_schedule_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE consultation_schedules
    SET current_patients = current_patients + 1
    WHERE id = NEW.schedule_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE consultation_schedules
    SET current_patients = current_patients - 1
    WHERE id = OLD.schedule_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultation_schedule_count_trigger
  AFTER INSERT OR DELETE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_schedule_count();

-- ============================================
-- VIEWS FOR DASHBOARD
-- ============================================

-- Daily statistics view for admin
CREATE OR REPLACE VIEW daily_statistics AS
SELECT
  DATE(NOW()) as date,
  COUNT(DISTINCT CASE WHEN status = 'pending' THEN id END) as pending_vaccinations,
  COUNT(DISTINCT CASE WHEN status = 'confirmed' THEN id END) as confirmed_vaccinations,
  COUNT(DISTINCT CASE WHEN status = 'completed' THEN id END) as completed_vaccinations,
  COUNT(DISTINCT CASE WHEN status IN ('pending', 'confirmed', 'in_progress') AND created_at >= NOW() - INTERVAL '24 hours' THEN id END) as new_treatments_24h,
  COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN id END) as new_consultations_24h
FROM (
  SELECT id, status, created_at FROM vaccinations
  UNION ALL
  SELECT id, status, created_at FROM treatments
  UNION ALL
  SELECT id, status, created_at FROM consultations
) as combined_data;

-- Monthly report view
CREATE OR REPLACE VIEW monthly_reports AS
SELECT
  EXTRACT(YEAR FROM created_at) as year,
  EXTRACT(MONTH FROM created_at) as month,
  COUNT(DISTINCT CASE WHEN 'vaccination' = 'vaccination' THEN id END) as total_vaccinations,
  COUNT(DISTINCT CASE WHEN 'treatment' = 'treatment' THEN id END) as total_treatments,
  COUNT(DISTINCT CASE WHEN 'consultation' = 'consultation' THEN id END) as total_consultations
FROM (
  SELECT id, 'vaccination' as type, created_at FROM vaccinations
  UNION ALL
  SELECT id, 'treatment' as type, created_at FROM treatments
  UNION ALL
  SELECT id, 'consultation' as type, created_at FROM consultations
) as combined_data
GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
ORDER BY year DESC, month DESC;

-- ============================================
-- STORAGE BUCKET SETUP (via Supabase MCP) will be done separately
-- ============================================

COMMENT ON TABLE doctors IS 'Dokter hewan yang memberikan layanan';
COMMENT ON TABLE pets IS 'Data hewan peliharaan pemilik';
COMMENT ON TABLE vaccinations IS 'Vaksinasi rabies dengan sistem booking';
COMMENT ON TABLE treatments IS 'Pengobatan hewan dengan booking dokter';
COMMENT ON TABLE consultations IS 'Konsultasi online dan offline';
COMMENT ON TABLE medical_records IS 'Riwayat medis lengkap hewan';
COMMENT ON TABLE notifications IS 'Notifikasi untuk user dan admin';
