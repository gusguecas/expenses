import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

// Types for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  ATTACHMENTS: R2Bucket;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', logger())
app.use('/api/*', cors())
app.use(renderer)

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ===== AUTHENTICATION UTILITIES =====

// Generate UUID function compatible with Cloudflare Workers
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Simple JWT implementation for Cloudflare Workers
async function createJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${message}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret: string): Promise<any> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signature = Uint8Array.from(atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  const isValid = await crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(message));
  
  if (!isValid) throw new Error('Invalid signature');
  
  return JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
}

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'LYRA_SALT_2024'); // Simple salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const newHash = await hashPassword(password);
    return newHash === hashedPassword;
  } catch (error) {
    return false;
  }
}

// Authentication middleware with permissions
async function authenticateUser(c: any): Promise<any> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const JWT_SECRET = 'lyra-jwt-secret-key-2024'; // In production, use env variable
  
  try {
    const payload = await verifyJWT(token, JWT_SECRET);
    
    // Verify session in database
    const { env } = c;
    const session = await env.DB.prepare(`
      SELECT s.*, u.id, u.name, u.email, u.is_cfo, u.created_at
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > datetime('now')
    `).bind(payload.sessionId).first();
    
    if (!session) {
      return null;
    }
    
    // Load user permissions
    const permissions = await env.DB.prepare(`
      SELECT p.*, c.name as company_name, c.country, c.primary_currency
      FROM user_permissions p
      JOIN companies c ON p.company_id = c.id
      WHERE p.user_id = ? AND c.active = 1
    `).bind(session.id).all();
    
    return {
      id: session.id,
      name: session.name,
      email: session.email,
      is_cfo: session.is_cfo,
      sessionId: session.sessionId,
      created_at: session.created_at,
      permissions: permissions.results || []
    };
  } catch (error) {
    return null;
  }
}

// Permission checking functions
function hasCompanyAccess(user: any, companyId: number): boolean {
  // CFO always has access to all companies
  if (user.is_cfo) return true;
  
  // Check if user has specific company permissions
  return user.permissions.some((perm: any) => 
    perm.company_id === companyId && perm.can_view_all
  );
}

function canCreateInCompany(user: any, companyId: number): boolean {
  if (user.is_cfo) return true;
  
  return user.permissions.some((perm: any) => 
    perm.company_id === companyId && perm.can_create
  );
}

function canApproveInCompany(user: any, companyId: number): boolean {
  if (user.is_cfo) return true;
  
  return user.permissions.some((perm: any) => 
    perm.company_id === companyId && perm.can_approve
  );
}

function canManageUsers(user: any, companyId?: number): boolean {
  if (user.is_cfo) return true;
  
  if (!companyId) {
    // Global user management - only CFO
    return false;
  }
  
  return user.permissions.some((perm: any) => 
    perm.company_id === companyId && perm.can_manage_users
  );
}

function getUserAccessibleCompanies(user: any): number[] {
  if (user.is_cfo) {
    // CFO has access to all companies - we'll need to fetch all active company IDs
    return []; // Will be handled separately for CFO
  }
  
  return user.permissions
    .filter((perm: any) => perm.can_view_all)
    .map((perm: any) => perm.company_id);
}

// Enhanced permission middleware for different access levels
async function requirePermission(level: 'read' | 'create' | 'approve' | 'manage', companyId?: number) {
  return async (c: any, next: () => Promise<void>) => {
    const user = await authenticateUser(c);
    
    if (!user) {
      return c.json({ error: 'No autorizado' }, 401);
    }
    
    // Check specific permission level
    switch (level) {
      case 'read':
        if (companyId && !hasCompanyAccess(user, companyId)) {
          return c.json({ error: 'No tienes acceso a esta empresa' }, 403);
        }
        break;
        
      case 'create':
        if (companyId && !canCreateInCompany(user, companyId)) {
          return c.json({ error: 'No tienes permisos para crear en esta empresa' }, 403);
        }
        break;
        
      case 'approve':
        if (companyId && !canApproveInCompany(user, companyId)) {
          return c.json({ error: 'No tienes permisos para aprobar en esta empresa' }, 403);
        }
        break;
        
      case 'manage':
        if (!canManageUsers(user, companyId)) {
          return c.json({ error: 'No tienes permisos para gestionar usuarios' }, 403);
        }
        break;
    }
    
    // Add user to context
    c.set('user', user);
    await next();
  };
}

// ===== API ROUTES =====

// Authentication routes
app.post('/api/auth/register', async (c) => {
  const { env } = c;
  
  try {
    const { name, email, password } = await c.req.json();
    
    if (!name || !email || !password) {
      return c.json({ error: 'Todos los campos son requeridos' }, 400);
    }
    
    if (password.length < 6) {
      return c.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400);
    }
    
    // Check if user already exists
    const existingUser = await env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first();
    
    if (existingUser) {
      return c.json({ error: 'Este correo ya está registrado' }, 400);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Check if this is the first user (will be CFO)
    const userCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM users`).first();
    const isCFO = userCount.count === 0;
    
    // Create user
    const result = await env.DB.prepare(`
      INSERT INTO users (name, email, password_hash, is_cfo, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(name, email, hashedPassword, isCFO ? 1 : 0).run();
    
    const userId = result.meta.last_row_id;
    
    // Create session
    const sessionId = generateUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    
    await env.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(sessionId, userId, expiresAt).run();
    
    // Create JWT token
    const JWT_SECRET = 'lyra-jwt-secret-key-2024';
    const token = await createJWT({ sessionId }, JWT_SECRET);
    
    return c.json({
      token,
      user: {
        id: userId,
        name,
        email,
        is_cfo: isCFO
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
})

app.post('/api/auth/login', async (c) => {
  const { env } = c;
  const { email, password } = await c.req.json();
  
  if (!email || !password) {
    return c.json({ error: 'Email y contraseña son requeridos' }, 400);
  }
  
  try {
    // Find user by email
    const user = await env.DB.prepare(`
      SELECT id, name, email, password_hash, is_cfo, created_at
      FROM users WHERE email = ?
    `).bind(email).first();
    
    if (!user) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }
    
    // Create new session
    const sessionId = generateUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    
    await env.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(sessionId, user.id, expiresAt).run();
    
    // Create JWT token
    const JWT_SECRET = 'lyra-jwt-secret-key-2024';
    const token = await createJWT({ sessionId }, JWT_SECRET);
    
    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_cfo: user.is_cfo
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
})

app.post('/api/auth/verify', async (c) => {
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'Token inválido o expirado' }, 401);
  }
  
  return c.json({ user });
})

app.post('/api/auth/logout', async (c) => {
  const user = await authenticateUser(c);
  
  if (user) {
    const { env } = c;
    // Delete session
    await env.DB.prepare(`
      DELETE FROM user_sessions WHERE id = ?
    `).bind(user.sessionId).run();
  }
  
  return c.json({ success: true });
})

// Check if user needs setup
app.get('/api/user/needs-setup', async (c) => {
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  try {
    const { env } = c;
    
    // Check if user has any permissions configured
    const permissions = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_permissions WHERE user_id = ?
    `).bind(user.id).first();
    
    const needsSetup = permissions.count === 0;
    
    return c.json({ needsSetup, user });
    
  } catch (error) {
    console.error('Check setup error:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
})

// Get current user permissions - useful for frontend
app.get('/api/user/permissions', async (c) => {
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  try {
    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_cfo: user.is_cfo
      },
      permissions: user.permissions,
      capabilities: {
        can_view_all_expenses: user.is_cfo || user.permissions.some((p: any) => p.can_view_all),
        can_create_expenses: user.is_cfo || user.permissions.some((p: any) => p.can_create),
        can_approve_expenses: user.is_cfo || user.permissions.some((p: any) => p.can_approve),
        can_manage_users: user.is_cfo || user.permissions.some((p: any) => p.can_manage_users),
        accessible_companies: user.is_cfo ? 'all' : user.permissions.map((p: any) => p.company_id)
      }
    });
    
  } catch (error) {
    console.error('User permissions error:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
})

// User setup permissions endpoint
app.post('/api/user/setup-permissions', async (c) => {
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  try {
    const { env } = c;
    const { permissions } = await c.req.json();
    
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return c.json({ error: 'Debe especificar al menos una empresa' }, 400);
    }
    
    // Delete existing permissions for this user
    await env.DB.prepare(`
      DELETE FROM user_permissions WHERE user_id = ?
    `).bind(user.id).run();
    
    // Insert new permissions
    for (const perm of permissions) {
      await env.DB.prepare(`
        INSERT INTO user_permissions (user_id, company_id, can_view_all, can_create, can_approve, can_manage_users, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        user.id,
        perm.company_id,
        perm.can_view_all ? 1 : 0,
        perm.can_create ? 1 : 0,
        perm.can_approve ? 1 : 0,
        perm.can_manage_users ? 1 : 0
      ).run();
    }
    
    return c.json({ success: true, message: 'Permisos configurados exitosamente' });
    
  } catch (error) {
    console.error('Setup permissions error:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
})

// Health check
app.get('/api/health', async (c) => {
  const { env } = c;
  
  // Test database connection
  try {
    const result = await env.DB.prepare('SELECT 1 as test').first();
    return c.json({ 
      status: 'healthy', 
      database: 'connected',
      environment: env.ENVIRONMENT || 'development',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return c.json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    }, 500);
  }
})

// Initialize database with test data (development only)
app.post('/api/init-db', async (c) => {
  const { env } = c;
  
  if (env.ENVIRONMENT === 'production') {
    return c.json({ error: 'Not available in production' }, 403);
  }
  
  try {
    // Create tables one by one
    const tables = [
      `CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        -- Información Básica
        name TEXT NOT NULL,
        commercial_name TEXT,
        razon_social TEXT,
        country TEXT NOT NULL CHECK (country IN ('MX', 'ES', 'US', 'CA')), 
        tax_id TEXT,
        primary_currency TEXT NOT NULL DEFAULT 'MXN' CHECK (primary_currency IN ('MXN', 'EUR', 'USD', 'CAD')),
        employees_count INTEGER,
        
        -- Información Comercial
        business_category TEXT,
        website TEXT,
        business_description TEXT,
        
        -- Dirección Fiscal
        address_street TEXT,
        address_city TEXT,
        address_state TEXT,
        address_postal TEXT,
        phone TEXT,
        
        -- Branding Corporativo
        logo_url TEXT,
        brand_color TEXT DEFAULT '#D4AF37',
        
        -- Sistema
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Legacy field for backward compatibility
        address TEXT
      )`,
      
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer', 'editor', 'advanced', 'admin')),
        is_cfo BOOLEAN NOT NULL DEFAULT FALSE,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        can_view BOOLEAN NOT NULL DEFAULT TRUE,
        can_edit BOOLEAN NOT NULL DEFAULT FALSE,
        can_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, company_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS expense_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('travel', 'meals', 'transport', 'accommodation', 'supplies', 'services', 'general')),
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        expense_type_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        expense_date DATE NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency TEXT NOT NULL CHECK (currency IN ('MXN', 'EUR', 'USD')),
        exchange_rate DECIMAL(10,6) NOT NULL DEFAULT 1.0,
        amount_mxn DECIMAL(12,2) NOT NULL,
        payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'company_card', 'petty_cash')),
        vendor TEXT,
        invoice_number TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'more_info', 'reimbursed', 'invoiced')),
        approved_by INTEGER,
        approved_at DATETIME,
        notes TEXT,
        tags TEXT,
        is_billable BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER NOT NULL,
        updated_by INTEGER
      )`,
      
      `CREATE TABLE IF NOT EXISTS attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf', 'xml')),
        file_url TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        ocr_text TEXT,
        ocr_confidence DECIMAL(3,2),
        is_cfdi_valid BOOLEAN,
        cfdi_uuid TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        uploaded_by INTEGER NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS exchange_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_currency TEXT NOT NULL CHECK (from_currency IN ('MXN', 'EUR', 'USD')),
        to_currency TEXT NOT NULL CHECK (to_currency IN ('MXN', 'EUR', 'USD')),
        rate DECIMAL(10,6) NOT NULL,
        rate_date DATE NOT NULL,
        source TEXT NOT NULL DEFAULT 'banxico',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_currency, to_currency, rate_date)
      )`,
      
      `CREATE TABLE IF NOT EXISTS cfdi_validations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        expense_id INTEGER,
        uuid TEXT NOT NULL,
        rfc_emisor TEXT NOT NULL,
        rfc_receptor TEXT NOT NULL,
        total DECIMAL(12,2) NOT NULL,
        fecha_emision DATETIME,
        serie TEXT,
        folio TEXT,
        is_valid BOOLEAN NOT NULL DEFAULT FALSE,
        validation_details TEXT,
        validation_source TEXT DEFAULT 'manual',
        validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        validated_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(uuid, company_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        rfc TEXT,
        birthdate DATE,
        address TEXT,
        company_id INTEGER NOT NULL,
        position TEXT NOT NULL,
        department TEXT NOT NULL CHECK (department IN ('it', 'sales', 'hr', 'finance', 'operations', 'management')),
        employee_number TEXT,
        hire_date DATE,
        manager_id INTEGER,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (manager_id) REFERENCES employees(id)
      )`
    ];

    // Create tables
    for (const table of tables) {
      await env.DB.prepare(table).run();
    }

    // Insert test data
    await env.DB.prepare(`
      INSERT OR IGNORE INTO companies (id, name, country, primary_currency, tax_id, active) VALUES 
        (1, 'TechMX Solutions', 'MX', 'MXN', 'TMX123456789', TRUE),
        (2, 'Innovación Digital MX', 'MX', 'MXN', 'IDM987654321', TRUE),
        (3, 'Consultoría Estratégica MX', 'MX', 'MXN', 'CEM555666777', TRUE),
        (4, 'TechES Barcelona', 'ES', 'EUR', 'B-12345678', TRUE),
        (5, 'Innovación Madrid SL', 'ES', 'EUR', 'B-87654321', TRUE),
        (6, 'Digital Valencia S.A.', 'ES', 'EUR', 'A-11223344', TRUE)
    `).run();

    await env.DB.prepare(`
      INSERT OR IGNORE INTO expense_types (id, name, description, category, active) VALUES 
        (1, 'Comidas de Trabajo', 'Gastos en restaurantes por reuniones de trabajo', 'meals', TRUE),
        (2, 'Transporte Terrestre', 'Taxis, Uber, autobuses, metro', 'transport', TRUE),
        (3, 'Combustible', 'Gasolina y gastos de vehículos', 'transport', TRUE),
        (4, 'Hospedaje', 'Hoteles y alojamientos', 'accommodation', TRUE),
        (5, 'Vuelos', 'Boletos de avión nacionales e internacionales', 'travel', TRUE),
        (6, 'Material de Oficina', 'Papelería, suministros de oficina', 'supplies', TRUE),
        (7, 'Software y Licencias', 'Suscripciones y licencias de software', 'services', TRUE),
        (8, 'Capacitación', 'Cursos, conferencias, workshops', 'services', TRUE),
        (9, 'Marketing', 'Publicidad, eventos, promociones', 'services', TRUE),
        (10, 'Otros Gastos', 'Gastos diversos no categorizados', 'general', TRUE)
    `).run();

    // Hash passwords with the current hashPassword function
    const admin123Hash = await hashPassword('admin123');
    const partner123Hash = await hashPassword('partner123');
    const employee123Hash = await hashPassword('employee123');
    
    await env.DB.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, password_hash, role, active, is_cfo) VALUES 
        (1, 'admin@techmx.com', 'Alejandro Rodríguez', ?, 'admin', TRUE, FALSE),
        (2, 'maria.lopez@techmx.com', 'María López', ?, 'editor', TRUE, FALSE),
        (3, 'carlos.martinez@innovacion.mx', 'Carlos Martínez', ?, 'advanced', TRUE, FALSE),
        (4, 'ana.garcia@consultoria.mx', 'Ana García', ?, 'editor', TRUE, FALSE),
        (5, 'pedro.sanchez@techespana.es', 'Pedro Sánchez', ?, 'advanced', TRUE, FALSE),
        (6, 'elena.torres@madrid.es', 'Elena Torres', ?, 'editor', TRUE, FALSE),
        (7, 'gus@lyraexpenses.com', 'Gus', ?, 'admin', TRUE, TRUE),
        (8, 'maria@lyraexpenses.com', 'María Partner', ?, 'editor', TRUE, FALSE),
        (9, 'carlos@lyraexpenses.com', 'Carlos Employee', ?, 'viewer', TRUE, FALSE)
    `).bind(
      admin123Hash, partner123Hash, employee123Hash, admin123Hash, partner123Hash, employee123Hash,
      admin123Hash, partner123Hash, employee123Hash
    ).run();

    // Create user_permissions table if it doesn't exist
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        can_view_all BOOLEAN NOT NULL DEFAULT FALSE,
        can_create BOOLEAN NOT NULL DEFAULT FALSE,
        can_approve BOOLEAN NOT NULL DEFAULT FALSE,
        can_manage_users BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, company_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )
    `).run();

    await env.DB.prepare(`
      INSERT OR IGNORE INTO user_companies (user_id, company_id, can_view, can_edit, can_admin) VALUES 
        (1, 1, TRUE, TRUE, TRUE), (1, 2, TRUE, TRUE, TRUE), (1, 3, TRUE, TRUE, TRUE),
        (1, 4, TRUE, TRUE, TRUE), (1, 5, TRUE, TRUE, TRUE), (1, 6, TRUE, TRUE, TRUE),
        (2, 1, TRUE, TRUE, FALSE), (3, 2, TRUE, TRUE, FALSE), (4, 3, TRUE, TRUE, FALSE),
        (5, 4, TRUE, TRUE, FALSE), (6, 5, TRUE, TRUE, FALSE)
    `).run();

    // Insert permissions for new users from README
    await env.DB.prepare(`
      INSERT OR IGNORE INTO user_permissions (user_id, company_id, can_view_all, can_create, can_approve, can_manage_users) VALUES 
        -- Gus (CFO) - Control total de todas las empresas
        (7, 1, TRUE, TRUE, TRUE, TRUE), (7, 2, TRUE, TRUE, TRUE, TRUE), (7, 3, TRUE, TRUE, TRUE, TRUE),
        (7, 4, TRUE, TRUE, TRUE, TRUE), (7, 5, TRUE, TRUE, TRUE, TRUE), (7, 6, TRUE, TRUE, TRUE, TRUE),
        -- María (Partner) - LYRA México (crear gastos) + LYRA España (solo ver)
        (8, 1, TRUE, TRUE, FALSE, FALSE), (8, 4, TRUE, FALSE, FALSE, FALSE),
        -- Carlos (Employee) - Solo LYRA México (read-only)
        (9, 1, FALSE, FALSE, FALSE, FALSE)
    `).run();

    await env.DB.prepare(`
      INSERT OR IGNORE INTO employees (
        id, name, email, phone, rfc, birthdate, address,
        company_id, position, department, employee_number, hire_date, manager_id, active
      ) VALUES 
        (1, 'Alejandro Rodríguez', 'alejandro@techmx.com', '+52 555 123 4567', 'ROGA850101ABC', '1985-01-01', 'Av. Reforma 123, CDMX', 1, 'Director General', 'management', 'EMP001', '2020-01-15', NULL, TRUE),
        (2, 'María López García', 'maria.lopez@techmx.com', '+52 555 234 5678', 'LOGM880215DEF', '1988-02-15', 'Calle Insurgentes 456, CDMX', 1, 'Gerente de Finanzas', 'finance', 'EMP002', '2020-03-01', 1, TRUE),
        (3, 'Carlos Martínez Ruiz', 'carlos@innovacion.mx', '+52 555 345 6789', 'MARC920310GHI', '1992-03-10', 'Col. Roma Norte 789, CDMX', 2, 'Developer Senior', 'it', 'EMP003', '2021-06-15', NULL, TRUE),
        (4, 'Ana García Hernández', 'ana@consultoria.mx', '+52 555 456 7890', 'GAHA900520JKL', '1990-05-20', 'Polanco 321, CDMX', 3, 'Coordinadora de RH', 'hr', 'EMP004', '2021-08-01', NULL, TRUE),
        (5, 'Pedro Sánchez Vila', 'pedro@techespana.es', '+34 915 123 456', '12345678Z', '1987-07-12', 'Calle Gran Vía 45, Madrid', 4, 'Jefe de Ventas', 'sales', 'EMP005', '2020-11-01', NULL, TRUE),
        (6, 'Elena Torres López', 'elena@madrid.es', '+34 915 234 567', '87654321Y', '1991-09-25', 'Barrio Salamanca 67, Madrid', 5, 'Especialista en Marketing', 'sales', 'EMP006', '2022-02-15', 5, TRUE),
        (7, 'Roberto Silva Castro', 'roberto@techmx.com', '+52 555 567 8901', 'SICR890430MNO', '1989-04-30', 'Santa Fe 890, CDMX', 1, 'Analista de Sistemas', 'it', 'EMP007', '2022-07-01', 1, TRUE),
        (8, 'Sofía Mendoza Ruiz', 'sofia@innovacion.mx', '+52 555 678 9012', 'MERS940615PQR', '1994-06-15', 'Condesa 234, CDMX', 2, 'Coordinadora de Operaciones', 'operations', 'EMP008', '2023-01-10', NULL, TRUE),
        (9, 'Miguel Ángel Jiménez', 'miguel@consultoria.mx', '+52 555 789 0123', 'JIMM860825STU', '1986-08-25', 'Del Valle 567, CDMX', 3, 'Contador Senior', 'finance', 'EMP009', '2021-12-01', NULL, TRUE),
        (10, 'Carmen Vega Morales', 'carmen@techespana.es', '+34 915 345 678', '45678912X', '1993-11-08', 'Calle Alcalá 123, Madrid', 4, 'Desarrolladora Frontend', 'it', 'EMP010', '2023-04-01', NULL, TRUE)
    `).run();

    await env.DB.prepare(`
      INSERT OR IGNORE INTO exchange_rates (from_currency, to_currency, rate, rate_date, source) VALUES 
        ('USD', 'MXN', 18.25, '2024-09-24', 'banxico'),
        ('EUR', 'MXN', 20.15, '2024-09-24', 'banxico'),
        ('EUR', 'USD', 1.10, '2024-09-24', 'ecb'),
        ('USD', 'EUR', 0.91, '2024-09-24', 'ecb'),
        ('MXN', 'USD', 0.055, '2024-09-24', 'banxico'),
        ('MXN', 'EUR', 0.050, '2024-09-24', 'banxico')
    `).run();

    // Sample expenses
    await env.DB.prepare(`
      INSERT OR IGNORE INTO expenses (
        id, company_id, user_id, expense_type_id, description, expense_date, 
        amount, currency, exchange_rate, amount_mxn, payment_method, vendor, 
        status, notes, is_billable, created_by
      ) VALUES 
        (1, 1, 2, 1, 'Comida con cliente - Proyecto Alpha', '2024-09-20', 850.00, 'MXN', 1.0, 850.00, 'company_card', 'Restaurante Pujol', 'approved', 'Reunión de cierre de proyecto', TRUE, 2),
        (2, 1, 2, 2, 'Taxi al aeropuerto', '2024-09-21', 320.50, 'MXN', 1.0, 320.50, 'cash', 'Uber', 'pending', NULL, FALSE, 2),
        (3, 2, 3, 7, 'Licencia Adobe Creative Suite', '2024-09-22', 2500.00, 'MXN', 1.0, 2500.00, 'credit_card', 'Adobe Inc', 'approved', 'Renovación anual', FALSE, 3),
        (4, 4, 5, 5, 'Vuelo Barcelona-Madrid', '2024-09-18', 120.00, 'EUR', 20.15, 2418.00, 'company_card', 'Iberia', 'reimbursed', 'Reunión con cliente en Madrid', TRUE, 5),
        (5, 5, 6, 4, 'Hotel NH Collection Madrid', '2024-09-19', 180.00, 'EUR', 20.15, 3627.00, 'credit_card', 'NH Hotels', 'approved', 'Estadía 2 noches', TRUE, 6),
        (6, 1, 1, 8, 'Conferencia AWS Re:Invent', '2024-09-15', 1500.00, 'USD', 18.25, 27375.00, 'company_card', 'Amazon Web Services', 'approved', 'Capacitación en cloud computing', FALSE, 1),
        (7, 3, 4, 6, 'Material de oficina importado', '2024-09-23', 250.00, 'USD', 18.25, 4562.50, 'bank_transfer', 'Office Depot USA', 'pending', 'Material especializado', FALSE, 4)
    `).run();

    // Sample CFDI validations for Mexican companies
    await env.DB.prepare(`
      INSERT OR IGNORE INTO cfdi_validations (
        company_id, expense_id, uuid, rfc_emisor, rfc_receptor, total, 
        fecha_emision, serie, folio, is_valid, validation_details, 
        validation_source, validated_by
      ) VALUES 
        (1, 1, '12345678-1234-1234-1234-123456789012', 'RPU123456789', 'TMX123456789', 850.00, 
         '2024-09-20T14:30:00', 'A', '001', TRUE, 'CFDI válido - Verificado en SAT', 'xml', 1),
        (2, 3, '87654321-4321-4321-4321-210987654321', 'ADO987654321', 'IDM987654321', 2500.00, 
         '2024-09-22T09:15:00', 'B', '002', TRUE, 'CFDI válido - Factura de software', 'pdf', 3),
        (3, 7, 'ABCDEFGH-1111-2222-3333-444455556666', 'ODP555666777', 'CEM555666777', 4562.50, 
         '2024-09-23T16:45:00', 'C', '003', FALSE, 'Error: Receptor no coincide', 'manual', 4)
    `).run();

    return c.json({ 
      success: true, 
      message: 'Base de datos inicializada con datos de prueba (incluyendo CFDI validations)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      error: 'Failed to initialize database', 
      details: error.message 
    }, 500);
  }
})

// Companies API - Protected: Users can only see companies they have access to
app.get('/api/companies', async (c) => {
  const { env } = c;
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  try {
    let companiesQuery;
    let queryParams = [];
    
    if (user.is_cfo) {
      // CFO can see all companies
      companiesQuery = `
        SELECT id, name, commercial_name, razon_social, country, tax_id, primary_currency,
               employees_count, business_category, website, business_description,
               address, address_street, address_city, address_state, address_postal, phone,
               logo_url, brand_color, active, created_at, updated_at
        FROM companies 
        WHERE active = TRUE
        ORDER BY country, name
      `;
    } else {
      // Regular users can only see companies they have permissions for
      const accessibleCompanyIds = user.permissions.map((p: any) => p.company_id);
      
      if (accessibleCompanyIds.length === 0) {
        return c.json({ companies: [] });
      }
      
      const placeholders = accessibleCompanyIds.map(() => '?').join(',');
      companiesQuery = `
        SELECT id, name, commercial_name, razon_social, country, tax_id, primary_currency,
               employees_count, business_category, website, business_description,
               address, address_street, address_city, address_state, address_postal, phone,
               logo_url, brand_color, active, created_at, updated_at
        FROM companies 
        WHERE active = TRUE AND id IN (${placeholders})
        ORDER BY country, name
      `;
      queryParams = accessibleCompanyIds;
    }
    
    const companies = await env.DB.prepare(companiesQuery).bind(...queryParams).all();
    
    return c.json({ 
      companies: companies.results,
      user_role: user.is_cfo ? 'cfo' : 'user',
      accessible_count: companies.results.length
    });
  } catch (error) {
    console.error('Companies API error:', error);
    return c.json({ error: 'Failed to fetch companies' }, 500);
  }
})

// Companies API - Create new company (Protected)
app.post('/api/companies', async (c) => {
  const { env } = c;
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  // Check if user can create companies (CFO only for now)
  if (!user.is_cfo) {
    return c.json({ error: 'Solo CFOs pueden crear nuevas empresas' }, 403);
  }
  
  try {
    const companyData = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['razon_social', 'commercial_name', 'country', 'tax_id', 'primary_currency'];
    for (const field of requiredFields) {
      if (!companyData[field]) {
        return c.json({ error: `El campo ${field} es requerido` }, 400);
      }
    }
    
    // Validate country
    if (!['MX', 'ES', 'US', 'CA'].includes(companyData.country)) {
      return c.json({ error: 'País no válido' }, 400);
    }
    
    // Validate currency
    if (!['MXN', 'EUR', 'USD', 'CAD'].includes(companyData.primary_currency)) {
      return c.json({ error: 'Moneda no válida' }, 400);
    }
    
    // Check if company with same tax_id already exists
    const existingCompany = await env.DB.prepare(`
      SELECT id FROM companies WHERE tax_id = ? AND active = TRUE
    `).bind(companyData.tax_id).first();
    
    if (existingCompany) {
      return c.json({ error: 'Ya existe una empresa con ese RFC/NIF/EIN/BN' }, 409);
    }
    
    // Insert new company
    const result = await env.DB.prepare(`
      INSERT INTO companies (
        name, commercial_name, razon_social, country, tax_id, primary_currency, employees_count,
        business_category, website, business_description,
        address_street, address_city, address_state, address_postal, phone,
        logo_url, brand_color, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      companyData.commercial_name || companyData.razon_social,
      companyData.commercial_name,
      companyData.razon_social,
      companyData.country,
      companyData.tax_id,
      companyData.primary_currency,
      companyData.employees_count || null,
      companyData.business_category || null,
      companyData.website || null,
      companyData.business_description || null,
      companyData.address_street || null,
      companyData.address_city || null,
      companyData.address_state || null,
      companyData.address_postal || null,
      companyData.phone || null,
      companyData.logo_url || null,
      companyData.brand_color || '#D4AF37',
      true
    ).run();
    
    const companyId = result.meta.last_row_id;
    
    // Get the created company
    const newCompany = await env.DB.prepare(`
      SELECT * FROM companies WHERE id = ?
    `).bind(companyId).first();
    
    console.log(`✅ Nueva empresa creada: ${companyData.commercial_name} (ID: ${companyId})`);
    
    return c.json({
      success: true,
      message: 'Empresa creada exitosamente',
      company: newCompany,
      id: companyId
    });
    
  } catch (error) {
    console.error('Error creating company:', error);
    return c.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, 500);
  }
})

