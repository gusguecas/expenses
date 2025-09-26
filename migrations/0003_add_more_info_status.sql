-- Agregar estatus 'more_info' a la tabla expenses
-- Migración para permitir el estatus "Pedir Más Información"

-- SQLite no permite modificar CHECK constraints directamente
-- Necesitamos recrear la tabla con el nuevo constraint

-- Paso 1: Crear tabla temporal con el nuevo constraint
CREATE TABLE IF NOT EXISTS expenses_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  expense_type_id INTEGER NOT NULL,
  
  -- Información básica
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  
  -- Información financiera (multimoneda)
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('MXN', 'EUR', 'USD')),
  exchange_rate DECIMAL(10,6) NOT NULL DEFAULT 1.0,
  amount_mxn DECIMAL(12,2) NOT NULL, -- Siempre convertido a MXN para reportes
  
  -- Detalles del gasto
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'company_card', 'petty_cash')),
  vendor TEXT,
  invoice_number TEXT,
  
  -- Estado y aprobaciones (ACTUALIZADO CON 'more_info')
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'more_info', 'reimbursed', 'invoiced')),
  approved_by INTEGER,
  approved_at DATETIME,
  
  -- Metadatos
  notes TEXT,
  tags TEXT, -- JSON array como string
  is_billable BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Auditoría
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (expense_type_id) REFERENCES expense_types(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Paso 2: Copiar todos los datos existentes
INSERT INTO expenses_new SELECT * FROM expenses;

-- Paso 3: Eliminar tabla original
DROP TABLE expenses;

-- Paso 4: Renombrar tabla nueva
ALTER TABLE expenses_new RENAME TO expenses;

-- Paso 5: Recrear índices
CREATE INDEX IF NOT EXISTS idx_expenses_company_date ON expenses(company_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);  
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency);