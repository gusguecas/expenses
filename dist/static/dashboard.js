// Dashboard Analytics - Executive Management System
// Advanced real-time metrics and interactive charts

class DashboardAnalytics {
  constructor() {
    this.charts = {};
    this.filters = {
      company_id: '',
      user_id: '',
      status: '',
      currency: '',
      date_from: '',
      date_to: ''
    };
    this.data = {
      expenses: [],
      companies: [],
      users: [],
      metrics: {}
    };
    
    console.log('🚀 Dashboard Analytics iniciando...');
    this.init();
  }

  async init() {
    try {
      console.log('📊 Cargando datos del dashboard...');
      
      // Load initial data
      await Promise.all([
        this.loadKPIData(),
        this.loadCompanies(),
        this.loadUsers(),
        this.loadDashboardMetrics()
      ]);
      
      // Initialize charts
      this.initializeCharts();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('✅ Dashboard Analytics listo');
    } catch (error) {
      console.error('❌ Error inicializando dashboard:', error);
      this.showError('Error cargando el dashboard');
    }
  }

  async loadKPIData() {
    try {
      console.log('📈 Cargando KPIs...');
      
      const response = await axios.get('/api/dashboard/metrics', {
        params: this.filters
      });
      
      if (response.data) {
        this.updateKPICards(response.data);
      }
    } catch (error) {
      console.error('❌ Error cargando KPIs:', error);
    }
  }

  updateKPICards(data) {
    const statusMetrics = data.status_metrics || [];
    const companyMetrics = data.company_metrics || [];
    
    // Calculate totals
    const totalAmount = statusMetrics.reduce((sum, item) => sum + (parseFloat(item.total_mxn) || 0), 0);
    const pendingCount = statusMetrics.find(item => item.status === 'pending')?.count || 0;
    const activeCompanies = companyMetrics.length;
    const activeUsers = data.recent_expenses ? 
      [...new Set(data.recent_expenses.map(exp => exp.user_name))].length : 0;
    
    // Update KPI cards with animations
    this.animateNumber('total-amount', totalAmount, 'currency');
    this.animateNumber('pending-count', pendingCount);
    this.animateNumber('active-companies', activeCompanies);
    this.animateNumber('active-users', activeUsers);
    
    console.log('✅ KPIs actualizados:', { totalAmount, pendingCount, activeCompanies, activeUsers });
  }

  animateNumber(elementId, targetValue, type = 'number') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 1500;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
      
      if (type === 'currency') {
        element.textContent = new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(currentValue);
      } else {
        element.textContent = Math.round(currentValue).toLocaleString();
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  async loadCompanies() {
    try {
      console.log('🏢 Cargando empresas...');
      
      const response = await axios.get('/api/companies');
      if (response.data?.success) {
        this.data.companies = response.data.companies;
        this.populateCompanyFilter();
      }
    } catch (error) {
      console.error('❌ Error cargando empresas:', error);
    }
  }

  async loadUsers() {
    try {
      console.log('👥 Cargando usuarios...');
      
      const response = await axios.get('/api/users');
      if (response.data?.users) {
        this.data.users = response.data.users;
        this.populateUserFilter();
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
    }
  }

  populateCompanyFilter() {
    const select = document.getElementById('filter-company');
    if (!select) return;
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild);
    }
    
    // Add company options
    this.data.companies.forEach(company => {
      const option = document.createElement('option');
      option.value = company.id;
      const flag = company.country === 'MX' ? '🇲🇽' : company.country === 'ES' ? '🇪🇸' : '🌍';
      option.textContent = `${flag} ${company.name}`;
      select.appendChild(option);
    });
    
    console.log(`✅ ${this.data.companies.length} empresas añadidas al filtro`);
  }