// Companies API - Update existing company (Protected)
app.put('/api/companies/:id', async (c) => {
  const { env } = c;
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  if (!user.is_cfo) {
    return c.json({ error: 'Solo CFOs pueden editar empresas' }, 403);
  }
  
  try {
    const companyId = c.req.param('id');
    const companyData = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['razon_social', 'commercial_name', 'country', 'tax_id', 'primary_currency'];
    for (const field of requiredFields) {
      if (!companyData[field]) {
        return c.json({ error: `El campo ${field} es requerido` }, 400);
      }
    }
    
    // Validate country and currency
    if (!['MX', 'ES', 'US', 'CA'].includes(companyData.country)) {
      return c.json({ error: 'País no válido' }, 400);
    }
    
    if (!['MXN', 'EUR', 'USD', 'CAD'].includes(companyData.primary_currency)) {
      return c.json({ error: 'Moneda no válida' }, 400);
    }
    
    // Check if company exists
    const existingCompany = await env.DB.prepare(`
      SELECT id FROM companies WHERE id = ? AND active = TRUE
    `).bind(companyId).first();
    
    if (!existingCompany) {
      return c.json({ error: 'Empresa no encontrada' }, 404);
    }
    
    // Check if tax_id is unique (excluding current company)
    const duplicateTaxId = await env.DB.prepare(`
      SELECT id FROM companies WHERE tax_id = ? AND id != ? AND active = TRUE
    `).bind(companyData.tax_id, companyId).first();
    
    if (duplicateTaxId) {
      return c.json({ error: 'Ya existe otra empresa con ese RFC/NIF/EIN/BN' }, 409);
    }
    
    // Update company
    await env.DB.prepare(`
      UPDATE companies SET
        name = ?, commercial_name = ?, razon_social = ?, country = ?, tax_id = ?, 
        primary_currency = ?, employees_count = ?, business_category = ?, 
        website = ?, business_description = ?, address_street = ?, address_city = ?, 
        address_state = ?, address_postal = ?, phone = ?, logo_url = ?, brand_color = ?,
        updated_at = datetime('now')
      WHERE id = ? AND active = TRUE
    `).bind(
      companyData.commercial_name || companyData.razon_social,
      companyData.commercial_name,
      companyData.razon_social,
      companyData.country,
      companyData.tax_id,
      companyData.primary_currency,
      companyData.employees_count || null,
      companyData.business_category || null,
      companyData.website || null,
      companyData.business_description || null,
      companyData.address_street || null,
      companyData.address_city || null,
      companyData.address_state || null,
      companyData.address_postal || null,
      companyData.phone || null,
      companyData.logo_url || null,
      companyData.brand_color || '#D4AF37',
      companyId
    ).run();
    
    // Get updated company
    const updatedCompany = await env.DB.prepare(`
      SELECT * FROM companies WHERE id = ?
    `).bind(companyId).first();
    
    console.log(`✅ Empresa actualizada: ${companyData.commercial_name} (ID: ${companyId})`);
    
    return c.json({
      success: true,
      message: 'Empresa actualizada exitosamente',
      company: updatedCompany
    });
    
  } catch (error) {
    console.error('Error updating company:', error);
    return c.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, 500);
  }
})

// Companies API - Upload logo (Protected)
// Logo upload is now handled via the main PUT /api/companies/:id endpoint with base64 data

