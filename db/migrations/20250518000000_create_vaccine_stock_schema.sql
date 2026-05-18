-- ============================================
-- VACCINE STOCK MANAGEMENT SCHEMA
-- Manajemen Stok Vaksin
-- ============================================

-- ============================================
-- 1. VACCINE TYPES TABLE (Jenis Vaksin)
-- ============================================
CREATE TABLE IF NOT EXISTS vaccine_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  manufacturer VARCHAR(150) NOT NULL,
  description TEXT,
  target_species VARCHAR(200), -- e.g., 'Anjing', 'Kucing', 'Sapi', 'Semua'
  dosage_quantity INTEGER DEFAULT 1, -- doses per vial
  dosage_unit VARCHAR(50) DEFAULT 'vial', -- vial, bottle, unit
  min_stock_threshold INTEGER DEFAULT 10, -- alert when below this
  storage_temperature VARCHAR(100), -- e.g., '2-8°C', '-20°C'
  shelf_life_months INTEGER, -- shelf life in months
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. VACCINE BATCHES TABLE (Batch Vaksin)
-- ============================================
CREATE TABLE IF NOT EXISTS vaccine_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vaccine_type_id UUID NOT NULL REFERENCES vaccine_types(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  manufacture_date DATE,
  expiry_date DATE NOT NULL,
  initial_quantity INTEGER NOT NULL, -- total doses
  available_quantity INTEGER NOT NULL, -- remaining doses
  reserved_quantity INTEGER DEFAULT 0, -- reserved for upcoming appointments
  unit_cost DECIMAL(12,2), -- cost per dose
  supplier VARCHAR(200),
  supplier_invoice VARCHAR(100),
  received_date DATE,
  storage_location VARCHAR(100),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (
    status IN ('active', 'low_stock', 'expired', 'depleted', 'quarantined')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vaccine_type_id, batch_number)
);

-- ============================================
-- 3. VACCINE STOCK TRANSACTIONS TABLE (Transaksi Stok)
-- ============================================
CREATE TABLE IF NOT EXISTS vaccine_stock_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES vaccine_batches(id) ON DELETE CASCADE,
  vaccination_id UUID REFERENCES vaccinations(id) ON DELETE SET NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (
    transaction_type IN ('incoming', 'outgoing', 'adjustment', 'reservation', 'release')
  ),
  quantity INTEGER NOT NULL, -- positive for incoming, negative for outgoing
  unit_cost DECIMAL(12,2), -- cost at time of transaction
  total_cost DECIMAL(12,2), -- quantity * unit_cost
  notes TEXT,
  created_by UUID REFERENCES profiles(id), -- admin who performed transaction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. VACCINE STOCK ALERTS TABLE (Peringatan Stok)
