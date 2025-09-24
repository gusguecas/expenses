# 📊 Lyra Expenses - Sistema de Gastos y Viáticos

**Sistema ejecutivo multiempresa de gestión de gastos y viáticos basado en el modelo 4-D: Dinero, Decisión, Dirección, Disciplina**

## 🎯 Objetivos del Proyecto

Crear una aplicación centralizada donde se puedan:
- ✅ **Registrar gastos y viáticos** separados por empresa
- ✅ **Soporte multimoneda** (MXN, EUR, USD) con conversión automática  
- ⏳ **Adjuntar tickets y facturas** con OCR y validación fiscal (CFDI)
- ✅ **Dashboard global consolidado** con gráficas por mes, año, empresa, moneda
- ⏳ **Exportar reportes** en PDF/Excel con logos empresariales
- ✅ **Sistema multiusuario** con roles diferenciados (visor, editor, administrador)
- ⏳ **Importar datos** desde Excel para históricos

## 🌐 URLs del Proyecto

- **Aplicación en Desarrollo**: https://3000-ial41s29t0kzpd2ozwkwe-6532622b.e2b.dev
- **Dashboard Principal**: https://3000-ial41s29t0kzpd2ozwkwe-6532622b.e2b.dev/
- **Gestión de Gastos**: https://3000-ial41s29t0kzpd2ozwkwe-6532622b.e2b.dev/expenses
- **API Health Check**: https://3000-ial41s29t0kzpd2ozwkwe-6532622b.e2b.dev/api/health

## 🏗️ Arquitectura de Datos

### **Modelo Multiempresa/Multiusuario/Multimoneda**

El sistema implementa 4 pilares fundamentales:

1. **Multiempresa** 🏢
   - Empresas mexicanas y españolas
   - Logos corporativos por empresa
   - Separación total de datos por empresa

2. **Multiusuario** 👥  
   - Roles: Viewer, Editor, Advanced, Admin
   - Permisos granulares por empresa
   - Auditoría completa de acciones

3. **Multimoneda** 💰
   - MXN, EUR, USD
   - Tipos de cambio históricos
   - Conversión automática para reportes

4. **Multiroles** 🔐
   - **Viewer**: Solo consulta
   - **Editor**: Crea y edita sus gastos
   - **Advanced**: Ve y edita gastos de otros (limitado)
   - **Admin**: Control total

### **Entidades Principales**

| Tabla | Descripción | Campos Clave |
|-------|-------------|--------------|
| `companies` | Empresas MX/ES | name, country, primary_currency, logo_url |
| `users` | Usuarios del sistema | email, name, role, active |
| `user_companies` | Permisos usuario-empresa | can_view, can_edit, can_admin |
| `expenses` | Gastos principales | amount, currency, exchange_rate, amount_mxn |
| `expense_types` | Categorías de gastos | meals, transport, accommodation, etc. |
| `attachments` | Archivos adjuntos | tickets, facturas, OCR data |
| `exchange_rates` | Tipos de cambio | rate, rate_date, source (banxico/ecb) |

## 🚀 Funcionalidades Implementadas

### ✅ **Dashboard Global**
- **Métricas por Estado**: Pendientes, Aprobados, Rechazados, Reembolsados
- **Gastos por Empresa**: Con banderas MX 🇲🇽 / ES 🇪🇸  
- **Gastos por Moneda**: MXN, USD, EUR con conversión
- **Gastos Recientes**: Últimos 10 movimientos
- **Indicadores KPI**: Total gastos, pendientes, empresas activas

### ✅ **API REST Completa**
```
GET  /api/health           - Health check
POST /api/init-db          - Inicializar BD (dev only)
GET  /api/companies        - Listado de empresas
GET  /api/users            - Listado de usuarios  
GET  /api/expense-types    - Tipos de gastos
GET  /api/expenses         - Gastos con filtros
POST /api/expenses         - Crear nuevo gasto
GET  /api/dashboard/metrics - Métricas del dashboard
```

