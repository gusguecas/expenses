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

// ===== API ROUTES =====

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
        name TEXT NOT NULL,
        country TEXT NOT NULL CHECK (country IN ('MX', 'ES')), 
        logo_url TEXT,
        primary_currency TEXT NOT NULL DEFAULT 'MXN' CHECK (primary_currency IN ('MXN', 'EUR', 'USD')),
        tax_id TEXT,
        address TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer', 'editor', 'advanced', 'admin')),
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
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed', 'invoiced')),
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

    await env.DB.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, password_hash, role, active) VALUES 
        (1, 'admin@techmx.com', 'Alejandro Rodríguez', '$2b$10$yvsqabOwKIXJf5cu2nCIq.LDZQAKQPusEN2pvncvnTgO9lHfgE1F6', 'admin', TRUE),
        (2, 'maria.lopez@techmx.com', 'María López', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'editor', TRUE),
        (3, 'carlos.martinez@innovacion.mx', 'Carlos Martínez', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'advanced', TRUE),
        (4, 'ana.garcia@consultoria.mx', 'Ana García', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'editor', TRUE),
        (5, 'pedro.sanchez@techespana.es', 'Pedro Sánchez', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'advanced', TRUE),
        (6, 'elena.torres@madrid.es', 'Elena Torres', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'editor', TRUE)
    `).run();

    await env.DB.prepare(`
      INSERT OR IGNORE INTO user_companies (user_id, company_id, can_view, can_edit, can_admin) VALUES 
        (1, 1, TRUE, TRUE, TRUE), (1, 2, TRUE, TRUE, TRUE), (1, 3, TRUE, TRUE, TRUE),
        (1, 4, TRUE, TRUE, TRUE), (1, 5, TRUE, TRUE, TRUE), (1, 6, TRUE, TRUE, TRUE),
        (2, 1, TRUE, TRUE, FALSE), (3, 2, TRUE, TRUE, FALSE), (4, 3, TRUE, TRUE, FALSE),
        (5, 4, TRUE, TRUE, FALSE), (6, 5, TRUE, TRUE, FALSE)
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