  populateUserFilter() {
    const select = document.getElementById('filter-user');
    if (!select) return;
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild);
    }
    
    // Add user options
    this.data.users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = `${user.name} (${user.role})`;
      select.appendChild(option);
    });
    
    console.log(`✅ ${this.data.users.length} usuarios añadidos al filtro`);
  }

  async loadDashboardMetrics() {
    try {
      console.log('📊 Cargando métricas para gráficas...');
      
      const response = await axios.get('/api/dashboard/metrics', {
        params: this.filters
      });
      
      if (response.data) {
        this.data.metrics = response.data;
        this.loadRecentActivities(response.data.recent_expenses);
      }
    } catch (error) {
      console.error('❌ Error cargando métricas:', error);
    }
  }

  loadRecentActivities(expenses = []) {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (expenses.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i class="fas fa-inbox text-4xl text-tertiary mb-4"></i>
          <p class="text-tertiary">No hay actividad reciente</p>
        </div>
      `;
      return;
    }
    
    expenses.slice(0, 5).forEach(expense => {
      const statusColor = {
        'pending': 'gold',
        'approved': 'emerald',
        'rejected': 'rose',
        'reimbursed': 'sapphire'
      }[expense.status] || 'gray';
      
      const statusText = {
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'rejected': 'Rechazado',
        'reimbursed': 'Reembolsado'
      }[expense.status] || expense.status;
      
      const icon = this.getExpenseIcon(expense.description);
      const timeAgo = this.getTimeAgo(expense.created_at);
      
      const activityHtml = `
        <div class="flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all">
          <div class="flex items-center space-x-4">
            <div class="p-2 rounded-lg bg-${statusColor} bg-opacity-20">
              <i class="${icon} text-${statusColor}"></i>
            </div>
            <div>
              <p class="font-semibold text-primary">${expense.description}</p>
              <p class="text-sm text-tertiary">
                ${expense.user_name} • ${expense.company_name} • ${timeAgo}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-${statusColor}">
              ${new Intl.NumberFormat('es-MX', { 
                style: 'currency', 
                currency: expense.currency || 'MXN' 
              }).format(expense.amount || 0)}
            </p>
            <p class="text-xs text-tertiary">${statusText}</p>
          </div>
        </div>
      `;
      
      container.innerHTML += activityHtml;
    });
    
    console.log(`✅ ${expenses.length} actividades recientes cargadas`);
  }

  getExpenseIcon(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('vuelo') || desc.includes('avión')) return 'fas fa-plane';
    if (desc.includes('hotel') || desc.includes('hospedaje')) return 'fas fa-bed';
    if (desc.includes('comida') || desc.includes('restaurante')) return 'fas fa-utensils';
    if (desc.includes('taxi') || desc.includes('uber')) return 'fas fa-car';
    if (desc.includes('software') || desc.includes('licencia')) return 'fas fa-laptop';
    if (desc.includes('gasolina') || desc.includes('combustible')) return 'fas fa-gas-pump';
    if (desc.includes('oficina') || desc.includes('papelería')) return 'fas fa-paperclip';
    
    return 'fas fa-receipt';
  }

  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays} días`;
  }

  initializeCharts() {
    console.log('📈 Inicializando gráficas...');
    
    this.createStatusChart();
    this.createCompanyChart();
    this.createTrendChart();
    this.createCurrencyChart();
  }

  createStatusChart() {
    const ctx = document.getElementById('status-chart');
    if (!ctx) return;
    
    const data = this.data.metrics.status_metrics || [];
    
    this.charts.status = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => {
          const statusLabels = {
            'pending': 'Pendientes',
            'approved': 'Aprobados',
            'rejected': 'Rechazados',
            'reimbursed': 'Reembolsados'
          };
          return statusLabels[item.status] || item.status;
        }),
        datasets: [{
          data: data.map(item => item.count),
          backgroundColor: [
            'rgba(245, 158, 11, 0.8)',  // gold
            'rgba(16, 185, 129, 0.8)',  // emerald
            'rgba(239, 68, 68, 0.8)',   // rose
            'rgba(59, 130, 246, 0.8)'   // sapphire
          ],
          borderColor: [
            'rgb(245, 158, 11)',
            'rgb(16, 185, 129)',
            'rgb(239, 68, 68)',
            'rgb(59, 130, 246)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#e5e7eb' }
          }
        }
      }
    });
  }

  createCompanyChart() {
    const ctx = document.getElementById('company-chart');
    if (!ctx) return;
    
    const data = this.data.metrics.company_metrics || [];
    
    this.charts.company = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => {
          const flag = item.country === 'MX' ? '🇲🇽' : item.country === 'ES' ? '🇪🇸' : '🌍';
          return `${flag} ${item.company}`;
        }),
        datasets: [{
          label: 'Total MXN',
          data: data.map(item => item.total_mxn),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#e5e7eb' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#e5e7eb',
              callback: function(value) {
                return new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  minimumFractionDigits: 0
                }).format(value);
              }
            }
          },
          x: {
            ticks: { color: '#e5e7eb' }
          }
        }
      }
    });
  }

  createTrendChart() {
    const ctx = document.getElementById('trend-chart');
    if (!ctx) return;
    
    // Generate sample trend data - in production this would come from API
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const trendData = months.map(() => Math.floor(Math.random() * 50000) + 20000);
    
    this.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Gastos Mensuales (MXN)',
          data: trendData,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#e5e7eb' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#e5e7eb',
              callback: function(value) {
                return new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  minimumFractionDigits: 0
                }).format(value);
              }
            }
          },
          x: {
            ticks: { color: '#e5e7eb' }
          }
        }
      }
    });
  }

  createCurrencyChart() {
    const ctx = document.getElementById('currency-chart');
    if (!ctx) return;
    
    const data = this.data.metrics.currency_metrics || [];
    
    this.charts.currency = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(item => {
          const flags = { 'MXN': '🇲🇽', 'USD': '🇺🇸', 'EUR': '🇪🇺' };
          return `${flags[item.currency] || '💱'} ${item.currency}`;
        }),
        datasets: [{
          data: data.map(item => item.total_mxn),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',  // emerald
            'rgba(59, 130, 246, 0.8)',  // sapphire
            'rgba(239, 68, 68, 0.8)'    // rose
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#e5e7eb' }
          }
        }
      }
    });
  }

  setupEventListeners() {
    console.log('🎯 Configurando event listeners...');
    
    // Filter change events
    ['filter-company', 'filter-user', 'filter-status'].forEach(filterId => {
      const element = document.getElementById(filterId);
      if (element) {
        element.addEventListener('change', () => this.applyFilters());
      }
    });
    
    // Currency selector
    const currencySelector = document.getElementById('currency-selector');
    if (currencySelector) {
      currencySelector.addEventListener('change', () => {
        console.log('💱 Moneda cambiada:', currencySelector.value);
        // Update displays - could refresh data or convert existing values
      });
    }
  }

  applyFilters() {
    console.log('🔍 Aplicando filtros...');
    
    // Update filters object
    this.filters.company_id = document.getElementById('filter-company')?.value || '';
    this.filters.user_id = document.getElementById('filter-user')?.value || '';
    this.filters.status = document.getElementById('filter-status')?.value || '';
    
    console.log('📊 Filtros aplicados:', this.filters);
    
    // Reload data with new filters
    this.loadKPIData();
    this.loadDashboardMetrics();
    
    // Update charts
    setTimeout(() => {
      this.updateCharts();
    }, 500);
  }

  updateCharts() {
    console.log('📈 Actualizando gráficas...');
    
    // Destroy existing charts
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    
    // Recreate charts with new data
    this.initializeCharts();
  }

  showError(message) {
    console.error('❌ Error:', message);
    // Could show a toast notification or modal here
  }
}

// Global functions for template interactions
window.clearFilters = function() {
  console.log('🧹 Limpiando todos los filtros...');
  
  ['filter-company', 'filter-user', 'filter-status'].forEach(filterId => {
    const element = document.getElementById(filterId);
    if (element) element.value = '';
  });
  
  if (window.dashboard) {
    window.dashboard.filters = {
      company_id: '', user_id: '', status: '', currency: '', date_from: '', date_to: ''
    };
    window.dashboard.applyFilters();
  }
};

window.showExpenseForm = function() {
  console.log('💰 Abriendo formulario de gastos...');
  window.location.href = '/expenses';
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando Dashboard Analytics...');
  window.dashboard = new DashboardAnalytics();
});

console.log('✅ Dashboard JavaScript cargado correctamente');