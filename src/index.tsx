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
    // Total expenses by status
    const statusMetrics = await env.DB.prepare(`
      SELECT status, COUNT(*) as count, SUM(amount_mxn) as total_mxn
      FROM expenses
      GROUP BY status
    `).all();
    
    // Expenses by company
    const companyMetrics = await env.DB.prepare(`
      SELECT c.name as company, c.country, COUNT(*) as count, SUM(e.amount_mxn) as total_mxn
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      GROUP BY c.id, c.name, c.country
      ORDER BY total_mxn DESC
    `).all();
    
    // Expenses by currency
    const currencyMetrics = await env.DB.prepare(`
      SELECT currency, COUNT(*) as count, SUM(amount) as total_original, SUM(amount_mxn) as total_mxn
      FROM expenses
      GROUP BY currency
    `).all();
    
    // Recent expenses
    const recentExpenses = await env.DB.prepare(`
      SELECT e.*, c.name as company_name, u.name as user_name
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
      LIMIT 10
    `).all();
    
    return c.json({
      status_metrics: statusMetrics.results,
      company_metrics: companyMetrics.results,
      currency_metrics: currencyMetrics.results,
      recent_expenses: recentExpenses.results
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch dashboard metrics' }, 500);
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
  const companyName = company?.name || 'Consolidado';
  const flag = company?.country === 'MX' ? '🇲🇽' : company?.country === 'ES' ? '🇪🇸' : '🌍';
  
  let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Gastos - ${companyName}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 80px; height: 80px; margin: 0 auto 10px; background: #3B82F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
            .company-info { margin: 10px 0; }
            .filters { background: #F3F4F6; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-card { background: #F9FAFB; padding: 15px; border-radius: 5px; text-align: center; border: 1px solid #E5E7EB; }
            .summary-number { font-size: 24px; font-weight: bold; color: #1F2937; }
            .summary-label { font-size: 12px; color: #6B7280; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #E5E7EB; }
            th { background: #F9FAFB; font-weight: bold; }
            .currency-mxn { color: #059669; }
            .currency-usd { color: #3B82F6; }
            .currency-eur { color: #8B5CF6; }
            .status-pending { background: #FEF3C7; color: #92400E; padding: 2px 6px; border-radius: 12px; font-size: 11px; }
            .status-approved { background: #D1FAE5; color: #065F46; padding: 2px 6px; border-radius: 12px; font-size: 11px; }
            .status-rejected { background: #FEE2E2; color: #991B1B; padding: 2px 6px; border-radius: 12px; font-size: 11px; }
            .status-reimbursed { background: #DBEAFE; color: #1E40AF; padding: 2px 6px; border-radius: 12px; font-size: 11px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 20px; }
            @media print { body { margin: 0; } }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">${companyName.substring(0, 2).toUpperCase()}</div>
            <h1>${flag} ${companyName}</h1>
            <h2>Reporte de Gastos y Viáticos</h2>
            <p class="company-info">Sistema Lyra Expenses • Modelo 4-D</p>
        </div>
        
        <div class="filters">
            <h3>Filtros Aplicados:</h3>
            <p><strong>Período:</strong> ${filters.date_from || 'Inicio'} - ${filters.date_to || 'Actual'}</p>
            ${filters.status ? `<p><strong>Estado:</strong> ${filters.status}</p>` : ''}
            ${filters.currency ? `<p><strong>Moneda:</strong> ${filters.currency}</p>` : ''}
            <p><strong>Fecha de generación:</strong> ${today}</p>
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
            <div class="summary-label">Total Gastos</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">$${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            <div class="summary-label">Total MXN</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${pendingCount}</div>
            <div class="summary-label">Pendientes</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${Object.keys(currencyBreakdown).length}</div>
            <div class="summary-label">Monedas</div>
        </div>
    </div>
  `;
  
  // Expenses table
  html += `
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Monto Original</th>
                <th>Monto MXN</th>
                <th>Estado</th>
                <th>Método Pago</th>
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
    
    <div class="footer">
        <p>Lyra Expenses - Sistema de Gestión de Gastos y Viáticos</p>
        <p>Modelo 4-D: Dinero • Decisión • Dirección • Disciplina</p>
        <p>Generado el ${today} • Total de registros: ${totalCount}</p>
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

// Main dashboard
app.get('/', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <i className="fas fa-calculator text-blue-600 text-2xl"></i>
              <h1 className="text-2xl font-bold text-gray-900">Lyra Expenses</h1>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                Sistema 4-D: Dinero, Decisión, Dirección, Disciplina
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div id="auth-indicator" className="mr-4">
                {/* Authentication status will be inserted here */}
              </div>
              <select id="currency-selector" className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="MXN">Ver en MXN 🇲🇽</option>
                <option value="USD">Ver en USD 🇺🇸</option>
                <option value="EUR">Ver en EUR 🇪🇺</option>
              </select>
              <button onclick="showExpenseForm()" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <i className="fas fa-plus mr-2"></i>
                Nuevo Gasto
              </button>
              <a href="/expenses" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <i className="fas fa-list mr-2"></i>
                Ver Todos
              </a>
              <button id="login-btn" onclick="showLoginModal()" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700" style="display: none;">
                <i className="fas fa-sign-in-alt mr-2"></i>
                Iniciar Sesión
              </button>
              <button id="logout-btn" onclick="logout()" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700" style="display: none;">
                <i className="fas fa-sign-out-alt mr-2"></i>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="app">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-sm text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-money-bill-wave text-3xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-90">Total Gastos</p>
                  <p className="text-2xl font-bold" id="total-expenses">$0</p>
                  <p className="text-xs opacity-75" id="total-expenses-period">Este mes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-sm text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-clock text-3xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-90">Pendientes</p>
                  <p className="text-2xl font-bold" id="pending-expenses">0</p>
                  <p className="text-xs opacity-75">Por aprobar</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-sm text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-building text-3xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-90">Empresas Activas</p>
                  <p className="text-2xl font-bold" id="companies-count">0</p>
                  <p className="text-xs opacity-75">MX + ES</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-sm text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-users text-3xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-90">Usuarios</p>
                  <p className="text-2xl font-bold" id="users-count">0</p>
                  <p className="text-xs opacity-75">Multirol</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Rates Widget */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  <i className="fas fa-exchange-alt mr-2 text-green-600"></i>
                  Tipos de Cambio Actuales
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500" id="exchange-rates-updated">
                    Actualizado: --
                  </span>
                  <button onclick="refreshExchangeRates()" className="text-green-600 hover:text-green-800 text-sm">
                    <i className="fas fa-sync-alt mr-1"></i>
                    Actualizar
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="exchange-rates-container">
                {/* USD to MXN */}
                <div className="exchange-rate-card bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🇺🇸</span>
                      <div>
                        <p className="text-sm font-medium text-green-800">USD → MXN</p>
                        <p className="text-xs text-green-600">Dólar Americano</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-800 exchange-rate-value" id="rate-usd-mxn">$18.25</p>
                      <p className="text-xs text-green-600" id="change-usd-mxn">+0.15 (0.8%)</p>
                    </div>
                  </div>
                </div>
                
                {/* EUR to MXN */}
                <div className="exchange-rate-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🇪🇺</span>
                      <div>
                        <p className="text-sm font-medium text-blue-800">EUR → MXN</p>
                        <p className="text-xs text-blue-600">Euro</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-800 exchange-rate-value" id="rate-eur-mxn">$20.15</p>
                      <p className="text-xs text-blue-600" id="change-eur-mxn">-0.25 (1.2%)</p>
                    </div>
                  </div>
                </div>
                
                {/* USD to EUR */}
                <div className="exchange-rate-card bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🔄</span>
                      <div>
                        <p className="text-sm font-medium text-purple-800">USD → EUR</p>
                        <p className="text-xs text-purple-600">Dólar a Euro</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-800 exchange-rate-value" id="rate-usd-eur">€0.91</p>
                      <p className="text-xs text-purple-600" id="change-usd-eur">+0.02 (2.1%)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>
                      <i className="fas fa-info-circle mr-1 text-blue-500"></i>
                      Fuente: Banxico / BCE
                    </span>
                    <span>
                      <i className="fas fa-clock mr-1 text-orange-500"></i>
                      Actualización cada 30 min
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <i className="fas fa-circle text-xs mr-1"></i>
                      En línea
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Companies Mosaic */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                <i className="fas fa-th-large mr-2 text-blue-600"></i>
                Empresas - Acceso Directo
              </h2>
              <button onclick="toggleCompanyView()" className="text-blue-600 hover:text-blue-800 text-sm">
                <i className="fas fa-expand mr-1"></i>
                Vista Expandida
              </button>
            </div>
            <div id="companies-mosaic" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Companies will be loaded here dynamically */}
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  <i className="fas fa-chart-pie mr-2 text-blue-600"></i>
                  Gastos por Empresa
                </h3>
                <select id="period-selector" className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option value="month">Este Mes</option>
                  <option value="quarter">Trimestre</option>
                  <option value="year">Este Año</option>
                </select>
              </div>
              <div id="company-chart" className="h-64"></div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  <i className="fas fa-coins mr-2 text-green-600"></i>
                  Distribución por Moneda
                </h3>
                <div className="text-xs text-gray-500">Tipos de cambio actualizados</div>
              </div>
              <div id="currency-chart" className="h-64"></div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  <i className="fas fa-receipt mr-2 text-orange-600"></i>
                  Actividad Reciente
                </h3>
              </div>
              <div className="p-6">
                <div id="recent-activity" className="space-y-4">
                  {/* Activity items will be loaded here */}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  <i className="fas fa-exclamation-triangle mr-2 text-yellow-600"></i>
                  Acciones Requeridas
                </h3>
              </div>
              <div className="p-6">
                <div id="pending-actions" className="space-y-4">
                  {/* Pending actions will be loaded here */}
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed Recent Expenses Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  <i className="fas fa-table mr-2 text-gray-600"></i>
                  Últimos Gastos Registrados
                </h3>
                <a href="/expenses" className="text-blue-600 hover:text-blue-800 text-sm">
                  Ver todos los gastos →
                </a>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjuntos</th>
                  </tr>
                </thead>
                <tbody id="recent-expenses-table" className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td colspan="7" className="px-6 py-4 text-center text-gray-500">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Cargando gastos recientes...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})

// Expenses list page
app.get('/expenses', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-blue-600 hover:text-blue-700">
                <i className="fas fa-arrow-left"></i>
              </a>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Gastos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onclick="showExpenseForm()">
                <i className="fas fa-plus mr-2"></i>
                Registrar Gasto
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onclick="showImportExcel()">
                <i className="fas fa-file-excel mr-2"></i>
                Importar Excel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros Avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
              <select id="filter-company" className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Todas las empresas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <select id="filter-user" className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Todos los usuarios</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select id="filter-status" className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="reimbursed">Reembolsado</option>
                <option value="invoiced">Facturado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
              <select id="filter-currency" className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Todas las monedas</option>
                <option value="MXN">🇲🇽 MXN</option>
                <option value="USD">🇺🇸 USD</option>
                <option value="EUR">🇪🇺 EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Gasto</label>
              <select id="filter-expense-type" className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Todos los tipos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
              <input type="date" id="filter-date-from" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
              <input type="date" id="filter-date-to" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
              <select id="filter-payment-method" className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Todos los métodos</option>
                <option value="cash">Efectivo</option>
                <option value="credit_card">Tarjeta de Crédito</option>
                <option value="debit_card">Tarjeta de Débito</option>
                <option value="bank_transfer">Transferencia</option>
                <option value="company_card">Tarjeta Empresarial</option>
                <option value="petty_cash">Caja Chica</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <button onclick="applyFilters()" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <i className="fas fa-search mr-2"></i>
              Aplicar Filtros
            </button>
            <button onclick="clearFilters()" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              <i className="fas fa-times mr-2"></i>
              Limpiar
            </button>
            <button onclick="exportFiltered('pdf')" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              <i className="fas fa-file-pdf mr-2"></i>
              Exportar PDF
            </button>
            <button onclick="exportFiltered('excel')" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <i className="fas fa-file-excel mr-2"></i>
              Exportar Excel
            </button>
          </div>
        </div>
        
        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Gastos y Viáticos</h3>
              <div className="flex space-x-2">
                <span id="expenses-count" className="text-sm text-gray-500">0 gastos</span>
                <span id="expenses-total" className="text-sm font-semibold text-gray-900">$0.00</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" id="select-all" className="mr-2" onclick="toggleSelectAll()" />
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Original</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto MXN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjuntos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody id="expenses-table" className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colspan="10" className="px-6 py-4 text-center text-gray-500">Cargando gastos...</td>
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

export default app
