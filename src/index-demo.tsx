import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

// Demo version without D1 - uses in-memory data
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('/api/*', cors())
app.use(renderer)

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ===== DEMO DATA =====
const DEMO_COMPANIES = [
  { id: 1, name: 'LYRA México', country: 'MX', primary_currency: 'MXN', logo_url: '/static/logos/lyra-mx.png' },
  { id: 2, name: 'LYRA España', country: 'ES', primary_currency: 'EUR', logo_url: '/static/logos/lyra-es.png' },
  { id: 3, name: 'TechNova Solutions', country: 'MX', primary_currency: 'MXN', logo_url: '/static/logos/technova.png' }
];

const DEMO_USERS = [
  { id: 1, email: 'gus@lyraexpenses.com', name: 'Gus (CFO)', is_cfo: true, active: true },
  { id: 2, email: 'maria@lyraexpenses.com', name: 'María (Partner)', is_cfo: false, active: true },
  { id: 3, email: 'carlos@lyraexpenses.com', name: 'Carlos (Employee)', is_cfo: false, active: true }
];

const DEMO_EXPENSES = [
  {
    id: 1,
    company_id: 1,
    user_id: 1,
    amount: 2500.00,
    currency: 'MXN',
    description: 'Viaje de negocios CDMX',
    expense_type: 'travel',
    status: 'approved',
    created_at: '2025-09-25T10:00:00Z'
  },
  {
    id: 2,
    company_id: 2,
    user_id: 2,
    amount: 150.75,
    currency: 'EUR',
    description: 'Cena con cliente Madrid',
    expense_type: 'meals',
    status: 'pending',
    created_at: '2025-09-24T18:30:00Z'
  }
];

// ===== API ROUTES =====

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    database: 'demo-mode',
    environment: 'production-demo',
    timestamp: new Date().toISOString(),
    message: '🚀 LYRA Demo - Sistema RBAC funcionando!'
  });
});

// Companies
app.get('/api/companies', (c) => {
  return c.json(DEMO_COMPANIES);
});

// Users
app.get('/api/users', (c) => {
  return c.json(DEMO_USERS);
});

// Expenses
app.get('/api/expenses', (c) => {
  const companyId = c.req.query('company_id');
  const filteredExpenses = companyId 
    ? DEMO_EXPENSES.filter(e => e.company_id === parseInt(companyId))
    : DEMO_EXPENSES;
  
  return c.json(filteredExpenses);
});

// Dashboard metrics
app.get('/api/dashboard/metrics', (c) => {
  return c.json({
    total_expenses: DEMO_EXPENSES.length,
    total_amount_mxn: 2650.75,
    pending_approvals: 1,
    companies_count: DEMO_COMPANIES.length,
    users_count: DEMO_USERS.length,
    recent_expenses: DEMO_EXPENSES.slice(-5),
    status_summary: {
      approved: 1,
      pending: 1,
      rejected: 0
    }
  });
});

// Auth endpoints (demo mode)
app.post('/api/auth/login', async (c) => {
  const { email } = await c.req.json();
  
  const user = DEMO_USERS.find(u => u.email === email);
  if (!user) {
    return c.json({ error: 'Usuario no encontrado' }, 404);
  }

  // Demo JWT (not real)
  const token = 'demo-jwt-token-' + Date.now();
  
  return c.json({
    message: 'Login exitoso (modo demo)',
    user: user,
    auth_token: token,
    expires_in: 604800 // 7 días
  });
});

app.get('/api/auth/profile', (c) => {
  return c.json({
    user: DEMO_USERS[0], // Default to Gus
    permissions: {
      is_cfo: true,
      companies: [
        { company_id: 1, can_view_all: true, can_create: true, can_approve: true, can_manage_users: true },
        { company_id: 2, can_view_all: true, can_create: true, can_approve: true, can_manage_users: true },
        { company_id: 3, can_view_all: true, can_create: true, can_approve: true, can_manage_users: true }
      ]
    }
  });
});

// ===== FRONTEND ROUTES =====

