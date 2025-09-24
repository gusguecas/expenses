-- CFDI Validations table for Mexican companies
CREATE TABLE IF NOT EXISTS cfdi_validations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  expense_id INTEGER, -- Optional: link to specific expense
  
  -- CFDI Data
  uuid TEXT NOT NULL,
  rfc_emisor TEXT NOT NULL,
  rfc_receptor TEXT NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  fecha_emision DATETIME,
  serie TEXT,
  folio TEXT,
  
  -- Validation Results
  is_valid BOOLEAN NOT NULL DEFAULT FALSE,
  validation_details TEXT,
  validation_source TEXT DEFAULT 'manual', -- 'manual', 'xml', 'pdf'
  
  -- Metadata
  validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  validated_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL,
  FOREIGN KEY (validated_by) REFERENCES users(id),
  UNIQUE(uuid, company_id)
);

-- Index for CFDI validations
CREATE INDEX IF NOT EXISTS idx_cfdi_validations_company ON cfdi_validations(company_id);
CREATE INDEX IF NOT EXISTS idx_cfdi_validations_uuid ON cfdi_validations(uuid);
CREATE INDEX IF NOT EXISTS idx_cfdi_validations_valid ON cfdi_validations(is_valid);