### ✅ **Filtros Avanzados**
- Por empresa, estado, moneda, periodo
- Rangos de fechas personalizables
- Filtros rápidos: hoy, semana, mes, trimestre, año

### ✅ **Datos de Prueba**
- **6 Empresas**: 3 en México, 3 en España
- **6 Usuarios**: Con diferentes roles y permisos
- **7 Gastos**: En MXN, USD, EUR con diferentes estados
- **10 Tipos de Gastos**: Categorizados por tipo

## 🔧 Tecnologías Utilizadas

- **Backend**: Hono Framework + Cloudflare Workers
- **Base de Datos**: Cloudflare D1 (SQLite distribuido)
- **Frontend**: HTML + TailwindCSS + Vanilla JavaScript
- **Despliegue**: Cloudflare Pages
- **Gestión de Procesos**: PM2
- **Versionado**: Git

## 📋 Próximos Pasos de Desarrollo

### 🔴 **Prioridad Alta**
1. **Sistema de Autenticación** - JWT + sesiones
2. **Formulario de Registro de Gastos** - Modal con validación
3. **Integración API Tipos de Cambio** - Banxico, ECB en tiempo real

### 🟡 **Prioridad Media**  
4. **Sistema de Archivos Adjuntos** - Upload a R2, OCR
5. **Validación CFDI** - Para facturas mexicanas
6. **Reportes PDF** - Con logos empresariales

### 🟢 **Prioridad Baja**
7. **Importación Excel** - Mapeo de columnas
8. **Exportación Excel** - Con filtros aplicados
9. **Notificaciones** - Email, push notifications

## 🏃‍♂️ Guía de Inicio Rápido

### **1. Instalación**
```bash
npm install
```

### **2. Desarrollo Local**
```bash
# Construir aplicación
npm run build

# Iniciar con PM2
pm2 start ecosystem.config.cjs

# Verificar estado
pm2 list
pm2 logs expenses-app --nostream
```

### **3. Inicializar Base de Datos**
```bash
# Solo en desarrollo - crea tablas y datos de prueba
curl -X POST http://localhost:3000/api/init-db
```

### **4. Pruebas de API**
```bash
# Health check
curl http://localhost:3000/api/health

# Ver empresas
curl http://localhost:3000/api/companies

# Ver métricas dashboard  
curl http://localhost:3000/api/dashboard/metrics

# Ver gastos con filtros
curl "http://localhost:3000/api/expenses?company_id=1&status=approved"
```

### **5. Despliegue a Producción**
```bash
# Configurar Cloudflare API
setup_cloudflare_api_key

# Crear base de datos D1
wrangler d1 create expenses-app-production

# Aplicar migraciones
wrangler d1 migrations apply expenses-app-production

# Desplegar a Cloudflare Pages
npm run deploy:prod
```

## 🌍 Modelo 4-D en Acción

- **💰 Dinero**: Control granular por empresa, moneda y tipo de gasto
- **🎯 Decisión**: Dashboard con métricas para decisiones rápidas  
- **📍 Dirección**: Flujos claros (captura → adjunto → validación → reporte)
- **📋 Disciplina**: Roles, permisos, auditoría y control total

## 📊 Estado del Proyecto

- **Plataforma**: Cloudflare Pages + Workers ✅
- **Base de Datos**: D1 SQLite distribuido ✅ 
- **Modelo de Datos**: Multiempresa/multiusuario/multimoneda ✅
- **Dashboard**: Métricas y visualización ✅
- **API**: Endpoints core completos ✅
- **Frontend**: Responsive UI ✅
- **Autenticación**: Pendiente ⏳
- **Upload de Archivos**: Pendiente ⏳
- **Reportes PDF**: Pendiente ⏳

**Última Actualización**: 24 de septiembre de 2024