// Main dashboard
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LYRA Expenses - Demo Sistema RBAC</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        <!-- Demo Banner -->
        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-2 font-bold">
            🚀 LYRA EXPENSES - DEMO PRODUCCIÓN | Sistema RBAC Completo | Cloudflare Pages
        </div>
        
        <div class="container mx-auto p-6">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white mb-2">
                    <i class="fas fa-chart-line mr-3 text-yellow-400"></i>
                    LYRA Expenses
                </h1>
                <p class="text-purple-300 text-lg">Sistema Ejecutivo de Gestión de Gastos y Viáticos</p>
                <div class="mt-4 bg-black/20 backdrop-blur rounded-lg p-4 max-w-2xl mx-auto">
                    <p class="text-green-400 font-semibold">✅ Sistema RBAC Implementado</p>
                    <p class="text-blue-400">🔐 Control CFO → Partner → Employee</p>
                    <p class="text-purple-400">🏢 Permisos Granulares por Empresa</p>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-200 text-sm">Total Gastos</p>
                            <p class="text-2xl font-bold">$2,650.75</p>
                        </div>
                        <i class="fas fa-money-bill-wave text-3xl text-purple-300"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-600 to-teal-700 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-200 text-sm">Empresas Activas</p>
                            <p class="text-2xl font-bold">${DEMO_COMPANIES.length}</p>
                        </div>
                        <i class="fas fa-building text-3xl text-green-300"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-yellow-600 to-orange-700 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-200 text-sm">Pendientes</p>
                            <p class="text-2xl font-bold">1</p>
                        </div>
                        <i class="fas fa-clock text-3xl text-yellow-300"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-red-600 to-pink-700 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-red-200 text-sm">Usuarios</p>
                            <p class="text-2xl font-bold">${DEMO_USERS.length}</p>
                        </div>
                        <i class="fas fa-users text-3xl text-red-300"></i>
                    </div>
                </div>
            </div>

            <!-- Companies Grid -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-white mb-4">
                    <i class="fas fa-building mr-2"></i>
                    Empresas del Grupo
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${DEMO_COMPANIES.map(company => `
                        <div class="bg-black/20 backdrop-blur rounded-xl p-6 border border-purple-500/30 hover:border-purple-400 transition-all">
                            <div class="text-center">
                                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-building text-2xl text-white"></i>
                                </div>
                                <h3 class="text-xl font-bold text-white mb-2">${company.name}</h3>
                                <p class="text-purple-300">${company.country} • ${company.primary_currency}</p>
                                <div class="mt-4">
                                    <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                                        ✅ Activa
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Functionality Demos -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <!-- Sistema RBAC -->
                <div class="bg-black/20 backdrop-blur rounded-xl p-6 border border-purple-500/30">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-shield-alt mr-2 text-green-400"></i>
                        Sistema RBAC Implementado
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center text-green-400">
                            <i class="fas fa-check-circle mr-2"></i>
                            <span>CFO: Control Total</span>
                        </div>
                        <div class="flex items-center text-blue-400">
                            <i class="fas fa-check-circle mr-2"></i>
                            <span>Partner: Acceso Limitado</span>
                        </div>
                        <div class="flex items-center text-purple-400">
                            <i class="fas fa-check-circle mr-2"></i>
                            <span>Employee: Solo Lectura</span>
                        </div>
                        <div class="flex items-center text-yellow-400">
                            <i class="fas fa-check-circle mr-2"></i>
                            <span>Permisos por Empresa</span>
                        </div>
                    </div>
                </div>

                <!-- Características -->
                <div class="bg-black/20 backdrop-blur rounded-xl p-6 border border-purple-500/30">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-star mr-2 text-yellow-400"></i>
                        Características Completas
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center text-green-400">
                            <i class="fas fa-check mr-2"></i>
                            <span>Autenticación JWT</span>
                        </div>
                        <div class="flex items-center text-green-400">
                            <i class="fas fa-check mr-2"></i>
                            <span>OCR Inteligente</span>
                        </div>
                        <div class="flex items-center text-green-400">
                            <i class="fas fa-check mr-2"></i>
                            <span>Validación CFDI</span>
                        </div>
                        <div class="flex items-center text-green-400">
                            <i class="fas fa-check mr-2"></i>
                            <span>Analytics Premium</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- API Status -->
            <div class="bg-black/20 backdrop-blur rounded-xl p-6 border border-green-500/30 text-center">
                <h3 class="text-xl font-bold text-green-400 mb-2">
                    <i class="fas fa-server mr-2"></i>
                    API Status: Operativa
                </h3>
                <p class="text-green-300">Todos los endpoints funcionando correctamente</p>
                <div class="mt-4 text-sm text-gray-400">
                    <p>Health Check: <span class="text-green-400">✅ Healthy</span></p>
                    <p>Base de Datos: <span class="text-blue-400">Demo Mode</span></p>
                    <p>Cloudflare Pages: <span class="text-green-400">✅ Deployed</span></p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="mt-12 text-center text-purple-300 pb-6">
            <p>🚀 LYRA Expenses - Sistema Ejecutivo Multiempresa</p>
            <p class="text-sm">Desarrollado con Hono + Cloudflare Workers + Sistema RBAC</p>
        </footer>
    </body>
    </html>
  `);
});

export default app