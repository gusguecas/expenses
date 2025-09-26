-- Sistema de Permisos por Usuario-Empresa
-- Migración para control granular de accesos CFO/Socios/Empleados

-- Tabla de permisos por usuario-empresa
CREATE TABLE IF NOT EXISTS user_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  
  -- Permisos específicos
  can_view_all BOOLEAN NOT NULL DEFAULT FALSE,     -- Socios/CFO ven todos los gastos
  can_create BOOLEAN NOT NULL DEFAULT TRUE,        -- Puede crear gastos en esta empresa
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,      -- Solo CFO puede autorizar/rechazar
  can_manage_users BOOLEAN NOT NULL DEFAULT FALSE, -- Solo CFO gestiona usuarios
  
  -- Auditoría
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE(user_id, company_id)
);

-- Actualizar roles en tabla users para ser más específicos
-- Agregar nuevos roles: cfo, partner, employee
-- (Manteniendo compatibilidad con roles existentes)

-- Índices para optimizar consultas de permisos
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_company ON user_permissions(company_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_view_all ON user_permissions(can_view_all);
CREATE INDEX IF NOT EXISTS idx_user_permissions_approve ON user_permissions(can_approve);

-- Agregar campo para identificar al CFO principal
ALTER TABLE users ADD COLUMN is_cfo BOOLEAN DEFAULT FALSE;

-- Tabla de sesiones de usuario para autenticación
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);