// Users API - Protected: Only users with management permissions
app.get('/api/users', async (c) => {
  const { env } = c;
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  // Check if user can manage users (CFO or has manage permissions in any company)
  if (!user.is_cfo && !user.permissions.some((p: any) => p.can_manage_users)) {
    return c.json({ error: 'No tienes permisos para ver usuarios' }, 403);
  }
  
  try {
    let usersQuery = `
      SELECT DISTINCT u.id, u.email, u.name, u.role, u.active, u.created_at, u.is_cfo,
             GROUP_CONCAT(DISTINCT c.name || ' (' || up.can_view_all || ',' || up.can_create || ',' || up.can_approve || ')') as companies_permissions
      FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      LEFT JOIN companies c ON up.company_id = c.id
      WHERE u.active = TRUE
    `;
    
    if (!user.is_cfo) {
      // Non-CFO users can only see users from companies they can manage
      const managedCompanyIds = user.permissions
        .filter((p: any) => p.can_manage_users)
        .map((p: any) => p.company_id);
      
      if (managedCompanyIds.length === 0) {
        return c.json({ users: [] });
      }
      
      const placeholders = managedCompanyIds.map(() => '?').join(',');
      usersQuery += ` AND u.id IN (
        SELECT DISTINCT user_id FROM user_permissions 
        WHERE company_id IN (${placeholders})
      )`;
      usersQuery += ` GROUP BY u.id ORDER BY u.name`;
      
      const users = await env.DB.prepare(usersQuery).bind(...managedCompanyIds).all();
      return c.json({ users: users.results });
    } else {
      // CFO can see all users
      usersQuery += ` GROUP BY u.id ORDER BY u.name`;
      const users = await env.DB.prepare(usersQuery).all();
      return c.json({ users: users.results });
    }
  } catch (error) {
    console.error('Users API error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
})

// Expenses API - List with filters (PROTECTED: User permissions applied)
app.get('/api/expenses', async (c) => {
  const { env } = c;
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  const query = c.req.query();
  
  let sql = `
    SELECT e.*, c.name as company_name, u.name as user_name, et.name as expense_type_name,
           c.country, c.primary_currency as company_currency
    FROM expenses e
    JOIN companies c ON e.company_id = c.id
    JOIN users u ON e.user_id = u.id
    JOIN expense_types et ON e.expense_type_id = et.id
    WHERE 1=1
  `;
  
  const params = [];
  
  // **PERMISSION FILTERING - CRITICAL SECURITY**
  if (user.is_cfo) {
    // CFO can see all expenses
    console.log('CFO access: viewing all expenses');
  } else {
    // Regular users can only see:
    // 1. Their own expenses 
    // 2. Expenses from companies they have view permissions for
    
    const accessibleCompanyIds = user.permissions
      .filter((p: any) => p.can_view_all)
      .map((p: any) => p.company_id);
    
    if (accessibleCompanyIds.length === 0) {
      // User has no company access, can only see their own expenses
      sql += ` AND e.user_id = ?`;
      params.push(user.id);
    } else {
      // User can see their own expenses + expenses from accessible companies
      const companyPlaceholders = accessibleCompanyIds.map(() => '?').join(',');
      sql += ` AND (e.user_id = ? OR e.company_id IN (${companyPlaceholders}))`;
      params.push(user.id, ...accessibleCompanyIds);
    }
    
    console.log(`User ${user.email}: accessing expenses with companies [${accessibleCompanyIds.join(',')}]`);
  }
  
  // Apply additional filters
  if (query.company_id) {
    const companyId = parseInt(query.company_id);
    
    // Verify user has access to this specific company
    if (!user.is_cfo && !hasCompanyAccess(user, companyId)) {
      return c.json({ error: 'No tienes acceso a esta empresa' }, 403);
    }
    
    sql += ` AND e.company_id = ?`;
    params.push(companyId);
  }
  
  if (query.user_id) {
    const requestedUserId = parseInt(query.user_id);
    
    // Users can only filter by their own user_id unless they're CFO or have view permissions
    if (!user.is_cfo && requestedUserId !== user.id) {
      return c.json({ error: 'No puedes ver gastos de otros usuarios' }, 403);
    }
    
    sql += ` AND e.user_id = ?`;
    params.push(requestedUserId);
  }
  
  if (query.status) {
    sql += ` AND e.status = ?`;
    params.push(query.status);
  }
  
  if (query.currency) {
    sql += ` AND e.currency = ?`;
    params.push(query.currency);
  }
  
  if (query.date_from) {
    sql += ` AND e.expense_date >= ?`;
    params.push(query.date_from);
  }
  
  if (query.date_to) {
    sql += ` AND e.expense_date <= ?`;
    params.push(query.date_to);
  }
  
  sql += ` ORDER BY e.expense_date DESC, e.created_at DESC`;
  
  if (query.limit) {
    sql += ` LIMIT ?`;
    params.push(parseInt(query.limit) || 50);
  }
  
  try {
    const stmt = env.DB.prepare(sql);
    const expenses = await stmt.bind(...params).all();
    
    return c.json({ 
      expenses: expenses.results,
      total: expenses.results.length 
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch expenses' }, 500);
  }
})

// Create new expense (PROTECTED: User must have create permissions)
app.post('/api/expenses', async (c) => {
  const { env } = c;
  const user = await authenticateUser(c);
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  try {
    const expense = await c.req.json();
    
    // Validate required fields
    const required = ['company_id', 'expense_type_id', 'description', 'expense_date', 'amount', 'currency'];
    for (const field of required) {
      if (!expense[field]) {
        return c.json({ error: `Missing required field: ${field}` }, 400);
      }
    }
    
    const companyId = parseInt(expense.company_id);
    
    // **PERMISSION CHECK - CRITICAL SECURITY**
    if (!user.is_cfo && !canCreateInCompany(user, companyId)) {
      return c.json({ error: 'No tienes permisos para crear gastos en esta empresa' }, 403);
    }
    
    // Set the user_id to the authenticated user (prevent impersonation)
    expense.user_id = user.id;
    
    console.log(`User ${user.email} creating expense in company ${companyId}`);
    
    // Convert amount to MXN (simplified for demo - in production, use real exchange rates)
    let amount_mxn = expense.amount;
    let exchange_rate = 1.0;
    
    if (expense.currency === 'USD') {
      exchange_rate = 18.25; // Demo rate
      amount_mxn = expense.amount * exchange_rate;
    } else if (expense.currency === 'EUR') {
      exchange_rate = 20.15; // Demo rate  
      amount_mxn = expense.amount * exchange_rate;
    }
    
    const result = await env.DB.prepare(`
      INSERT INTO expenses (
        company_id, user_id, expense_type_id, description, expense_date, 
        amount, currency, exchange_rate, amount_mxn, payment_method, 
        vendor, notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      expense.company_id,
      expense.user_id || 1, // Demo user
      expense.expense_type_id,
      expense.description,
      expense.expense_date,
      expense.amount,
      expense.currency,
      exchange_rate,
      amount_mxn,
      expense.payment_method || 'cash',
      expense.vendor || '',
      expense.notes || '',
      'pending',
      expense.user_id || 1
    ).run();
    
    return c.json({ 
      success: true, 
      expense_id: result.meta.last_row_id,
      message: 'Gasto creado exitosamente'
    });
  } catch (error) {
    return c.json({ error: 'Failed to create expense', details: error.message }, 500);
  }
})

// Update expense status (PROTECTED: Requires approval permissions)
app.put('/api/expenses/:id/status', async (c) => {
  const { env } = c;
  const user = await authenticateUser(c);
  const expenseId = c.req.param('id');
  
  if (!user) {
    return c.json({ error: 'No autorizado' }, 401);
  }
  
  try {
    const { status } = await c.req.json();
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'more_info', 'reimbursed', 'invoiced'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    // Get the expense to check company and current owner
    const expense = await env.DB.prepare(`
      SELECT e.*, c.name as company_name 
      FROM expenses e 
      JOIN companies c ON e.company_id = c.id 
      WHERE e.id = ?
    `).bind(expenseId).first();
    
    if (!expense) {
      return c.json({ error: 'Gasto no encontrado' }, 404);
    }
    
    // **PERMISSION CHECKS - CRITICAL SECURITY**
    const companyId = expense.company_id;
    
    // Status changes requiring approval permissions
    const approvalStatuses = ['approved', 'rejected', 'reimbursed', 'invoiced'];
    
    if (approvalStatuses.includes(status)) {
      // User must have approval permissions in this company
      if (!user.is_cfo && !canApproveInCompany(user, companyId)) {
        return c.json({ 
          error: `No tienes permisos para ${status === 'approved' ? 'aprobar' : 'cambiar estado de'} gastos en ${expense.company_name}` 
        }, 403);
      }
    }
    
    // Users can set their own expenses to 'pending' or 'more_info' status
    const userEditableStatuses = ['pending', 'more_info'];
    if (userEditableStatuses.includes(status) && expense.user_id !== user.id) {
      if (!user.is_cfo && !canApproveInCompany(user, companyId)) {
        return c.json({ error: 'Solo puedes modificar tus propios gastos' }, 403);
      }
    }
    
    console.log(`User ${user.email} changing expense ${expenseId} status to ${status} in company ${companyId}`);
    
    // Update expense status
    const result = await env.DB.prepare(`
      UPDATE expenses 
      SET status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? 
      WHERE id = ?
    `).bind(status, user.id, expenseId).run();
    
    if (result.changes === 0) {
      return c.json({ error: 'Expense not found' }, 404);
    }
    
    return c.json({ 
      success: true, 
      message: 'Status updated successfully',
      new_status: status 
    });
  } catch (error) {
    return c.json({ error: 'Failed to update status', details: error.message }, 500);
  }
})

// Dashboard metrics
app.get('/api/dashboard/metrics', async (c) => {
  const { env } = c;
  const query = c.req.query();
  
  try {
    // Build WHERE clause for filters
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (query.company_id) {
      whereClause += ' AND e.company_id = ?';
      params.push(query.company_id);
    }
    
    if (query.user_id) {
      whereClause += ' AND e.user_id = ?';
      params.push(query.user_id);
    }
    
    if (query.status) {
      whereClause += ' AND e.status = ?';
      params.push(query.status);
    }
    
    if (query.currency) {
      whereClause += ' AND e.currency = ?';
      params.push(query.currency);
    }
    
    if (query.date_from) {
      whereClause += ' AND e.expense_date >= ?';
      params.push(query.date_from);
    }
    
    if (query.date_to) {
      whereClause += ' AND e.expense_date <= ?';
      params.push(query.date_to);
    }
    
    if (query.user_id) {
      whereClause += ' AND e.user_id = ?';
      params.push(query.user_id);
    }
    
    if (query.status) {
      whereClause += ' AND e.status = ?';
      params.push(query.status);
    }
    
    // Total expenses by status (with filters)
    const statusMetrics = await env.DB.prepare(`
      SELECT status, COUNT(*) as count, SUM(amount_mxn) as total_mxn
      FROM expenses e
      ${whereClause}
      GROUP BY status
    `).bind(...params).all();
    
    // Expenses by company (with filters)
    const companyMetrics = await env.DB.prepare(`
      SELECT c.name as company, c.country, COUNT(*) as count, SUM(e.amount_mxn) as total_mxn
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      ${whereClause}
      GROUP BY c.id, c.name, c.country
      ORDER BY total_mxn DESC
    `).bind(...params).all();
    
    // Expenses by currency (with filters)
    const currencyMetrics = await env.DB.prepare(`
      SELECT currency, COUNT(*) as count, SUM(amount) as total_original, SUM(amount_mxn) as total_mxn
      FROM expenses e
      ${whereClause}
      GROUP BY currency
    `).bind(...params).all();
    
    // Recent expenses (with filters, limited to 10)
    const recentExpenses = await env.DB.prepare(`
      SELECT e.*, c.name as company_name, u.name as user_name
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT 10
    `).bind(...params).all();
    
    return c.json({
      status_metrics: statusMetrics.results || [],
      company_metrics: companyMetrics.results || [],
      currency_metrics: currencyMetrics.results || [],
      recent_expenses: recentExpenses.results || [],
      filters_applied: {
        company_id: query.company_id,
        user_id: query.user_id,
        status: query.status,
        currency: query.currency,
        date_from: query.date_from,
        date_to: query.date_to,
        period: query.period
      }
    });
  } catch (error) {
    return c.json({ 
      error: 'Failed to fetch dashboard metrics', 
      details: error.message 
    }, 500);
  }
})

// Expense types
app.get('/api/expense-types', async (c) => {
  const { env } = c;
  
  try {
    const types = await env.DB.prepare(`
      SELECT id, name, description, category, active
      FROM expense_types
      WHERE active = TRUE
      ORDER BY category, name
    `).all();
    
    return c.json({ expense_types: types.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch expense types' }, 500);
  }
})

// Exchange rates - Get current rates
app.get('/api/exchange-rates', async (c) => {
  const { env } = c;
  const query = c.req.query();
  
  try {
    // Get latest exchange rates
    const rates = await env.DB.prepare(`
      SELECT from_currency, to_currency, rate, rate_date, source
      FROM exchange_rates
      WHERE rate_date = (
        SELECT MAX(rate_date) FROM exchange_rates
      )
      ORDER BY from_currency, to_currency
    `).all();
    
    // If requesting specific conversion
    if (query.from && query.to) {
      const rate = rates.results.find(r => 
        r.from_currency === query.from && r.to_currency === query.to
      );
      
      if (rate) {
        return c.json({ rate: rate.rate, date: rate.rate_date, source: rate.source });
      } else {
        // Try inverse rate
        const inverseRate = rates.results.find(r => 
          r.from_currency === query.to && r.to_currency === query.from
        );
        
        if (inverseRate) {
          return c.json({ 
            rate: (1 / inverseRate.rate).toFixed(6), 
            date: inverseRate.rate_date, 
            source: inverseRate.source + ' (inverse)' 
          });
        }
      }
      
      return c.json({ error: 'Exchange rate not found' }, 404);
    }
    
    return c.json({ exchange_rates: rates.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch exchange rates' }, 500);
  }
})

// Update exchange rates (admin only)
app.post('/api/exchange-rates/update', async (c) => {
  const { env } = c;
  
  try {
    // In production, this would fetch from Banxico/ECB APIs
    // For demo, we'll update with sample rates
    const today = new Date().toISOString().split('T')[0];
    
    const rates = [
      { from: 'USD', to: 'MXN', rate: 18.25, source: 'banxico' },
      { from: 'EUR', to: 'MXN', rate: 20.15, source: 'banxico' },
      { from: 'EUR', to: 'USD', rate: 1.10, source: 'ecb' },
      { from: 'USD', to: 'EUR', rate: 0.91, source: 'ecb' },
      { from: 'MXN', to: 'USD', rate: 0.055, source: 'banxico' },
      { from: 'MXN', to: 'EUR', rate: 0.050, source: 'banxico' }
    ];
    
    for (const rateData of rates) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO exchange_rates 
        (from_currency, to_currency, rate, rate_date, source, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        rateData.from,
        rateData.to,
        rateData.rate,
        today,
        rateData.source
      ).run();
    }
    
    return c.json({ 
      success: true, 
      message: 'Exchange rates updated successfully',
      date: today 
    });
  } catch (error) {
    return c.json({ error: 'Failed to update exchange rates' }, 500);
  }
})

// Upload attachments endpoint with OCR processing
app.post('/api/attachments', async (c) => {
  const { env } = c;
  
  try {
    // In production, this would upload to R2 storage
    // For demo, we'll simulate the upload
    const formData = await c.req.formData();
    const file = formData.get('file');
    const expenseId = formData.get('expense_id');
    const processOcr = formData.get('process_ocr') === 'true';
    
    if (!file || !expenseId) {
      return c.json({ error: 'File and expense_id are required' }, 400);
    }
    
    // Simulate file upload
    const fileUrl = `/uploads/${Date.now()}-${file.name}`;
    const fileType = file.type.startsWith('image/') ? 'image' : (file.type === 'application/pdf' ? 'pdf' : 'xml');
    
    // Process OCR if requested and file is an image or PDF
    let ocrData = null;
    if (processOcr && (fileType === 'image' || fileType === 'pdf')) {
      ocrData = await processOcrExtraction(file, fileType);
    }
    
    // Save attachment record
    const result = await env.DB.prepare(`
      INSERT INTO attachments (
        expense_id, file_name, file_type, file_url, file_size, 
        mime_type, ocr_text, ocr_confidence, uploaded_by, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      expenseId,
      file.name,
      fileType,
      fileUrl,
      file.size,
      file.type,
      ocrData?.text || null,
      ocrData?.confidence || null,
      1 // Demo user
    ).run();
    
    return c.json({ 
      success: true, 
      attachment_id: result.meta.last_row_id,
      file_url: fileUrl,
      ocr_data: ocrData,
      message: 'File uploaded successfully' + (ocrData ? ' with OCR processing' : '')
    });
  } catch (error) {
    return c.json({ error: 'Failed to upload attachment', details: error.message }, 500);
  }
})

// OCR processing endpoint for existing files
app.post('/api/attachments/:id/ocr', async (c) => {
  const { env } = c;
  const attachmentId = c.req.param('id');
  
  try {
    // Get attachment info
    const attachment = await env.DB.prepare(`
      SELECT * FROM attachments WHERE id = ?
    `).bind(attachmentId).first();
    
    if (!attachment) {
      return c.json({ error: 'Attachment not found' }, 404);
    }
    
    if (attachment.file_type !== 'image' && attachment.file_type !== 'pdf') {
      return c.json({ error: 'OCR only supported for images and PDFs' }, 400);
    }
    
    // Process OCR (simulate with realistic data)
    const ocrData = await processOcrExtraction(null, attachment.file_type, attachment.file_name);
    
    // Update attachment with OCR data
    await env.DB.prepare(`
      UPDATE attachments 
      SET ocr_text = ?, ocr_confidence = ?
      WHERE id = ?
    `).bind(ocrData.text, ocrData.confidence, attachmentId).run();
    
    return c.json({ 
      success: true,
      ocr_data: ocrData,
      message: 'OCR processing completed'
    });
  } catch (error) {
    return c.json({ error: 'Failed to process OCR', details: error.message }, 500);
  }
})

// Extract expense data from OCR text using AI
app.post('/api/ocr/extract-expense-data', async (c) => {
  const { env } = c;
  
  try {
    const { ocr_text, attachment_id } = await c.req.json();
    
    if (!ocr_text) {
      return c.json({ error: 'OCR text is required' }, 400);
    }
    
    // Use AI to extract structured expense data from OCR text
    const extractedData = await extractExpenseDataFromOcr(ocr_text);
    
    return c.json({ 
      success: true,
      extracted_data: extractedData,
      message: 'Expense data extracted successfully'
    });
  } catch (error) {
    return c.json({ error: 'Failed to extract expense data', details: error.message }, 500);
  }
})

// Helper function to simulate OCR processing
async function processOcrExtraction(file, fileType, fileName = null) {
  // Simulate OCR processing with realistic ticket/receipt data
  const sampleOcrResults = {
    'ticket': {
      text: `RESTAURANTE PUJOL
Tennyson 133, Polanco
Ciudad de México
RFC: RPU890123ABC

FECHA: ${new Date().toLocaleDateString('es-MX')}
HORA: ${new Date().toLocaleTimeString('es-MX')}

MESA: 12
MESERO: Carlos Martinez

CONSUMO:
1x Menú Degustación     $1,200.00
2x Vino Tinto Casa      $400.00
1x Postre Especial      $250.00

SUBTOTAL:               $1,850.00
IVA (16%):              $296.00
PROPINA SUGERIDA:       $277.50

TOTAL:                  $2,146.00

FORMA DE PAGO: TARJETA ****1234
AUTORIZACIÓN: 123456

GRACIAS POR SU VISITA
www.pujol.com.mx`,
      confidence: 0.94
    },
    'factura': {
      text: `FACTURA ELECTRÓNICA
Adobe Systems Incorporated
RFC: ASI123456789

LUGAR DE EXPEDICIÓN: 06600
FECHA: ${new Date().toLocaleDateString('es-MX')}
FOLIO FISCAL: 12345678-ABCD-1234-EFGH-123456789012

RECEPTOR:
TechMX Solutions S.A. de C.V.
RFC: TMX123456789
USO CFDI: G03 - Gastos en General

CONCEPTO:
Licencia Adobe Creative Suite Anual
Cantidad: 1
Precio Unitario: $2,500.00
Importe: $2,500.00

SUBTOTAL: $2,500.00
IVA (16%): $400.00
TOTAL: $2,900.00

MÉTODO DE PAGO: 04 - Tarjeta de Crédito
MONEDA: MXN

SELLO DIGITAL SAT: ABC123DEF456...`,
      confidence: 0.97
    },
    'uber': {
      text: `Uber
VIAJE COMPLETADO

DOMINGO, ${new Date().toLocaleDateString('es-MX')}
${new Date().toLocaleTimeString('es-MX')}

DESDE: Torre Reforma
HASTA: Aeropuerto Internacional

CONDUCTOR: Miguel Hernández
AUTO: Nissan Versa Blanco
PLACAS: ABC-123-D

DISTANCIA: 32.5 km
DURACIÓN: 45 min

TARIFA BASE:     $45.00
TIEMPO Y DIST:   $235.50
PEAJE:          $40.00

SUBTOTAL:       $320.50
PROPINA:        $0.00
TOTAL:          $320.50

MÉTODO DE PAGO: Efectivo
ID VIAJE: 1234-5678-9012`,
      confidence: 0.89
    }
  };
  
  // Determine type based on file name or content
  let ocrType = 'ticket';
  if (fileName) {
    if (fileName.toLowerCase().includes('factura') || fileName.toLowerCase().includes('invoice')) {
      ocrType = 'factura';
    } else if (fileName.toLowerCase().includes('uber') || fileName.toLowerCase().includes('taxi')) {
      ocrType = 'uber';
    }
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return sampleOcrResults[ocrType] || sampleOcrResults.ticket;
}

// CFDI Validation endpoint for Mexican companies
app.post('/api/cfdi/validate', async (c) => {
  const { env } = c;
  
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const expenseId = formData.get('expense_id');
    
    if (!file) {
      return c.json({ error: 'XML or PDF file is required for CFDI validation' }, 400);
    }
    
    let cfdiData = null;
    
    if (file.type === 'application/xml' || file.type === 'text/xml') {
      // Process XML CFDI
      cfdiData = await processCfdiXml(file);
    } else if (file.type === 'application/pdf') {
      // Extract CFDI data from PDF (usually contains XML embedded)
      cfdiData = await processCfdiPdf(file);
    } else {
      return c.json({ error: 'Only XML and PDF files are supported for CFDI validation' }, 400);
    }
    
    // Validate CFDI with SAT (simulate validation)
    const satValidation = await validateWithSat(cfdiData);
    
    // Update attachment record if expense_id provided
    if (expenseId && cfdiData.uuid) {
      await env.DB.prepare(`
        UPDATE attachments 
        SET is_cfdi_valid = ?, cfdi_uuid = ?
        WHERE expense_id = ? AND id = (
          SELECT id FROM attachments WHERE expense_id = ? ORDER BY uploaded_at DESC LIMIT 1
        )
      `).bind(satValidation.valid, cfdiData.uuid, expenseId, expenseId).run();
    }
    
    return c.json({ 
      success: true,
      cfdi_data: cfdiData,
      sat_validation: satValidation,
      message: satValidation.valid ? 'CFDI válido' : 'CFDI inválido o con errores'
    });
  } catch (error) {
    return c.json({ error: 'Failed to validate CFDI', details: error.message }, 500);
  }
})

// CFDI Manual Data Validation endpoint
app.post('/api/cfdi/validate-data', async (c) => {
  const { env } = c;
  
  try {
    const body = await c.req.json();
    const { company_id, rfc_emisor, rfc_receptor, uuid, total } = body;
    
    if (!company_id || !rfc_emisor || !rfc_receptor || !uuid) {
      return c.json({ error: 'company_id, rfc_emisor, rfc_receptor, and uuid are required' }, 400);
    }
    
    // Validate company is Mexican
    const company = await env.DB.prepare('SELECT * FROM companies WHERE id = ? AND country = ?')
      .bind(company_id, 'MX').first();
    
    if (!company) {
      return c.json({ error: 'Company not found or not a Mexican company' }, 400);
    }
    
    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return c.json({ error: 'Invalid UUID format' }, 400);
    }
    
    // Simulate SAT validation with manual data
    const cfdiData = {
      rfc_emisor,
      rfc_receptor,
      uuid,
      total: parseFloat(total) || 0,
      fecha_emision: new Date().toISOString(),
      serie: 'A',
      folio: '001'
    };
    
    const satValidation = await validateWithSat(cfdiData);
    
    // Store CFDI validation record
    const validationResult = await env.DB.prepare(`
      INSERT INTO cfdi_validations (
        company_id, uuid, rfc_emisor, rfc_receptor, total, 
        is_valid, validation_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      company_id, 
      uuid, 
      rfc_emisor, 
      rfc_receptor, 
      total || 0,
      satValidation.valid ? 1 : 0,
      satValidation.mensaje
    ).run();
    
    return c.json({ 
      success: true,
      validation_id: validationResult.meta.last_row_id,
      cfdi_data: cfdiData,
      sat_valid: satValidation.valid,
      validation_details: satValidation.mensaje,
      message: satValidation.valid ? 'CFDI validado exitosamente' : 'CFDI con errores de validación'
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to validate CFDI data', details: error.message }, 500);
  }
})

// Get CFDI status for an expense
app.get('/api/expenses/:id/cfdi-status', async (c) => {
  const { env } = c;
  const expenseId = c.req.param('id');
  
  try {
    const cfdiAttachments = await env.DB.prepare(`
      SELECT id, file_name, is_cfdi_valid, cfdi_uuid, uploaded_at
      FROM attachments
      WHERE expense_id = ? AND (file_type = 'xml' OR file_type = 'pdf')
      ORDER BY uploaded_at DESC
    `).bind(expenseId).all();
    
    return c.json({ 
      success: true,
      cfdi_attachments: cfdiAttachments.results,
      has_valid_cfdi: cfdiAttachments.results.some(a => a.is_cfdi_valid === 1)
    });
  } catch (error) {
    return c.json({ error: 'Failed to get CFDI status' }, 500);
  }
})

// Helper functions for CFDI processing
async function processCfdiXml(file) {
  // In production, this would parse the actual XML file
  // For demo, we'll simulate CFDI data extraction
  
  const cfdiData = {
    version: '4.0',
    uuid: generateUuid(),
    rfc_emisor: 'ABC123456789',
    razon_social_emisor: 'Empresa Emisora S.A. de C.V.',
    rfc_receptor: 'XYZ987654321',
    razon_social_receptor: 'TechMX Solutions S.A. de C.V.',
    fecha: new Date().toISOString(),
    folio: 'A001-' + Math.floor(Math.random() * 100000),
    serie: 'A',
    forma_pago: '04', // Tarjeta de crédito
    metodo_pago: 'PUE', // Pago en una exhibición
    uso_cfdi: 'G03', // Gastos en general
    lugar_expedicion: '06600',
    moneda: 'MXN',
    tipo_cambio: '1.000000',
    conceptos: [
      {
        clave_prod_serv: '84111506',
        no_identificacion: null,
        cantidad: '1.000000',
        clave_unidad: 'ACT',
        unidad: 'Actividad',
        descripcion: 'Servicios de consultoría',
        valor_unitario: '2500.00',
        importe: '2500.00'
      }
    ],
    subtotal: '2500.00',
    iva: '400.00',
    total: '2900.00',
    sello_digital: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ...',
    certificado_sat: 'DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567ABC...',
    fecha_timbrado: new Date().toISOString(),
    no_certificado_sat: '30001000000400002495'
  };
  
  return cfdiData;
}

async function processCfdiPdf(file) {
  // In production, this would extract XML from PDF or parse PDF content
  // For demo, we'll simulate extraction
  
  const cfdiData = {
    version: '4.0',
    uuid: generateUuid(),
    rfc_emisor: 'PDF123456789',
    razon_social_emisor: 'Empresa PDF S.A. de C.V.',
    rfc_receptor: 'TMX123456789',
    razon_social_receptor: 'TechMX Solutions S.A. de C.V.',
    fecha: new Date().toISOString(),
    folio: 'P001-' + Math.floor(Math.random() * 100000),
    serie: 'P',
    forma_pago: '01', // Efectivo
    metodo_pago: 'PUE',
    uso_cfdi: 'G01', // Adquisición de mercancías
    lugar_expedicion: '06600',
    moneda: 'MXN',
    subtotal: '850.00',
    iva: '136.00',
    total: '986.00',
    extracted_from: 'PDF',
    confidence: 0.85
  };
  
  return cfdiData;
}

async function validateWithSat(cfdiData) {
  // In production, this would call the actual SAT web service
  // For demo, we'll simulate validation
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay
  
  const validationChecks = {
    uuid_format: /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(cfdiData.uuid),
    rfc_format: /^[A-Z]{3,4}\d{6}[A-Z0-9]{3}$/.test(cfdiData.rfc_emisor),
    date_valid: cfdiData.fecha_emision ? new Date(cfdiData.fecha_emision) <= new Date() : true,
    amounts_valid: parseFloat(cfdiData.total) > 0,
    version_supported: cfdiData.version ? ['3.3', '4.0'].includes(cfdiData.version) : true
  };
  
  const isValid = Object.values(validationChecks).every(check => check);
  
  return {
    valid: isValid,
    timestamp: new Date().toISOString(),
    checks: validationChecks,
    sat_status: isValid ? 'VIGENTE' : 'INVALIDO',
    cancelable: isValid,
    estado_sat: isValid ? 'Activo' : 'Cancelado',
    mensaje: isValid ? 
      'CFDI válido y vigente en el SAT' : 
      'CFDI inválido o con errores en la estructura'
  };
}

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to extract structured expense data from OCR text
async function extractExpenseDataFromOcr(ocrText) {
  // Simulate AI processing to extract structured data
  const extractedData = {
    amount: null,
    currency: 'MXN',
    date: null,
    vendor: null,
    description: null,
    tax_amount: null,
    payment_method: null,
    invoice_number: null,
    confidence_score: 0.85,
    is_cfdi: false,
    cfdi_uuid: null,
    rfc_emisor: null
  };
  
  // Check if it's a CFDI (Mexican electronic invoice)
  if (ocrText.includes('CFDI') || ocrText.includes('UUID') || ocrText.includes('FOLIO FISCAL')) {
    extractedData.is_cfdi = true;
    extractedData.confidence_score += 0.1;
    
    // Extract UUID
    const uuidMatch = ocrText.match(/UUID[\s:]*([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);
    if (uuidMatch) {
      extractedData.cfdi_uuid = uuidMatch[1];
    }
    
    // Extract Folio Fiscal (alternative UUID location)
    const folioFiscalMatch = ocrText.match(/FOLIO FISCAL[\s:]*([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);
    if (folioFiscalMatch) {
      extractedData.cfdi_uuid = folioFiscalMatch[1];
    }
  }
  
  // Extract amount (look for patterns like $1,234.56 or TOTAL: $amount)
  const amountMatch = ocrText.match(/(?:TOTAL|Total|total)[\s:]*\$?([\d,]+\.?\d*)/i);
  if (amountMatch) {
    extractedData.amount = parseFloat(amountMatch[1].replace(',', ''));
    extractedData.confidence_score += 0.1;
  }
  
  // Extract date
  const dateMatch = ocrText.match(/(?:FECHA|Fecha|fecha)[\s:]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (dateMatch) {
    extractedData.date = dateMatch[1];
    extractedData.confidence_score += 0.05;
  }
  
  // Extract vendor/establishment
  const lines = ocrText.split('\n');
  if (lines.length > 0) {
    // Usually the first non-empty line is the business name
    const businessName = lines.find(line => line.trim() && !line.includes('TICKET') && !line.includes('FACTURA'));
    if (businessName) {
      extractedData.vendor = businessName.trim();
      extractedData.description = `Gasto en ${businessName.trim()}`;
    }
  }
  
  // Extract RFC (Mexican tax ID)
  const rfcMatch = ocrText.match(/RFC[\s:]*([A-Z]{3,4}\d{6}[A-Z0-9]{3})/i);
  if (rfcMatch) {
    extractedData.rfc_emisor = rfcMatch[1];
    extractedData.confidence_score += 0.05;
  }
  
  // Extract payment method
  if (ocrText.toLowerCase().includes('efectivo') || ocrText.toLowerCase().includes('cash')) {
    extractedData.payment_method = 'cash';
  } else if (ocrText.toLowerCase().includes('tarjeta') || ocrText.toLowerCase().includes('card')) {
    extractedData.payment_method = 'credit_card';
  }
  
  // Extract folio/invoice number
  const folioMatch = ocrText.match(/(?:FOLIO|Folio|folio)[\s:]*([A-Z0-9\-]+)/i);
  if (folioMatch) {
    extractedData.invoice_number = folioMatch[1];
  }
  
  // Extract IVA (Mexican VAT)
  const ivaMatch = ocrText.match(/(?:IVA|iva)[\s:]*\$?([\d,]+\.?\d*)/i);
  if (ivaMatch) {
    extractedData.tax_amount = parseFloat(ivaMatch[1].replace(',', ''));
  }
  
  return extractedData;
}

// Get attachments for an expense
app.get('/api/expenses/:id/attachments', async (c) => {
  const { env } = c;
  const expenseId = c.req.param('id');
  
  try {
    const attachments = await env.DB.prepare(`
      SELECT id, file_name, file_type, file_url, file_size, 
             mime_type, ocr_text, uploaded_at
      FROM attachments
      WHERE expense_id = ?
      ORDER BY uploaded_at ASC
    `).bind(expenseId).all();
    
    return c.json({ attachments: attachments.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch attachments' }, 500);
  }
})

// Generate PDF report with company logos and attachments
app.post('/api/reports/pdf', async (c) => {
  const { env } = c;
  
  try {
    const body = await c.req.json();
    const { 
      company_id, 
      date_from, 
      date_to, 
      status, 
      currency,
      user_id,
      expense_type_id,
      format = 'detailed' // detailed, summary, compact
    } = body;
    
    // Build query
    let sql = `
      SELECT e.*, c.name as company_name, c.country, c.logo_url, c.primary_currency,
             u.name as user_name, et.name as expense_type_name, et.category,
             COUNT(a.id) as attachments_count
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      JOIN expense_types et ON e.expense_type_id = et.id
      LEFT JOIN attachments a ON e.id = a.expense_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (company_id) {
      sql += ` AND e.company_id = ?`;
      params.push(company_id);
    }
    
    if (date_from) {
      sql += ` AND e.expense_date >= ?`;
      params.push(date_from);
    }
    
    if (date_to) {
      sql += ` AND e.expense_date <= ?`;
      params.push(date_to);
    }
    
    if (status) {
      sql += ` AND e.status = ?`;
      params.push(status);
    }
    
    if (currency) {
      sql += ` AND e.currency = ?`;
      params.push(currency);
    }
    
    if (user_id) {
      sql += ` AND e.user_id = ?`;
      params.push(user_id);
    }
    
    if (expense_type_id) {
      sql += ` AND e.expense_type_id = ?`;
      params.push(expense_type_id);
    }
    
    sql += ` GROUP BY e.id ORDER BY e.expense_date DESC, e.created_at DESC`;
    
    const expenses = await env.DB.prepare(sql).bind(...params).all();
    
    // Get company for logo
    let company = null;
    if (company_id) {
      company = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(company_id).first();
    }
    
    // Generate PDF HTML content
    const reportHtml = generateReportHtml(expenses.results, company, format, { date_from, date_to, status, currency });
    
    return c.json({ 
      success: true,
      html_content: reportHtml,
      total_expenses: expenses.results.length,
      total_amount: expenses.results.reduce((sum, e) => sum + parseFloat(e.amount_mxn || 0), 0),
      filters: { company_id, date_from, date_to, status, currency, user_id, expense_type_id },
      message: 'PDF content generated successfully'
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to generate PDF report', details: error.message }, 500);
  }
})

// Excel export endpoint
app.post('/api/reports/excel', async (c) => {
  const { env } = c;
  
  try {
    const body = await c.req.json();
    const filters = body;
    
    // Use same query as PDF but return structured data for Excel
    let sql = `
      SELECT e.id, e.description, e.expense_date, e.amount, e.currency, e.exchange_rate, 
             e.amount_mxn, e.payment_method, e.vendor, e.invoice_number, e.status, e.notes,
             e.is_billable, e.created_at,
             c.name as company_name, c.country, c.primary_currency,
             u.name as user_name, u.email as user_email,
             et.name as expense_type_name, et.category
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      JOIN expense_types et ON e.expense_type_id = et.id
      WHERE 1=1
    `;
    
    // Apply same filters as PDF
    const params = [];
    
    if (filters.company_id) {
      sql += ` AND e.company_id = ?`;
      params.push(filters.company_id);
    }
    
    if (filters.date_from) {
      sql += ` AND e.expense_date >= ?`;
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      sql += ` AND e.expense_date <= ?`;
      params.push(filters.date_to);
    }
    
    if (filters.status) {
      sql += ` AND e.status = ?`;
      params.push(filters.status);
    }
    
    sql += ` ORDER BY e.expense_date DESC`;
    
    const expenses = await env.DB.prepare(sql).bind(...params).all();
    
    return c.json({ 
      success: true,
      data: expenses.results,
      total_records: expenses.results.length,
      total_amount_mxn: expenses.results.reduce((sum, e) => sum + parseFloat(e.amount_mxn || 0), 0),
      export_date: new Date().toISOString(),
      filters
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to generate Excel export', details: error.message }, 500);
  }
})

// Import Excel data
app.post('/api/import/excel', async (c) => {
  const { env } = c;
  
  try {
    const body = await c.req.json();
    const { data, mappings, company_id, user_id = 1 } = body;
    
    if (!data || !Array.isArray(data) || !mappings) {
      return c.json({ error: 'Data and column mappings are required' }, 400);
    }
    
    const results = {
      total: data.length,
      imported: 0,
      errors: [],
      skipped: 0
    };
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Map row data using provided mappings
        const expense = {
          company_id: company_id || getMappedValue(row, mappings.company_id),
          expense_type_id: getMappedValue(row, mappings.expense_type_id) || 10, // Default to "Otros Gastos"
          description: getMappedValue(row, mappings.description) || 'Importado desde Excel',
          expense_date: getMappedValue(row, mappings.expense_date) || new Date().toISOString().split('T')[0],
          amount: parseFloat(getMappedValue(row, mappings.amount)) || 0,
          currency: getMappedValue(row, mappings.currency) || 'MXN',
          payment_method: getMappedValue(row, mappings.payment_method) || 'cash',
          vendor: getMappedValue(row, mappings.vendor) || '',
          notes: getMappedValue(row, mappings.notes) || 'Importado desde Excel',
          status: 'pending',
          user_id: user_id,
          created_by: user_id
        };
        
        // Calculate exchange rate and MXN amount
        let exchange_rate = 1.0;
        let amount_mxn = expense.amount;
        
        if (expense.currency === 'USD') {
          exchange_rate = 18.25; // Use current rate
          amount_mxn = expense.amount * exchange_rate;
        } else if (expense.currency === 'EUR') {
          exchange_rate = 20.15; // Use current rate
          amount_mxn = expense.amount * exchange_rate;
        }
        
        // Insert expense
        const result = await env.DB.prepare(`
          INSERT INTO expenses (
            company_id, user_id, expense_type_id, description, expense_date, 
            amount, currency, exchange_rate, amount_mxn, payment_method, 
            vendor, notes, status, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          expense.company_id,
          expense.user_id,
          expense.expense_type_id,
          expense.description,
          expense.expense_date,
          expense.amount,
          expense.currency,
          exchange_rate,
          amount_mxn,
          expense.payment_method,
          expense.vendor,
          expense.notes,
          expense.status,
          expense.created_by
        ).run();
        
        results.imported++;
        
      } catch (rowError) {
        results.errors.push({
          row: i + 1,
          error: rowError.message,
          data: row
        });
      }
    }
    
    return c.json({ 
      success: true,
      results,
      message: `Importación completada: ${results.imported} gastos importados, ${results.errors.length} errores`
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to import Excel data', details: error.message }, 500);
  }
})

// ===== USERS MANAGEMENT API ENDPOINTS =====

// Get all users
app.get('/api/users', async (c) => {
  const { env } = c;
  
  try {
    const users = await env.DB.prepare(`
      SELECT id, email, name, role, active, created_at, updated_at, last_login
      FROM users
      ORDER BY created_at DESC
    `).all();
    
    return c.json({ users: users.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch users', details: error.message }, 500);
  }
})

// Get single user
app.get('/api/users/:id', async (c) => {
  const { env } = c;
  const userId = c.req.param('id');
  
  try {
    const user = await env.DB.prepare(`
      SELECT id, email, name, role, active, created_at, updated_at, last_login
      FROM users
      WHERE id = ?
    `).bind(userId).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Get user's company permissions
    const permissions = await env.DB.prepare(`
      SELECT uc.*, c.name as company_name, c.country
      FROM user_companies uc
      JOIN companies c ON uc.company_id = c.id
      WHERE uc.user_id = ?
    `).bind(userId).all();
    
    return c.json({ 
      ...user,
      company_permissions: permissions.results 
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch user', details: error.message }, 500);
  }
})

// Create new user
app.post('/api/users', async (c) => {
  const { env } = c;
  
  try {
    const userData = await c.req.json();
    const { name, email, password, role, active, company_permissions } = userData;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return c.json({ error: 'Name, email, password, and role are required' }, 400);
    }
    
    // Check if email already exists
    const existingUser = await env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first();
    
    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }
    
    // Create password hash (in production, use proper hashing)
    const passwordHash = `hash_${password}_${Date.now()}`;
    
    // Insert user
    const result = await env.DB.prepare(`
      INSERT INTO users (name, email, password_hash, role, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(name, email, passwordHash, role, active).run();
    
    const userId = result.meta.last_row_id;
    
    // Insert company permissions if provided
    if (company_permissions && Array.isArray(company_permissions)) {
      for (const permission of company_permissions) {
        await env.DB.prepare(`
          INSERT INTO user_companies (user_id, company_id, can_view, can_edit, can_admin)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          userId,
          permission.company_id,
          permission.can_view,
          permission.can_edit,
          permission.can_admin
        ).run();
      }
    }
    
    return c.json({ 
      id: userId,
      message: 'User created successfully'
    });
  } catch (error) {
    return c.json({ error: 'Failed to create user', details: error.message }, 500);
  }
})

// Update user
app.put('/api/users/:id', async (c) => {
  const { env } = c;
  const userId = c.req.param('id');
  
  try {
    const userData = await c.req.json();
    const { name, email, password, role, active, company_permissions } = userData;
    
    // Build update query
    let updateFields = [];
    let params = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      params.push(email);
    }
    if (password) {
      updateFields.push('password_hash = ?');
      params.push(`hash_${password}_${Date.now()}`);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      params.push(role);
    }
    if (active !== undefined) {
      updateFields.push('active = ?');
      params.push(active);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);
    
    // Update user
    await env.DB.prepare(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).bind(...params).run();
    
    // Update company permissions if provided
    if (company_permissions && Array.isArray(company_permissions)) {
      // Delete existing permissions
      await env.DB.prepare(`
        DELETE FROM user_companies WHERE user_id = ?
      `).bind(userId).run();
      
      // Insert new permissions
      for (const permission of company_permissions) {
        await env.DB.prepare(`
          INSERT INTO user_companies (user_id, company_id, can_view, can_edit, can_admin)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          userId,
          permission.company_id,
          permission.can_view,
          permission.can_edit,
          permission.can_admin
        ).run();
      }
    }
    
    return c.json({ message: 'User updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update user', details: error.message }, 500);
  }
})

// Update user status
app.put('/api/users/:id/status', async (c) => {
  const { env } = c;
  const userId = c.req.param('id');
  
  try {
    const { active } = await c.req.json();
    
    await env.DB.prepare(`
      UPDATE users 
      SET active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(active, userId).run();
    
    return c.json({ message: 'User status updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update user status', details: error.message }, 500);
  }
})

// ===== EMPLOYEES MANAGEMENT API ENDPOINTS =====

// Get all employees
app.get('/api/employees', async (c) => {
  const { env } = c;
  
  try {
    const employees = await env.DB.prepare(`
      SELECT 
        e.id, e.name, e.email, e.phone, e.rfc, e.birthdate, e.address,
        e.company_id, e.position, e.department, e.employee_number, 
        e.hire_date, e.manager_id, e.active, e.created_at,
        c.name as company_name, c.country,
        m.name as manager_name,
        COUNT(ex.id) as expense_count
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN employees m ON e.manager_id = m.id
      LEFT JOIN expenses ex ON ex.user_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `).all();
    
    // Add has_expenses flag
    const employeesWithExpenses = employees.results.map(emp => ({
      ...emp,
      has_expenses: emp.expense_count > 0
    }));
    
    return c.json({ employees: employeesWithExpenses });
  } catch (error) {
    return c.json({ error: 'Failed to fetch employees', details: error.message }, 500);
  }
})

// Get single employee
app.get('/api/employees/:id', async (c) => {
  const { env } = c;
  const employeeId = c.req.param('id');
  
  try {
    const employee = await env.DB.prepare(`
      SELECT 
        e.*,
        c.name as company_name, c.country,
        m.name as manager_name
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ?
    `).bind(employeeId).first();
    
    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404);
    }
    
    return c.json(employee);
  } catch (error) {
    return c.json({ error: 'Failed to fetch employee', details: error.message }, 500);
  }
})

// Create new employee
app.post('/api/employees', async (c) => {
  const { env } = c;
  
  try {
    const employeeData = await c.req.json();
    const { 
      name, email, phone, rfc, birthdate, address,
      company_id, position, department, employee_number,
      hire_date, manager_id, active
    } = employeeData;
    
    // Validate required fields
    if (!name || !company_id || !position || !department) {
      return c.json({ error: 'Name, company, position, and department are required' }, 400);
    }
    
    // Insert employee
    const result = await env.DB.prepare(`
      INSERT INTO employees (
        name, email, phone, rfc, birthdate, address,
        company_id, position, department, employee_number,
        hire_date, manager_id, active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      name, email, phone, rfc, birthdate, address,
      company_id, position, department, employee_number,
      hire_date, manager_id, active
    ).run();
    
    return c.json({ 
      id: result.meta.last_row_id,
      message: 'Employee created successfully'
    });
  } catch (error) {
    return c.json({ error: 'Failed to create employee', details: error.message }, 500);
  }
})

// Update employee
app.put('/api/employees/:id', async (c) => {
  const { env } = c;
  const employeeId = c.req.param('id');
  
  try {
    const employeeData = await c.req.json();
    
    // Build update query dynamically
    const fields = [
      'name', 'email', 'phone', 'rfc', 'birthdate', 'address',
      'company_id', 'position', 'department', 'employee_number',
      'hire_date', 'manager_id', 'active'
    ];
    
    let updateFields = [];
    let params = [];
    
    fields.forEach(field => {
      if (employeeData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(employeeData[field]);
      }
    });
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(employeeId);
    
    await env.DB.prepare(`
      UPDATE employees 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).bind(...params).run();
    
    return c.json({ message: 'Employee updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update employee', details: error.message }, 500);
  }
})

// Helper function for Excel import
function getMappedValue(row, mapping) {
  if (!mapping) return null;
  return row[mapping] || null;
}

// Helper function to generate PDF HTML content
function generateReportHtml(expenses, company, format, filters) {
  const today = new Date().toLocaleDateString('es-MX');
  const companyName = company?.name || 'Consolidado Multiempresa';
  const flag = company?.country === 'MX' ? '🇲🇽' : company?.country === 'ES' ? '🇪🇸' : '🌍';
  const logoInitials = companyName.substring(0, 2).toUpperCase();
  
  let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Ejecutivo - ${companyName}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { box-sizing: border-box; }
            
            body { 
                font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
                color: #e5e7eb;
                line-height: 1.6;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px;
                background: rgba(255, 255, 255, 0.95);
                color: #1f2937;
                min-height: 100vh;
            }
            
            .header { 
                position: relative;
                text-align: center; 
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 50px 40px;
                border-radius: 20px;
                margin-bottom: 40px;
                box-shadow: 0 20px 40px rgba(245, 158, 11, 0.3);
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="60" cy="60" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="20" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                border-radius: 20px;
                pointer-events: none;
            }
            
            .logo-container {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 30px;
            }
            
            .logo { 
                width: 120px; 
                height: 120px; 
                margin: 0 auto;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 30px;
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-size: 36px; 
                font-weight: 700;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                box-shadow: 0 15px 30px rgba(0,0,0,0.3);
                position: relative;
                overflow: hidden;
            }
            
            .logo::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                animation: logoShine 3s infinite;
            }
            
            @keyframes logoShine {
                0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            }
            
            .company-title {
                position: relative;
                z-index: 1;
            }
            
            .company-title h1 { 
                font-size: 48px; 
                font-weight: 700; 
                margin: 0 0 10px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                letter-spacing: -1px;
            }
            
            .company-title h2 { 
                font-size: 24px; 
                font-weight: 500; 
                margin: 0 0 20px 0;
                opacity: 0.9;
                letter-spacing: 0.5px;
            }
            
            .company-info { 
                font-size: 16px; 
                font-weight: 500;
                opacity: 0.8;
                border-top: 1px solid rgba(255,255,255,0.2);
                padding-top: 20px;
                margin-top: 20px;
            }
            
            .filters { 
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
                backdrop-filter: blur(10px);
                border: 1px solid rgba(59, 130, 246, 0.2);
                padding: 30px; 
                border-radius: 20px; 
                margin-bottom: 40px;
                box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
            }
            
            .filters h3 {
                color: #1e40af;
                font-size: 20px;
                font-weight: 600;
                margin: 0 0 20px 0;
            }
            
            .filters p {
                margin: 8px 0;
                font-weight: 500;
            }
            
            .summary { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                gap: 25px; 
                margin-bottom: 40px; 
            }
            
            .summary-card { 
                background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8));
                backdrop-filter: blur(20px);
                padding: 30px; 
                border-radius: 20px; 
                text-align: center; 
                border: 1px solid rgba(156, 163, 175, 0.2);
                box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .summary-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #f59e0b, #d97706, #059669);
            }
            
            .summary-number { 
                font-size: 36px; 
                font-weight: 700; 
                color: #1f2937;
                margin-bottom: 8px;
                font-family: 'Inter', monospace;
            }
            
            .summary-label { 
                font-size: 14px; 
                color: #6b7280; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .table-container {
                background: rgba(255,255,255,0.95);
                border-radius: 20px;
                padding: 0;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
                margin-bottom: 40px;
            }
            
            table { 
                width: 100%; 
                border-collapse: collapse;
            }
            
            th { 
                background: linear-gradient(135deg, #1f2937, #374151); 
                color: white;
                font-weight: 600; 
                padding: 20px 15px;
                text-align: left;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            td { 
                padding: 18px 15px; 
                border-bottom: 1px solid #f3f4f6;
                font-weight: 500;
                font-size: 14px;
            }
            
            tr:nth-child(even) {
                background: rgba(249, 250, 251, 0.5);
            }
            
            tr:hover {
                background: rgba(59, 130, 246, 0.05);
            }
            
            .currency-mxn { color: #059669; font-weight: 600; }
            .currency-usd { color: #3b82f6; font-weight: 600; }
            .currency-eur { color: #8b5cf6; font-weight: 600; }
            
            .status-pending { 
                background: linear-gradient(135deg, #fef3c7, #fde68a); 
                color: #92400e; 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .status-approved { 
                background: linear-gradient(135deg, #d1fae5, #a7f3d0); 
                color: #065f46; 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .status-rejected { 
                background: linear-gradient(135deg, #fee2e2, #fca5a5); 
                color: #991b1b; 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .status-reimbursed { 
                background: linear-gradient(135deg, #dbeafe, #93c5fd); 
                color: #1e40af; 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .footer { 
                text-align: center; 
                margin-top: 60px; 
                padding: 40px;
                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                border-radius: 20px;
                border-top: 4px solid #f59e0b;
            }
            
            .footer h3 {
                color: #1f2937;
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 15px;
            }
            
            .footer p {
                font-size: 14px; 
                color: #6b7280; 
                margin: 8px 0;
                font-weight: 500;
            }
            
            .model-4d {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin: 25px 0;
                flex-wrap: wrap;
            }
            
            .model-item {
                text-align: center;
                padding: 15px;
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
                border-radius: 15px;
                border: 1px solid rgba(245, 158, 11, 0.2);
                min-width: 120px;
            }
            
            .model-item h4 {
                color: #f59e0b;
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 5px 0;
            }
            
            .model-item p {
                color: #6b7280;
                font-size: 12px;
                margin: 0;
                font-weight: 600;
            }
            
            @media print { 
                body { margin: 0; background: white; } 
                .container { box-shadow: none; }
                .header { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-container">
                    <div class="logo">${logoInitials}</div>
                </div>
                <div class="company-title">
                    <h1>${flag} ${companyName}</h1>
                    <h2>Reporte Ejecutivo de Gastos y Viáticos</h2>
                    <p class="company-info">
                        Sistema Lyra Expenses • Análisis Inteligente de Gestión Financiera<br>
                        Generado el ${today} • Formato Premium
                    </p>
                </div>
            </div>
            
            <div class="filters">
                <h3>📊 Parámetros del Análisis</h3>
                <p><strong>Período de Análisis:</strong> ${filters.date_from || 'Desde el inicio'} - ${filters.date_to || 'Hasta la fecha actual'}</p>
                ${filters.status ? `<p><strong>Estado de Gastos:</strong> ${filters.status.toUpperCase()}</p>` : ''}
                ${filters.currency ? `<p><strong>Moneda Base:</strong> ${filters.currency}</p>` : ''}
                <p><strong>Fecha de Generación:</strong> ${today} • <strong>Formato:</strong> ${format.toUpperCase()}</p>
            </div>
        </div>
  `;
  
  // Summary calculations
  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount_mxn || 0), 0);
  const totalCount = expenses.length;
  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const currencyBreakdown = expenses.reduce((acc, e) => {
    acc[e.currency] = (acc[e.currency] || 0) + parseFloat(e.amount || 0);
    return acc;
  }, {});
  
  html += `
            <div class="summary">
                <div class="summary-card">
                    <div class="summary-number">${totalCount}</div>
                    <div class="summary-label">Total de Transacciones</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">$${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                    <div class="summary-label">Volumen Total (MXN)</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${pendingCount}</div>
                    <div class="summary-label">Gastos Pendientes</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${Object.keys(currencyBreakdown).length}</div>
                    <div class="summary-label">Monedas Operativas</div>
                </div>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Usuario Responsable</th>
                            <th>Categoría</th>
                            <th>Monto Original</th>
                            <th>Equivalente MXN</th>
                            <th>Status</th>
                            <th>Método de Pago</th>
                        </tr>
                    </thead>
                    <tbody>
  `;
  
  expenses.forEach(expense => {
    html += `
      <tr>
          <td>${new Date(expense.expense_date).toLocaleDateString('es-MX')}</td>
          <td>${expense.description}</td>
          <td>${expense.user_name}</td>
          <td>${expense.expense_type_name}</td>
          <td class="currency-${expense.currency.toLowerCase()}">${expense.currency} $${parseFloat(expense.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
          <td class="currency-mxn">MXN $${parseFloat(expense.amount_mxn).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
          <td><span class="status-${expense.status}">${getStatusText(expense.status)}</span></td>
          <td>${getPaymentMethodText(expense.payment_method)}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
    </table>
                    </tbody>
                </table>
            </div>
            
            <div class="footer">
                <h3>🚀 Sistema Lyra Expenses</h3>
                <p><strong>Plataforma Inteligente de Gestión Financiera Empresarial</strong></p>
                
                <div class="model-4d">
                    <div class="model-item">
                        <h4>Dinero</h4>
                        <p>Control Total</p>
                    </div>
                    <div class="model-item">
                        <h4>Decisión</h4>
                        <p>Análisis Inteligente</p>
                    </div>
                    <div class="model-item">
                        <h4>Dirección</h4>
                        <p>Estrategia Ejecutiva</p>
                    </div>
                    <div class="model-item">
                        <h4>Disciplina</h4>
                        <p>Proceso Optimizado</p>
                    </div>
                </div>
                
                <p><strong>Métricas del Reporte:</strong> ${totalCount} transacciones analizadas • ${Object.keys(currencyBreakdown).length} divisas operativas</p>
                <p><strong>Generado:</strong> ${today} • <strong>Modelo:</strong> ${format.toUpperCase()} • <strong>Sistema:</strong> v2.1 Premium</p>
                <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                    Este reporte ha sido generado automáticamente por el sistema Lyra Expenses.<br>
                    Todos los datos están actualizados en tiempo real y han sido validados por nuestros algoritmos de control financiero.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  return html;
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Pendiente',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'reimbursed': 'Reembolsado',
    'invoiced': 'Facturado'
  };
  return statusMap[status] || status;
}

function getPaymentMethodText(method) {
  const methodMap = {
    'cash': 'Efectivo',
    'credit_card': 'Tarjeta de Crédito',
    'debit_card': 'Tarjeta de Débito',
    'bank_transfer': 'Transferencia',
    'company_card': 'Tarjeta Empresarial',
    'petty_cash': 'Caja Chica'
  };
  return methodMap[method] || method;
}

// ===== FRONTEND ROUTES =====

// Initial setup page for new users
app.get('/setup', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Configuración Inicial - LYRA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 min-h-screen flex items-center justify-center p-4">
        <!-- Setup Container -->
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 backdrop-blur-sm bg-opacity-95">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-4">
                    <i class="fas fa-cogs text-white text-2xl"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800">¡Bienvenido a LYRA!</h1>
                <p class="text-gray-600 mt-2">Configuremos tu acceso a las empresas</p>
            </div>

            <!-- Progress Bar -->
            <div class="mb-8">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Cuenta Creada</span>
                    <span>Configurando Empresas</span>
                    <span>¡Listo!</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full" style="width: 60%"></div>
                </div>
            </div>

            <!-- User Info -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-user text-white"></i>
                    </div>
                    <div>
                        <div id="userName" class="font-semibold text-gray-800">Cargando...</div>
                        <div id="userEmail" class="text-sm text-gray-600">Cargando...</div>
                        <div id="userRole" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block">Cargando...</div>
                    </div>
                </div>
            </div>

            <!-- Company Permissions -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">
                    <i class="fas fa-building mr-2"></i>Acceso a Empresas
                </h2>
                <p class="text-gray-600 mb-6">Selecciona a qué empresas necesitas acceso y define tus permisos:</p>
                
                <div id="companiesContainer" class="space-y-4">
                    <div class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                        <p class="text-gray-500">Cargando empresas disponibles...</p>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 justify-between">
                <button onclick="skipSetup()" class="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium">
                    Omitir por ahora
                </button>
                <div class="flex gap-4">
                    <button onclick="goBack()" class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium">
                        <i class="fas fa-arrow-left mr-2"></i>Volver
                    </button>
                    <button onclick="completeSetup()" class="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-medium">
                        <i class="fas fa-check mr-2"></i>Completar Configuración
                    </button>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="/static/login.js"></script>
        <script>
            let allCompanies = [];
            let currentUser = null;

            document.addEventListener('DOMContentLoaded', function() {
                // Check if user is logged in
                if (!requireAuth()) return;
                
                // Load user data
                currentUser = getCurrentUser();
                if (currentUser) {
                    document.getElementById('userName').textContent = currentUser.name;
                    document.getElementById('userEmail').textContent = currentUser.email;
                    document.getElementById('userRole').textContent = currentUser.is_cfo ? 'CFO - Director Financiero' : 'Usuario';
                }
                
                // Load companies
                loadCompanies();
            });

            async function loadCompanies() {
                try {
                    const response = await fetch('/api/companies', {
                        headers: getAuthHeader()
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        allCompanies = data.companies || [];
                        displayCompanies();
                    } else {
                        throw new Error('Error cargando empresas');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    document.getElementById('companiesContainer').innerHTML = \`
                        <div class="text-center py-8">
                            <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-4"></i>
                            <p class="text-red-600">Error cargando empresas. <button onclick="loadCompanies()" class="text-blue-600 underline">Reintentar</button></p>
                        </div>
                    \`;
                }
            }

            function displayCompanies() {
                const container = document.getElementById('companiesContainer');
                
                if (allCompanies.length === 0) {
                    container.innerHTML = \`
                        <div class="text-center py-8">
                            <i class="fas fa-building text-3xl text-gray-400 mb-4"></i>
                            <p class="text-gray-600">No hay empresas disponibles aún.</p>
                            <button onclick="goToDashboard()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Ir al Dashboard
                            </button>
                        </div>
                    \`;
                    return;
                }

                container.innerHTML = allCompanies.map(company => \`
                    <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <span class="text-2xl mr-3">\${company.country === 'MX' ? '🇲🇽' : '🇪🇸'}</span>
                                <div>
                                    <h3 class="font-semibold text-gray-800">\${company.name}</h3>
                                    <p class="text-sm text-gray-600">\${company.primary_currency} • \${company.country}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-gray-500">Empresa \${company.country === 'MX' ? 'Mexicana' : 'Española'}</div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-sm text-gray-600 mb-3">¿Qué tipo de acceso necesitas?</p>
                            <div class="flex gap-4">
                                <label class="flex items-center text-sm">
                                    <input type="checkbox" name="company-\${company.id}-view" class="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                                    👀 <span class="ml-1">Solo Ver</span>
                                </label>
                                <label class="flex items-center text-sm">
                                    <input type="checkbox" name="company-\${company.id}-edit" class="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                                    ✏️ <span class="ml-1">Crear/Editar</span>
                                </label>
                                \${currentUser && currentUser.is_cfo ? \`
                                <label class="flex items-center text-sm">
                                    <input type="checkbox" name="company-\${company.id}-admin" class="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                                    👑 <span class="ml-1">Administrar</span>
                                </label>
                                \` : ''}
                            </div>
                        </div>
                    </div>
                \`).join('');
            }

            async function completeSetup() {
                // Collect selected permissions
                const permissions = [];
                
                allCompanies.forEach(company => {
                    const canView = document.querySelector(\`input[name="company-\${company.id}-view"]\`)?.checked || false;
                    const canEdit = document.querySelector(\`input[name="company-\${company.id}-edit"]\`)?.checked || false;
                    const canAdmin = document.querySelector(\`input[name="company-\${company.id}-admin"]\`)?.checked || false;
                    
                    if (canView || canEdit || canAdmin) {
                        permissions.push({
                            company_id: company.id,
                            can_view_all: canView || canEdit || canAdmin,
                            can_create: canEdit || canAdmin,
                            can_approve: canAdmin,
                            can_manage_users: canAdmin
                        });
                    }
                });

                if (permissions.length === 0) {
                    alert('Debes seleccionar al menos una empresa y permiso para continuar.');
                    return;
                }

                try {
                    const response = await fetch('/api/user/setup-permissions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...getAuthHeader()
                        },
                        body: JSON.stringify({ permissions })
                    });

                    if (response.ok) {
                        alert('¡Configuración completada exitosamente!');
                        goToDashboard();
                    } else {
                        const error = await response.json();
                        throw new Error(error.error || 'Error configurando permisos');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error completando configuración: ' + error.message);
                }
            }

            function skipSetup() {
                if (confirm('¿Estás seguro de omitir la configuración? Podrás configurar el acceso a empresas más tarde desde la sección de Usuarios.')) {
                    goToDashboard();
                }
            }

            function goBack() {
                window.history.back();
            }

            function goToDashboard() {
                window.location.href = '/';
            }
        </script>
    </body>
    </html>
  `)
})

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - LYRA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 min-h-screen flex items-center justify-center p-4">
        <!-- Login Container -->
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 backdrop-blur-sm bg-opacity-95">
            <!-- Logo and Title -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                    <i class="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <h1 id="formTitle" class="text-2xl font-bold text-gray-800">Iniciar Sesión - LYRA</h1>
                <p class="text-gray-600 mt-2">Sistema de Gestión de Gastos</p>
            </div>

            <!-- Error Message -->
            <div id="errorMessage" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            </div>

            <!-- Success Message -->
            <div id="successMessage" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            </div>

            <!-- Login Form -->
            <form onsubmit="handleAuth(event)" class="space-y-6">
                <!-- Name Field (hidden by default) -->
                <div id="nameField" style="display: none;">
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-user mr-2"></i>Nombre Completo
                    </label>
                    <input type="text" id="name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200" placeholder="Ingresa tu nombre completo">
                </div>

                <!-- Email Field -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-envelope mr-2"></i>Correo Electrónico
                    </label>
                    <input type="email" id="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200" placeholder="tu@empresa.com">
                </div>

                <!-- Password Field -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-lock mr-2"></i>Contraseña
                    </label>
                    <input type="password" id="password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200" placeholder="••••••••">
                </div>

                <!-- Submit Button -->
                <button type="submit" id="submitButton" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium">
                    <i class="fas fa-sign-in-alt mr-2"></i>Iniciar Sesión
                </button>
            </form>

            <!-- Toggle Link -->
            <div id="toggleLink" class="text-center mt-6 text-sm text-gray-600">
                ¿No tienes cuenta? <span class="text-blue-600 cursor-pointer hover:text-blue-800" onclick="toggleAuthMode()">Regístrate</span>
            </div>

            <!-- Footer -->
            <div class="text-center mt-8 text-xs text-gray-500">
                LYRA © 2024 - Sistema de Gestión de Gastos Empresarial
            </div>
        </div>

        <script src="/static/login.js"></script>
    </body>
    </html>
  `)
})

// Main dashboard - DASHBOARD MORADO SUSTITUIDO
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="es">
<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestión de Gastos Premium</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <link href="/static/styles.css" rel="stylesheet">
        <style>
        body {
            background: linear-gradient(135deg, 
                var(--color-bg-primary) 0%, 
                var(--color-bg-secondary) 50%, 
                var(--color-bg-tertiary) 100%);
            min-height: 100vh;
            color: var(--color-text-primary);
        }
        
        .premium-button {
            background: var(--gradient-emerald);
            border: 1px solid var(--color-glass-border);
            border-radius: var(--radius-md);
            padding: 12px 24px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }
        
        .premium-button:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-glow);
            background: var(--gradient-gold);
        }
        </style>
    </head>
<body>
    <!-- Authentication Check -->
    <script>
        // Check authentication on page load
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '/login';
        } else {
            // Verify token with server
            fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => {
                if (!response.ok) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                }
                return response.json();
            })
            .then(data => {
                if (data.user) {
                    localStorage.setItem('user_data', JSON.stringify(data.user));
                    // Update UI based on user role
                    updateUIForUser(data.user);
                    // Check if user needs setup
                    checkUserSetup();
                }
            })
            .catch(error => {
                console.error('Auth verification error:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
            });
        }
        
        function updateUIForUser(user) {
            // Show user info in header
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.innerHTML = \`
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <div class="font-semibold text-white">\${user.name}</div>
                            <div class="text-sm text-gray-300">\${user.is_cfo ? 'CFO' : 'Usuario'}</div>
                        </div>
                        <button onclick="logout()" class="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-sign-out-alt"></i> Salir
                        </button>
                    </div>
                \`;
            }
        }
        
        function logout() {
            const token = localStorage.getItem('auth_token');
            if (token) {
                fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }).finally(() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                });
            }
        }
        
        function checkUserSetup() {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            
            fetch('/api/user/needs-setup', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.needsSetup && !data.user.is_cfo) {
                    // Non-CFO users who need setup should go to setup page
                    if (confirm('Necesitas configurar tu acceso a las empresas. ¿Deseas hacerlo ahora?')) {
                        window.location.href = '/setup';
                    }
                }
            })
            .catch(error => {
                console.error('Error checking user setup:', error);
            });
        }
    </script>

    <!-- Navigation Header (estilo gastos) -->
    <div class="container mx-auto px-6 py-8">
        <div class="glass-panel p-8 mb-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-4xl font-bold text-accent-gold">
                        <i class="fas fa-chart-pie mr-4"></i>
                        Dashboard Analítico - Lyra Expenses
                    </h1>
                    <p class="text-text-secondary text-lg mt-2">
                        Sistema ejecutivo de control financiero empresarial
                    </p>
                </div>
                <div id="userInfo" class="text-white">
                    <!-- User info will be populated by JavaScript -->
                </div>
            </div>
            <div class="flex gap-4 justify-center">
                <a href="/" class="premium-button style="background: var(--gradient-gold);"">
                    <i class="fas fa-chart-pie mr-3"></i>Dashboard
                </a>
                <a href="/companies" class="premium-button ">
                    <i class="fas fa-building mr-3"></i>Empresas
                </a>
                <a href="/users" class="premium-button ">
                    <i class="fas fa-users mr-3"></i>Usuarios
                </a>
                <a href="/employees" class="premium-button ">
                    <i class="fas fa-user-tie mr-3"></i>Empleados
                </a>
                <a href="/expenses" class="premium-button ">
                    <i class="fas fa-receipt mr-3"></i>Gastos
                </a>
            </div>
        </div>
    </div>
    
    <!-- Contenido Principal -->
   
 <div class="container mx-auto px-6 pb-8">
        <!-- Dashboard Content con estilo gastos -->
        <div class="glass-panel p-6 mb-8">
            <h3 class="text-xl font-bold text-accent-gold flex items-center mb-4">
                <i class="fas fa-chart-pie mr-3"></i>
                KPIs Principales
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="glass-panel p-4 text-center">
                    <div id="totalAmount" class="text-3xl font-bold text-accent-gold">Cargando...</div>
                    <div class="text-text-secondary text-sm">Total Gastos (MXN)</div>
                </div>
                <div class="glass-panel p-4 text-center">
                    <div id="totalExpenses" class="text-3xl font-bold text-accent-emerald">-</div>
                    <div class="text-text-secondary text-sm">Total Gastos</div>
                </div>
                <div class="glass-panel p-4 text-center">
                    <div id="pendingExpenses" class="text-3xl font-bold text-accent-gold">-</div>
                    <div class="text-text-secondary text-sm">Pendiente Autorización</div>
                </div>
                <div class="glass-panel p-4 text-center">
                    <div id="approvalRate" class="text-3xl font-bold text-accent-emerald">-</div>
                    <div class="text-text-secondary text-sm">% Aprobación</div>
                </div>
            </div>
        </div>

        <!-- Filtros de Gasto (sidebar style) -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="lg:col-span-1">
                <div class="glass-panel p-6">
                    <h3 class="text-xl font-bold text-accent-gold mb-6">
                        <i class="fas fa-filter mr-2"></i>Ficha de Gasto
                    </h3>
                    
                    <div class="space-y-4">
                        <!-- Filtro por Fecha -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">📅 Fecha</label>
                            <div class="flex gap-2">
                                <input type="date" id="filter-date-from" class="flex-1 p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none text-sm">
                                <input type="date" id="filter-date-to" class="flex-1 p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none text-sm">
                            </div>
                        </div>

                        <!-- Filtro por Empresa -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">🏢 Empresa</label>
                            <select id="companyFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todas las empresas</option>
                            </select>
                        </div>

                        <!-- Filtro por Usuario -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">👤 Usuario</label>
                            <select id="userFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todos los usuarios</option>
                                <option value="1">👑 Alejandro Rodríguez</option>
                                <option value="2">✏️ María López</option>
                                <option value="3">⭐ Carlos Martínez</option>
                                <option value="4">✏️ Ana García</option>
                                <option value="5">⭐ Pedro Sánchez</option>
                                <option value="6">✏️ Elena Torres</option>
                            </select>
                        </div>

                        <!-- Filtro por Tipo -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">🏷️ Tipo</label>
                            <select id="typeFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todos los tipos</option>
                                <option value="G">💼 Gastos</option>
                                <option value="V">✈️ Viáticos</option>
                            </select>
                        </div>

                        <!-- Filtro por Categoría -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">📂 Categoría</label>
                            <select id="categoryFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todas las categorías</option>
                                <option value="meals">🍽️ Comidas</option>
                                <option value="transport">🚗 Transporte</option>
                                <option value="accommodation">🏨 Hospedaje</option>
                                <option value="travel">✈️ Viajes</option>
                                <option value="supplies">📋 Suministros</option>
                                <option value="services">💻 Servicios</option>
                                <option value="general">📦 General</option>
                            </select>
                        </div>

                        <!-- Filtro por Status -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">📊 Status</label>
                            <select id="statusFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todos los estados</option>
                                <option value="pending">⏳ Pendiente</option>
                                <option value="approved">✅ Aprobado</option>
                                <option value="rejected">❌ Rechazado</option>
                                <option value="more_info">❓ Pedir Más Información</option>
                                <option value="reimbursed">💰 Reembolsado</option>
                                <option value="invoiced">📄 Facturado</option>
                            </select>
                        </div>

                        <!-- Filtro por Moneda -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">💱 Moneda</label>
                            <select id="currencyFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todas las monedas</option>
                                <option value="MXN">🇲🇽 MXN</option>
                                <option value="USD">🇺🇸 USD</option>
                                <option value="EUR">🇪🇺 EUR</option>
                            </select>
                        </div>

                        <button id="applyFilters" class="w-full premium-button">
                            <i class="fas fa-search mr-2"></i>Aplicar Filtros
                        </button>
                        
                        <button id="clearFilters" class="w-full premium-button" style="background: var(--gradient-accent);">
                            <i class="fas fa-broom mr-2"></i>Limpiar Filtros
                        </button>
                    </div></div>
            </div>

            <div class="lg:col-span-3">
                <div class="glass-panel p-6">
                    <h3 class="text-xl font-bold text-accent-gold mb-4">
                        <i class="fas fa-chart-pie mr-3"></i>Distribución por Estado
                    </h3>
                    <div class="h-96 flex items-center justify-center">
                        <canvas id="statusChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <div class="glass-panel p-6 mt-8">
                    <h3 class="text-xl font-bold text-accent-gold mb-4">
                        <i class="fas fa-table mr-3"></i>Tabla de Gastos Recientes
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="border-b border-glass-border">
                                    <th class="text-left py-3 px-4 text-accent-gold">Descripción</th>
                                    <th class="text-left py-3 px-4 text-accent-gold">Empresa</th>
                                    <th class="text-left py-3 px-4 text-accent-gold">Monto</th>
                                    <th class="text-left py-3 px-4 text-accent-gold">Estado</th>
                                    <th class="text-left py-3 px-4 text-accent-gold">Fecha</th>
                                </tr>
                            </thead>
                            <tbody id="recentExpensesTable">
                                <tr>
                                    <td colspan="5" class="py-8 text-center text-text-secondary">
                                        <i class="fas fa-spinner fa-spin mr-2"></i>Cargando gastos recientes...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Botones de Acción Dashboard -->
                    <div class="mt-6 flex gap-4 justify-end">
                        <button onclick="printDashboardExpenses()" class="premium-button" style="background: var(--gradient-accent);">
                            <i class="fas fa-print mr-2"></i>Imprimir Lista
                        </button>
                        <button onclick="generateDashboardPDF()" class="premium-button">
                            <i class="fas fa-file-pdf mr-2"></i>Generar PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal Detalle de Gasto -->
    <div id="expenseDetailModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center">
        <div class="glass-panel p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-bold text-accent-gold flex items-center">
                    <i class="fas fa-receipt mr-3"></i>Detalle del Gasto
                </h2>
                <button onclick="closeExpenseModal()" class="text-text-secondary hover:text-accent-gold transition-colors">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <!-- Información Principal del Gasto -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Columna Izquierda -->
                <div class="space-y-6">
                    <div class="glass-panel p-6">
                        <h3 class="text-lg font-semibold text-accent-gold mb-4">📋 Información General</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">Descripción</label>
                                <p id="modal-description" class="text-text-primary font-medium text-lg"></p>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">📅 Fecha</label>
                                    <p id="modal-date" class="text-text-primary"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">🏷️ Tipo</label>
                                    <p id="modal-type" class="text-text-primary"></p>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">🏢 Empresa</label>
                                <p id="modal-company" class="text-text-primary font-medium"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">👤 Usuario Responsable</label>
                                <p id="modal-user" class="text-text-primary"></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="glass-panel p-6">
                        <h3 class="text-lg font-semibold text-accent-gold mb-4">💰 Información Financiera</h3>
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">💵 Monto Original</label>
                                    <p id="modal-amount" class="text-accent-emerald font-bold text-xl"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">💱 Moneda</label>
                                    <p id="modal-currency" class="text-text-primary"></p>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">🇲🇽 Equivalente MXN</label>
                                <p id="modal-amount-mxn" class="text-accent-emerald font-bold text-lg"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">💳 Método de Pago</label>
                                <p id="modal-payment-method" class="text-text-primary"></p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Columna Derecha -->
                <div class="space-y-6">
                    <div class="glass-panel p-6">
                        <h3 class="text-lg font-semibold text-accent-gold mb-4">🏪 Detalles Comerciales</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">🏪 Proveedor/Lugar</label>
                                <p id="modal-vendor" class="text-text-primary"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">📄 Número de Factura</label>
                                <p id="modal-invoice" class="text-text-primary"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">📂 Categoría</label>
                                <p id="modal-category" class="text-text-primary"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">📊 Estado Actual</label>
                                <p id="modal-status" class="font-bold"></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="glass-panel p-6">
                        <h3 class="text-lg font-semibold text-accent-gold mb-4">📝 Observaciones</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">Notas</label>
                                <p id="modal-notes" class="text-text-primary text-sm bg-glass p-3 rounded-lg min-h-[60px]"></p>
                            </div>
                            <div class="text-sm">
                                <div>
                                    <label class="block text-xs font-medium text-accent-gold mb-1">Creado</label>
                                    <p id="modal-created" class="text-text-secondary"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Acciones del Gasto -->
            <div class="border-t border-glass-border pt-6">
                <h3 class="text-lg font-semibold text-accent-gold mb-4">⚡ Acciones</h3>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onclick="authorizeExpense()" class="premium-button bg-green-600 hover:bg-green-700">
                        <i class="fas fa-check mr-2"></i>Autorizar
                    </button>
                    <button onclick="rejectExpense()" class="premium-button bg-red-600 hover:bg-red-700">
                        <i class="fas fa-times mr-2"></i>Rechazar
                    </button>
                    <button onclick="requestMoreInfo()" class="premium-button bg-blue-600 hover:bg-blue-700">
                        <i class="fas fa-question-circle mr-2"></i>Pedir Info
                    </button>
                    <button onclick="setPendingExpense()" class="premium-button bg-yellow-600 hover:bg-yellow-700">
                        <i class="fas fa-clock mr-2"></i>Dejar Pendiente
                    </button>
                </div>
            </div>
        </div>
    </div>

    
    <script>
        // Variables globales para filtros y gráfica
        let currentFilters = {};
        let statusChart = null;
        
        // Inicializar al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            initializeEventListeners();
            loadCompanies();
            initializeChart();
            loadDashboardData();
        });
        
        // Event listeners para filtros
        function initializeEventListeners() {
            const applyBtn = document.getElementById('applyFilters');
            const clearBtn = document.getElementById('clearFilters');
            
            if (applyBtn) {
                applyBtn.addEventListener('click', applyFilters);
            }
            
            if (clearBtn) {
                clearBtn.addEventListener('click', clearFilters);
            }
        }
        
        // Aplicar filtros
        function applyFilters() {
            const dateFromFilter = document.getElementById('filter-date-from');
            const dateToFilter = document.getElementById('filter-date-to');
            const companyFilter = document.getElementById('companyFilter');
            const userFilter = document.getElementById('userFilter');
            const typeFilter = document.getElementById('typeFilter');
            const categoryFilter = document.getElementById('categoryFilter');
            const statusFilter = document.getElementById('statusFilter');
            const currencyFilter = document.getElementById('currencyFilter');
            
            currentFilters = {
                date_from: dateFromFilter ? dateFromFilter.value : '',
                date_to: dateToFilter ? dateToFilter.value : '',
                company_id: companyFilter ? companyFilter.value : '',
                user_id: userFilter ? userFilter.value : '',
                type: typeFilter ? typeFilter.value : '',
                category: categoryFilter ? categoryFilter.value : '',
                status: statusFilter ? statusFilter.value : '',
                currency: currencyFilter ? currencyFilter.value : ''
            };
            
            console.log('🔍 Aplicando filtros:', currentFilters);
            
            // Mostrar feedback visual
            const applyBtn = document.getElementById('applyFilters');
            if (applyBtn) {
                applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Filtrando...';
                setTimeout(() => {
                    applyBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Aplicar Filtros';
                }, 1000);
            }
            
            loadDashboardData();
        }
        
        // Limpiar filtros
        function clearFilters() {
            const dateFromFilter = document.getElementById('filter-date-from');
            const dateToFilter = document.getElementById('filter-date-to');
            const companyFilter = document.getElementById('companyFilter');
            const userFilter = document.getElementById('userFilter');
            const typeFilter = document.getElementById('typeFilter');
            const categoryFilter = document.getElementById('categoryFilter');
            const statusFilter = document.getElementById('statusFilter');
            const currencyFilter = document.getElementById('currencyFilter');
            
            if (dateFromFilter) dateFromFilter.value = '';
            if (dateToFilter) dateToFilter.value = '';
            if (companyFilter) companyFilter.value = '';
            if (userFilter) userFilter.value = '';
            if (typeFilter) typeFilter.value = '';
            if (categoryFilter) categoryFilter.value = '';
            if (statusFilter) statusFilter.value = '';
            if (currencyFilter) currencyFilter.value = '';
            
            currentFilters = {};
            
            console.log('🧹 Filtros limpiados');
            
            // Mostrar feedback visual
            const clearBtn = document.getElementById('clearFilters');
            if (clearBtn) {
                clearBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Limpiando...';
                setTimeout(() => {
                    clearBtn.innerHTML = '<i class="fas fa-broom mr-2"></i>Limpiar Filtros';
                }, 1000);
            }
            
            loadDashboardData();
        }
        
        // Cargar empresas para el filtro
        function loadCompanies() {
            fetch('/api/companies')
                .then(response => response.json())
                .then(data => {
                    const companySelect = document.getElementById('companyFilter');
                    if (companySelect && data.companies) {
                        // Limpiar opciones existentes excepto la primera
                        companySelect.innerHTML = '<option value="">Todas las empresas</option>';
                        
                        data.companies.forEach(company => {
                            const option = document.createElement('option');
                            option.value = company.id;
                            const flag = company.country === 'MX' ? '🇲🇽' : company.country === 'ES' ? '🇪🇸' : '🌍';
                            option.textContent = flag + ' ' + company.name;
                            companySelect.appendChild(option);
                        });
                        
                        console.log('✅ Empresas cargadas en filtro:', data.companies.length);
                    }
                })
                .catch(error => {
                    console.error('❌ Error cargando empresas:', error);
                });
        }
        
        // Cargar datos del dashboard
        function loadDashboardData() {
            console.log('📊 Cargando datos del dashboard con filtros:', currentFilters);
            
            // Construir query string con filtros
            const queryParams = new URLSearchParams();
            Object.keys(currentFilters).forEach(key => {
                if (currentFilters[key]) {
                    queryParams.append(key, currentFilters[key]);
                }
            });
            
            // Cargar métricas del dashboard
            fetch('/api/dashboard/metrics?' + queryParams.toString())
                .then(response => response.json())
                .then(metrics => {
                    updateDashboardMetrics(metrics);
                })
                .catch(error => {
                    console.error('❌ Error cargando métricas:', error);
                });
                
            // Cargar gastos recientes
            fetch('/api/expenses?' + queryParams.toString())
                .then(response => response.json())
                .then(expenses => {
                    updateExpensesTable(expenses);
                })
                .catch(error => {
                    console.error('❌ Error cargando gastos:', error);
                });
        }
        
        // Actualizar métricas en el dashboard
        function updateDashboardMetrics(data) {
            console.log('📊 Datos recibidos para métricas:', data);
            
            // Calcular total en MXN de todos los gastos
            let totalAmountMxn = 0;
            let totalExpenses = 0;
            let pendingCount = 0;
            let approvedCount = 0;
            
            if (data.status_metrics && data.status_metrics.length > 0) {
                data.status_metrics.forEach(status => {
                    totalAmountMxn += parseFloat(status.total_mxn || 0);
                    totalExpenses += parseInt(status.count || 0);
                    
                    if (status.status === 'pending') {
                        pendingCount += parseInt(status.count || 0);
                    }
                    if (status.status === 'approved') {
                        approvedCount += parseInt(status.count || 0);
                    }
                });
            }
            
            // Calcular porcentaje de aprobación
            const approvalRate = totalExpenses > 0 ? Math.round((approvedCount / totalExpenses) * 100) : 0;
            
            // Actualizar elementos del DOM
            const totalAmountEl = document.getElementById('totalAmount');
            const totalExpensesEl = document.getElementById('totalExpenses');
            const pendingExpensesEl = document.getElementById('pendingExpenses');
            const approvalRateEl = document.getElementById('approvalRate');
            
            if (totalAmountEl) {
                totalAmountEl.textContent = '$' + totalAmountMxn.toLocaleString('es-MX', { minimumFractionDigits: 2 });
            }
            
            if (totalExpensesEl) {
                totalExpensesEl.textContent = totalExpenses;
            }
            
            if (pendingExpensesEl) {
                pendingExpensesEl.textContent = pendingCount;
            }
            
            if (approvalRateEl) {
                approvalRateEl.textContent = approvalRate + '%';
            }
            
            // Actualizar también la gráfica de pie
            updateChart(data);
            
            console.log('✅ KPIs actualizados:', {
                totalAmountMxn,
                totalExpenses,
                pendingCount,
                approvalRate
            });
        }
        
        // Actualizar tabla de gastos
        function updateExpensesTable(data) {
            const tableBody = document.getElementById('recentExpensesTable');
            if (!tableBody) {
                console.error('❌ No se encontró el elemento recentExpensesTable');
                return;
            }
            
            const expenses = data.expenses || [];
            
            if (expenses.length === 0) {
                tableBody.innerHTML = 
                    '<tr>' +
                        '<td colspan="5" class="py-8 text-center text-text-secondary">' +
                            '<i class="fas fa-info-circle mr-2"></i>' +
                            'No se encontraron gastos con los filtros aplicados' +
                        '</td>' +
                    '</tr>';
                return;
            }
            
            // Generar filas de la tabla (limitar a 10 gastos recientes)
            const rows = expenses.slice(0, 10).map((expense, index) => 
                '<tr class="border-b border-glass-border hover:bg-glass transition-colors cursor-pointer" onclick="openExpenseModal(' + 
                    "expenseData[" + index + "]" + ')">' +
                    '<td class="py-3 px-4 text-text-primary">' + (expense.description || 'Sin descripción') + '</td>' +
                    '<td class="py-3 px-4 text-text-secondary">' + 
                        (expense.company_name || 'N/A') + 
                        (expense.country ? ' ' + (expense.country === 'MX' ? '🇲🇽' : expense.country === 'ES' ? '🇪🇸' : '') : '') +
                    '</td>' +
                    '<td class="py-3 px-4 text-accent-emerald font-bold">$' +
                        parseFloat(expense.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 }) + 
                        ' ' + (expense.currency || 'MXN') +
                    '</td>' +
                    '<td class="py-3 px-4">' +
                        '<span class="status-badge status-' + expense.status + '">' +
                            getStatusIcon(expense.status) + ' ' + getStatusText(expense.status) +
                        '</span>' +
                    '</td>' +
                    '<td class="py-3 px-4 text-text-secondary">' +
                        new Date(expense.expense_date || expense.created_at).toLocaleDateString('es-ES') +
                    '</td>' +
                '</tr>'
            ).join('');
            
            tableBody.innerHTML = rows;
            
            // Hacer los datos disponibles globalmente para el modal
            window.expenseData = expenses.slice(0, 10);
            
            console.log('✅ Tabla actualizada con', expenses.length, 'gastos (mostrando max 10)');
        }
        
        // Helper functions para estados
        function getStatusClass(status) {
            const classes = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'approved': 'bg-green-100 text-green-800',
                'rejected': 'bg-red-100 text-red-800',
                'reimbursed': 'bg-blue-100 text-blue-800',
                'more_info': 'bg-purple-100 text-purple-800',
                'invoiced': 'bg-indigo-100 text-indigo-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
        
        function getStatusText(status) {
            const texts = {
                'pending': 'Pendiente',
                'approved': 'Aprobado', 
                'rejected': 'Rechazado',
                'reimbursed': 'Reembolsado',
                'more_info': 'Pedir Más Info',
                'invoiced': 'Facturado'
            };
            return texts[status] || status;
        }
        
        // Función para íconos de estatus (igual que en sección Gastos)
        function getStatusIcon(status) {
            const icons = {
                'pending': '⏳',
                'approved': '✅',
                'rejected': '❌',
                'more_info': '❓',
                'reimbursed': '💰',
                'invoiced': '📄'
            };
            return icons[status] || '📋';
        }
        
        // Inicializar gráfica de pie
        function initializeChart() {
            const ctx = document.getElementById('statusChart');
            if (!ctx) {
                console.error('❌ No se encontró el canvas para la gráfica');
                return;
            }
            
            statusChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Cargando...'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#e5e7eb'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return label + ': ' + value + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfica de pie inicializada');
        }
        
        // Actualizar gráfica de pie con datos reales
        function updateChart(data) {
            if (!statusChart || !data.status_metrics) {
                console.log('⚠️ Gráfica o datos no disponibles');
                return;
            }
            
            const statusData = data.status_metrics;
            const labels = [];
            const values = [];
            const colors = [];
            
            const statusConfig = {
                'pending': { 
                    label: '⏳ Pendiente', 
                    color: '#f59e0b' 
                },
                'approved': { 
                    label: '✅ Aprobado', 
                    color: '#10b981' 
                },
                'rejected': { 
                    label: '❌ Rechazado', 
                    color: '#ef4444' 
                },
                'reimbursed': { 
                    label: '💰 Reembolsado', 
                    color: '#3b82f6' 
                },
                'invoiced': { 
                    label: '📄 Facturado', 
                    color: '#8b5cf6' 
                }
            };
            
            statusData.forEach(status => {
                const config = statusConfig[status.status] || { 
                    label: status.status, 
                    color: '#6b7280' 
                };
                labels.push(config.label);
                values.push(status.count);
                colors.push(config.color);
            });
            
            // Actualizar datos de la gráfica
            statusChart.data.labels = labels;
            statusChart.data.datasets[0].data = values;
            statusChart.data.datasets[0].backgroundColor = colors;
            
            // Animar la actualización
            statusChart.update('active');
            
            console.log('📊 Gráfica actualizada:', { labels, values });
        }
        
        // Funciones de Impresión y PDF
        function printDashboardExpenses() {
            const printContent = document.querySelector('#recentExpensesTable').parentElement;
            const originalContent = document.body.innerHTML;
            
            const printWindow = window.open('', '_blank');
            const htmlContent = 
                '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                    '<title>Gastos Recientes - Dashboard</title>' +
                    '<style>' +
                        'body { font-family: Arial, sans-serif; margin: 20px; }' +
                        'table { width: 100%; border-collapse: collapse; margin-top: 20px; }' +
                        'th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }' +
                        'th { background-color: #f4f4f4; font-weight: bold; }' +
                        '.header { text-align: center; margin-bottom: 30px; }' +
                        '.date { color: #666; }' +
                    '</style>' +
                '</head>' +
                '<body>' +
                    '<div class="header">' +
                        '<h1>📊 Gastos Recientes - Dashboard</h1>' +
                        '<p class="date">Generado el: ' + new Date().toLocaleDateString('es-ES') + ' a las ' + new Date().toLocaleTimeString('es-ES') + '</p>' +
                    '</div>' +
                    printContent.outerHTML +
                '</body>' +
                '</html>';
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        }
        
        function generateDashboardPDF() {
            const queryParams = new URLSearchParams(currentFilters).toString();
            
            fetch('/api/reports/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...currentFilters,
                    format: 'dashboard_summary',
                    title: 'Reporte Dashboard - Gastos Recientes'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Crear y descargar PDF
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(data.html_content);
                    printWindow.document.close();
                    printWindow.print();
                    printWindow.close();
                    
                    console.log('✅ PDF generado exitosamente');
                } else {
                    alert('Error al generar PDF: ' + (data.error || 'Error desconocido'));
                }
            })
            .catch(error => {
                console.error('❌ Error generando PDF:', error);
                alert('Error al generar el PDF. Por favor intente nuevamente.');
            });
        }
        
        // Variables para el modal
        let currentExpenseId = null;
        
        // Funciones del Modal de Detalle
        function openExpenseModal(expense) {
            currentExpenseId = expense.id;
            
            // Llenar información general
            document.getElementById('modal-description').textContent = expense.description || 'Sin descripción';
            document.getElementById('modal-date').textContent = new Date(expense.expense_date).toLocaleDateString('es-ES');
            document.getElementById('modal-type').textContent = expense.expense_type_name || 'No especificado';
            document.getElementById('modal-company').textContent = (expense.country === 'MX' ? '🇲🇽 ' : '🇪🇸 ') + (expense.company_name || 'Sin empresa');
            document.getElementById('modal-user').textContent = expense.user_name || 'Usuario desconocido';
            
            // Llenar información financiera
            document.getElementById('modal-amount').textContent = '$' + parseFloat(expense.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
            document.getElementById('modal-currency').textContent = expense.currency || 'MXN';
            document.getElementById('modal-amount-mxn').textContent = '$' + parseFloat(expense.amount_mxn || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 }) + ' MXN';
            document.getElementById('modal-payment-method').textContent = getPaymentMethodText(expense.payment_method);
            
            // Llenar detalles comerciales
            document.getElementById('modal-vendor').textContent = expense.vendor || 'No especificado';
            document.getElementById('modal-invoice').textContent = expense.invoice_number || 'Sin número';
            document.getElementById('modal-category').textContent = getCategoryText(expense.expense_type_name);
            
            const statusElement = document.getElementById('modal-status');
            statusElement.textContent = getStatusText(expense.status);
            statusElement.className = 'font-bold ' + getStatusColorClass(expense.status);
            
            // Llenar observaciones
            document.getElementById('modal-notes').textContent = expense.description || 'Sin descripción disponible';
            document.getElementById('modal-created').textContent = new Date(expense.created_at).toLocaleDateString('es-ES');
            
            // Mostrar modal
            document.getElementById('expenseDetailModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            console.log('📋 Modal abierto para gasto ID:', expense.id);
        }
        
        function closeExpenseModal() {
            document.getElementById('expenseDetailModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
            currentExpenseId = null;
        }
        
        // Función para formatear las notas GUSBit de manera legible
        function formatGusbitNotes(notes) {
            if (!notes || (!notes.includes('REGISTRO GUSBIT NUEVO ORDEN') && !notes.includes('REGISTRO GUSBIT COMPLETO'))) {
                return '<div class="text-text-secondary italic">Sin información detallada de registro GUSBit disponible</div>';
            }
            
            // Extraer la información línea por línea
            const lines = notes.split('\\n').filter(line => line.trim() !== '' && !line.includes('═══'));
            
            let formattedHtml = '<div class="space-y-3">';
            formattedHtml += '<div class="text-accent-gold font-semibold mb-3">📋 Información Completa del Registro GUSBit:</div>';
            
            lines.forEach((line, index) => {
                if (index === 0) return; // Skip the header line
                
                const cleanLine = line.trim();
                if (cleanLine && cleanLine.includes(':')) {
                    const [label, value] = cleanLine.split(':', 2);
                    const fieldNumber = label.match(/^\\d+\\./);
                    
                    if (fieldNumber) {
                        const fieldName = label.replace(/^\\d+\\.\\s*/, '').trim();
                        const fieldValue = value.trim();
                        
                        formattedHtml += \`
                            <div class="flex justify-between items-center py-2 px-3 bg-glass rounded-lg">
                                <span class="text-accent-gold text-sm font-medium">\${getFieldIcon(fieldName)} \${fieldName}:</span>
                                <span class="text-text-primary font-semibold">\${fieldValue}</span>
                            </div>
                        \`;
                    }
                }
            });
            
            formattedHtml += '</div>';
            return formattedHtml;
        }
        
        // Función helper para obtener iconos por campo
        function getFieldIcon(fieldName) {
            const icons = {
                'Fecha': '📅',
                'Empresa': '🏢',
                'Usuario': '👤',
                'Tipo': '🏷️',
                'Categoría': '📂',
                'Destino': '🎯',
                'Lugar/Negocio': '📍',
                'Lugar': '📍',
                'Descripción': '📝',
                'Monto': '💰',
                'Moneda': '💱',
                'Forma de Pago': '💳',
                'Quién lo Capturó': '👨‍💻',
                'Status': '📊'
            };
            
            // Buscar coincidencia exacta o parcial
            for (const [key, icon] of Object.entries(icons)) {
                if (fieldName.includes(key) || key.includes(fieldName)) {
                    return icon;
                }
            }
            
            return '📋'; // Icono por defecto
        }
        
        // Funciones de acciones del gasto
        function authorizeExpense() {
            updateExpenseStatus('approved', '✅ Gasto autorizado exitosamente');
        }
        
        function rejectExpense() {
            updateExpenseStatus('rejected', '❌ Gasto rechazado');
        }
        
        function requestMoreInfo() {
            updateExpenseStatus('more_info', '❓ Se solicitó más información');
        }
        
        function setPendingExpense() {
            updateExpenseStatus('pending', '⏳ Gasto marcado como pendiente');
        }
        
        function updateExpenseStatus(newStatus, message) {
            if (!currentExpenseId) return;
            
            fetch('/api/expenses/' + currentExpenseId + '/status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(message);
                    closeExpenseModal();
                    loadDashboardData(); // Recargar datos
                } else {
                    alert('Error: ' + (data.error || 'No se pudo actualizar el estado'));
                }
            })
            .catch(error => {
                console.error('❌ Error actualizando estado:', error);
                alert('Error de conexión. Intente nuevamente.');
            });
        }
        
        // Helper functions para el modal
        function getPaymentMethodText(method) {
            const methods = {
                'cash': '💵 Efectivo',
                'credit_card': '💳 Tarjeta de Crédito',
                'debit_card': '💳 Tarjeta de Débito',
                'bank_transfer': '🏦 Transferencia',
                'company_card': '🏢 Tarjeta Empresa',
                'petty_cash': '💰 Caja Chica'
            };
            return methods[method] || method || 'No especificado';
        }
        
        function getCategoryText(typeName) {
            // Mapear tipos de gastos a categorías más amigables
            const categories = {
                'Comidas de Trabajo': '🍽️ Alimentación',
                'Transporte Terrestre': '🚗 Transporte',
                'Hospedaje': '🏨 Alojamiento',
                'Vuelos': '✈️ Viajes Aéreos',
                'Material de Oficina': '📋 Suministros',
                'Software y Licencias': '💻 Tecnología',
                'Capacitación': '📚 Formación'
            };
            return categories[typeName] || typeName || 'General';
        }
        
        function getStatusColorClass(status) {
            const colors = {
                'pending': 'text-yellow-600',
                'approved': 'text-green-600',
                'rejected': 'text-red-600',
                'reimbursed': 'text-blue-600',
                'invoiced': 'text-purple-600'
            };
            return colors[status] || 'text-gray-600';
        }
    </script>
    </body>
</html>`);
})


app.get('/companies', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Empresas Premium</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css" rel="stylesheet">
    <style>
    body {
        background: linear-gradient(135deg, 
            var(--color-bg-primary) 0%, 
            var(--color-bg-secondary) 50%, 
            var(--color-bg-tertiary) 100%);
        min-height: 100vh;
        color: var(--color-text-primary);
    }
    
    .premium-button {
        background: var(--gradient-emerald);
        border: 1px solid var(--color-glass-border);
        border-radius: var(--radius-md);
        padding: 12px 24px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
    }
    
    .premium-button:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-glow);
        background: var(--gradient-gold);
    }
    </style>
</head>
<body>
    <!-- Navigation Header -->
    <div class="container mx-auto px-6 py-8">
        <div class="glass-panel p-8 mb-8">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-4xl font-bold text-accent-gold">
                        <i class="fas fa-building mr-4"></i>
                        Gestión de Empresas Premium
                    </h1>
                    <p class="text-text-secondary text-lg mt-2">
                        Sistema ejecutivo de control corporativo empresarial
                    </p>
                </div>
                <div class="flex gap-4">
                    <a href="/" class="premium-button">
                        <i class="fas fa-chart-pie mr-3"></i>Dashboard
                    </a>
                    <a href="/companies" class="premium-button" style="background: var(--gradient-gold);">
                        <i class="fas fa-building mr-3"></i>Empresas
                    </a>
                    <a href="/users" class="premium-button">
                        <i class="fas fa-users mr-3"></i>Usuarios
                    </a>
                    <a href="/employees" class="premium-button">
                        <i class="fas fa-user-tie mr-3"></i>Empleados
                    </a>
                    <a href="/expenses" class="premium-button">
                        <i class="fas fa-receipt mr-3"></i>Gastos
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-6 pb-8">
        <!-- Header with Add Button -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <h2 class="text-3xl font-bold text-accent-gold mb-2">
                    <i class="fas fa-building-columns mr-3"></i>
                    Portfolio Corporativo
                </h2>
                <p class="text-text-secondary">Gestión multiempresa internacional • MX + ES + US + CA</p>
            </div>
            <button onclick="showAddCompanyModal()" class="premium-button">
                <i class="fas fa-plus mr-3"></i>Nueva Empresa
            </button>
        </div>

        <!-- Company Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="glass-panel p-6 text-center">
                <div class="text-2xl font-bold text-accent-emerald mb-2" id="total-companies">0</div>
                <div class="text-sm text-text-secondary">Empresas Activas</div>
            </div>
            <div class="glass-panel p-6 text-center">
                <div class="text-2xl font-bold text-accent-gold mb-2" id="total-employees">0</div>
                <div class="text-sm text-text-secondary">Empleados Totales</div>
            </div>
            <div class="glass-panel p-6 text-center">
                <div class="text-2xl font-bold text-accent-sapphire mb-2" id="countries-count">0</div>
                <div class="text-sm text-text-secondary">Países</div>
            </div>
            <div class="glass-panel p-6 text-center">
                <div class="text-2xl font-bold text-accent-emerald mb-2" id="currencies-count">0</div>
                <div class="text-sm text-text-secondary">Monedas</div>
            </div>
        </div>

        <!-- Companies Grid -->
        <div id="companies-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Companies will be loaded here dynamically -->
            <div class="col-span-full text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-accent-gold mb-4"></i>
                <p class="text-text-secondary">Cargando empresas...</p>
            </div>
        </div>
    </div>

    <!-- Modal - Agregar/Editar Empresa -->
    <div id="company-modal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="p-8">
                <!-- Modal Header -->
                <div class="flex justify-between items-center mb-8">
                    <h2 id="modal-title" class="text-3xl font-bold text-accent-gold">
                        <i class="fas fa-building mr-3"></i>Nueva Empresa
                    </h2>
                    <button onclick="closeCompanyModal()" class="text-text-secondary hover:text-accent-gold transition-colors text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Company Form -->
                <form id="company-form" onsubmit="saveCompany(event)" class="space-y-8">
                    
                    <!-- Sección 1: Información Básica -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold text-accent-emerald mb-6 flex items-center">
                            <i class="fas fa-info-circle mr-3"></i>Información Básica
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-building mr-2"></i>Razón Social *
                                </label>
                                <input type="text" id="razon-social" required
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: TechMX Solutions S.A. de C.V.">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-tag mr-2"></i>Nombre Comercial *
                                </label>
                                <input type="text" id="commercial-name" required
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: TechMX">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-globe mr-2"></i>País *
                                </label>
                                <select id="country" required onchange="updateCountryFields()"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent">
                                    <option value="">Seleccionar país...</option>
                                    <option value="MX">🇲🇽 México</option>
                                    <option value="ES">🇪🇸 España</option>
                                    <option value="US">🇺🇸 Estados Unidos</option>
                                    <option value="CA">🇨🇦 Canadá</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-id-card mr-2"></i><span id="tax-id-label">RFC/NIF *</span>
                                </label>
                                <input type="text" id="tax-id" required
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="RFC, NIF, EIN, BN">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-money-bill-wave mr-2"></i>Moneda Principal *
                                </label>
                                <select id="primary-currency" required
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent">
                                    <option value="">Seleccionar moneda...</option>
                                    <option value="MXN">💲 Peso Mexicano (MXN)</option>
                                    <option value="EUR">💶 Euro (EUR)</option>
                                    <option value="USD">💵 Dólar USD</option>
                                    <option value="CAD">💴 Dólar Canadiense (CAD)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-users mr-2"></i>Número de Empleados
                                </label>
                                <input type="number" id="employees-count" min="1"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: 25">
                            </div>
                        </div>
                    </div>

                    <!-- Sección 2: Información Comercial -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold text-accent-sapphire mb-6 flex items-center">
                            <i class="fas fa-briefcase mr-3"></i>Información Comercial
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-industry mr-2"></i>Giro Empresarial
                                </label>
                                <select id="business-category"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-sapphire focus:border-transparent">
                                    <option value="">Seleccionar giro...</option>
                                    <option value="technology">💻 Tecnología</option>
                                    <option value="consulting">📊 Consultoría</option>
                                    <option value="finance">💰 Financiero</option>
                                    <option value="healthcare">🏥 Salud</option>
                                    <option value="education">🎓 Educación</option>
                                    <option value="retail">🏪 Comercio</option>
                                    <option value="manufacturing">🏭 Manufactura</option>
                                    <option value="services">🔧 Servicios</option>
                                    <option value="other">📁 Otros</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-globe-americas mr-2"></i>Sitio Web
                                </label>
                                <input type="url" id="website"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-sapphire focus:border-transparent"
                                    placeholder="https://www.empresa.com">
                            </div>
                        </div>
                        
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-file-alt mr-2"></i>Descripción del Negocio
                            </label>
                            <textarea id="business-description" rows="3"
                                class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-sapphire focus:border-transparent resize-none"
                                placeholder="Breve descripción de la actividad comercial de la empresa..."></textarea>
                        </div>
                    </div>

                    <!-- Sección 3: Dirección Fiscal -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold text-accent-gold mb-6 flex items-center">
                            <i class="fas fa-map-marker-alt mr-3"></i>Dirección Fiscal
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-road mr-2"></i>Calle y Número
                                </label>
                                <input type="text" id="address-street"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: Av. Insurgentes Sur 1234, Col. Del Valle">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-city mr-2"></i>Ciudad
                                </label>
                                <input type="text" id="address-city"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: Ciudad de México">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-map mr-2"></i><span id="state-label">Estado/Provincia</span>
                                </label>
                                <input type="text" id="address-state"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: CDMX, Madrid, California">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-mail-bulk mr-2"></i><span id="postal-code-label">Código Postal</span>
                                </label>
                                <input type="text" id="address-postal"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: 03100, 28001, 90210">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-phone mr-2"></i>Teléfono Principal
                                </label>
                                <input type="tel" id="phone"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: +52 555 123 4567">
                            </div>
                        </div>
                    </div>

                    <!-- Sección 4: Branding Corporativo -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold text-accent-emerald mb-6 flex items-center">
                            <i class="fas fa-palette mr-3"></i>Branding Corporativo
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Logo Upload -->
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-image mr-2"></i>Logo Corporativo
                                </label>
                                <div id="logo-dropzone" class="border-2 border-dashed border-glass-border rounded-lg p-6 text-center cursor-pointer hover:border-accent-emerald transition-colors bg-glass">
                                    <div id="logo-preview" class="hidden">
                                        <img id="logo-img" src="" alt="Logo preview" class="max-h-20 mx-auto mb-2">
                                        <p class="text-sm text-text-secondary">Click para cambiar</p>
                                    </div>
                                    <div id="logo-placeholder">
                                        <i class="fas fa-cloud-upload-alt text-3xl text-accent-emerald mb-2"></i>
                                        <p class="text-text-primary font-medium">Arrastra tu logo aquí</p>
                                        <p class="text-sm text-text-secondary">PNG, JPG, SVG hasta 5MB</p>
                                    </div>
                                    <input type="file" id="logo-file" accept="image/*" class="hidden">
                                </div>
                            </div>
                            
                            <!-- Color Corporativo -->
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-fill-drip mr-2"></i>Color Corporativo
                                </label>
                                <div class="space-y-4">
                                    <input type="color" id="brand-color" value="#D4AF37"
                                        class="w-full h-12 bg-glass border border-glass-border rounded-lg cursor-pointer">
                                    <div class="grid grid-cols-6 gap-2">
                                        <button type="button" onclick="setBrandColor('#D4AF37')" class="w-8 h-8 rounded-full bg-yellow-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#10B981')" class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#3B82F6')" class="w-8 h-8 rounded-full bg-blue-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#8B5CF6')" class="w-8 h-8 rounded-full bg-purple-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#EF4444')" class="w-8 h-8 rounded-full bg-red-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#F59E0B')" class="w-8 h-8 rounded-full bg-amber-500 border-2 border-transparent hover:border-white"></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-4 pt-6">
                        <button type="button" onclick="closeCompanyModal()" 
                            class="px-6 py-3 border border-glass-border rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button type="submit" 
                            class="premium-button">
                            <i class="fas fa-save mr-2"></i>Guardar Empresa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- JavaScript -->
    <script>
        let companies = [];
        let currentEditingCompany = null;

        // Load companies on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Check if user is authenticated
            const token = localStorage.getItem('auth_token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
            
            loadCompanies();
            setupLogoUpload();
        });

        // Load companies from API
        async function loadCompanies() {
            try {
                const token = localStorage.getItem('auth_token');
                const headers = token ? { 'Authorization': \`Bearer \${token}\` } : {};
                
                const response = await fetch('/api/companies', { headers });
                if (response.ok) {
                    const data = await response.json();
                    companies = data.companies || [];
                    displayCompanies();
                    updateStatistics();
                } else {
                    throw new Error('Error al cargar empresas');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error al cargar empresas: ' + error.message, 'error');
            }
        }

        // Display companies in grid
        function displayCompanies() {
            const grid = document.getElementById('companies-grid');
            
            if (companies.length === 0) {
                grid.innerHTML = \`
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-building text-6xl text-text-secondary mb-4"></i>
                        <h3 class="text-xl font-bold text-text-primary mb-2">No hay empresas registradas</h3>
                        <p class="text-text-secondary mb-6">Comienza agregando tu primera empresa al sistema</p>
                        <button onclick="showAddCompanyModal()" class="premium-button">
                            <i class="fas fa-plus mr-2"></i>Agregar Primera Empresa
                        </button>
                    </div>
                \`;
                return;
            }

            const companyCards = companies.map(company => {
                const countryFlag = {
                    'MX': '🇲🇽',
                    'ES': '🇪🇸', 
                    'US': '🇺🇸',
                    'CA': '🇨🇦'
                }[company.country] || '🏢';

                const currencySymbol = {
                    'MXN': '$',
                    'EUR': '€',
                    'USD': '$',
                    'CAD': 'C$'
                }[company.primary_currency] || '';

                const logoHtml = company.logo_url ? 
                    '<img src="' + company.logo_url + '" alt="' + company.name + '" class="w-10 h-10 object-contain rounded-lg">' :
                    '<span class="text-3xl">' + countryFlag + '</span>';

                return '<div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="viewCompany(' + company.id + ')">' +
                    '<div class="flex items-center justify-between mb-6">' +
                        '<div class="flex items-center space-x-4">' +
                            '<div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">' +
                                logoHtml +
                            '</div>' +
                            '<div>' +
                                '<h3 class="text-lg font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">' + company.name + '</h3>' +
                                '<p class="text-sm text-text-secondary">' + company.country + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="text-right">' +
                            '<div class="premium-badge mb-2">' +
                                '<i class="fas fa-check-circle mr-1"></i>' +
                                (company.active ? 'Activa' : 'Inactiva') +
                            '</div>' +
                            '<p class="text-xs text-text-secondary">' + company.primary_currency + '</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="grid grid-cols-2 gap-4 mb-6">' +
                        '<div class="text-center p-3 bg-glass rounded-lg">' +
                            '<div class="text-xl font-bold text-accent-emerald">' + (company.employees_count || 0) + '</div>' +
                            '<div class="text-xs text-text-secondary">Empleados</div>' +
                        '</div>' +
                        '<div class="text-center p-3 bg-glass rounded-lg">' +
                            '<div class="text-xl font-bold text-accent-gold">' + currencySymbol + '0</div>' +
                            '<div class="text-xs text-text-secondary">Gastos</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="flex items-center justify-between pt-4 border-t border-glass-border">' +
                        '<button onclick="event.stopPropagation(); editCompany(' + company.id + ')" class="text-sm text-accent-sapphire hover:text-accent-gold transition-colors">' +
                            '<i class="fas fa-edit mr-1"></i>Editar' +
                        '</button>' +
                        '<a href="/company/' + company.id + '" onclick="event.stopPropagation()" class="text-sm text-accent-gold hover:text-accent-emerald transition-colors">' +
                            'Ver detalles <i class="fas fa-arrow-right ml-1"></i>' +
                        '</a>' +
                    '</div>' +
                '</div>';
            });
            
            grid.innerHTML = companyCards.join('');
        }

        // Update statistics
        function updateStatistics() {
            document.getElementById('total-companies').textContent = companies.length;
            document.getElementById('countries-count').textContent = new Set(companies.map(c => c.country)).size;
            document.getElementById('currencies-count').textContent = new Set(companies.map(c => c.primary_currency)).size;
        }

        // Show add company modal
        function showAddCompanyModal() {
            currentEditingCompany = null;
            document.getElementById('modal-title').innerHTML = '<i class="fas fa-building mr-3"></i>Nueva Empresa';
            document.getElementById('company-form').reset();
            document.getElementById('company-modal').classList.remove('hidden');
            resetLogoPreview();
            window.selectedLogoFile = null;
        }

        // Close modal
        function closeCompanyModal() {
            document.getElementById('company-modal').classList.add('hidden');
            currentEditingCompany = null;
        }

        // Save company
        async function saveCompany(event) {
            event.preventDefault();
            
            const formData = new FormData();
            const companyData = {
                razon_social: document.getElementById('razon-social').value,
                commercial_name: document.getElementById('commercial-name').value,
                country: document.getElementById('country').value,
                tax_id: document.getElementById('tax-id').value,
                primary_currency: document.getElementById('primary-currency').value,
                employees_count: parseInt(document.getElementById('employees-count').value) || null,
                business_category: document.getElementById('business-category').value,
                website: document.getElementById('website').value,
                business_description: document.getElementById('business-description').value,
                address_street: document.getElementById('address-street').value,
                address_city: document.getElementById('address-city').value,
                address_state: document.getElementById('address-state').value,
                address_postal: document.getElementById('address-postal').value,
                phone: document.getElementById('phone').value,
                brand_color: document.getElementById('brand-color').value
            };

            try {
                // If there's a logo file, convert to base64 and include in company data
                if (window.selectedLogoFile) {
                    const base64Logo = await fileToBase64(window.selectedLogoFile);
                    companyData.logo_url = base64Logo;
                }

                const token = localStorage.getItem('auth_token');
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
                };

                const url = currentEditingCompany ? '/api/companies/' + currentEditingCompany : '/api/companies';
                const method = currentEditingCompany ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(companyData)
                });

                if (response.ok) {
                    const result = await response.json();
                    showMessage('Empresa ' + (currentEditingCompany ? 'actualizada' : 'creada') + ' exitosamente', 'success');
                    closeCompanyModal();
                    await loadCompanies();
                } else {
                    let errorMessage = 'Error desconocido';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    } catch (e) {
                        errorMessage = 'Error del servidor (status: ' + response.status + ')';
                    }
                    throw new Error(errorMessage);
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error al guardar empresa: ' + error.message, 'error');
            }
        }

        // Update country-specific fields
        function updateCountryFields() {
            const country = document.getElementById('country').value;
            const taxIdLabel = document.getElementById('tax-id-label');
            const stateLabel = document.getElementById('state-label');
            const postalLabel = document.getElementById('postal-code-label');
            const currencySelect = document.getElementById('primary-currency');

            switch(country) {
                case 'MX':
                    taxIdLabel.textContent = 'RFC *';
                    stateLabel.textContent = 'Estado';
                    postalLabel.textContent = 'Código Postal';
                    currencySelect.value = 'MXN';
                    break;
                case 'ES':
                    taxIdLabel.textContent = 'NIF/CIF *';
                    stateLabel.textContent = 'Provincia';
                    postalLabel.textContent = 'Código Postal';
                    currencySelect.value = 'EUR';
                    break;
                case 'US':
                    taxIdLabel.textContent = 'EIN *';
                    stateLabel.textContent = 'State';
                    postalLabel.textContent = 'ZIP Code';
                    currencySelect.value = 'USD';
                    break;
                case 'CA':
                    taxIdLabel.textContent = 'BN *';
                    stateLabel.textContent = 'Province';
                    postalLabel.textContent = 'Postal Code';
                    currencySelect.value = 'CAD';
                    break;
            }
        }

        // Setup logo upload
        function setupLogoUpload() {
            const dropzone = document.getElementById('logo-dropzone');
            const fileInput = document.getElementById('logo-file');

            dropzone.addEventListener('click', () => fileInput.click());
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('border-accent-emerald');
            });
            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('border-accent-emerald');
            });
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('border-accent-emerald');
                const files = e.dataTransfer.files;
                if (files.length > 0) handleLogoFile(files[0]);
            });
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) handleLogoFile(e.target.files[0]);
            });
        }

        // Handle logo file
        function handleLogoFile(file) {
            if (file.size > 5 * 1024 * 1024) {
                showMessage('El archivo es muy grande. Máximo 5MB.', 'error');
                return;
            }

            // Store file for later upload
            window.selectedLogoFile = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('logo-img').src = e.target.result;
                document.getElementById('logo-preview').classList.remove('hidden');
                document.getElementById('logo-placeholder').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }

        // Convert file to base64
        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        // Logo upload is now handled via base64 inclusion in main company data

        // Reset logo preview
        function resetLogoPreview() {
            document.getElementById('logo-preview').classList.add('hidden');
            document.getElementById('logo-placeholder').classList.remove('hidden');
            document.getElementById('logo-file').value = '';
            window.selectedLogoFile = null;
        }

        // Set brand color
        function setBrandColor(color) {
            document.getElementById('brand-color').value = color;
        }

        // View company details
        function viewCompany(companyId) {
            window.location.href = \`/company/\${companyId}\`;
        }

        // Edit company
        async function editCompany(companyId) {
            try {
                // Find company in current data
                const company = companies.find(c => c.id == companyId);
                if (!company) {
                    showMessage('Empresa no encontrada', 'error');
                    return;
                }
                
                // Set editing mode
                currentEditingCompany = companyId;
                
                // Update modal title
                document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit mr-3"></i>Editar Empresa';
                
                // Pre-fill ALL form fields with existing company data
                document.getElementById('razon-social').value = company.razon_social || company.name || '';
                document.getElementById('commercial-name').value = company.commercial_name || company.name || '';
                document.getElementById('country').value = company.country || '';
                document.getElementById('tax-id').value = company.tax_id || '';
                document.getElementById('primary-currency').value = company.primary_currency || '';
                document.getElementById('employees-count').value = company.employees_count || '';
                document.getElementById('business-category').value = company.business_category || '';
                document.getElementById('website').value = company.website || '';
                document.getElementById('business-description').value = company.business_description || '';
                
                // Address fields - use specific fields if available, fallback to parsing legacy address
                document.getElementById('address-street').value = company.address_street || company.address || '';
                document.getElementById('address-city').value = company.address_city || '';
                document.getElementById('address-state').value = company.address_state || '';
                document.getElementById('address-postal').value = company.address_postal || '';
                document.getElementById('phone').value = company.phone || '';
                document.getElementById('brand-color').value = company.brand_color || '#D4AF37';
                
                // If specific address fields are empty but legacy address exists, parse it
                if (!company.address_city && !company.address_state && company.address) {
                    const addressParts = company.address.split(',').map(part => part.trim());
                    if (addressParts.length >= 2) {
                        document.getElementById('address-city').value = addressParts[1] || '';
                        if (addressParts.length >= 3) {
                            document.getElementById('address-state').value = addressParts[2] || '';
                        }
                    }
                }
                
                // Show existing logo if available
                if (company.logo_url) {
                    document.getElementById('logo-img').src = company.logo_url;
                    document.getElementById('logo-preview').classList.remove('hidden');
                    document.getElementById('logo-placeholder').classList.add('hidden');
                } else {
                    resetLogoPreview();
                }
                
                // Update country-specific fields
                updateCountryFields();
                
                // Show modal
                document.getElementById('company-modal').classList.remove('hidden');
                
            } catch (error) {
                console.error('Error loading company for edit:', error);
                showMessage('Error al cargar datos de la empresa', 'error');
            }
        }

        // Show message helper
        function showMessage(message, type) {
            // Simple alert for now, can be enhanced with toast notifications
            if (type === 'error') {
                alert('❌ ' + message);
            } else if (type === 'success') {
                alert('✅ ' + message);
            } else {
                alert('ℹ️ ' + message);
            }
        }

        // Close modal on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeCompanyModal();
            }
        });
    </script>
    
</body>
</html>`);
})


app.get('/company/:id', (c) => {
  const companyId = c.req.param('id');
  
  // Company data mapping
  const companies = {
    '1': { name: 'TechMX Solutions', country: 'MX', currency: 'MXN', flag: '🇲🇽', employees: 24, expenses: '485K', category: 'Tecnología' },
    '2': { name: 'Innovación Digital MX', country: 'MX', currency: 'MXN', flag: '🇲🇽', employees: 18, expenses: '325K', category: 'Digital' },
    '3': { name: 'Consultoría Estratégica MX', country: 'MX', currency: 'MXN', flag: '🇲🇽', employees: 12, expenses: '195K', category: 'Consultoría' },
    '4': { name: 'TechES Barcelona', country: 'ES', currency: 'EUR', flag: '🇪🇸', employees: 32, expenses: '85K', category: 'Tecnología' },
    '5': { name: 'Innovación Madrid SL', country: 'ES', currency: 'EUR', flag: '🇪🇸', employees: 28, expenses: '72K', category: 'Innovación' },
    '6': { name: 'Digital Valencia S.A.', country: 'ES', currency: 'EUR', flag: '🇪🇸', employees: 22, expenses: '58K', category: 'Digital' }
  };
  
  const company = companies[companyId];
  if (!company) {
    return c.redirect('/companies');
  }

  return c.render(
    <div className="min-h-screen" style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);">
      {/* Premium Navigation */}
      <nav className="nav-premium border-b" style="border-color: rgba(255, 255, 255, 0.1);">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo & Branding */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <i className="fas fa-gem text-3xl text-gold animate-pulse-gold"></i>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="nav-logo text-3xl">Lyra Expenses</h1>
                  <p className="text-xs text-secondary opacity-75 font-medium">Executive Financial Management</p>
                </div>
              </div>
              <span className="nav-badge">
                {company.flag} {company.name}
              </span>
            </div>

            {/* Navigation Menu */}
            <div className="flex items-center space-x-8">
              {/* Main Navigation Links */}
              <nav className="flex space-x-6">
                <a href="/" className="nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2">
                  <i className="fas fa-chart-pie"></i>
                  <span>Dashboard</span>
                </a>
                <a href="/companies" className="nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2">
                  <i className="fas fa-building"></i>
                  <span>Empresas</span>
                </a>
                <a href="/expenses" className="nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2">
                  <i className="fas fa-receipt"></i>
                  <span>Gastos</span>
                </a>
              </nav>
              
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-tertiary">
                <a href="/companies" className="hover:text-gold">Empresas</a>
                <i className="fas fa-chevron-right"></i>
                <span className="text-gold">{company.name}</span>
              </div>
              
              {/* Right Side Actions */}
              <div className="flex items-center space-x-4 border-l border-glass-border pl-6">
                <select className="form-input-premium bg-glass border-0 text-sm min-w-[120px]">
                  <option>{company.flag} {company.currency}</option>
                </select>
                
                <button onclick="showExpenseForm()" className="btn-premium btn-emerald text-sm">
                  <i className="fas fa-plus mr-1"></i>
                  Nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Company Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-4 mb-4">
            <div className="p-4 rounded-2xl bg-glass">
              <span className="text-6xl">{company.flag}</span>
            </div>
            <div className="text-left">
              <h2 className="text-4xl font-bold gradient-text-gold">{company.name}</h2>
              <p className="text-xl text-secondary">{company.category} • {company.country === 'MX' ? 'México' : 'España'}</p>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-8 text-sm text-tertiary">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"></div>
                {company.employees} empleados activos
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"></div>
                {company.currency} {company.expenses} en gastos
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"></div>
                Operativa desde 2019
              </span>
            </div>
          </div>
        </div>

        {/* Company KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="metric-card-premium animate-slide-up" style="animation-delay: 0.1s">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-glass">
                  <i className="fas fa-coins text-emerald text-xl"></i>
                </div>
                <div>
                  <p className="metric-label text-emerald">Gastos Mensuales</p>
                  <p className="text-xs text-tertiary">Este mes</p>
                </div>
              </div>
            </div>
            <div className="metric-value text-emerald">{company.currency} {company.expenses}</div>
            <div className="text-xs text-tertiary mt-2">+8.5% vs mes anterior</div>
          </div>

          <div className="metric-card-premium animate-slide-up" style="animation-delay: 0.2s">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-glass">
                  <i className="fas fa-users text-sapphire text-xl"></i>
                </div>
                <div>
                  <p className="metric-label text-sapphire">Empleados</p>
                  <p className="text-xs text-tertiary">Plantilla actual</p>
                </div>
              </div>
            </div>
            <div className="metric-value text-sapphire">{company.employees}</div>
            <div className="text-xs text-tertiary mt-2">+2 nuevas contrataciones</div>
          </div>

          <div className="metric-card-premium animate-slide-up" style="animation-delay: 0.3s">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-glass">
                  <i className="fas fa-clock text-gold text-xl"></i>
                </div>
                <div>
                  <p className="metric-label text-gold">Pendientes</p>
                  <p className="text-xs text-tertiary">Por revisar</p>
                </div>
              </div>
            </div>
            <div className="metric-value text-gold">7</div>
            <div className="text-xs text-tertiary mt-2">2 urgentes</div>
          </div>

          <div className="metric-card-premium animate-slide-up" style="animation-delay: 0.4s">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-glass">
                  <i className="fas fa-percentage text-ruby text-xl"></i>
                </div>
                <div>
                  <p className="metric-label text-ruby">Eficiencia</p>
                  <p className="text-xs text-tertiary">Aprobación</p>
                </div>
              </div>
            </div>
            <div className="metric-value text-ruby">94.2%</div>
            <div className="text-xs text-tertiary mt-2">Excelente performance</div>
          </div>
        </div>

        {/* Company Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="glass-panel p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-glass">
                  <i className="fas fa-chart-line text-emerald text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">Tendencia de Gastos</h3>
                  <p className="text-xs text-tertiary">Últimos 6 meses • {company.name}</p>
                </div>
              </div>
            </div>
            <div id="company-trend-chart" className="h-64 rounded-lg bg-glass p-4">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <i className="fas fa-chart-line text-4xl text-emerald mb-4"></i>
                  <p className="text-secondary">Gráfica de tendencias específica</p>
                  <p className="text-xs text-tertiary">Datos de {company.name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-glass">
                  <i className="fas fa-chart-pie text-gold text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">Distribución por Categoría</h3>
                  <p className="text-xs text-tertiary">Análisis de tipos de gasto</p>
                </div>
              </div>
            </div>
            <div id="company-category-chart" className="h-64 rounded-lg bg-glass p-4">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-4xl text-gold mb-4"></i>
                  <p className="text-secondary">Distribución por categoría</p>
                  <p className="text-xs text-tertiary">Viajes, comidas, tecnología, etc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-glass">
                <i className="fas fa-history text-sapphire text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Actividad Reciente</h3>
                <p className="text-xs text-tertiary">Últimos movimientos en {company.name}</p>
              </div>
            </div>
            <a href="/expenses" className="btn-premium btn-sapphire text-sm">
              <i className="fas fa-external-link-alt mr-2"></i>
              Ver todos los gastos
            </a>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-emerald bg-opacity-20">
                  <i className="fas fa-plane text-emerald"></i>
                </div>
                <div>
                  <p className="font-semibold text-primary">Vuelo Madrid-Barcelona</p>
                  <p className="text-sm text-tertiary">María López • Hace 2 horas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald">{company.currency} 250</p>
                <p className="text-xs text-tertiary">Aprobado</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-gold bg-opacity-20">
                  <i className="fas fa-utensils text-gold"></i>
                </div>
                <div>
                  <p className="font-semibold text-primary">Comida con cliente</p>
                  <p className="text-sm text-tertiary">Carlos Martínez • Hace 4 horas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gold">{company.currency} 125</p>
                <p className="text-xs text-tertiary">Pendiente</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-sapphire bg-opacity-20">
                  <i className="fas fa-laptop text-sapphire"></i>
                </div>
                <div>
                  <p className="font-semibold text-primary">Software Adobe Creative Suite</p>
                  <p className="text-sm text-tertiary">Ana García • Hace 1 día</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sapphire">{company.currency} 89</p>
                <p className="text-xs text-tertiary">Aprobado</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <script src="/static/app.js"></script>
    </div>
  );
})

// Expenses list page - PREMIUM DESIGN RESTORED + NUCLEAR FUNCTIONALITY
app.get('/expenses', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestión de Gastos Premium</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <style>
        body {
            background: linear-gradient(135deg, 
                var(--color-bg-primary) 0%, 
                var(--color-bg-secondary) 50%, 
                var(--color-bg-tertiary) 100%);
            min-height: 100vh;
            color: var(--color-text-primary);
        }
        
        .premium-button {
            background: var(--gradient-emerald);
            border: 1px solid var(--color-glass-border);
            border-radius: var(--radius-md);
            padding: 12px 24px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }
        
        .premium-button:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-glow);
            background: var(--gradient-gold);
        }
        </style>
    </head>
    <body>
        <div class="container mx-auto px-6 py-8">
            <!-- Premium Header -->
            <div class="glass-panel p-8 mb-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-4xl font-bold text-accent-gold">
                            <i class="fas fa-receipt mr-4"></i>
                            Gestión de Gastos Premium
                        </h1>
                        <p class="text-text-secondary text-lg mt-2">
                            Sistema ejecutivo de control financiero empresarial
                        </p>
                    </div>
                    <div class="flex gap-4">
                        <button onclick="showAddExpenseModal()" class="premium-button">
                            <i class="fas fa-plus mr-3"></i>AGREGAR GASTO
                        </button>
                        <a href="/" class="premium-button" style="background: var(--gradient-primary);">
                            <i class="fas fa-home mr-3"></i>Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- FILTROS Y TABLA DE GASTOS -->
        <div class="container mx-auto px-6 pb-8">
            <!-- Filtros Avanzados -->
            <div class="glass-panel p-6 mb-8">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-accent-gold flex items-center">
                            <i class="fas fa-filter mr-3"></i>
                            Filtros Avanzados de Gastos
                        </h3>
                        <p class="text-text-secondary">Personaliza tu búsqueda con filtros multidimensionales</p>
                    </div>
                    <button onclick="clearAllFilters()" class="premium-button" style="background: var(--gradient-accent);">
                        <i class="fas fa-broom mr-2"></i>Limpiar Filtros
                    </button>
                </div>
                
                <!-- Primera fila de filtros -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <!-- Filtro por Fecha (PRIMERO) -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">📅 Fecha</label>
                        <div class="flex gap-2">
                            <input type="date" id="filter-date-from" onchange="applyFilters()" 
                                   class="flex-1 p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none text-sm"
                                   placeholder="Desde">
                            <input type="date" id="filter-date-to" onchange="applyFilters()" 
                                   class="flex-1 p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none text-sm"
                                   placeholder="Hasta">
                        </div>
                    </div>
                    
                    <!-- Filtro por Empresa -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">🏢 Empresa</label>
                        <select id="filter-company" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todas las Empresas</option>
                        </select>
                    </div>
                    
                    <!-- Filtro por Usuario -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">👤 Usuario</label>
                        <select id="filter-user" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todos los Usuarios</option>
                            <option value="1">👑 Alejandro Rodríguez</option>
                            <option value="2">✏️ María López</option>
                            <option value="3">⭐ Carlos Martínez</option>
                            <option value="4">✏️ Ana García</option>
                            <option value="5">⭐ Pedro Sánchez</option>
                            <option value="6">✏️ Elena Torres</option>
                        </select>
                    </div>
                    
                    <!-- Filtro por Tipo de Gasto -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">🏷️ Tipo</label>
                        <select id="filter-type" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todos los Tipos</option>
                            <option value="G">💼 Gastos</option>
                            <option value="V">✈️ Viáticos</option>
                        </select>
                    </div>
                </div>
                
                <!-- Segunda fila de filtros -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Filtro por Categoría -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">📂 Categoría</label>
                        <select id="filter-category" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todas las Categorías</option>
                            <option value="meals">🍽️ Comidas</option>
                            <option value="transport">🚗 Transporte</option>
                            <option value="accommodation">🏨 Hospedaje</option>
                            <option value="travel">✈️ Viajes</option>
                            <option value="supplies">📋 Suministros</option>
                            <option value="services">💻 Servicios</option>
                            <option value="general">📦 General</option>
                        </select>
                    </div>
                    
                    <!-- Filtro por Status -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">📊 Status</label>
                        <select id="filter-status" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todos los Status</option>
                            <option value="pending">⏳ Pendiente</option>
                            <option value="approved">✅ Aprobado</option>
                            <option value="rejected">❌ Rechazado</option>
                            <option value="more_info">💬 Pedir Más Información</option>
                            <option value="reimbursed">💰 Reembolsado</option>
                            <option value="invoiced">📄 Facturado</option>
                        </select>
                    </div>
                    
                    <!-- Filtro por Moneda -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">💱 Moneda</label>
                        <select id="filter-currency" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todas las Monedas</option>
                            <option value="MXN">🇲🇽 MXN</option>
                            <option value="USD">🇺🇸 USD</option>
                            <option value="EUR">🇪🇺 EUR</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Estadísticas KPI Compactas -->
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                <!-- Total Gastos -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-chart-bar text-accent-emerald text-lg"></i>
                        <span class="text-xs text-text-secondary">Total</span>
                    </div>
                    <div class="text-xl font-bold text-accent-gold">
                        <span id="total-count">0</span>
                    </div>
                    <div class="text-xs text-text-secondary">gastos</div>
                </div>
                
                <!-- Monto Total -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-calculator text-accent-emerald text-lg"></i>
                        <span class="text-xs text-text-secondary">Monto</span>
                    </div>
                    <div class="text-lg font-bold text-accent-emerald" id="total-amount">
                        $0.00
                    </div>
                    <div class="text-xs text-text-secondary">total</div>
                </div>

                <!-- Pendientes por Autorizar -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-clock text-yellow-400 text-lg"></i>
                        <span class="text-xs text-text-secondary">Pendientes</span>
                    </div>
                    <div class="text-xl font-bold text-yellow-400">
                        <span id="pending-count">0</span>
                    </div>
                    <div class="text-xs text-text-secondary">por autorizar</div>
                </div>

                <!-- Aprobados -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-check-circle text-green-400 text-lg"></i>
                        <span class="text-xs text-text-secondary">Aprobados</span>
                    </div>
                    <div class="text-xl font-bold text-green-400">
                        <span id="approved-count">0</span>
                    </div>
                    <div class="text-xs text-text-secondary">gastos</div>
                </div>

                <!-- Empresas Activas -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-building text-sapphire text-lg"></i>
                        <span class="text-xs text-text-secondary">Empresas</span>
                    </div>
                    <div class="text-xl font-bold text-sapphire">
                        <span id="companies-count">0</span>
                    </div>
                    <div class="text-xs text-text-secondary">activas</div>
                </div>

                <!-- Total por Reembolsar -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-money-bill-wave text-purple-400 text-lg"></i>
                        <span class="text-xs text-text-secondary">Reembolsar</span>
                    </div>
                    <div class="text-lg font-bold text-purple-400" id="reimbursed-amount">
                        $0.00
                    </div>
                    <div class="text-xs text-text-secondary">por reembolsar</div>
                </div>
            </div>

            <!-- Tabla de Gastos -->
            <div class="glass-panel p-6">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-accent-gold flex items-center">
                            <i class="fas fa-table mr-3"></i>
                            Registro de Gastos GUSBit
                        </h3>
                        <p class="text-text-secondary">Sistema completo de 13 campos con validación avanzada</p>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-accent-gold/30">
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold w-32 min-w-32">📅 Fecha</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">🏢 Empresa</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">👤 Usuario</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">🏷️ Tipo</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">📂 Categoría</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">📍 Destino</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">🏪 Lugar</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">📝 Descripción</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">💰 Monto</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">💱 Moneda</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">💳 Forma Pago</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">👨‍💼 Capturó</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">📊 Status</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">⚙️ Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="expenses-list">
                            <tr>
                                <td colspan="14" class="text-center py-12 text-text-secondary">
                                    <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
                                    <p>Cargando sistema GUSBit...</p>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot id="expenses-totals">
                            <!-- Los totales se generan dinámicamente -->
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- MODAL GUSBIT COMPLETO (13 CAMPOS) CON OCR Y ADJUNTOS -->
        <div id="add-expense-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.95); z-index: 10000; overflow-y: auto;">
            <div class="glass-panel" style="max-width: 1200px; margin: 20px auto; border: 3px solid var(--color-accent-gold);">
                <!-- Modal Header -->
                <div class="flex justify-between items-center p-6 border-b border-accent-gold bg-gradient-to-r from-accent-gold/10 to-accent-emerald/10">
                    <div>
                        <h2 class="text-2xl font-bold text-accent-gold flex items-center">
                            <i class="fas fa-plus-circle mr-3"></i>
                            SISTEMA GUSBIT - Registro Completo de Gasto
                        </h2>
                        <p class="text-text-secondary mt-1">
                            🏆 Información Principal del Gasto (13 Campos GUSBit) + Comprobantes y Procesamiento OCR Automático
                        </p>
                    </div>
                    <button onclick="closeAddExpenseModal()" class="text-accent-gold hover:text-red-400 text-3xl font-bold transition-colors">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </div>

                <form id="expense-form" onsubmit="submitExpenseGusbit(event)" class="p-6">
                    <!-- SECCIÓN 1: INFORMACIÓN PRINCIPAL DEL GASTO (13 CAMPOS GUSBIT) -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold text-accent-emerald mb-6 flex items-center">
                            <i class="fas fa-list-ol mr-3"></i>
                            📋 INFORMACIÓN PRINCIPAL DEL GASTO (13 Campos GUSBit)
                        </h3>
                        
                        <!-- Fila 1: Fecha, Empresa, Usuario, Tipo -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <!-- Campo 1: FECHA -->
                            <div>
                                <label for="gusbit-fecha" class="block text-sm font-semibold text-accent-gold mb-2">
                                    🗓️ 1. FECHA *
                                </label>
                                <input type="date" id="gusbit-fecha" required 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                            
                            <!-- Campo 2: EMPRESA -->
                            <div>
                                <label for="gusbit-empresa" class="block text-sm font-semibold text-accent-gold mb-2">
                                    🏢 2. EMPRESA *
                                </label>
                                <select id="gusbit-empresa" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR EMPRESA...</option>
                                </select>
                            </div>
                            
                            <!-- Campo 3: USUARIO -->
                            <div>
                                <label for="gusbit-usuario" class="block text-sm font-semibold text-accent-gold mb-2">
                                    👤 3. USUARIO *
                                </label>
                                <select id="gusbit-usuario" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR USUARIO...</option>
                                    <option value="1">👑 Alejandro Rodríguez</option>
                                    <option value="2">✏️ María López</option>
                                    <option value="3">⭐ Carlos Martínez</option>
                                    <option value="4">✏️ Ana García</option>
                                    <option value="5">⭐ Pedro Sánchez</option>
                                    <option value="6">✏️ Elena Torres</option>
                                </select>
                            </div>
                            
                            <!-- Campo 4: TIPO (V=Viático, G=Gasto) -->
                            <div>
                                <label for="gusbit-tipo" class="block text-sm font-semibold text-accent-gold mb-2">
                                    🏷️ 4. TIPO *
                                </label>
                                <select id="gusbit-tipo" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR TIPO...</option>
                                    <option value="V">✈️ V - Viático</option>
                                    <option value="G">💰 G - Gasto</option>
                                </select>
                            </div>
                        </div>

                        <!-- Fila 2: Categoría, Destino, Lugar, Descripción -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <!-- Campo 5: CATEGORÍA -->
                            <div>
                                <label for="gusbit-categoria" class="block text-sm font-semibold text-accent-gold mb-2">
                                    📂 5. CATEGORÍA *
                                </label>
                                <select id="gusbit-categoria" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR CATEGORÍA...</option>
                                    <option value="1">🍽️ Comidas de Trabajo</option>
                                    <option value="2">🚗 Transporte Terrestre</option>
                                    <option value="3">⛽ Combustible</option>
                                    <option value="4">🏨 Hospedaje</option>
                                    <option value="5">✈️ Vuelos</option>
                                    <option value="6">📋 Material de Oficina</option>
                                    <option value="7">💻 Software y Licencias</option>
                                    <option value="8">📚 Capacitación</option>
                                    <option value="9">📢 Marketing</option>
                                    <option value="10">📦 Otros Gastos</option>
                                </select>
                            </div>
                            
                            <!-- Campo 6: DESTINO -->
                            <div>
                                <label for="gusbit-destino" class="block text-sm font-semibold text-accent-gold mb-2">
                                    📍 6. DESTINO *
                                </label>
                                <input type="text" id="gusbit-destino" required placeholder="Ej: Ciudad de México, Madrid, Nueva York" 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                        </div>

                        <!-- Fila 3: Lugar y Descripción -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <!-- Campo 7: LUGAR/NEGOCIO -->
                            <div>
                                <label for="gusbit-lugar" class="block text-sm font-semibold text-accent-gold mb-2">
                                    🏪 7. LUGAR/NEGOCIO *
                                </label>
                                <input type="text" id="gusbit-lugar" required placeholder="Ej: Restaurante Pujol, Uber, Hotel Marriott" 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                            
                            <!-- Campo 8: DESCRIPCIÓN -->
                            <div>
                                <label for="gusbit-descripcion" class="block text-sm font-semibold text-accent-gold mb-2">
                                    📝 8. DESCRIPCIÓN *
                                </label>
                                <input type="text" id="gusbit-descripcion" required placeholder="Ej: Comida con cliente potencial" 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                        </div>

                        <!-- Fila 4: Monto, Moneda, Forma de Pago -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <!-- Campo 9: MONTO -->
                            <div>
                                <label for="gusbit-monto" class="block text-sm font-semibold text-accent-gold mb-2">
                                    💰 9. MONTO *
                                </label>
                                <input type="number" step="0.01" min="0.01" id="gusbit-monto" required placeholder="0.00" 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                            
                            <!-- Campo 10: MONEDA -->
                            <div>
                                <label for="gusbit-moneda" class="block text-sm font-semibold text-accent-gold mb-2">
                                    💱 10. MONEDA *
                                </label>
                                <select id="gusbit-moneda" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR MONEDA...</option>
                                    <option value="MXN">🇲🇽 MXN - Peso Mexicano</option>
                                    <option value="USD">🇺🇸 USD - Dólar Americano</option>
                                    <option value="EUR">🇪🇺 EUR - Euro</option>
                                </select>
                            </div>
                            
                            <!-- Campo 11: FORMA DE PAGO -->
                            <div>
                                <label for="gusbit-forma-pago" class="block text-sm font-semibold text-accent-gold mb-2">
                                    💳 11. FORMA DE PAGO *
                                </label>
                                <select id="gusbit-forma-pago" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR FORMA DE PAGO...</option>
                                    <option value="efectivo">💵 Efectivo</option>
                                    <option value="tarjeta_credito">💳 Tarjeta de Crédito</option>
                                    <option value="tarjeta_debito">💳 Tarjeta de Débito</option>
                                    <option value="tarjeta_empresarial">🏢 Tarjeta Empresarial</option>
                                    <option value="transferencia">🏦 Transferencia Bancaria</option>
                                    <option value="cheque">📄 Cheque</option>
                                    <option value="vales">🎫 Vales de Despensa</option>
                                    <option value="caja_chica">💰 Caja Chica</option>
                                </select>
                            </div>
                        </div>

                        <!-- Fila 5: Quién lo Capturó y Status -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <!-- Campo 12: QUIÉN LO CAPTURÓ -->
                            <div>
                                <label for="gusbit-quien-capturo" class="block text-sm font-semibold text-accent-gold mb-2">
                                    👨‍💼 12. QUIÉN LO CAPTURÓ *
                                </label>
                                <select id="gusbit-quien-capturo" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR QUIÉN CAPTURÓ...</option>
                                    <option value="alejandro">👑 Alejandro Rodríguez</option>
                                    <option value="maria">✏️ María López</option>
                                    <option value="carlos">⭐ Carlos Martínez</option>
                                    <option value="ana">✏️ Ana García</option>
                                    <option value="pedro">⭐ Pedro Sánchez</option>
                                    <option value="elena">✏️ Elena Torres</option>
                                </select>
                            </div>
                            
                            <!-- Campo 13: STATUS -->
                            <div>
                                <label for="gusbit-status" class="block text-sm font-semibold text-accent-gold mb-2">
                                    📊 13. STATUS *
                                </label>
                                <select id="gusbit-status" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR STATUS...</option>
                                    <option value="pending">⏳ Pendiente de Autorización</option>
                                    <option value="approved">✅ Aprobado</option>
                                    <option value="rejected">❌ Rechazado</option>
                                    <option value="reimbursed">💰 Reembolsado</option>
                                    <option value="invoiced">📄 Facturado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- SECCIÓN 2: COMPROBANTES Y PROCESAMIENTO OCR AUTOMÁTICO -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold text-accent-emerald mb-6 flex items-center">
                            <i class="fas fa-camera mr-3"></i>
                            📸 COMPROBANTES Y PROCESAMIENTO OCR AUTOMÁTICO
                        </h3>
                        
                        <!-- Upload Section -->
                        <div class="glass-panel p-6 mb-4">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <h4 class="text-lg font-semibold text-accent-gold">📎 Adjuntar Tickets y Facturas</h4>
                                    <p class="text-text-secondary text-sm">Sube tickets, facturas o recibos para procesamiento OCR automático</p>
                                </div>
                                <label class="premium-button cursor-pointer">
                                    <i class="fas fa-upload mr-2"></i>
                                    SELECCIONAR ARCHIVOS
                                    <input type="file" multiple accept="image/*,.pdf" style="display: none;" onchange="handleFileUpload(this)">
                                </label>
                            </div>
                            
                            <!-- Uploaded Files Display -->
                            <div id="uploaded-files" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"></div>
                            
                            <!-- OCR Results -->
                            <div id="ocr-results" style="display: none;" class="glass-panel p-4">
                                <h5 class="text-lg font-semibold text-accent-emerald mb-3">
                                    <i class="fas fa-eye mr-2"></i>
                                    🤖 Resultados del Procesamiento OCR
                                </h5>
                                <div id="ocr-content" class="space-y-3"></div>
                            </div>
                        </div>
                    </div>

                    <!-- BOTONES DE ACCIÓN -->
                    <div class="flex justify-between items-center pt-6 border-t border-accent-gold/30">
                        <button type="button" onclick="closeAddExpenseModal()" 
                                class="premium-button" style="background: var(--gradient-accent);">
                            <i class="fas fa-times mr-3"></i>
                            ❌ CANCELAR
                        </button>
                        
                        <button type="submit" id="gusbit-submit-button" 
                                class="premium-button text-lg px-8" 
                                style="background: var(--gradient-gold);" disabled>
                            <i class="fas fa-save mr-3"></i>
                            ❌ COMPLETAR TODOS LOS CAMPOS
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Modal Detalle de Gasto (Expenses) -->
        <div id="expenseDetailModalExpenses" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center">
            <div class="glass-panel p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-bold text-accent-gold flex items-center">
                        <i class="fas fa-receipt mr-3"></i>Detalle del Gasto
                    </h2>
                    <button onclick="closeExpenseModalExpenses()" class="text-text-secondary hover:text-accent-gold transition-colors">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <!-- Contenido idéntico al modal del dashboard -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <!-- Columna Izquierda -->
                    <div class="space-y-6">
                        <div class="glass-panel p-6">
                            <h3 class="text-lg font-semibold text-accent-gold mb-4">📋 Información General</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">Descripción</label>
                                    <p id="modal-description-exp" class="text-text-primary font-medium text-lg"></p>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-accent-gold mb-1">📅 Fecha</label>
                                        <p id="modal-date-exp" class="text-text-primary"></p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-accent-gold mb-1">🏷️ Tipo</label>
                                        <p id="modal-type-exp" class="text-text-primary"></p>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">🏢 Empresa</label>
                                    <p id="modal-company-exp" class="text-text-primary font-medium"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">👤 Usuario Responsable</label>
                                    <p id="modal-user-exp" class="text-text-primary"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="glass-panel p-6">
                            <h3 class="text-lg font-semibold text-accent-gold mb-4">💰 Información Financiera</h3>
                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-accent-gold mb-1">💵 Monto Original</label>
                                        <p id="modal-amount-exp" class="text-accent-emerald font-bold text-xl"></p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-accent-gold mb-1">💱 Moneda</label>
                                        <p id="modal-currency-exp" class="text-text-primary"></p>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">🇲🇽 Equivalente MXN</label>
                                    <p id="modal-amount-mxn-exp" class="text-accent-emerald font-bold text-lg"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">💳 Método de Pago</label>
                                    <p id="modal-payment-method-exp" class="text-text-primary"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Columna Derecha -->
                    <div class="space-y-6">
                        <div class="glass-panel p-6">
                            <h3 class="text-lg font-semibold text-accent-gold mb-4">🏪 Detalles Comerciales</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">🏪 Proveedor/Lugar</label>
                                    <p id="modal-vendor-exp" class="text-text-primary"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">📄 Número de Factura</label>
                                    <p id="modal-invoice-exp" class="text-text-primary"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">📂 Categoría</label>
                                    <p id="modal-category-exp" class="text-text-primary"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">📊 Estado Actual</label>
                                    <p id="modal-status-exp" class="font-bold"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="glass-panel p-6">
                            <h3 class="text-lg font-semibold text-accent-gold mb-4">📝 Observaciones</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">Notas</label>
                                    <p id="modal-notes-exp" class="text-text-primary text-sm bg-glass p-3 rounded-lg min-h-[60px]"></p>
                                </div>
                                <div class="text-sm">
                                    <div>
                                        <label class="block text-xs font-medium text-accent-gold mb-1">Creado</label>
                                        <p id="modal-created-exp" class="text-text-secondary"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Acciones del Gasto -->
                <div class="border-t border-glass-border pt-6">
                    <h3 class="text-lg font-semibold text-accent-gold mb-4">⚡ Acciones</h3>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onclick="authorizeExpenseExp()" class="premium-button bg-green-600 hover:bg-green-700">
                            <i class="fas fa-check mr-2"></i>Autorizar
                        </button>
                        <button onclick="rejectExpenseExp()" class="premium-button bg-red-600 hover:bg-red-700">
                            <i class="fas fa-times mr-2"></i>Rechazar
                        </button>
                        <button onclick="requestMoreInfoExpenses()" class="premium-button bg-blue-600 hover:bg-blue-700">
                            <i class="fas fa-question-circle mr-2"></i>Pedir Info
                        </button>
                        <button onclick="leavePendingExpenses()" class="premium-button bg-yellow-600 hover:bg-yellow-700">
                            <i class="fas fa-clock mr-2"></i>Dejar Pendiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- CARGAR SISTEMA GUSBIT COMPLETO -->
        <script src="/static/expenses.js"></script>
        
        <script>
            // INICIALIZACIÓN INMEDIATA DEL SISTEMA GUSBIT
            document.addEventListener('DOMContentLoaded', function() {
                // Cargar gastos y empresas inmediatamente
                if (typeof loadExpenses === 'function') {
                    loadExpenses();
                } else {
                    console.error('❌ loadExpenses no está definido');
                }
                
                // Configurar fecha actual por defecto
                const today = new Date().toISOString().split('T')[0];
                const fechaField = document.getElementById('gusbit-fecha');
                if (fechaField) {
                    fechaField.value = today;
                }
            });
            
            // FUNCIONES DE FORMATEO DE NÚMEROS PARA MONTOS
            function formatNumber(num) {
                if (!num) return '';
                // Eliminar todo excepto números y puntos
                const cleanNum = num.toString().replace(/[^0-9.]/g, '');
                
                // Dividir en parte entera y decimales
                const parts = cleanNum.split('.');
                const integerPart = parts[0];
                const decimalPart = parts[1];
                
                // Formatear parte entera con comas cada 3 dígitos
                const formattedInteger = integerPart.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
                
                // Retornar con decimales si existen
                if (decimalPart !== undefined) {
                    return formattedInteger + '.' + decimalPart.slice(0, 2); // Máximo 2 decimales
                }
                
                return formattedInteger;
            }
            
            function unformatNumber(formattedNum) {
                if (!formattedNum) return '';
                return formattedNum.replace(/,/g, '');
            }
            
            // CONFIGURAR FORMATEO AUTOMÁTICO DEL CAMPO MONTO
            document.addEventListener('DOMContentLoaded', function() {
                // Esperar a que el modal se cargue y luego configurar el evento
                setTimeout(() => {
                    const montoField = document.getElementById('gusbit-monto');
                    if (montoField) {
                        // Formatear mientras escribe
                        montoField.addEventListener('input', function(e) {
                            const cursorPos = e.target.selectionStart;
                            const oldValue = e.target.value;
                            const newValue = formatNumber(oldValue);
                            
                            if (oldValue !== newValue) {
                                e.target.value = newValue;
                                // Ajustar cursor
                                const newCursorPos = cursorPos + (newValue.length - oldValue.length);
                                e.target.setSelectionRange(newCursorPos, newCursorPos);
                            }
                        });
                        
                        // Al salir del campo, asegurar formato correcto
                        montoField.addEventListener('blur', function(e) {
                            const value = parseFloat(unformatNumber(e.target.value));
                            if (!isNaN(value)) {
                                e.target.value = formatNumber(value.toFixed(2));
                            }
                        });

                    }
                }, 2000);
            });
            
            // NOTA: Las funciones closeAddExpenseModal(), handleFileUpload() y fillFormWithOCR() 
            // ya están definidas en expenses.js - No las redefinimos aquí para evitar duplicación
            
        </script>
    </body>
    </html>
  `)
})

app.get('/expenses-old', (c) => {
  return c.render(
    <div className="min-h-screen bg-primary">
      {/* Header Navigation */}
      <div className="bg-glass border-b border-glass-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <a href="/" className="text-gold hover:text-gold-light transition-colors duration-200 text-xl">
                <i className="fas fa-arrow-left"></i>
              </a>
              <div>
                <h1 className="text-3xl font-bold text-primary flex items-center">
                  <i className="fas fa-receipt mr-3 text-gold"></i>
                  Gestión de Gastos
                </h1>
                <p className="text-sm text-tertiary mt-1">Control integral de gastos y viáticos empresariales</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-premium btn-emerald" onclick="showExpenseForm()">
                <i className="fas fa-plus mr-2"></i>
                Registrar Gasto
              </button>
              <button className="btn-premium btn-sapphire" onclick="showImportExcel()">
                <i className="fas fa-file-excel mr-2"></i>
                Importar Excel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Filters Section */}
        <div className="card-premium mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-primary flex items-center">
                <i className="fas fa-filter mr-3 text-gold"></i>
                Filtros Avanzados de Gastos
              </h3>
              <p className="text-sm text-tertiary mt-1">Personaliza tu búsqueda con filtros multidimensionales</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">🏢 Empresa</label>
              <select id="filter-company" className="w-full border border-gray-300 rounded-lg px-3 py-2" onchange="EXPENSES_FILTER_COMPANY(this.value)" style="background-color: white !important; color: black !important;">
                <option value="" style="background-color: white !important; color: black !important;">Todas las empresas</option>
                <option value="1" style="background-color: white !important; color: black !important;">🇲🇽 TechMX Solutions</option>
                <option value="2" style="background-color: white !important; color: black !important;">🇲🇽 Innovación Digital MX</option>
                <option value="3" style="background-color: white !important; color: black !important;">🇲🇽 Consultoría Estratégica MX</option>
                <option value="4" style="background-color: white !important; color: black !important;">🇪🇸 TechES Barcelona</option>
                <option value="5" style="background-color: white !important; color: black !important;">🇪🇸 Innovación Madrid SL</option>
                <option value="6" style="background-color: white !important; color: black !important;">🇪🇸 Digital Valencia S.A.</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">👤 Usuario Responsable</label>
              <select id="filter-user" className="w-full border border-gray-300 rounded-lg px-3 py-2" onchange="EXPENSES_FILTER_USER(this.value)" style="background-color: white !important; color: black !important;">
                <option value="" style="background-color: white !important; color: black !important;">Todos los usuarios</option>
                <option value="1" style="background-color: white !important; color: black !important;">👑 Alejandro Rodríguez (Admin)</option>
                <option value="2" style="background-color: white !important; color: black !important;">✏️ María López (Editor)</option>
                <option value="3" style="background-color: white !important; color: black !important;">⭐ Carlos Martínez (Advanced)</option>
                <option value="4" style="background-color: white !important; color: black !important;">✏️ Ana García (Editor)</option>
                <option value="5" style="background-color: white !important; color: black !important;">⭐ Pedro Sánchez (Advanced)</option>
                <option value="6" style="background-color: white !important; color: black !important;">✏️ Elena Torres (Editor)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">📋 Estado del Gasto</label>
              <select id="filter-status" className="w-full border border-gray-300 rounded-lg px-3 py-2" onchange="EXPENSES_FILTER_STATUS(this.value)" style="background-color: white !important; color: black !important;">
                <option value="" style="background-color: white !important; color: black !important;">Todos los estados</option>
                <option value="pending" style="background-color: white !important; color: black !important;">⏳ Pendiente</option>
                <option value="approved" style="background-color: white !important; color: black !important;">✅ Aprobado</option>
                <option value="rejected" style="background-color: white !important; color: black !important;">❌ Rechazado</option>
                <option value="more_info" style="background-color: white !important; color: black !important;">💬 Pedir Más Información</option>
                <option value="reimbursed" style="background-color: white !important; color: black !important;">💰 Reembolsado</option>
                <option value="invoiced" style="background-color: white !important; color: black !important;">📄 Facturado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">💰 Moneda</label>
              <select id="filter-currency" className="w-full border border-gray-300 rounded-lg px-3 py-2" style="background-color: white !important; color: black !important;">
                <option value="" style="background-color: white !important; color: black !important;">Todas las monedas</option>
                <option value="MXN" style="background-color: white !important; color: black !important;">🇲🇽 MXN</option>
                <option value="USD" style="background-color: white !important; color: black !important;">🇺🇸 USD</option>
                <option value="EUR" style="background-color: white !important; color: black !important;">🇪🇺 EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">🏷️ Tipo de Gasto</label>
              <select id="filter-expense-type" className="w-full border border-gray-300 rounded-lg px-3 py-2" onchange="EXPENSES_FILTER_TYPE(this.value)" style="background-color: white !important; color: black !important;">
                <option value="" style="background-color: white !important; color: black !important;">Todos los tipos</option>
                <option value="1" style="background-color: white !important; color: black !important;">🍽️ Comidas de Trabajo</option>
                <option value="2" style="background-color: white !important; color: black !important;">🚕 Transporte Terrestre</option>
                <option value="3" style="background-color: white !important; color: black !important;">⛽ Combustible</option>
                <option value="4" style="background-color: white !important; color: black !important;">🏨 Hospedaje</option>
                <option value="5" style="background-color: white !important; color: black !important;">✈️ Vuelos</option>
                <option value="6" style="background-color: white !important; color: black !important;">📄 Material de Oficina</option>
                <option value="7" style="background-color: white !important; color: black !important;">💻 Software y Licencias</option>
                <option value="8" style="background-color: white !important; color: black !important;">🎓 Capacitación</option>
                <option value="9" style="background-color: white !important; color: black !important;">📊 Marketing</option>
                <option value="10" style="background-color: white !important; color: black !important;">📂 Otros Gastos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">📅 Fecha Desde</label>
              <input type="date" id="filter-date-from" className="w-full border border-gray-300 rounded-lg px-3 py-2" style="background-color: white !important; color: black !important;" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">📅 Fecha Hasta</label>
              <input type="date" id="filter-date-to" className="w-full border border-gray-300 rounded-lg px-3 py-2" style="background-color: white !important; color: black !important;" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">💳 Método de Pago</label>
              <select id="filter-payment-method" className="w-full border border-gray-300 rounded-lg px-3 py-2" style="background-color: white !important; color: black !important;">
                <option value="" style="background-color: white !important; color: black !important;">Todos los métodos</option>
                <option value="cash" style="background-color: white !important; color: black !important;">💵 Efectivo</option>
                <option value="credit_card" style="background-color: white !important; color: black !important;">💳 Tarjeta de Crédito</option>
                <option value="debit_card" style="background-color: white !important; color: black !important;">💳 Tarjeta de Débito</option>
                <option value="bank_transfer" style="background-color: white !important; color: black !important;">🏦 Transferencia</option>
                <option value="company_card" style="background-color: white !important; color: black !important;">🏢 Tarjeta Empresarial</option>
                <option value="petty_cash" style="background-color: white !important; color: black !important;">💰 Caja Chica</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onclick="EXPENSES_APPLY_ALL_FILTERS()" className="btn-premium btn-sapphire">
              <i className="fas fa-search mr-2"></i>
              Aplicar Filtros
            </button>
            <button onclick="EXPENSES_CLEAR_ALL()" className="btn-premium btn-slate">
              <i className="fas fa-eraser mr-2"></i>
              Limpiar Todo
            </button>
            <button onclick="EXPENSES_TEST_MARIA()" className="btn-premium btn-emerald text-sm">
              <i className="fas fa-user mr-2"></i>
              Probar María
            </button>
            <button onclick="EXPENSES_TEST_PENDING()" className="btn-premium btn-gold text-sm">
              <i className="fas fa-clock mr-2"></i>
              Solo Pendientes
            </button>
            <button onclick="QUITAR_MARIA()" className="btn-premium btn-ruby text-sm">
              <i className="fas fa-user-slash mr-2"></i>
              Quitar María
            </button>
          </div>
        </div>
        
        {/* Premium Expenses Table */}
        <div className="card-premium">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-primary flex items-center">
                <i className="fas fa-list-alt mr-3 text-gold"></i>
                Lista de Gastos y Viáticos
              </h3>
              <p className="text-sm text-tertiary mt-1">Registro completo de transacciones empresariales</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div id="expenses-count" className="text-lg font-bold text-emerald">0 gastos</div>
                <div className="text-xs text-tertiary">Total registros</div>
              </div>
              <div className="text-center">
                <div id="expenses-total" className="text-lg font-bold text-gold">$0.00</div>
                <div className="text-xs text-tertiary">Monto total</div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto bg-glass rounded-lg border border-glass-border">
            <table className="min-w-full">
              <thead className="bg-quaternary border-b border-glass-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <input type="checkbox" id="select-all" className="mr-2 accent-gold" onclick="toggleSelectAll()" />
                    <i className="fas fa-hashtag mr-1 text-gold"></i>ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <i className="fas fa-file-text mr-1 text-gold"></i>Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <i className="fas fa-building mr-1 text-gold"></i>Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <i className="fas fa-user mr-1 text-gold"></i>Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <i className="fas fa-money-bill mr-1 text-gold"></i>Monto Original
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <i className="fas fa-peso-sign mr-1 text-gold"></i>Monto MXN
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <i className="fas fa-flag mr-1 text-gold"></i>Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <i className="fas fa-calendar mr-1 text-gold"></i>Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <i className="fas fa-paperclip mr-1 text-gold"></i>Adjuntos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    <i className="fas fa-cogs mr-1 text-gold"></i>Acciones
                  </th>
                </tr>
              </thead>
              <tbody id="expenses-table" className="divide-y divide-glass-border">
                <tr className="hover:bg-glass-hover transition-colors duration-200">
                  <td colspan="10" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-spinner fa-spin text-2xl text-gold mb-3"></i>
                      <span className="text-secondary">Cargando gastos...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Registro de Gastos Completo */}
      <div id="expense-modal" className="fixed inset-0 z-50 hidden">
        <div className="fixed inset-0 bg-black bg-opacity-50" onclick="closeExpenseForm()"></div>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <i className="fas fa-plus-circle mr-2 text-green-600"></i>
                    Registrar Nuevo Gasto o Viático
                  </h3>
                  <button onclick="closeExpenseForm()" className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Complete todos los campos requeridos. Los campos marcados con * son obligatorios.</p>
              </div>

              <form id="expense-form" className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columna Izquierda */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">📋 Información Básica</h4>
                    
                    {/* Empresa */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa * <i className="fas fa-building ml-1 text-blue-500"></i>
                      </label>
                      <select id="form-company" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Seleccione una empresa...</option>
                      </select>
                    </div>

                    {/* Tipo de Gasto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Gasto * <i className="fas fa-tags ml-1 text-purple-500"></i>
                      </label>
                      <select id="form-expense-type" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Seleccione tipo de gasto...</option>
                      </select>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción * <i className="fas fa-edit ml-1 text-green-500"></i>
                      </label>
                      <textarea id="form-description" required rows="3" placeholder="Ej: Comida con cliente - Proyecto Alpha" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>

                    {/* Fecha */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha del Gasto * <i className="fas fa-calendar ml-1 text-red-500"></i>
                      </label>
                      <input type="date" id="form-expense-date" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* Responsable y Integrantes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Responsable <i className="fas fa-user ml-1 text-indigo-500"></i>
                      </label>
                      <select id="form-responsible" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Yo (usuario actual)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Integrantes <i className="fas fa-users ml-1 text-orange-500"></i>
                      </label>
                      <textarea id="form-attendees" rows="2" placeholder="Ej: María López, Carlos Martínez (opcional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                  </div>

                  {/* Columna Derecha */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">💰 Información Financiera</h4>
                    
                    {/* Monto y Moneda */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monto * <i className="fas fa-dollar-sign ml-1 text-green-600"></i>
                        </label>
                        <input type="number" step="0.01" id="form-amount" required placeholder="0.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Moneda * <i className="fas fa-coins ml-1 text-yellow-600"></i>
                        </label>
                        <select id="form-currency" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="updateExchangeRate()">
                          <option value="">Seleccionar...</option>
                          <option value="MXN">🇲🇽 MXN</option>
                          <option value="USD">🇺🇸 USD</option>
                          <option value="EUR">🇪🇺 EUR</option>
                        </select>
                      </div>
                    </div>

                    {/* Tipo de Cambio */}
                    <div id="exchange-rate-section" className="hidden">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Cambio <i className="fas fa-exchange-alt ml-1 text-blue-600"></i>
                      </label>
                      <div className="flex items-center space-x-2">
                        <input type="number" step="0.000001" id="form-exchange-rate" readonly className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                        <button type="button" onclick="refreshExchangeRate()" className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <i className="fas fa-sync-alt"></i>
                        </button>
                      </div>
                      <p id="exchange-rate-info" className="text-xs text-gray-500 mt-1"></p>
                    </div>

                    {/* Método de Pago */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Método de Pago * <i className="fas fa-credit-card ml-1 text-purple-600"></i>
                      </label>
                      <select id="form-payment-method" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Seleccione método...</option>
                        <option value="cash">💵 Efectivo</option>
                        <option value="credit_card">💳 Tarjeta de Crédito</option>
                        <option value="debit_card">💳 Tarjeta de Débito</option>
                        <option value="bank_transfer">🏦 Transferencia Bancaria</option>
                        <option value="company_card">🏢 Tarjeta Empresarial</option>
                        <option value="petty_cash">🪙 Caja Chica</option>
                      </select>
                    </div>

                    {/* Proveedor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor/Establecimiento <i className="fas fa-store ml-1 text-teal-500"></i>
                      </label>
                      <input type="text" id="form-vendor" placeholder="Ej: Restaurante Pujol, Uber, Adobe Inc" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* Número de Factura */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Factura/Folio <i className="fas fa-receipt ml-1 text-gray-600"></i>
                      </label>
                      <input type="text" id="form-invoice-number" placeholder="Ej: A123456789" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado Inicial <i className="fas fa-flag ml-1 text-yellow-500"></i>
                      </label>
                      <select id="form-status" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="pending">⏳ Pendiente</option>
                        <option value="approved">✅ Aprobado</option>
                      </select>
                    </div>

                    {/* Facturable */}
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="form-billable" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label for="form-billable" className="text-sm font-medium text-gray-700">
                        <i className="fas fa-file-invoice-dollar mr-1 text-green-600"></i>
                        Gasto Facturable al Cliente
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">📝 Información Adicional</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas y Comentarios <i className="fas fa-sticky-note ml-1 text-yellow-500"></i>
                    </label>
                    <textarea id="form-notes" rows="3" placeholder="Información adicional, contexto del gasto, observaciones..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                  </div>
                </div>

                {/* Archivos Adjuntos con OCR */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">📎 Archivos Adjuntos con OCR Inteligente</h4>
                  
                  {/* OCR Settings */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" id="enable-ocr" checked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label for="enable-ocr" className="text-sm font-medium text-blue-900">
                        <i className="fas fa-robot mr-1"></i>
                        Activar OCR - Extracción Automática de Datos
                      </label>
                    </div>
                    <p className="text-xs text-blue-700 mt-1 ml-6">
                      El sistema extraerá automáticamente: monto, fecha, proveedor, y método de pago desde tickets y facturas
                    </p>
                  </div>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors" 
                       ondrop="handleFileDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 mb-2">
                      <strong>Arrastra archivos aquí</strong> o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      📸 Tickets • 📄 Facturas PDF/XML • 🖼️ Fotografías (Max: 10MB por archivo)
                    </p>
                    
                    {/* Mobile Camera Button */}
                    <div className="flex justify-center space-x-3">
                      <input type="file" id="form-attachments" multiple accept=".pdf,.xml,.jpg,.jpeg,.png,.gif" className="hidden" onchange="handleFileSelect(event)" />
                      
                      <button type="button" onclick="document.getElementById('form-attachments').click()" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i className="fas fa-paperclip mr-2"></i>
                        Seleccionar Archivos
                      </button>
                      
                      <button type="button" onclick="captureFromCamera()" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 md:hidden min-h-12">
                        <i className="fas fa-camera mr-2"></i>
                        📸 Tomar Foto
                      </button>
                      
                      <button type="button" onclick="captureLocationForExpense()" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 md:hidden min-h-12">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        📍 Ubicación
                      </button>
                    </div>
                    
                    <input type="file" id="camera-capture" accept="image/*" capture="environment" className="hidden" onchange="handleCameraCapture(event)" />
                  </div>
                  
                  {/* OCR Processing Status */}
                  <div id="ocr-status" className="mt-3 hidden">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <i className="fas fa-cog fa-spin text-yellow-600 mr-2"></i>
                        <span class="text-yellow-800">Procesando OCR...</span>
                      </div>
                    </div>
                  </div>

                  {/* Attachments Preview */}
                  <div id="attachments-preview" className="mt-4 hidden">
                    <h5 className="font-medium text-gray-900 mb-2">Archivos y Datos Extraídos:</h5>
                    <div id="attachments-list" className="space-y-2"></div>
                  </div>

                  {/* OCR Results */}
                  <div id="ocr-results" className="mt-4 hidden">
                    <h5 className="font-medium text-gray-900 mb-2">
                      <i className="fas fa-magic mr-1 text-purple-600"></i>
                      Datos Extraídos Automáticamente:
                    </h5>
                    <div id="ocr-data-preview" className="bg-green-50 border border-green-200 rounded-lg p-4">
                      {/* OCR extracted data will be shown here */}
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <button type="button" onclick="applyOcrData()" className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                        <i className="fas fa-check mr-1"></i>
                        Aplicar Datos
                      </button>
                      <button type="button" onclick="clearOcrData()" className="text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                        <i className="fas fa-times mr-1"></i>
                        Descartar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button type="button" onclick="closeExpenseForm()" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <i className="fas fa-times mr-2"></i>
                    Cancelar
                  </button>
                  <button type="button" onclick="saveDraft()" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    <i className="fas fa-save mr-2"></i>
                    Guardar Borrador
                  </button>
                  <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <i className="fas fa-check mr-2"></i>
                    Registrar Gasto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})

// Dashboard metrics endpoint (protected)
app.get('/api/dashboard-metrics', authMiddleware, async (c) => {
  const { env } = c;
  
  try {
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    
    // Get accessible companies based on user role
    let companyFilter = '';
    if (userRole !== 'admin') {
      companyFilter = `
        AND e.company_id IN (
          SELECT company_id FROM user_companies WHERE user_id = ${userId}
        )
      `;
    }
    
    // Total expenses (this month)
    const totalExpenses = await env.DB.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount_mxn), 0) as total
      FROM expenses e
      WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', 'now')
      ${companyFilter}
    `).first();
    
    // Pending expenses
    const pendingExpenses = await env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM expenses e
      WHERE e.status = 'pending'
      ${companyFilter}
    `).first();
    
    // Company metrics
    const companyMetrics = await env.DB.prepare(`
      SELECT c.name as company, COUNT(e.id) as count, 
             COALESCE(SUM(e.amount_mxn), 0) as total_mxn
      FROM companies c
      LEFT JOIN expenses e ON c.id = e.company_id
      WHERE c.active = TRUE
      ${userRole !== 'admin' ? `AND c.id IN (SELECT company_id FROM user_companies WHERE user_id = ${userId})` : ''}
      GROUP BY c.id, c.name
      ORDER BY total_mxn DESC
    `).all();
    
    // Currency metrics
    const currencyMetrics = await env.DB.prepare(`
      SELECT currency, COUNT(*) as count, SUM(amount) as total_original, SUM(amount_mxn) as total_mxn
      FROM expenses e
      WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', 'now')
      ${companyFilter}
      GROUP BY currency
      ORDER BY total_mxn DESC
    `).all();
    
    // Status metrics
    const statusMetrics = await env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM expenses e
      WHERE 1=1 ${companyFilter}
      GROUP BY status
    `).all();
    
    // Recent expenses
    const recentExpenses = await env.DB.prepare(`
      SELECT e.*, c.name as company_name, u.name as user_name
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      WHERE 1=1 ${companyFilter}
      ORDER BY e.created_at DESC
      LIMIT 10
    `).all();
    
    return c.json({
      success: true,
      total_expenses: totalExpenses,
      pending_expenses: pendingExpenses,
      company_metrics: companyMetrics.results || [],
      currency_metrics: currencyMetrics.results || [],
      status_metrics: statusMetrics.results || [],
      recent_expenses: recentExpenses.results || []
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to load dashboard metrics', details: error.message }, 500);
  }
})

// ===== JWT AUTHENTICATION SYSTEM =====

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

// JWT Secret (in production, use environment variable)
const JWT_SECRET = new TextEncoder().encode('lyra-expenses-jwt-secret-2024-very-secure-key-change-in-production')

// JWT Helper Functions
async function generateTokens(userId: number, userRole: string) {
  const now = Math.floor(Date.now() / 1000)
  
  // Access token (15 minutes)
  const accessToken = await new SignJWT({
    sub: userId.toString(),
    role: userRole,
    type: 'access'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60) // 15 minutes
    .sign(JWT_SECRET)

  // Refresh token (7 days)
  const refreshToken = await new SignJWT({
    sub: userId.toString(),
    role: userRole,
    type: 'refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 days
    .sign(JWT_SECRET)

  return { accessToken, refreshToken }
}

async function verifyToken(token: string, tokenType: 'access' | 'refresh' = 'access') {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (payload.type !== tokenType) {
      throw new Error('Invalid token type')
    }
    
    return payload
  } catch (error) {
    return null
  }
}

// Authentication Middleware
async function authMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  const token = authHeader.split(' ')[1]
  const payload = await verifyToken(token, 'access')
  
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
  
  // Add user info to request context
  c.set('userId', parseInt(payload.sub as string))
  c.set('userRole', payload.role as string)
  
  await next()
}

// Role-based middleware
function requireRole(allowedRoles: string[]) {
  return async (c: any, next: any) => {
    const userRole = c.get('userRole')
    
    if (!allowedRoles.includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }
    
    await next()
  }
}

// ===== AUTHENTICATION ENDPOINTS =====

// Login endpoint
app.post('/api/auth/login', async (c) => {
  const { env } = c;
  
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    // Find user by email
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND active = TRUE')
      .bind(email.toLowerCase()).first();
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Generate JWT tokens
    const tokens = await generateTokens(user.id, user.role);
    
    // Update last login
    await env.DB.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(user.id).run();
    
    // Create session record
    const sessionId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, expires_at, ip_address, user_agent) 
      VALUES (?, ?, datetime('now', '+7 days'), ?, ?)
    `).bind(
      sessionId, 
      user.id, 
      c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
      c.req.header('User-Agent') || 'unknown'
    ).run();
    
    // Return user data and tokens
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tokens,
      session_id: sessionId
    });
    
  } catch (error) {
    return c.json({ error: 'Login failed', details: error.message }, 500);
  }
})

// Refresh token endpoint
app.post('/api/auth/refresh', async (c) => {
  const { env } = c;
  
  try {
    const { refresh_token } = await c.req.json();
    
    if (!refresh_token) {
      return c.json({ error: 'Refresh token is required' }, 400);
    }
    
    const payload = await verifyToken(refresh_token, 'refresh');
    
    if (!payload) {
      return c.json({ error: 'Invalid or expired refresh token' }, 401);
    }
    
    const userId = parseInt(payload.sub as string);
    
    // Verify user still exists and is active
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ? AND active = TRUE')
      .bind(userId).first();
    
    if (!user) {
      return c.json({ error: 'User not found or inactive' }, 401);
    }
    
    // Generate new tokens
    const tokens = await generateTokens(user.id, user.role);
    
    return c.json({
      success: true,
      tokens
    });
    
  } catch (error) {
    return c.json({ error: 'Token refresh failed', details: error.message }, 500);
  }
})

// Logout endpoint
app.post('/api/auth/logout', authMiddleware, async (c) => {
  const { env } = c;
  
  try {
    const { session_id } = await c.req.json();
    const userId = c.get('userId');
    
    if (session_id) {
      // Delete specific session
      await env.DB.prepare('DELETE FROM user_sessions WHERE id = ? AND user_id = ?')
        .bind(session_id, userId).run();
    } else {
      // Delete all user sessions (logout from all devices)
      await env.DB.prepare('DELETE FROM user_sessions WHERE user_id = ?')
        .bind(userId).run();
    }
    
    return c.json({ success: true, message: 'Logged out successfully' });
    
  } catch (error) {
    return c.json({ error: 'Logout failed', details: error.message }, 500);
  }
})

// Get current user profile
app.get('/api/auth/profile', authMiddleware, async (c) => {
  const { env } = c;
  
  try {
    const userId = c.get('userId');
    
    // Get user with company permissions
    const user = await env.DB.prepare(`
      SELECT u.*, 
             GROUP_CONCAT(DISTINCT c.id || ':' || c.name) as companies
      FROM users u
      LEFT JOIN user_companies uc ON u.id = uc.user_id
      LEFT JOIN companies c ON uc.company_id = c.id
      WHERE u.id = ? AND u.active = TRUE
      GROUP BY u.id
    `).bind(userId).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const companies = user.companies ? 
      user.companies.split(',').map(item => {
        const [id, name] = item.split(':');
        return { id: parseInt(id), name };
      }) : [];
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companies,
        last_login: user.last_login,
        created_at: user.created_at
      }
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to get profile', details: error.message }, 500);
  }
})

// Protected route example - Get user's accessible companies
app.get('/api/auth/companies', authMiddleware, async (c) => {
  const { env } = c;
  
  try {
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    
    let companies;
    
    if (userRole === 'admin') {
      // Admins can see all companies
      companies = await env.DB.prepare('SELECT * FROM companies WHERE active = TRUE').all();
    } else {
      // Other users only see assigned companies
      companies = await env.DB.prepare(`
        SELECT c.* 
        FROM companies c
        JOIN user_companies uc ON c.id = uc.company_id
        WHERE uc.user_id = ? AND c.active = TRUE
      `).bind(userId).all();
    }
    
    return c.json({
      success: true,
      companies: companies.results
    });
    
  } catch (error) {
    return c.json({ error: 'Failed to get companies', details: error.message }, 500);
  }
})

// Analytics page - Advanced analytics and reports
app.get('/analytics', (c) => {
  return c.render(
    <div className="min-h-screen" style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);">
      {/* Premium Navigation */}
      <nav className="nav-premium border-b" style="border-color: rgba(255, 255, 255, 0.1);">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo & Branding */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <i className="fas fa-gem text-3xl text-gold animate-pulse-gold"></i>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="nav-logo text-3xl">Lyra Expenses</h1>
                  <p className="text-xs text-secondary opacity-75 font-medium">Executive Financial Management</p>
                </div>
              </div>
              <span className="nav-badge">
                Sistema 4-D Premium
              </span>
            </div>

            {/* Navigation Menu */}
            <div className="flex items-center space-x-8">
              {/* Main Navigation Links */}
              <nav className="flex space-x-6">
                <a href="/" className="nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2">
                  <i className="fas fa-chart-pie"></i>
                  <span>Dashboard</span>
                </a>
                <a href="/companies" className="nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2">
                  <i className="fas fa-building"></i>
                  <span>Empresas</span>
                </a>
                <a href="/expenses" className="nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2">
                  <i className="fas fa-receipt"></i>
                  <span>Gastos</span>
                </a>
                <a href="/analytics" className="nav-link text-gold active flex items-center space-x-2">
                  <i className="fas fa-chart-line"></i>
                  <span>Analytics</span>
                </a>
              </nav>
              
              {/* Right Side Actions */}
              <div className="flex items-center space-x-4 border-l border-glass-border pl-6">
                <div id="auth-indicator">
                  {/* Authentication status will be inserted here */}
                </div>
                
                <select id="currency-selector" className="form-input-premium bg-glass border-0 text-sm min-w-[120px]">
                  <option value="MXN">💎 MXN</option>
                  <option value="USD">🔹 USD</option>
                  <option value="EUR">🔸 EUR</option>
                </select>
                
                <button onclick="showExpenseForm()" className="btn-premium btn-emerald text-sm">
                  <i className="fas fa-plus mr-1"></i>
                  Nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold gradient-text-gold mb-3">
            <i className="fas fa-chart-line mr-3"></i>
            Analytics Avanzado
          </h2>
          <p className="text-secondary text-lg">Análisis profundo y reportes inteligentes multiempresa</p>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-6 text-sm text-tertiary">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"></div>
                Datos en tiempo real
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"></div>
                Machine Learning activo
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"></div>
                Predicciones inteligentes
              </span>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="glass-panel p-16 text-center">
          <div className="mb-8">
            <i className="fas fa-rocket text-6xl text-gold mb-6"></i>
            <h3 className="text-3xl font-bold text-primary mb-4">Próximamente</h3>
            <p className="text-xl text-secondary mb-6">Analytics Avanzado con IA</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-glass rounded-lg">
              <i className="fas fa-brain text-3xl text-emerald mb-4"></i>
              <h4 className="text-lg font-bold text-primary mb-2">Machine Learning</h4>
              <p className="text-sm text-tertiary">Predicciones automáticas de gastos y detección de anomalías</p>
            </div>
            
            <div className="p-6 bg-glass rounded-lg">
              <i className="fas fa-chart-network text-3xl text-gold mb-4"></i>
              <h4 className="text-lg font-bold text-primary mb-2">Analytics Predictivo</h4>
              <p className="text-sm text-tertiary">Forecasting inteligente y optimización de presupuestos</p>
            </div>
            
            <div className="p-6 bg-glass rounded-lg">
              <i className="fas fa-file-chart-line text-3xl text-sapphire mb-4"></i>
              <h4 className="text-lg font-bold text-primary mb-2">Reportes Avanzados</h4>
              <p className="text-sm text-tertiary">Reportes ejecutivos automatizados con insights accionables</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <a href="/" className="btn-premium btn-gold">
              <i className="fas fa-chart-pie mr-2"></i>
              Volver al Dashboard
            </a>
            <a href="/companies" className="btn-premium btn-sapphire">
              <i className="fas fa-building mr-2"></i>
              Ver Empresas
            </a>
          </div>
        </div>
        
      </div>
      
      {/* Dependencies */}
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
      <link href="/static/styles.css" rel="stylesheet" />
      
      {/* Scripts */}
      <script src="/static/app.js"></script>
      <script>{`
        // Initialize expenses page IMMEDIATELY
        console.log('🚀 Expenses page script loaded');
        
        // Function to load expenses with retry
        function loadExpensesNow() {
          console.log('🔄 Attempting to load expenses...');
          
          fetch('/api/expenses')
            .then(response => response.json())
            .then(data => {
              console.log('✅ Expenses loaded:', data);
              
              // Update counters
              const count = data.expenses?.length || 0;
              const total = data.expenses?.reduce((sum, e) => sum + parseFloat(e.amount_mxn || 0), 0) || 0;
              
              document.getElementById('expenses-count').textContent = count + ' gastos';
              document.getElementById('expenses-total').textContent = '$' + total.toLocaleString('es-MX');
              
              // Update table
              EXPENSES_UPDATE_TABLE(data.expenses || []);
            })
            .catch(error => {
              console.error('❌ Error loading expenses:', error);
              
              // Show error in table
              const tableBody = document.getElementById('expenses-table');
              if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-red-500"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar gastos</td></tr>';
              }
            });
        }
        
        // Load immediately
        loadExpensesNow();
        
        // Also try after DOM loaded
        document.addEventListener('DOMContentLoaded', function() {
          console.log('🚀 DOM loaded - retrying expenses load');
          setTimeout(loadExpensesNow, 500);
        });
        
        // Try again after 2 seconds as backup
        setTimeout(loadExpensesNow, 2000);
      `}</script>
    </div>
  );
})

// Dashboard Analytics Route - Purple themed with "Ficha de gasto" sidebar
app.get('/analytics-morado', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Dashboard Analítico - Lyra Expenses</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .purple-gradient { 
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%); 
        }
        .purple-glass { 
            background: rgba(139, 92, 246, 0.1); 
            backdrop-filter: blur(10px); 
            border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .purple-card {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05));
            border: 1px solid rgba(139, 92, 246, 0.15);
        }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <!-- Navigation Header -->
    <header class="purple-gradient shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <i class="fas fa-chart-line text-white text-xl"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-white">Lyra Expenses</h1>
                </div>
                <nav class="flex space-x-6">
                    <a href="/analytics-morado" class="text-white font-medium px-3 py-2 rounded-md bg-white bg-opacity-20">
                        <i class="fas fa-chart-pie mr-2"></i>Analytics
                    </a>
                    <a href="/" class="text-white hover:text-purple-200 font-medium px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-10 transition">
                        <i class="fas fa-building mr-2"></i>Dashboard
                    </a>
                    <a href="/expenses" class="text-white hover:text-purple-200 font-medium px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-10 transition">
                        <i class="fas fa-receipt mr-2"></i>Gastos
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <div class="flex h-screen pt-0">
        <!-- Sidebar: Ficha de Gasto -->
        <div class="w-80 purple-glass shadow-xl overflow-y-auto">
            <div class="p-6">
                <h2 class="text-xl font-bold text-purple-900 mb-6">
                    <i class="fas fa-filter mr-2"></i>Ficha de Gasto
                </h2>
                
                <!-- Filters -->
                <div class="space-y-4">
                    <!-- Company Filter -->
                    <div>
                        <label class="block text-sm font-medium text-purple-800 mb-2">Empresa</label>
                        <select id="companyFilter" class="w-full px-3 py-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Todas las empresas</option>
                        </select>
                    </div>

                    <!-- Status Filter -->
                    <div>
                        <label class="block text-sm font-medium text-purple-800 mb-2">Estado</label>
                        <select id="statusFilter" class="w-full px-3 py-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="approved">Aprobado</option>
                            <option value="rejected">Rechazado</option>
                            <option value="reimbursed">Reembolsado</option>
                        </select>
                    </div>

                    <!-- Currency Filter -->
                    <div>
                        <label class="block text-sm font-medium text-purple-800 mb-2">Moneda</label>
                        <select id="currencyFilter" class="w-full px-3 py-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Todas las monedas</option>
                            <option value="MXN">MXN - Peso Mexicano</option>
                            <option value="USD">USD - Dólar</option>
                            <option value="EUR">EUR - Euro</option>
                        </select>
                    </div>

                    <!-- Apply Filters Button -->
                    <button id="applyFilters" class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition font-medium">
                        <i class="fas fa-search mr-2"></i>Aplicar Filtros
                    </button>
                    
                    <!-- Clear Filters Button -->
                    <button id="clearFilters" class="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition font-medium">
                        <i class="fas fa-eraser mr-2"></i>Limpiar Filtros
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-auto bg-gray-50">
            <div class="p-6">
                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <!-- Total Amount -->
                    <div class="purple-card rounded-xl p-6 shadow-sm">
                        <div class="flex items-center">
                            <div class="p-3 bg-purple-100 rounded-full mr-4">
                                <i class="fas fa-euro-sign text-purple-600 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-purple-600">Total Gastos</p>
                                <p id="totalAmount" class="text-2xl font-bold text-purple-900">4,563 €</p>
                            </div>
                        </div>
                    </div>

                    <!-- Total Companies -->
                    <div class="purple-card rounded-xl p-6 shadow-sm">
                        <div class="flex items-center">
                            <div class="p-3 bg-purple-100 rounded-full mr-4">
                                <i class="fas fa-building text-purple-600 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-purple-600">Empresas</p>
                                <p id="totalCompanies" class="text-2xl font-bold text-purple-900">1</p>
                            </div>
                        </div>
                    </div>

                    <!-- Pending Authorization -->
                    <div class="purple-card rounded-xl p-6 shadow-sm">
                        <div class="flex items-center">
                            <div class="p-3 bg-orange-100 rounded-full mr-4">
                                <i class="fas fa-clock text-orange-600 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-purple-600">Pend. Autorización</p>
                                <p id="pendingAuth" class="text-2xl font-bold text-purple-900">1</p>
                            </div>
                        </div>
                    </div>

                    <!-- Approved Expenses -->
                    <div class="purple-card rounded-xl p-6 shadow-sm">
                        <div class="flex items-center">
                            <div class="p-3 bg-green-100 rounded-full mr-4">
                                <i class="fas fa-check-circle text-green-600 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-purple-600">Aprobados</p>
                                <p id="approvedCount" class="text-2xl font-bold text-purple-900">6</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Donut Chart -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                        <h3 class="text-lg font-semibold text-purple-900 mb-4">
                            <i class="fas fa-chart-pie mr-2 text-purple-600"></i>Gastos por Estado
                        </h3>
                        <div class="relative" style="height: 300px;">
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>

                    <!-- Bar Chart -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                        <h3 class="text-lg font-semibold text-purple-900 mb-4">
                            <i class="fas fa-chart-bar mr-2 text-purple-600"></i>Gastos por Empresa
                        </h3>
                        <div class="relative" style="height: 300px;">
                            <canvas id="companyChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Expenses Table -->
                <div class="bg-white rounded-xl shadow-sm border border-purple-100">
                    <div class="px-6 py-4 border-b border-purple-100">
                        <h3 class="text-lg font-semibold text-purple-900">
                            <i class="fas fa-table mr-2 text-purple-600"></i>Gastos Recientes
                        </h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-purple-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Fecha</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Descripción</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Empresa</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Monto</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody id="expensesTableBody" class="bg-white divide-y divide-gray-200">
                                <!-- Table rows will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Dashboard variables
        let currentFilters = {};
        let dashboardData = {};
        let statusChart, companyChart;

        // Initialize dashboard on load
        document.addEventListener('DOMContentLoaded', function() {
            loadCompanies();
            loadDashboardData();
            initializeEventListeners();
        });

        // Load companies for filter
        async function loadCompanies() {
            try {
                const response = await axios.get('/api/companies');
                const companies = response.data.companies;
                
                const select = document.getElementById('companyFilter');
                companies.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company.id;
                    option.textContent = company.name + ' (' + company.country + ')';
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading companies:', error);
            }
        }

        // Load dashboard data
        async function loadDashboardData() {
            try {
                const response = await axios.get('/api/dashboard/metrics', {
                    params: currentFilters
                });
                
                dashboardData = response.data;
                updateKPIs();
                updateCharts();
                updateTable();
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        // Update KPI cards
        function updateKPIs() {
            const statusMetrics = dashboardData.status_metrics || [];
            const companyMetrics = dashboardData.company_metrics || [];
            
            // Calculate totals
            const totalAmount = statusMetrics.reduce((sum, metric) => sum + (metric.total_mxn || 0), 0);
            const totalCompanies = companyMetrics.length;
            const pendingCount = statusMetrics.find(m => m.status === 'pending')?.count || 0;
            const approvedCount = statusMetrics.find(m => m.status === 'approved')?.count || 0;
            
            // Update KPI displays (convert to EUR for display)
            document.getElementById('totalAmount').textContent = Math.round(totalAmount / 20.15).toLocaleString() + ' €';
            document.getElementById('totalCompanies').textContent = totalCompanies;
            document.getElementById('pendingAuth').textContent = pendingCount;
            document.getElementById('approvedCount').textContent = approvedCount;
        }

        // Update charts
        function updateCharts() {
            updateStatusChart();
            updateCompanyChart();
        }

        // Update status donut chart with purple theme
        function updateStatusChart() {
            const ctx = document.getElementById('statusChart').getContext('2d');
            
            if (statusChart) {
                statusChart.destroy();
            }
            
            const statusMetrics = dashboardData.status_metrics || [];
            const labels = statusMetrics.map(m => getStatusLabel(m.status));
            const data = statusMetrics.map(m => m.count);
            
            statusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            '#8b5cf6', // Purple
                            '#a855f7', // Purple variant
                            '#c084fc', // Light purple
                            '#e879f9', // Pink purple
                            '#f3e8ff'  // Very light purple
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#6b21a8',
                                font: {
                                    weight: 'bold'
                                }
                            }
                        }
                    }
                }
            });
        }

        // Update company bar chart with purple theme
        function updateCompanyChart() {
            const ctx = document.getElementById('companyChart').getContext('2d');
            
            if (companyChart) {
                companyChart.destroy();
            }
            
            const companyMetrics = dashboardData.company_metrics || [];
            const labels = companyMetrics.map(m => m.company);
            const data = companyMetrics.map(m => Math.round((m.total_mxn || 0) / 20.15)); // Convert to EUR
            
            companyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Gastos (EUR)',
                        data: data,
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                        borderColor: '#8b5cf6',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#6b21a8',
                                font: {
                                    weight: 'bold'
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#6b21a8'
                            },
                            grid: {
                                color: 'rgba(139, 92, 246, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#6b21a8'
                            },
                            grid: {
                                color: 'rgba(139, 92, 246, 0.1)'
                            }
                        }
                    }
                }
            });
        }

        // Update expenses table
        function updateTable() {
            const tableBody = document.getElementById('expensesTableBody');
            const expenses = dashboardData.recent_expenses || [];
            
            tableBody.innerHTML = '';
            
            expenses.forEach(expense => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-purple-50 transition-colors';
                row.innerHTML = 
                    '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">' + formatDate(expense.expense_date) + '</td>' +
                    '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">' + expense.description + '</td>' +
                    '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">' + expense.company_name + '</td>' +
                    '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">' + expense.currency + ' ' + parseFloat(expense.amount).toLocaleString() + '</td>' +
                    '<td class="px-6 py-4 whitespace-nowrap">' +
                        '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ' + getStatusBadgeClass(expense.status) + '">' +
                            getStatusLabel(expense.status) +
                        '</span>' +
                    '</td>';
                tableBody.appendChild(row);
            });
        }

        // Event listeners for filters
        function initializeEventListeners() {
            document.getElementById('applyFilters').addEventListener('click', applyFilters);
            document.getElementById('clearFilters').addEventListener('click', clearFilters);
        }

        // Apply filters
        function applyFilters() {
            currentFilters = {
                company_id: document.getElementById('companyFilter').value,
                status: document.getElementById('statusFilter').value,
                currency: document.getElementById('currencyFilter').value
            };
            
            // Remove empty filters
            Object.keys(currentFilters).forEach(key => {
                if (!currentFilters[key]) {
                    delete currentFilters[key];
                }
            });
            
            loadDashboardData();
        }

        // Clear all filters
        function clearFilters() {
            document.getElementById('companyFilter').value = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('currencyFilter').value = '';
            
            currentFilters = {};
            loadDashboardData();
        }

        // Utility functions
        function formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('es-ES');
        }

        function getStatusLabel(status) {
            const labels = {
                'pending': 'Pendiente',
                'approved': 'Aprobado',
                'rejected': 'Rechazado',
                'reimbursed': 'Reembolsado'
            };
            return labels[status] || status;
        }

        function getStatusBadgeClass(status) {
            const classes = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'approved': 'bg-green-100 text-green-800',
                'rejected': 'bg-red-100 text-red-800',
                'reimbursed': 'bg-blue-100 text-blue-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
    </script>
</body>
</html>`);
})

// ===== GESTIÓN DE USUARIOS DEL SISTEMA =====
app.get('/users', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestión de Usuarios del Sistema</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <style>
        body {
            background: linear-gradient(135deg, 
                var(--color-bg-primary) 0%, 
                var(--color-bg-secondary) 50%, 
                var(--color-bg-tertiary) 100%);
            min-height: 100vh;
            color: var(--color-text-primary);
        }
        
        .premium-button {
            background: var(--gradient-emerald);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .premium-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        
        .premium-button.secondary {
            background: var(--gradient-sapphire);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .premium-button.secondary:hover {
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .premium-button.danger {
            background: var(--gradient-accent);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        .premium-button.danger:hover {
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }
        
        .glass-panel {
            background: var(--color-glass);
            backdrop-filter: blur(10px);
            border: 1px solid var(--color-border);
            border-radius: 12px;
            box-shadow: var(--shadow-glass);
        }
        
        .role-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .role-viewer { background-color: #e0f2fe; color: #0277bd; }
        .role-editor { background-color: #e8f5e8; color: #2e7d32; }
        .role-advanced { background-color: #fff3e0; color: #f57c00; }
        .role-admin { background-color: #fce4ec; color: #c2185b; }
        
        .status-active { color: #10b981; }
        .status-inactive { color: #ef4444; }
        </style>
    </head>
    <body>
        <!-- Navigation -->
        <nav class="glass-panel border-b sticky top-0 z-40 mb-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-8">
                        <a href="/" class="text-2xl font-bold bg-gradient-to-r from-accent-gold to-accent-emerald bg-clip-text text-transparent">
                            <i class="fas fa-gem mr-2"></i>LYRA
                        </a>
                        <div class="hidden md:flex space-x-6">
                            <a href="/" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-chart-line mr-2"></i>Dashboard
                            </a>
                            <a href="/expenses" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-receipt mr-2"></i>Gastos
                            </a>
                            <a href="/users" class="text-accent-emerald font-semibold">
                                <i class="fas fa-users-cog mr-2"></i>Usuarios del Sistema
                            </a>
                            <a href="/employees" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-id-card mr-2"></i>Empleados
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 class="text-4xl font-bold bg-gradient-to-r from-accent-gold to-accent-emerald bg-clip-text text-transparent mb-4">
                            <i class="fas fa-users-cog mr-3"></i>
                            Gestión de Usuarios del Sistema
                        </h1>
                        <p class="text-text-secondary text-lg">
                            Administra usuarios con acceso al sistema de gastos • Roles y Privilegios
                        </p>
                    </div>
                    <div class="flex gap-3 mt-4 md:mt-0">
                        <button onclick="showAddUserModal()" class="premium-button">
                            <i class="fas fa-user-plus"></i>
                            Nuevo Usuario
                        </button>
                        <button onclick="exportUsers()" class="premium-button secondary">
                            <i class="fas fa-download"></i>
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                        <i class="fas fa-users text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="total-users-count">-</p>
                    <p class="text-text-secondary">Total Usuarios</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                        <i class="fas fa-user-check text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="active-users-count">-</p>
                    <p class="text-text-secondary">Usuarios Activos</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
                        <i class="fas fa-crown text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="admin-users-count">-</p>
                    <p class="text-text-secondary">Administradores</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                        <i class="fas fa-clock text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="recent-logins-count">-</p>
                    <p class="text-text-secondary">Últimos 30 días</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="glass-panel p-6 mb-8">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Buscar Usuario</label>
                        <input 
                            type="text" 
                            id="search-user" 
                            placeholder="Nombre, email o ID..."
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Filtrar por Rol</label>
                        <select 
                            id="filter-role" 
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                            <option value="">Todos los Roles</option>
                            <option value="viewer">👀 Solo Lectura</option>
                            <option value="editor">✏️ Editor</option>
                            <option value="advanced">⭐ Avanzado</option>
                            <option value="admin">👑 Administrador</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Estado</label>
                        <select 
                            id="filter-status" 
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                            <option value="">Todos</option>
                            <option value="active">✅ Activo</option>
                            <option value="inactive">❌ Inactivo</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button onclick="applyUserFilters()" class="premium-button">
                            <i class="fas fa-filter"></i>
                            Filtrar
                        </button>
                        <button onclick="clearUserFilters()" class="premium-button secondary">
                            <i class="fas fa-eraser"></i>
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="glass-panel overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gradient-to-r from-accent-gold/10 to-accent-emerald/10">
                            <tr>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Usuario</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Email</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Rol</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Estado</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Último Acceso</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Empresas Asignadas</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="users-list" class="divide-y divide-border-primary">
                            <!-- Users will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Add/Edit User Modal -->
        <div id="userModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center">
            <div class="glass-panel p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-text-primary">
                        <i class="fas fa-user-plus mr-2 text-accent-emerald"></i>
                        <span id="modal-title">Nuevo Usuario del Sistema</span>
                    </h3>
                    <button onclick="closeUserModal()" class="text-text-secondary hover:text-accent-gold">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="userForm" onsubmit="saveUser(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <!-- Basic Info -->
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-user mr-2 text-accent-emerald"></i>
                                Nombre Completo *
                            </label>
                            <input 
                                type="text" 
                                id="user-name" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Ej: Juan Pérez García"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-envelope mr-2 text-accent-emerald"></i>
                                Email *
                            </label>
                            <input 
                                type="email" 
                                id="user-email" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="juan.perez@empresa.com"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-lock mr-2 text-accent-emerald"></i>
                                Contraseña *
                            </label>
                            <input 
                                type="password" 
                                id="user-password" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Mínimo 8 caracteres"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-user-tag mr-2 text-accent-emerald"></i>
                                Rol del Usuario *
                            </label>
                            <select 
                                id="user-role" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                                <option value="">Seleccionar Rol...</option>
                                <option value="viewer">👀 Solo Lectura - Puede ver gastos y reportes</option>
                                <option value="editor">✏️ Editor - Puede crear y editar gastos</option>
                                <option value="advanced">⭐ Avanzado - Editor + Aprobaciones limitadas</option>
                                <option value="admin">👑 Administrador - Acceso completo</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Company Permissions -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-text-primary mb-4">
                            <i class="fas fa-building mr-2 text-accent-emerald"></i>
                            Permisos por Empresa
                        </label>
                        <div id="company-permissions" class="space-y-3">
                            <!-- Company permissions will be loaded here -->
                        </div>
                    </div>
                    
                    <!-- Status -->
                    <div class="mb-6">
                        <label class="flex items-center text-sm font-medium text-text-primary">
                            <input 
                                type="checkbox" 
                                id="user-active" 
                                checked
                                class="mr-3 w-4 h-4 text-accent-emerald bg-glass-input border-border-primary rounded focus:ring-accent-emerald focus:ring-2"
                            >
                            <i class="fas fa-check-circle mr-2 text-accent-emerald"></i>
                            Usuario Activo (puede iniciar sesión)
                        </label>
                    </div>
                    
                    <div class="flex justify-end gap-4">
                        <button type="button" onclick="closeUserModal()" class="premium-button secondary">
                            <i class="fas fa-times mr-2"></i>
                            Cancelar
                        </button>
                        <button type="submit" class="premium-button">
                            <i class="fas fa-save mr-2"></i>
                            Guardar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <script src="/static/permissions-ui.js"></script>
        <script src="/static/users.js"></script></script>
    </body>
    </html>`);
})