// Companies API
app.get('/api/companies', async (c) => {
  const { env } = c;
  
  try {
    const companies = await env.DB.prepare(`
      SELECT id, name, country, primary_currency, logo_url, active, created_at
      FROM companies 
      WHERE active = TRUE
      ORDER BY country, name
    `).all();
    
    return c.json({ companies: companies.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch companies' }, 500);
  }
})

// Users API
app.get('/api/users', async (c) => {
  const { env } = c;
  
  try {
    const users = await env.DB.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.active, u.created_at,
             GROUP_CONCAT(c.name, '|') as companies
      FROM users u
      LEFT JOIN user_companies uc ON u.id = uc.user_id
      LEFT JOIN companies c ON uc.company_id = c.id
      WHERE u.active = TRUE
      GROUP BY u.id
      ORDER BY u.name
    `).all();
    
    return c.json({ users: users.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
})

// Expenses API - List with filters
app.get('/api/expenses', async (c) => {
  const { env } = c;
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
  
  // Filters
  if (query.company_id) {
    sql += ` AND e.company_id = ?`;
    params.push(query.company_id);
  }
  
  if (query.user_id) {
    sql += ` AND e.user_id = ?`;
    params.push(query.user_id);
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

// Create new expense
app.post('/api/expenses', async (c) => {
  const { env } = c;
  
  try {
    const expense = await c.req.json();
    
    // Validate required fields
    const required = ['company_id', 'expense_type_id', 'description', 'expense_date', 'amount', 'currency'];
    for (const field of required) {
      if (!expense[field]) {
        return c.json({ error: `Missing required field: ${field}` }, 400);
      }
    }
    
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
    <!-- Navigation Header (estilo gastos) -->
    <div class="container mx-auto px-6 py-8">
        <div class="glass-panel p-8 mb-8">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-4xl font-bold text-accent-gold">
                        <i class="fas fa-chart-pie mr-4"></i>
                        Dashboard Analítico - Lyra Expenses
                    </h1>
                    <p class="text-text-secondary text-lg mt-2">
                        Sistema ejecutivo de control financiero empresarial
                    </p>
                </div>
                <div class="flex gap-4">
                    <a href="/" class="premium-button style="background: var(--gradient-gold);"">
                        <i class="fas fa-chart-pie mr-3"></i>Dashboard
                    </a>
                    <a href="/companies" class="premium-button ">
                        <i class="fas fa-building mr-3"></i>Empresas
                    </a>
                    <a href="/expenses" class="premium-button ">
                        <i class="fas fa-receipt mr-3"></i>Gastos
                    </a>
                </div>
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
                    <div class="text-text-secondary text-sm">Pendientes</div>
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
            const rows = expenses.slice(0, 10).map(expense => 
                '<tr class="border-b border-glass-border hover:bg-glass transition-colors">' +
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
                        '<span class="premium-badge ' + getStatusClass(expense.status) + '">' +
                            getStatusText(expense.status) +
                        '</span>' +
                    '</td>' +
                    '<td class="py-3 px-4 text-text-secondary">' +
                        new Date(expense.expense_date || expense.created_at).toLocaleDateString('es-ES') +
                    '</td>' +
                '</tr>'
            ).join('');
            
            tableBody.innerHTML = rows;
            
            console.log('✅ Tabla actualizada con', expenses.length, 'gastos (mostrando max 10)');
        }
        
        // Helper functions para estados
        function getStatusClass(status) {
            const classes = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'approved': 'bg-green-100 text-green-800',
                'rejected': 'bg-red-100 text-red-800',
                'reimbursed': 'bg-blue-100 text-blue-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
        
        function getStatusText(status) {
            const texts = {
                'pending': 'Pendiente',
                'approved': 'Aprobado',
                'rejected': 'Rechazado',
                'reimbursed': 'Reembolsado'
            };
            return texts[status] || status;
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
    <!-- Navigation Header (estilo gastos) -->
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
                    <a href="/expenses" class="premium-button">
                        <i class="fas fa-receipt mr-3"></i>Gastos
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Contenido Principal -->
    <div class="container mx-auto px-6 pb-8">
        <!-- Header -->
        <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-accent-gold mb-3">
                <i class="fas fa-building-columns mr-3"></i>
                Portfolio Corporativo
            </h2>
            <p class="text-text-secondary text-lg">Gestión multiempresa internacional • MX + ES</p>
            <div class="flex justify-center mt-4">
                <div class="flex items-center space-x-6 text-sm text-text-secondary">
                    <span class="flex items-center">
                        <div class="w-2 h-2 bg-accent-emerald rounded-full mr-2 animate-pulse"></div>
                        6 empresas activas
                    </span>
                    <span class="flex items-center">
                        <div class="w-2 h-2 bg-accent-gold rounded-full mr-2 animate-pulse"></div>
                        Operaciones globales
                    </span>
                    <span class="flex items-center">
                        <div class="w-2 h-2 bg-accent-sapphire rounded-full mr-2 animate-pulse"></div>
                        Multimoneda: MXN • USD • EUR
                    </span>
                </div>
            </div>
        </div>

        <!-- Companies Grid (ORIGINAL COMPLETO) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
            <!-- TechMX Solutions -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/1'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇲🇽</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">TechMX Solutions</h3>
                            <p class="text-sm text-text-secondary">Tecnología • México</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">MXN Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">24</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">$485K</div>
                        <div class="text-xs text-text-secondary">Gastos MXN</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- Innovación Digital MX -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/2'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇲🇽</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">Innovación Digital MX</h3>
                            <p class="text-sm text-text-secondary">Digital • México</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">MXN Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">18</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">$325K</div>
                        <div class="text-xs text-text-secondary">Gastos MXN</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- Consultoría Estratégica MX -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/3'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇲🇽</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">Consultoría Estratégica MX</h3>
                            <p class="text-sm text-text-secondary">Consultoría • México</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">MXN Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">12</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">$195K</div>
                        <div class="text-xs text-text-secondary">Gastos MXN</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- TechES Barcelona -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/4'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇪🇸</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">TechES Barcelona</h3>
                            <p class="text-sm text-text-secondary">Tecnología • España</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">EUR Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">32</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">€85K</div>
                        <div class="text-xs text-text-secondary">Gastos EUR</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- Innovación Madrid SL -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/5'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇪🇸</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">Innovación Madrid SL</h3>
                            <p class="text-sm text-text-secondary">Innovación • España</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">EUR Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">28</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">€72K</div>
                        <div class="text-xs text-text-secondary">Gastos EUR</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- Digital Valencia S.A. -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/6'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇪🇸</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">Digital Valencia S.A.</h3>
                            <p class="text-sm text-text-secondary">Digital • España</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">EUR Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">22</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">€58K</div>
                        <div class="text-xs text-text-secondary">Gastos EUR</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

        </div>

        <!-- Summary Stats -->
        <div class="mt-16 glass-panel p-8">
            <div class="text-center mb-8">
                <h3 class="text-2xl font-bold text-accent-gold mb-2">Resumen Consolidado</h3>
                <p class="text-text-secondary">Vista general del portfolio corporativo</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="text-center">
                    <div class="text-3xl font-bold text-accent-emerald mb-2">136</div>
                    <div class="text-sm text-text-secondary">Total Empleados</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-accent-gold mb-2">$1,120K</div>
                    <div class="text-sm text-text-secondary">Gastos Totales MXN</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-accent-gold mb-2">€215K</div>
                    <div class="text-sm text-text-secondary">Gastos Totales EUR</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-accent-emerald mb-2">6</div>
                    <div class="text-sm text-text-secondary">Empresas Activas</div>
                </div>
            </div>
        </div>
        
    </div>
    
    <script src="/static/app.js"></script>
    
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

export default app