-- ============================================
CREATE TABLE IF NOT EXISTS vaccine_stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vaccine_type_id UUID NOT NULL REFERENCES vaccine_types(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES vaccine_batches(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (
    alert_type IN ('low_stock', 'expired_soon', 'expired', 'depleted', 'near_expiry')
  ),
  threshold_value INTEGER, -- threshold that triggered alert
  current_value INTEGER, -- current quantity
  expiry_date DATE,
  message TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Vaccine types indexes
CREATE INDEX IF NOT EXISTS idx_vaccine_types_active ON vaccine_types(is_active);
CREATE INDEX IF NOT EXISTS idx_vaccine_types_name ON vaccine_types(name);

-- Vaccine batches indexes
CREATE INDEX IF NOT EXISTS idx_vaccine_batches_type ON vaccine_batches(vaccine_type_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_batches_expiry ON vaccine_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_vaccine_batches_status ON vaccine_batches(status);
CREATE INDEX IF NOT EXISTS idx_vaccine_batches_available ON vaccine_batches(available_quantity);
CREATE INDEX IF NOT EXISTS idx_vaccine_batches_batch_number ON vaccine_batches(batch_number);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_stock_transactions_batch ON vaccine_stock_transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON vaccine_stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON vaccine_stock_transactions(created_at);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_stock_alerts_type ON vaccine_stock_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_resolved ON vaccine_stock_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_vaccine_type ON vaccine_stock_alerts(vaccine_type_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_vaccine_types_updated_at BEFORE UPDATE ON vaccine_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccine_batches_updated_at BEFORE UPDATE ON vaccine_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE vaccine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Vaccine types policies
CREATE POLICY "Public can view active vaccine types" ON vaccine_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage vaccine types" ON vaccine_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Vaccine batches policies
CREATE POLICY "Healthcare staff can view all vaccine batches" ON vaccine_batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'doctor')
    )
    OR
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can manage vaccine batches" ON vaccine_batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Stock transactions policies
CREATE POLICY "Staff can view stock transactions" ON vaccine_stock_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Admins can manage stock transactions" ON vaccine_stock_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Alerts policies
CREATE POLICY "Staff can view all alerts" ON vaccine_stock_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Admins can manage alerts" ON vaccine_stock_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS FOR STOCK MANAGEMENT
-- ============================================

-- Function to update batch status based on available quantity
CREATE OR REPLACE FUNCTION update_batch_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.available_quantity <= 0 THEN
    NEW.status := 'depleted';
  ELSIF NEW.available_quantity < NEW.min_stock_threshold OR NEW.available_quantity < (
    SELECT min_stock_threshold FROM vaccine_types WHERE id = NEW.vaccine_type_id
  ) THEN
    NEW.status := 'low_stock';
  ELSIF NEW.expiry_date <= NOW()::DATE THEN
    NEW.status := 'expired';
  ELSE
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update batch status
CREATE TRIGGER check_batch_status
  BEFORE INSERT OR UPDATE ON vaccine_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_status();

-- Function to decrease available quantity when vaccination is completed
CREATE OR REPLACE FUNCTION decrease_vaccine_stock()
RETURNS TRIGGER AS $$
DECLARE
  batch_record RECORD;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Find the batch used for this vaccination
    IF NEW.batch_id IS NOT NULL THEN
      UPDATE vaccine_batches
      SET available_quantity = available_quantity - 1,
          reserved_quantity = GREATEST(reserved_quantity - 1, 0)
      WHERE id = NEW.batch_id;
      
      -- Insert transaction record
      INSERT INTO vaccine_stock_transactions (
        batch_id, vaccination_id, transaction_type, quantity, unit_cost
      ) VALUES (
        NEW.batch_id, NEW.id, 'outgoing', -1,
        (SELECT unit_cost FROM vaccine_batches WHERE id = NEW.batch_id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to decrease stock on vaccination completion
CREATE TRIGGER release_vaccine_stock
  AFTER UPDATE ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION decrease_vaccine_stock();

-- ============================================
-- VIEWS FOR DASHBOARD
-- ============================================

-- Current stock summary view
CREATE OR REPLACE VIEW vaccine_stock_summary AS
SELECT
  vt.id as vaccine_type_id,
  vt.name as vaccine_name,
  vt.target_species,
  vt.min_stock_threshold,
  COALESCE(SUM(CASE WHEN vb.status = 'active' THEN vb.available_quantity ELSE 0 END), 0) as total_available,
  COALESCE(SUM(CASE WHEN vb.status = 'active' THEN vb.reserved_quantity ELSE 0 END), 0) as total_reserved,
  COUNT(DISTINCT vb.id) as active_batches,
  MIN(vb.expiry_date) as earliest_expiry,
  CASE
    WHEN COALESCE(SUM(CASE WHEN vb.status = 'active' THEN vb.available_quantity ELSE 0 END), 0) < vt.min_stock_threshold
    THEN 'low'
    ELSE 'normal'
  END as stock_status
FROM vaccine_types vt
LEFT JOIN vaccine_batches vb ON vt.id = vb.vaccine_type_id
WHERE vt.is_active = true
GROUP BY vt.id, vt.name, vt.target_species, vt.min_stock_threshold;

-- Expiry alert view
CREATE OR REPLACE VIEW vaccine_expiry_alerts AS
SELECT
  vb.id as batch_id,
  vt.name as vaccine_name,
  vb.batch_number,
  vb.expiry_date,
  vb.available_quantity,
  vt.min_stock_threshold,
  CASE
    WHEN vb.expiry_date <= NOW()::DATE THEN 'expired'
    WHEN vb.expiry_date <= NOW()::DATE + INTERVAL '30 days' THEN 'expiring_soon'
    ELSE 'ok'
  END as expiry_status
FROM vaccine_batches vb
JOIN vaccine_types vt ON vb.vaccine_type_id = vt.id
WHERE vb.status IN ('active', 'low_stock')
  AND vb.expiry_date <= NOW()::DATE + INTERVAL '90 days'
ORDER BY vb.expiry_date ASC;

COMMENT ON TABLE vaccine_types IS 'Jenis vaksin yang tersedia';
COMMENT ON TABLE vaccine_batches IS 'Batch vaksin dengan nomor dan tanggal kadaluarsa';
COMMENT ON TABLE vaccine_stock_transactions IS 'Riwayat transaksi masuk/keluar stok vaksin';
COMMENT ON TABLE vaccine_stock_alerts IS 'Peringatan stok vaksin menipis atau kadaluarsa';