// ===== GESTIÓN DE EMPLEADOS =====
app.get('/employees', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestión de Empleados</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <style>
        body {
            background: linear-gradient(135deg, 
                var(--color-bg-primary) 0%, 
                var(--color-bg-secondary) 50%, 
                var(--color-bg-tertiary) 100%);
            min-height: 100vh;
            color: var(--color-text-primary);
        }
        
        .premium-button {
            background: var(--gradient-emerald);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .premium-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        
        .premium-button.secondary {
            background: var(--gradient-sapphire);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .premium-button.secondary:hover {
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .premium-button.danger {
            background: var(--gradient-accent);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        .premium-button.danger:hover {
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }
        
        .glass-panel {
            background: var(--color-glass);
            backdrop-filter: blur(10px);
            border: 1px solid var(--color-border);
            border-radius: 12px;
            box-shadow: var(--shadow-glass);
        }
        
        .department-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .dept-it { background-color: #e3f2fd; color: #1565c0; }
        .dept-sales { background-color: #e8f5e8; color: #2e7d32; }
        .dept-hr { background-color: #fff3e0; color: #f57c00; }
        .dept-finance { background-color: #fce4ec; color: #c2185b; }
        .dept-operations { background-color: #f3e5f5; color: #7b1fa2; }
        .dept-management { background-color: #fff8e1; color: #f9a825; }
        </style>
    </head>
    <body>
        <!-- Navigation -->
        <nav class="glass-panel border-b sticky top-0 z-40 mb-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-8">
                        <a href="/" class="text-2xl font-bold bg-gradient-to-r from-accent-gold to-accent-emerald bg-clip-text text-transparent">
                            <i class="fas fa-gem mr-2"></i>LYRA
                        </a>
                        <div class="hidden md:flex space-x-6">
                            <a href="/" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-chart-line mr-2"></i>Dashboard
                            </a>
                            <a href="/expenses" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-receipt mr-2"></i>Gastos
                            </a>
                            <a href="/users" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-users-cog mr-2"></i>Usuarios del Sistema
                            </a>
                            <a href="/employees" class="text-accent-emerald font-semibold">
                                <i class="fas fa-id-card mr-2"></i>Empleados
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 class="text-4xl font-bold bg-gradient-to-r from-accent-gold to-accent-emerald bg-clip-text text-transparent mb-4">
                            <i class="fas fa-id-card mr-3"></i>
                            Gestión de Empleados
                        </h1>
                        <p class="text-text-secondary text-lg">
                            Administra empleados que generan gastos y viáticos • Información Personal y Laboral
                        </p>
                    </div>
                    <div class="flex gap-3 mt-4 md:mt-0">
                        <button onclick="showAddEmployeeModal()" class="premium-button">
                            <i class="fas fa-user-plus"></i>
                            Nuevo Empleado
                        </button>
                        <button onclick="exportEmployees()" class="premium-button secondary">
                            <i class="fas fa-download"></i>
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                        <i class="fas fa-users text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="total-employees-count">-</p>
                    <p class="text-text-secondary">Total Empleados</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                        <i class="fas fa-user-check text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="active-employees-count">-</p>
                    <p class="text-text-secondary">Empleados Activos</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
                        <i class="fas fa-building text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="departments-count">-</p>
                    <p class="text-text-secondary">Departamentos</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                        <i class="fas fa-receipt text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="with-expenses-count">-</p>
                    <p class="text-text-secondary">Con Gastos</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="glass-panel p-6 mb-8">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Buscar Empleado</label>
                        <input 
                            type="text" 
                            id="search-employee" 
                            placeholder="Nombre, email, ID o puesto..."
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Filtrar por Departamento</label>
                        <select 
                            id="filter-department" 
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                            <option value="">Todos los Departamentos</option>
                            <option value="it">💻 Tecnología</option>
                            <option value="sales">💼 Ventas</option>
                            <option value="hr">👥 Recursos Humanos</option>
                            <option value="finance">💰 Finanzas</option>
                            <option value="operations">⚙️ Operaciones</option>
                            <option value="management">👔 Dirección</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Empresa</label>
                        <select 
                            id="filter-company" 
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                            <option value="">Todas las Empresas</option>
                            <!-- Companies will be loaded here -->
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button onclick="applyEmployeeFilters()" class="premium-button">
                            <i class="fas fa-filter"></i>
                            Filtrar
                        </button>
                        <button onclick="clearEmployeeFilters()" class="premium-button secondary">
                            <i class="fas fa-eraser"></i>
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Employees Table -->
            <div class="glass-panel overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gradient-to-r from-accent-gold/10 to-accent-emerald/10">
                            <tr>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Empleado</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Puesto</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Departamento</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Empresa</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Email</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Teléfono</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Estado</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="employees-list" class="divide-y divide-border-primary">
                            <!-- Employees will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Add/Edit Employee Modal -->
        <div id="employeeModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center">
            <div class="glass-panel p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-text-primary">
                        <i class="fas fa-user-plus mr-2 text-accent-emerald"></i>
                        <span id="employee-modal-title">Nuevo Empleado</span>
                    </h3>
                    <button onclick="closeEmployeeModal()" class="text-text-secondary hover:text-accent-gold">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="employeeForm" onsubmit="saveEmployee(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <!-- Personal Info -->
                        <div class="lg:col-span-3">
                            <h4 class="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-primary">
                                <i class="fas fa-user mr-2 text-accent-emerald"></i>
                                Información Personal
                            </h4>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Nombre Completo *
                            </label>
                            <input 
                                type="text" 
                                id="employee-name" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Nombre y apellidos"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Email Personal
                            </label>
                            <input 
                                type="email" 
                                id="employee-email" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="email@personal.com"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Teléfono
                            </label>
                            <input 
                                type="tel" 
                                id="employee-phone" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="+52 555 123 4567"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                RFC/Identificación Fiscal
                            </label>
                            <input 
                                type="text" 
                                id="employee-rfc" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="XAXX010101000"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Fecha de Nacimiento
                            </label>
                            <input 
                                type="date" 
                                id="employee-birthdate" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Dirección
                            </label>
                            <input 
                                type="text" 
                                id="employee-address" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Calle, número, colonia, ciudad"
                            >
                        </div>
                        
                        <!-- Work Info -->
                        <div class="lg:col-span-3">
                            <h4 class="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-primary mt-6">
                                <i class="fas fa-briefcase mr-2 text-accent-emerald"></i>
                                Información Laboral
                            </h4>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Empresa *
                            </label>
                            <select 
                                id="employee-company" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                                <option value="">Seleccionar Empresa...</option>
                                <!-- Companies will be loaded here -->
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Puesto de Trabajo *
                            </label>
                            <input 
                                type="text" 
                                id="employee-position" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Ej: Gerente de Ventas, Developer Senior"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Departamento *
                            </label>
                            <select 
                                id="employee-department" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                                <option value="">Seleccionar Departamento...</option>
                                <option value="it">💻 Tecnología</option>
                                <option value="sales">💼 Ventas</option>
                                <option value="hr">👥 Recursos Humanos</option>
                                <option value="finance">💰 Finanzas</option>
                                <option value="operations">⚙️ Operaciones</option>
                                <option value="management">👔 Dirección</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Número de Empleado
                            </label>
                            <input 
                                type="text" 
                                id="employee-number" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="ID interno de empleado"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Fecha de Ingreso
                            </label>
                            <input 
                                type="date" 
                                id="employee-hire-date" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Jefe Directo
                            </label>
                            <select 
                                id="employee-manager" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                                <option value="">Sin jefe directo...</option>
                                <!-- Managers will be loaded here -->
                            </select>
                        </div>
                    </div>
                    
                    <!-- Status -->
                    <div class="mb-6">
                        <label class="flex items-center text-sm font-medium text-text-primary">
                            <input 
                                type="checkbox" 
                                id="employee-active" 
                                checked
                                class="mr-3 w-4 h-4 text-accent-emerald bg-glass-input border-border-primary rounded focus:ring-accent-emerald focus:ring-2"
                            >
                            <i class="fas fa-check-circle mr-2 text-accent-emerald"></i>
                            Empleado Activo (puede generar gastos)
                        </label>
                    </div>
                    
                    <div class="flex justify-end gap-4">
                        <button type="button" onclick="closeEmployeeModal()" class="premium-button secondary">
                            <i class="fas fa-times mr-2"></i>
                            Cancelar
                        </button>
                        <button type="submit" class="premium-button">
                            <i class="fas fa-save mr-2"></i>
                            Guardar Empleado
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <script src="/static/permissions-ui.js"></script>
        <script src="/static/employees.js"></script>
    </body>
    </html>`);
})

export default app
