// Lyra Expenses - Frontend JavaScript
// Sistema 4-D: Dinero, Decisión, Dirección, Disciplina

class ExpensesApp {
  constructor() {
    this.apiBase = '/api';
    this.currentFilters = {};
    this.companies = [];
    this.users = [];
    this.expenseTypes = [];
    
    // Authentication state
    this.currentUser = null;
    this.accessToken = localStorage.getItem('lyra_access_token');
    this.refreshToken = localStorage.getItem('lyra_refresh_token');
    this.sessionId = localStorage.getItem('lyra_session_id');
    
    this.init();
  }

  async init() {
    try {
      // Load basic data first (needed for forms)
      await this.loadCompanies();
      await this.loadUsers();
      await this.loadExpenseTypes();
      
      // Load exchange rates (always visible)
      if (this.isDashboardPage()) {
        await this.loadExchangeRates();
      }
      
      // Check authentication for protected features
      const isAuthenticated = await this.checkAuthStatus();
      
      if (isAuthenticated) {
        // Load dashboard metrics if on dashboard page and authenticated
        if (this.isDashboardPage()) {
          await this.loadDashboardMetrics();
          this.setupAnalyticsFilters();
        }
        
        // Load expenses if on expenses page
        if (this.isExpensesPage()) {
          await this.loadExpenses();
          this.setupFilters();
        }
      } else {
        // User not authenticated - show basic interface but allow form usage
        this.updateAuthUI();
      }
      
      // Setup event listeners (always needed)
      this.setupEventListeners();
      
      // Apply mobile optimizations
      optimizeForMobile();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Error al inicializar la aplicación');
    }
  }

  // ===== UTILITY METHODS =====

  isDashboardPage() {
    return window.location.pathname === '/';
  }

  isExpensesPage() {
    return window.location.pathname === '/expenses';
  }

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window) || 
           (window.innerWidth <= 768);
  }

  async apiCall(endpoint, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };
      
      // Add authorization header if token exists
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
      
      const response = await fetch(`${this.apiBase}${endpoint}`, {
        headers,
        ...options
      });

      // Handle 401 (unauthorized) by trying to refresh token
      if (response.status === 401 && this.accessToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(`${this.apiBase}${endpoint}`, {
            headers,
            ...options
          });
          
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          
          return await retryResponse.json();
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  formatCurrency(amount, currency = 'MXN') {
    // Handle short format
    if (currency === 'short') {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
      } else {
        return `$${amount.toFixed(0)}`;
      }
    }
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusBadge(status) {
    const statusConfig = {
      pending: { class: 'bg-yellow-100 text-yellow-800', icon: 'fas fa-clock', text: 'Pendiente' },
      approved: { class: 'bg-green-100 text-green-800', icon: 'fas fa-check', text: 'Aprobado' },
      rejected: { class: 'bg-red-100 text-red-800', icon: 'fas fa-times', text: 'Rechazado' },
      reimbursed: { class: 'bg-blue-100 text-blue-800', icon: 'fas fa-money-bill-wave', text: 'Reembolsado' },
      invoiced: { class: 'bg-purple-100 text-purple-800', icon: 'fas fa-file-invoice', text: 'Facturado' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}">
      <i class="${config.icon} mr-1"></i>
      ${config.text}
    </span>`;
  }

  showError(message) {
    console.error(message);
    // In a real app, show a toast notification
    alert(`Error: ${message}`);
  }

  showSuccess(message) {
    console.log(message);
    // In a real app, show a toast notification
    alert(`Éxito: ${message}`);
  }

  // ===== DATA LOADING METHODS =====

  async loadCompanies() {
    try {
      const response = await this.apiCall('/companies');
      this.companies = response.companies || [];
      
      // Populate company select in filters
      const companySelect = document.getElementById('filter-company');
      if (companySelect) {
        companySelect.innerHTML = '<option value="">Todas las empresas</option>';
        this.companies.forEach(company => {
          const flag = company.country === 'MX' ? '🇲🇽' : '🇪🇸';
          companySelect.innerHTML += `<option value="${company.id}">${flag} ${company.name}</option>`;
        });
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  }

  async loadUsers() {
    try {
      const response = await this.apiCall('/users');
      this.users = response.users || [];
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  async loadExpenseTypes() {
    try {
      const response = await this.apiCall('/expense-types');
      this.expenseTypes = response.expense_types || [];
    } catch (error) {
      console.error('Failed to load expense types:', error);
    }
  }

  async loadExchangeRates() {
    try {
      const response = await this.apiCall('/exchange-rates');
      
      if (response.exchange_rates) {
        this.updateExchangeRatesDisplay(response.exchange_rates);
        
        // Update timestamp
        const updatedElement = document.getElementById('exchange-rates-updated');
        if (updatedElement) {
          const now = new Date();
          updatedElement.textContent = `Actualizado: ${now.toLocaleTimeString()}`;
        }
      }
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
      this.showExchangeRatesError();
    }
  }

  updateExchangeRatesDisplay(rates) {
    // Find rates for our currency pairs
    const usdToMxn = rates.find(r => r.from_currency === 'USD' && r.to_currency === 'MXN');
    const eurToMxn = rates.find(r => r.from_currency === 'EUR' && r.to_currency === 'MXN');
    const usdToEur = rates.find(r => r.from_currency === 'USD' && r.to_currency === 'EUR');
    
    // Simulate daily changes (in real app, this would come from API)
    const simulateChange = (rate) => {
      const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
      const change = rate * (changePercent / 100);
      return { change, changePercent };
    };
    
    // Update USD → MXN
    if (usdToMxn) {
      const rateElement = document.getElementById('rate-usd-mxn');
      const changeElement = document.getElementById('change-usd-mxn');
      if (rateElement) rateElement.textContent = `$${usdToMxn.rate.toFixed(2)}`;
      if (changeElement) {
        const { change, changePercent } = simulateChange(usdToMxn.rate);
        const isPositive = change >= 0;
        changeElement.textContent = `${isPositive ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(1)}%)`;
        changeElement.className = `text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`;
      }
    }
    
    // Update EUR → MXN
    if (eurToMxn) {
      const rateElement = document.getElementById('rate-eur-mxn');
      const changeElement = document.getElementById('change-eur-mxn');
      if (rateElement) rateElement.textContent = `$${eurToMxn.rate.toFixed(2)}`;
      if (changeElement) {
        const { change, changePercent } = simulateChange(eurToMxn.rate);
        const isPositive = change >= 0;
        changeElement.textContent = `${isPositive ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(1)}%)`;
        changeElement.className = `text-xs ${isPositive ? 'text-blue-600' : 'text-red-600'}`;
      }
    }
    
    // Update USD → EUR
    if (usdToEur) {
      const rateElement = document.getElementById('rate-usd-eur');
      const changeElement = document.getElementById('change-usd-eur');
      if (rateElement) rateElement.textContent = `€${usdToEur.rate.toFixed(3)}`;
      if (changeElement) {
        const { change, changePercent } = simulateChange(usdToEur.rate);
        const isPositive = change >= 0;
        changeElement.textContent = `${isPositive ? '+' : ''}${change.toFixed(3)} (${changePercent.toFixed(1)}%)`;
        changeElement.className = `text-xs ${isPositive ? 'text-purple-600' : 'text-red-600'}`;
      }
    }
  }

  showExchangeRatesError() {
    const container = document.getElementById('exchange-rates-container');
    if (container) {
      container.innerHTML = `
        <div class="col-span-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
            <span class="text-red-800">Error al cargar tipos de cambio. Usando valores de referencia.</span>
          </div>
        </div>
      `;
    }
  }

  // ===== PREMIUM CHARTS WITH CHART.JS =====
  
  async initializePremiumCharts(dashboardData) {
    try {
      // Destroy existing charts if they exist
      if (window.companyChart) window.companyChart.destroy();
      if (window.currencyChart) window.currencyChart.destroy();
      if (window.trendChart) window.trendChart.destroy();
      if (window.statusChart) window.statusChart.destroy();
      
      // Initialize company performance chart
      this.createCompanyPerformanceChart(dashboardData.company_metrics);
      
      // Initialize currency distribution chart
      this.createCurrencyDistributionChart(dashboardData.currency_metrics);
      
      // Initialize trend analysis chart
      await this.createTrendAnalysisChart();
      
      // Initialize status overview chart
      this.createStatusOverviewChart(dashboardData.status_metrics);
      
    } catch (error) {
      console.error('Failed to initialize premium charts:', error);
    }
  }

  createCompanyPerformanceChart(companyMetrics) {
    const ctx = document.getElementById('company-chart');
    if (!ctx) return;

    const labels = companyMetrics.map(m => m.company);
    const data = companyMetrics.map(m => m.total_mxn);
    const colors = this.generateChartColors(labels.length);

    window.companyChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Gastos por Empresa (MXN)',
          data: data,
          backgroundColor: colors.backgrounds,
          borderColor: colors.borders,
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              color: '#e5e7eb',
              font: {
                size: 12,
                family: 'Inter'
              },
              generateLabels: function(chart) {
                const data = chart.data;
                return data.labels.map((label, i) => ({
                  text: `${label}: ${window.expensesApp.formatCurrency(data.datasets[0].data[i], 'short')}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  index: i
                }));
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#f59e0b',
            bodyColor: '#ffffff',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${window.expensesApp.formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  createCurrencyDistributionChart(currencyMetrics) {
    const ctx = document.getElementById('currency-chart');
    if (!ctx) return;

    const labels = currencyMetrics.map(m => `${this.getCurrencyFlag(m.currency)} ${m.currency}`);
    const data = currencyMetrics.map(m => m.total_mxn);
    const counts = currencyMetrics.map(m => m.count);

    window.currencyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Volumen (MXN)',
          data: data,
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',  // MXN - Green
            'rgba(59, 130, 246, 0.8)',  // USD - Blue  
            'rgba(245, 158, 11, 0.8)'   // EUR - Gold
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(59, 130, 246, 1)', 
            'rgba(245, 158, 11, 1)'
          ],
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        }, {
          label: 'Transacciones',
          data: counts,
          type: 'line',
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            ticks: {
              color: '#9ca3af',
              font: { family: 'Inter', size: 11 },
              callback: function(value) {
                return window.expensesApp.formatCurrency(value, 'short');
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            ticks: {
              color: '#9ca3af',
              font: { family: 'Inter', size: 11 }
            },
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            ticks: {
              color: '#9ca3af',
              font: { family: 'Inter', size: 12 }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#e5e7eb',
              font: { family: 'Inter', size: 12 },
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#f59e0b',
            bodyColor: '#ffffff',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8
          }
        },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  async createTrendAnalysisChart() {
    // This would typically fetch historical data
    // For now, we'll simulate trend data
    const trendData = this.generateTrendData();
    
    const ctx = document.getElementById('trend-chart');
    if (!ctx) return;

    window.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [{
          label: 'Gastos Totales',
          data: trendData.totals,
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }, {
          label: 'Promedio Móvil',
          data: trendData.average,
          borderColor: 'rgba(245, 158, 11, 1)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)', 
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#9ca3af',
              font: { family: 'Inter', size: 11 },
              callback: function(value) {
                return window.expensesApp.formatCurrency(value, 'short');
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#9ca3af',
              font: { family: 'Inter', size: 11 }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#e5e7eb',
              font: { family: 'Inter', size: 12 },
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#f59e0b',
            bodyColor: '#ffffff'
          }
        }
      }
    });
  }

  createStatusOverviewChart(statusMetrics) {
    const ctx = document.getElementById('status-chart');
    if (!ctx) return;

    const labels = statusMetrics.map(m => this.getStatusLabel(m.status));
    const data = statusMetrics.map(m => m.count);
    const colors = statusMetrics.map(m => this.getStatusColor(m.status));

    window.statusChart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.backgrounds,
          borderColor: colors.borders,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e5e7eb',
              font: { family: 'Inter', size: 11 },
              usePointStyle: true
            }
          }
        },
        scales: {
          r: {
            ticks: {
              color: '#9ca3af',
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }

  // Helper methods for charts
  generateChartColors(count) {
    const baseColors = [
      { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },    // Emerald
      { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },    // Blue  
      { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' },    // Amber
      { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' },      // Red
      { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgba(168, 85, 247, 1)' },    // Purple
      { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgba(34, 197, 94, 1)' }       // Green
    ];
    
    return {
      backgrounds: baseColors.slice(0, count).map(c => c.bg),
      borders: baseColors.slice(0, count).map(c => c.border)
    };
  }

  getCurrencyFlag(currency) {
    const flags = { MXN: '🇲🇽', USD: '🇺🇸', EUR: '🇪🇺' };
    return flags[currency] || '💱';
  }

  getStatusLabel(status) {
    const labels = {
      pending: 'Pendientes',
      approved: 'Aprobados', 
      rejected: 'Rechazados',
      reimbursed: 'Reembolsados',
      invoiced: 'Facturados'
    };
    return labels[status] || status;
  }

  getStatusColor(status) {
    const colors = {
      pending: { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' },
      approved: { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
      rejected: { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' },
      reimbursed: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },
      invoiced: { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgba(168, 85, 247, 1)' }
    };
    return colors[status] || colors.pending;
  }

  generateTrendData() {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
    const totals = [];
    const average = [];
    
    for (let i = 0; i < months.length; i++) {
      const base = 25000 + Math.random() * 15000;
      const trend = base + (i * 2000) + (Math.sin(i) * 5000);
      totals.push(Math.max(0, trend));
      
      // Calculate moving average
      if (i >= 2) {
        const avg = (totals[i-2] + totals[i-1] + totals[i]) / 3;
        average.push(avg);
      } else {
        average.push(totals[i]);
      }
    }
    
    return { labels: months, totals, average };
  }

  async loadDashboardMetrics() {
    try {
      const response = await this.apiCall('/dashboard/metrics');
      
      // Update metric cards
      this.updateMetricCard('companies-count', this.companies.length);
      this.updateMetricCard('users-count', this.users.length);
      
      // Calculate totals from status metrics
      let totalAmount = 0;
      let pendingCount = 0;
      
      response.status_metrics.forEach(metric => {
        totalAmount += parseFloat(metric.total_mxn || 0);
        if (metric.status === 'pending') {
          pendingCount = metric.count;
        }
      });
      
      this.updateMetricCard('total-expenses', this.formatCurrency(totalAmount));
      this.updateMetricCard('pending-expenses', pendingCount);
      
      // Render companies mosaic
      this.renderCompaniesMosaic(response.company_metrics);
      
      // Initialize premium charts with real data
      await this.initializePremiumCharts(response);
      
      // Load exchange rates
      await this.loadExchangeRates();
      
      // Render recent activity and pending actions
      this.renderRecentActivity(response.recent_expenses);
      this.renderPendingActions(response.status_metrics);
      
      // Update recent expenses table
      this.renderRecentExpenses(response.recent_expenses);
      
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    }
  }

  async loadDashboardMetricsWithFilters(filters = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.period) {
        queryParams.append('period', filters.period);
      }
      
      if (filters.company_id) {
        queryParams.append('company_id', filters.company_id);
      }
      
      if (filters.currency) {
        queryParams.append('currency', filters.currency);
      }
      
      // Add date range based on period
      if (filters.period) {
        const dateRange = this.getDateRangeForPeriod(filters.period);
        if (dateRange.from) queryParams.append('date_from', dateRange.from);
        if (dateRange.to) queryParams.append('date_to', dateRange.to);
      }
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/dashboard/metrics?${queryString}` : '/dashboard/metrics';
      
      const response = await this.apiCall(endpoint);
      
      // Update metric cards with filtered data
      let totalAmount = 0;
      let pendingCount = 0;
      
      response.status_metrics.forEach(metric => {
        totalAmount += parseFloat(metric.total_mxn || 0);
        if (metric.status === 'pending') {
          pendingCount = metric.count;
        }
      });
      
      this.updateMetricCard('total-expenses', this.formatCurrency(totalAmount));
      this.updateMetricCard('pending-expenses', pendingCount);
      
      // Update companies mosaic with filtered data
      this.renderCompaniesMosaic(response.company_metrics);
      
      // Reinitialize charts with filtered data
      await this.initializePremiumCharts(response);
      
      // Update activity sections
      this.renderRecentActivity(response.recent_expenses);
      this.renderPendingActions(response.status_metrics);
      this.renderRecentExpenses(response.recent_expenses);
      
      // Show success message
      const periodText = this.getPeriodDisplayText(filters.period);
      this.showSuccess(`Analytics actualizadas para ${periodText}`);
      
    } catch (error) {
      console.error('Failed to load filtered dashboard metrics:', error);
      this.showError('Error al cargar métricas filtradas');
    }
  }

  getDateRangeForPeriod(period) {
    const today = new Date();
    const ranges = {
      month: {
        from: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
      },
      quarter: {
        from: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1).toISOString().split('T')[0],
        to: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0).toISOString().split('T')[0]
      },
      year: {
        from: new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0],
        to: new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0]
      }
    };
    
    return ranges[period] || { from: null, to: null };
  }

  getPeriodDisplayText(period) {
    const texts = {
      month: 'este mes',
      quarter: 'este trimestre', 
      year: 'este año'
    };
    
    return texts[period] || 'el período seleccionado';
  }

  setupAnalyticsFilters() {
    // Fill company filter dropdown
    this.fillAnalyticsCompanyFilter();
    
    // Setup event listeners for analytics filters
    initializeAnalyticsFilters();
  }

  fillAnalyticsCompanyFilter() {
    const companyFilter = document.getElementById('analytics-company-filter');
    if (companyFilter && this.companies.length > 0) {
      // Keep the "All Companies" option and add company options
      const existingOptions = companyFilter.innerHTML;
      const companyOptions = this.companies.map(company => {
        const flag = company.country === 'MX' ? '🇲🇽' : '🇪🇸';
        return `<option value="${company.id}">${flag} ${company.name}</option>`;
      }).join('');
      
      companyFilter.innerHTML = existingOptions + companyOptions;
    }
  }

  renderCompaniesMosaic(companyMetrics) {
    const mosaicContainer = document.getElementById('companies-mosaic');
    if (!mosaicContainer) return;

    // Create premium company cards with enhanced metrics
    const companyCards = this.companies.map(company => {
      const metrics = companyMetrics.find(m => m.company === company.name) || { count: 0, total_mxn: 0 };
      const flag = company.country === 'MX' ? '🇲🇽' : '🇪🇸';
      const countryName = company.country === 'MX' ? 'México' : 'España';
      
      return `
        <div class="company-card-premium group cursor-pointer" onclick="viewCompanyDetails(${company.id})">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <div class="w-14 h-14 bg-glass rounded-xl flex items-center justify-center group-hover:bg-glass-hover transition-all">
                  <span class="text-gold font-bold text-xl">${company.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald to-sapphire rounded-full flex items-center justify-center text-sm">
                  ${flag}
                </div>
              </div>
              <div>
                <h3 class="font-bold text-primary text-xl">${company.name}</h3>
                <p class="text-sm text-tertiary font-medium">${countryName} • ${company.primary_currency}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="status-badge-premium status-approved-premium">
                <i class="fas fa-chart-trend-up mr-1"></i>
                Activa
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-glass rounded-lg p-3 text-center">
                <div class="text-2xl font-mono font-bold text-emerald">${metrics.count}</div>
                <div class="text-xs text-tertiary font-medium">Transacciones</div>
              </div>
              <div class="bg-glass rounded-lg p-3 text-center">
                <div class="text-lg font-mono font-bold text-gold">${this.formatCurrency(metrics.total_mxn, 'short')}</div>
                <div class="text-xs text-tertiary font-medium">Volumen Total</div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-secondary font-medium">Performance</span>
                <span class="text-emerald font-mono">${Math.min((metrics.total_mxn / 50000) * 100, 100).toFixed(1)}%</span>
              </div>
              <div class="relative">
                <div class="w-full bg-glass rounded-full h-3 overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald via-gold to-sapphire rounded-full transition-all duration-1000 ease-out" 
                       style="width: ${Math.min((metrics.total_mxn / 50000) * 100, 100)}%"></div>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-glass rounded-lg p-2">
                <div class="text-xs text-tertiary">ROI</div>
                <div class="font-mono text-sm text-emerald">+${(Math.random() * 20 + 5).toFixed(1)}%</div>
              </div>
              <div class="bg-glass rounded-lg p-2">
                <div class="text-xs text-tertiary">Risk</div>
                <div class="font-mono text-sm text-sapphire">${Math.random() > 0.5 ? 'Low' : 'Med'}</div>
              </div>
              <div class="bg-glass rounded-lg p-2">
                <div class="text-xs text-tertiary">Status</div>
                <div class="font-mono text-sm text-gold">A+</div>
              </div>
            </div>
          </div>
            
            <div class="mt-4 flex flex-wrap gap-2 justify-between">
              <div class="flex space-x-2">
                <button onclick="event.stopPropagation(); addExpenseForCompany(${company.id})" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200">
                  <i class="fas fa-plus mr-1"></i>
                  Agregar Gasto
                </button>
                <button onclick="event.stopPropagation(); viewCompanyReport(${company.id})" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200">
                  <i class="fas fa-chart-bar mr-1"></i>
                  Ver Reporte
                </button>
              </div>
              ${company.country === 'MX' ? `
                <button onclick="event.stopPropagation(); window.expensesApp.openCfdiValidation(${company.id})" class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hover:bg-purple-200">
                  <i class="fas fa-file-invoice mr-1"></i>
                  Validar CFDI
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    mosaicContainer.innerHTML = companyCards;
  }

  renderRecentActivity(expenses) {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer || !expenses.length) {
      if (activityContainer) {
        activityContainer.innerHTML = '<p class="text-gray-500 text-center">No hay actividad reciente</p>';
      }
      return;
    }

    const activities = expenses.slice(0, 5).map(expense => {
      const timeAgo = this.getTimeAgo(expense.created_at);
      const flag = expense.company_name?.includes('MX') || expense.country === 'MX' ? '🇲🇽' : '🇪🇸';
      
      return `
        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div class="flex-shrink-0">
            <i class="fas fa-receipt text-blue-600"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              ${expense.description}
            </p>
            <p class="text-xs text-gray-500">
              ${flag} ${expense.user_name} • ${this.formatCurrency(expense.amount, expense.currency)}
            </p>
          </div>
          <div class="text-xs text-gray-400">
            ${timeAgo}
          </div>
        </div>
      `;
    }).join('');

    activityContainer.innerHTML = activities;
  }

  renderPendingActions(statusMetrics) {
    const actionsContainer = document.getElementById('pending-actions');
    if (!actionsContainer) return;

    const pendingMetric = statusMetrics.find(m => m.status === 'pending');
    const actions = [];

    if (pendingMetric && pendingMetric.count > 0) {
      actions.push({
        icon: 'fas fa-clock text-yellow-600',
        title: `${pendingMetric.count} gastos pendientes`,
        description: 'Requieren aprobación',
        action: 'viewPendingExpenses()',
        priority: 'high'
      });
    }

    // Add more action types as needed
    actions.push({
      icon: 'fas fa-sync-alt text-blue-600',
      title: 'Actualizar tipos de cambio',
      description: 'Última actualización: hoy',
      action: 'updateExchangeRates()',
      priority: 'medium'
    });

    if (actions.length === 0) {
      actionsContainer.innerHTML = '<p class="text-gray-500 text-center">No hay acciones pendientes</p>';
      return;
    }

    const actionItems = actions.map(action => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center space-x-3">
          <i class="${action.icon}"></i>
          <div>
            <p class="text-sm font-medium text-gray-900">${action.title}</p>
            <p class="text-xs text-gray-500">${action.description}</p>
          </div>
        </div>
        <button onclick="${action.action}" class="text-blue-600 hover:text-blue-800 text-sm">
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `).join('');

    actionsContainer.innerHTML = actionItems;
  }

  getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1h';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    
    return this.formatDate(dateString);
  }

  async loadExpenses() {
    try {
      const queryParams = new URLSearchParams(this.currentFilters);
      const response = await this.apiCall(`/expenses?${queryParams}`);
      
      this.renderExpensesTable(response.expenses || []);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      this.showError('Error al cargar los gastos');
    }
  }

  // ===== UI UPDATE METHODS =====

  updateMetricCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  renderCompanyChart(companyMetrics) {
    const chartElement = document.getElementById('company-chart');
    if (!chartElement || !companyMetrics.length) return;

    // Simple text-based chart for now
    let chartHTML = '';
    const maxAmount = Math.max(...companyMetrics.map(c => c.total_mxn));

    companyMetrics.forEach(company => {
      const percentage = (company.total_mxn / maxAmount) * 100;
      const flag = company.country === 'MX' ? '🇲🇽' : '🇪🇸';
      
      chartHTML += `
        <div class="mb-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium text-gray-700">${flag} ${company.company}</span>
            <span class="text-sm text-gray-500">${this.formatCurrency(company.total_mxn)}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    });

    chartElement.innerHTML = chartHTML;
  }

  renderCurrencyChart(currencyMetrics) {
    const chartElement = document.getElementById('currency-chart');
    if (!chartElement || !currencyMetrics.length) return;

    // Simple text-based chart for now
    let chartHTML = '';
    const total = currencyMetrics.reduce((sum, c) => sum + c.total_mxn, 0);

    currencyMetrics.forEach(currency => {
      const percentage = (currency.total_mxn / total) * 100;
      const currencySymbol = {
        'MXN': '🇲🇽 MXN',
        'USD': '🇺🇸 USD', 
        'EUR': '🇪🇺 EUR'
      }[currency.currency] || currency.currency;
      
      chartHTML += `
        <div class="mb-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium text-gray-700">${currencySymbol}</span>
            <span class="text-sm text-gray-500">${this.formatCurrency(currency.total_mxn)} MXN</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-600 h-2 rounded-full" style="width: ${percentage}%"></div>
          </div>
          <div class="flex justify-between items-center mt-1">
            <span class="text-xs text-gray-500">${currency.count} gastos</span>
            <span class="text-xs text-gray-500">${percentage.toFixed(1)}%</span>
          </div>
        </div>
      `;
    });

    chartElement.innerHTML = chartHTML;
  }

  renderRecentExpenses(expenses) {
    const tableBody = document.getElementById('recent-expenses-table');
    if (!tableBody) return;

    if (!expenses.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No hay gastos recientes</td></tr>';
      return;
    }

    tableBody.innerHTML = expenses.map(expense => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${expense.description}</div>
          <div class="text-sm text-gray-500">${expense.expense_type_name || 'Sin categoría'}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${expense.company_name}</div>
          <div class="text-sm text-gray-500">${expense.country === 'MX' ? '🇲🇽' : '🇪🇸'}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${expense.user_name}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${this.formatCurrency(expense.amount, expense.currency)}</div>
          <div class="text-sm text-gray-500">${this.formatCurrency(expense.amount_mxn)} MXN</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${this.getStatusBadge(expense.status)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${this.formatDate(expense.expense_date)}
        </td>
      </tr>
    `).join('');
  }

  renderExpensesTable(expenses) {
    const tableBody = document.getElementById('expenses-table');
    if (!tableBody) return;

    if (!expenses.length) {
      tableBody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 text-center text-gray-500">No se encontraron gastos con los filtros aplicados</td></tr>';
      return;
    }

    tableBody.innerHTML = expenses.map(expense => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          #${expense.id}
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-gray-900">${expense.description}</div>
          <div class="text-sm text-gray-500">${expense.expense_type_name || 'Sin categoría'}</div>
          ${expense.vendor ? `<div class="text-xs text-gray-400">${expense.vendor}</div>` : ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${expense.company_name}</div>
          <div class="text-sm text-gray-500">${expense.country === 'MX' ? '🇲🇽' : '🇪🇸'}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${expense.user_name}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${this.formatCurrency(expense.amount, expense.currency)}</div>
          ${expense.exchange_rate !== 1 ? `<div class="text-xs text-gray-500">TC: ${expense.exchange_rate}</div>` : ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${this.formatCurrency(expense.amount_mxn)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${this.getStatusBadge(expense.status)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${this.formatDate(expense.expense_date)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex space-x-2">
            <button onclick="editExpense(${expense.id})" class="text-blue-600 hover:text-blue-900" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="viewExpense(${expense.id})" class="text-green-600 hover:text-green-900" title="Ver detalles">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="deleteExpense(${expense.id})" class="text-red-600 hover:text-red-900" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ===== FILTER METHODS =====

  setupFilters() {
    const filterElements = ['filter-company', 'filter-status', 'filter-currency', 'filter-period'];
    
    filterElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => {
          this.updateFiltersFromForm();
        });
      }
    });
  }

  updateFiltersFromForm() {
    const filters = {};
    
    const company = document.getElementById('filter-company')?.value;
    if (company) filters.company_id = company;
    
    const status = document.getElementById('filter-status')?.value;
    if (status) filters.status = status;
    
    const currency = document.getElementById('filter-currency')?.value;
    if (currency) filters.currency = currency;
    
    const period = document.getElementById('filter-period')?.value;
    if (period) {
      const dates = this.getPeriodDates(period);
      if (dates.from) filters.date_from = dates.from;
      if (dates.to) filters.date_to = dates.to;
    }
    
    this.currentFilters = filters;
  }

  getPeriodDates(period) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (period) {
      case 'today':
        return { from: today, to: today };
      
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return { from: weekStart.toISOString().split('T')[0], to: today };
      
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: monthStart.toISOString().split('T')[0], to: today };
      
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { from: quarterStart.toISOString().split('T')[0], to: today };
      
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return { from: yearStart.toISOString().split('T')[0], to: today };
      
      default:
        return {};
    }
  }

  // ===== EVENT HANDLERS =====

  setupEventListeners() {
    // Global event listeners can be added here
  }

  async applyFilters() {
    this.updateFiltersFromForm();
    await this.loadExpenses();
  }

  clearFilters() {
    this.currentFilters = {};
    
    // Reset form
    const filterElements = ['filter-company', 'filter-status', 'filter-currency', 'filter-period'];
    filterElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.value = '';
      }
    });
    
    // Reload expenses
    this.loadExpenses();
  }

  // ===== EXPENSE FORM METHODS =====

  async createExpense(formData) {
    try {
      const response = await this.apiCall('/expenses', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      this.showSuccess('Gasto registrado exitosamente');
      this.closeExpenseForm();
      
      // Reload expenses if on expenses page
      if (this.isExpensesPage()) {
        await this.loadExpenses();
      }
      
      return response;
    } catch (error) {
      console.error('Failed to create expense:', error);
      this.showError('Error al crear el gasto');
      throw error;
    }
  }

  closeExpenseForm() {
    const modal = document.getElementById('expense-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
    // Reset form after closing
    this.resetExpenseForm();
  }

  showExpenseForm() {
    const modal = document.getElementById('expense-modal');
    if (modal) {
      // Reset and populate form
      this.resetExpenseForm();
      this.populateExpenseForm();
      
      // Show modal
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  populateExpenseForm() {
    // Populate companies
    const companySelect = document.getElementById('form-company');
    if (companySelect && this.companies) {
      companySelect.innerHTML = '<option value="">Seleccione una empresa...</option>';
      this.companies.forEach(company => {
        const flag = company.country === 'MX' ? '🇲🇽' : '🇪🇸';
        companySelect.innerHTML += `<option value="${company.id}">${flag} ${company.name}</option>`;
      });
    }

    // Populate expense types
    const expenseTypeSelect = document.getElementById('form-expense-type');
    if (expenseTypeSelect && this.expenseTypes) {
      expenseTypeSelect.innerHTML = '<option value="">Seleccione tipo de gasto...</option>';
      this.expenseTypes.forEach(type => {
        const icon = this.getCategoryIcon(type.category);
        expenseTypeSelect.innerHTML += `<option value="${type.id}">${icon} ${type.name}</option>`;
      });
    }

    // Populate users for responsible field
    const responsibleSelect = document.getElementById('form-responsible');
    if (responsibleSelect && this.users) {
      responsibleSelect.innerHTML = '<option value="">Yo (usuario actual)</option>';
      this.users.forEach(user => {
        responsibleSelect.innerHTML += `<option value="${user.id}">${user.name}</option>`;
      });
    }

    // Set current date
    const dateInput = document.getElementById('form-expense-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  getCategoryIcon(category) {
    const icons = {
      'travel': '✈️',
      'meals': '🍽️',
      'transport': '🚗',
      'accommodation': '🏨',
      'supplies': '📦',
      'services': '🛠️',
      'general': '📋'
    };
    return icons[category] || '📋';
  }

  async updateExchangeRate() {
    const currencySelect = document.getElementById('form-currency');
    const exchangeRateSection = document.getElementById('exchange-rate-section');
    const exchangeRateInput = document.getElementById('form-exchange-rate');
    const exchangeRateInfo = document.getElementById('exchange-rate-info');
    
    if (!currencySelect || !exchangeRateSection) return;

    const currency = currencySelect.value;
    
    if (currency === 'MXN') {
      // Hide exchange rate for MXN
      exchangeRateSection.classList.add('hidden');
      exchangeRateInput.value = '1.0';
    } else if (currency === 'USD' || currency === 'EUR') {
      // Show and fetch exchange rate
      exchangeRateSection.classList.remove('hidden');
      
      try {
        // For demo, use hardcoded rates - in production, fetch from API
        const rates = {
          'USD': 18.25,
          'EUR': 20.15
        };
        
        const rate = rates[currency];
        exchangeRateInput.value = rate;
        exchangeRateInfo.textContent = `1 ${currency} = ${rate} MXN (Tipo de cambio del día)`;
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        exchangeRateInfo.textContent = 'Error al obtener tipo de cambio';
      }
    }
  }

  validateExpenseForm() {
    const requiredFields = [
      { id: 'form-company', name: 'Empresa' },
      { id: 'form-expense-type', name: 'Tipo de Gasto' },
      { id: 'form-description', name: 'Descripción' },
      { id: 'form-expense-date', name: 'Fecha' },
      { id: 'form-amount', name: 'Monto' },
      { id: 'form-currency', name: 'Moneda' },
      { id: 'form-payment-method', name: 'Método de Pago' }
    ];

    for (const field of requiredFields) {
      const element = document.getElementById(field.id);
      if (!element || !element.value.trim()) {
        this.showError(`El campo ${field.name} es requerido`);
        element?.focus();
        return false;
      }
    }

    // Validate amount
    const amount = parseFloat(document.getElementById('form-amount').value);
    if (isNaN(amount) || amount <= 0) {
      this.showError('El monto debe ser mayor a 0');
      return false;
    }

    return true;
  }

  getFormData() {
    return {
      company_id: parseInt(document.getElementById('form-company').value),
      expense_type_id: parseInt(document.getElementById('form-expense-type').value),
      description: document.getElementById('form-description').value.trim(),
      expense_date: document.getElementById('form-expense-date').value,
      amount: parseFloat(document.getElementById('form-amount').value),
      currency: document.getElementById('form-currency').value,
      exchange_rate: parseFloat(document.getElementById('form-exchange-rate').value) || 1.0,
      payment_method: document.getElementById('form-payment-method').value,
      vendor: document.getElementById('form-vendor').value.trim(),
      invoice_number: document.getElementById('form-invoice-number').value.trim(),
      status: document.getElementById('form-status').value,
      notes: document.getElementById('form-notes').value.trim(),
      is_billable: document.getElementById('form-billable').checked,
      user_id: parseInt(document.getElementById('form-responsible').value) || 1, // Default to current user
      attendees: document.getElementById('form-attendees').value.trim()
    };
  }

  resetExpenseForm() {
    const form = document.getElementById('expense-form');
    if (form) {
      form.reset();
      document.getElementById('exchange-rate-section').classList.add('hidden');
      document.getElementById('attachments-preview').classList.add('hidden');
      document.getElementById('attachments-list').innerHTML = '';
    }
  }

  // ===== FILE HANDLING =====

  async handleFileSelect(files) {
    const attachmentsList = document.getElementById('attachments-list');
    const attachmentsPreview = document.getElementById('attachments-preview');
    const ocrEnabled = document.getElementById('enable-ocr')?.checked;
    
    if (!attachmentsList || !files.length) return;

    attachmentsPreview.classList.remove('hidden');
    
    for (const file of Array.from(files)) {
      const fileDiv = document.createElement('div');
      fileDiv.className = 'border border-gray-200 rounded-lg p-4 bg-white';
      
      const fileInfo = document.createElement('div');
      fileInfo.className = 'flex items-center justify-between mb-3';
      
      const icon = this.getFileIcon(file.type);
      const fileSize = this.formatFileSize(file.size);
      
      fileInfo.innerHTML = `
        <div class="flex items-center space-x-3">
          <i class="${icon} text-blue-600 text-xl"></i>
          <div>
            <p class="text-sm font-medium text-gray-900">${file.name}</p>
            <p class="text-xs text-gray-500">${fileSize} - ${file.type}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          ${ocrEnabled && this.canProcessOcr(file.type) ? 
            '<span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">OCR Activado</span>' : 
            ''}
          <button type="button" class="text-red-600 hover:text-red-800 remove-file-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      // OCR Processing Area
      if (ocrEnabled && this.canProcessOcr(file.type)) {
        const ocrDiv = document.createElement('div');
        ocrDiv.className = 'mt-3 border-t pt-3';
        ocrDiv.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">
              <i class="fas fa-robot mr-1"></i>
              Procesando OCR...
            </span>
            <div class="w-4 h-4">
              <i class="fas fa-spinner fa-spin text-blue-600"></i>
            </div>
          </div>
          <div class="ocr-results mt-2 hidden">
            <div class="bg-green-50 border border-green-200 rounded p-2 text-sm">
              <div class="ocr-data"></div>
              <div class="flex space-x-2 mt-2">
                <button type="button" class="apply-ocr-btn text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                  <i class="fas fa-check mr-1"></i>
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        `;
        
        fileDiv.appendChild(ocrDiv);
        
        // Process OCR
        this.processFileOcr(file, ocrDiv);
      }
      
      // Add event listeners
      const removeBtn = fileInfo.querySelector('.remove-file-btn');
      removeBtn.onclick = () => {
        fileDiv.remove();
        if (attachmentsList.children.length === 0) {
          attachmentsPreview.classList.add('hidden');
        }
      };
      
      attachmentsList.appendChild(fileDiv);
    }
  }

  canProcessOcr(mimeType) {
    return mimeType.startsWith('image/') || mimeType === 'application/pdf';
  }

  async processFileOcr(file, ocrDiv) {
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get OCR data (simulate API call)
      const ocrData = await this.simulateOcrProcessing(file);
      
      // Update UI with results
      const resultsDiv = ocrDiv.querySelector('.ocr-results');
      const dataDiv = ocrDiv.querySelector('.ocr-data');
      
      if (ocrData && ocrData.extracted_data) {
        const data = ocrData.extracted_data;
        
        dataDiv.innerHTML = `
          <div class="grid grid-cols-2 gap-2 text-xs">
            ${data.amount ? `<div><strong>Monto:</strong> $${data.amount} ${data.currency}</div>` : ''}
            ${data.date ? `<div><strong>Fecha:</strong> ${data.date}</div>` : ''}
            ${data.vendor ? `<div><strong>Proveedor:</strong> ${data.vendor}</div>` : ''}
            ${data.payment_method ? `<div><strong>Pago:</strong> ${data.payment_method}</div>` : ''}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Confianza: ${Math.round(data.confidence_score * 100)}%
          </div>
        `;
        
        // Add click handler to apply button
        const applyBtn = ocrDiv.querySelector('.apply-ocr-btn');
        applyBtn.onclick = () => this.applyOcrDataToForm(data);
        
        resultsDiv.classList.remove('hidden');
      } else {
        dataDiv.innerHTML = '<div class="text-red-600">No se pudieron extraer datos del archivo</div>';
        resultsDiv.classList.remove('hidden');
      }
      
      // Hide processing indicator
      ocrDiv.querySelector('.flex').classList.add('hidden');
      
    } catch (error) {
      console.error('OCR processing failed:', error);
      const dataDiv = ocrDiv.querySelector('.ocr-data');
      dataDiv.innerHTML = '<div class="text-red-600">Error procesando OCR</div>';
      ocrDiv.querySelector('.ocr-results').classList.remove('hidden');
      ocrDiv.querySelector('.flex').classList.add('hidden');
    }
  }

  async simulateOcrProcessing(file) {
    // In production, this would call the actual OCR API
    const fileName = file.name.toLowerCase();
    
    let mockData;
    if (fileName.includes('ticket') || fileName.includes('recibo')) {
      mockData = {
        extracted_data: {
          amount: 850.00,
          currency: 'MXN',
          date: new Date().toISOString().split('T')[0],
          vendor: 'Restaurante Pujol',
          description: 'Comida de trabajo',
          payment_method: 'credit_card',
          confidence_score: 0.94
        }
      };
    } else if (fileName.includes('uber') || fileName.includes('taxi')) {
      mockData = {
        extracted_data: {
          amount: 320.50,
          currency: 'MXN',
          date: new Date().toISOString().split('T')[0],
          vendor: 'Uber',
          description: 'Transporte al aeropuerto',
          payment_method: 'cash',
          confidence_score: 0.89
        }
      };
    } else {
      mockData = {
        extracted_data: {
          amount: 1500.00,
          currency: 'USD',
          date: new Date().toISOString().split('T')[0],
          vendor: 'Adobe Inc',
          description: 'Licencia de software',
          payment_method: 'company_card',
          confidence_score: 0.92
        }
      };
    }
    
    return mockData;
  }

  applyOcrDataToForm(data) {
    if (data.amount) {
      const amountInput = document.getElementById('form-amount');
      if (amountInput && !amountInput.value) {
        amountInput.value = data.amount;
      }
    }
    
    if (data.currency) {
      const currencySelect = document.getElementById('form-currency');
      if (currencySelect && !currencySelect.value) {
        currencySelect.value = data.currency;
        // Trigger exchange rate update
        window.updateExchangeRate();
      }
    }
    
    if (data.date) {
      const dateInput = document.getElementById('form-expense-date');
      if (dateInput && !dateInput.value) {
        dateInput.value = data.date;
      }
    }
    
    if (data.vendor) {
      const vendorInput = document.getElementById('form-vendor');
      if (vendorInput && !vendorInput.value) {
        vendorInput.value = data.vendor;
      }
    }
    
    if (data.description) {
      const descInput = document.getElementById('form-description');
      if (descInput && !descInput.value) {
        descInput.value = data.description;
      }
    }
    
    if (data.payment_method) {
      const paymentSelect = document.getElementById('form-payment-method');
      if (paymentSelect && !paymentSelect.value) {
        paymentSelect.value = data.payment_method;
      }
    }
    
    // Show success message
    this.showSuccess('Datos del OCR aplicados al formulario');
  }

  getFileIcon(mimeType) {
    if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
    if (mimeType.includes('xml')) return 'fas fa-file-code';
    if (mimeType.includes('image')) return 'fas fa-file-image';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
    return 'fas fa-file';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ===== AUTHENTICATION METHODS =====

  async checkAuthStatus() {
    if (!this.accessToken) {
      this.showLoginModal();
      return false;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        this.currentUser = result.user;
        this.updateAuthUI();
        return true;
      } else if (response.status === 401) {
        // Token expired, try to refresh
        return await this.refreshAccessToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }

    this.logout();
    return false;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      this.logout();
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      });

      if (response.ok) {
        const result = await response.json();
        this.accessToken = result.tokens.accessToken;
        this.refreshToken = result.tokens.refreshToken;
        
        localStorage.setItem('lyra_access_token', this.accessToken);
        localStorage.setItem('lyra_refresh_token', this.refreshToken);
        
        // Retry getting user profile
        return await this.checkAuthStatus();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.logout();
    return false;
  }

  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok) {
        this.currentUser = result.user;
        this.accessToken = result.tokens.accessToken;
        this.refreshToken = result.tokens.refreshToken;
        this.sessionId = result.session_id;

        // Store tokens
        localStorage.setItem('lyra_access_token', this.accessToken);
        localStorage.setItem('lyra_refresh_token', this.refreshToken);
        localStorage.setItem('lyra_session_id', this.sessionId);

        this.updateAuthUI();
        this.hideLoginModal();
        this.showMessage(`Bienvenido, ${result.user.name}!`, 'success');
        
        // Reload data after login
        await this.loadDashboardMetrics();
        
        return true;
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      this.showMessage('Error de autenticación: ' + error.message, 'error');
      return false;
    }
  }

  async logout() {
    try {
      if (this.accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ session_id: this.sessionId })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state
    this.currentUser = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.sessionId = null;

    localStorage.removeItem('lyra_access_token');
    localStorage.removeItem('lyra_refresh_token');
    localStorage.removeItem('lyra_session_id');

    this.updateAuthUI();
    this.showLoginModal();
    this.showMessage('Sesión cerrada exitosamente', 'info');
  }

  updateAuthUI() {
    const authIndicator = document.getElementById('auth-indicator');
    const userInfo = document.getElementById('user-info');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (this.currentUser) {
      // User is logged in
      if (authIndicator) {
        authIndicator.innerHTML = `
          <div class="flex items-center space-x-2 text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <i class="fas fa-user-check"></i>
            <span>${this.currentUser.name}</span>
            <span class="text-xs opacity-75">(${this.currentUser.role})</span>
          </div>
        `;
      }
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
      // User is not logged in
      if (authIndicator) {
        authIndicator.innerHTML = `
          <div class="flex items-center space-x-2 text-red-700 bg-red-100 px-3 py-1 rounded-full">
            <i class="fas fa-user-times"></i>
            <span>No autenticado</span>
          </div>
        `;
      }
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (!modal) {
      this.createLoginModal();
    }
    
    document.getElementById('login-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  createLoginModal() {
    const modalHTML = `
      <div id="login-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <i class="fas fa-lock text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-6">Iniciar Sesión</h3>
            
            <form id="login-form" onsubmit="submitLogin(event)">
              <div class="mb-4 text-left">
                <label for="login-email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input type="email" id="login-email" name="email" required
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="admin@techmx.com">
              </div>
              
              <div class="mb-6 text-left">
                <label for="login-password" class="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input type="password" id="login-password" name="password" required
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="••••••••">
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
                <p class="text-blue-800 font-medium mb-2">Usuarios de prueba:</p>
                <p class="text-blue-700">• <strong>admin@techmx.com</strong> (admin123) - Administrador</p>
                <p class="text-blue-700">• <strong>maria.lopez@techmx.com</strong> (user123) - Editor</p>
              </div>
              
              <div class="flex justify-end space-x-3">
                <button type="button" onclick="closeLoginModal()" 
                        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" 
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <i class="fas fa-sign-in-alt mr-1"></i>
                  Iniciar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // ===== CFDI VALIDATION METHODS =====

  openCfdiValidation(companyId) {
    const company = this.companies.find(c => c.id === companyId);
    if (!company || company.country !== 'MX') {
      this.showMessage('Solo las empresas mexicanas pueden validar CFDI', 'error');
      return;
    }

    const modal = document.getElementById('cfdi-modal');
    if (!modal) {
      this.createCfdiModal();
    }

    // Update modal title with company name
    document.getElementById('cfdi-company-name').textContent = company.name;
    document.getElementById('cfdi-company-id').value = companyId;

    // Reset form
    this.resetCfdiForm();

    // Show modal
    document.getElementById('cfdi-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  createCfdiModal() {
    const modalHTML = `
      <div id="cfdi-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden">
        <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900">
                <i class="fas fa-file-invoice text-purple-600 mr-2"></i>
                Validación CFDI - <span id="cfdi-company-name"></span>
              </h3>
              <button onclick="closeCfdiModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <!-- CFDI Upload Form -->
            <form id="cfdi-form" onsubmit="submitCfdiValidation(event)">
              <input type="hidden" id="cfdi-company-id" value="">
              
              <!-- File Upload Area -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Archivo CFDI (XML o PDF)
                </label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-purple-400 transition-colors"
                     ondrop="handleCfdiFileDrop(event)" 
                     ondragover="handleDragOver(event)" 
                     ondragleave="handleDragLeave(event)">
                  <div class="space-y-1 text-center">
                    <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                    <div class="flex text-sm text-gray-600">
                      <label for="cfdi-file-input" class="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>Seleccionar archivo CFDI</span>
                        <input id="cfdi-file-input" name="cfdi-file" type="file" class="sr-only" 
                               accept=".xml,.pdf" onchange="handleCfdiFileSelect(event)">
                      </label>
                      <p class="pl-1">o arrastra y suelta aquí</p>
                    </div>
                    <p class="text-xs text-gray-500">XML o PDF hasta 10MB</p>
                  </div>
                </div>
              </div>

              <!-- File Preview Area -->
              <div id="cfdi-file-preview" class="mb-6 hidden">
                <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div id="cfdi-file-info" class="flex items-center justify-between mb-3">
                    <!-- File info will be inserted here -->
                  </div>
                  <div id="cfdi-validation-status" class="hidden">
                    <!-- Validation status will be inserted here -->
                  </div>
                </div>
              </div>

              <!-- Manual Data Input -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label for="cfdi-rfc-emisor" class="block text-sm font-medium text-gray-700">RFC Emisor</label>
                  <input type="text" id="cfdi-rfc-emisor" name="rfc_emisor" 
                         class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                         placeholder="RFC123456789">
                </div>
                <div>
                  <label for="cfdi-rfc-receptor" class="block text-sm font-medium text-gray-700">RFC Receptor</label>
                  <input type="text" id="cfdi-rfc-receptor" name="rfc_receptor" 
                         class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                         placeholder="RFC987654321">
                </div>
                <div>
                  <label for="cfdi-uuid" class="block text-sm font-medium text-gray-700">UUID (Folio Fiscal)</label>
                  <input type="text" id="cfdi-uuid" name="uuid" 
                         class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                         placeholder="12345678-1234-1234-1234-123456789012">
                </div>
                <div>
                  <label for="cfdi-total" class="block text-sm font-medium text-gray-700">Total</label>
                  <input type="number" id="cfdi-total" name="total" step="0.01" 
                         class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                         placeholder="0.00">
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-3">
                <button type="button" onclick="closeCfdiModal()" 
                        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" 
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <i class="fas fa-check mr-1"></i>
                  Validar CFDI
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  resetCfdiForm() {
    const form = document.getElementById('cfdi-form');
    if (form) {
      form.reset();
      document.getElementById('cfdi-file-preview').classList.add('hidden');
      document.getElementById('cfdi-validation-status').classList.add('hidden');
    }
  }

  async validateCfdiFile(file, companyId) {
    try {
      this.showMessage('Validando archivo CFDI...', 'info');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('company_id', companyId);

      const response = await fetch('/api/cfdi/validate', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        this.displayCfdiValidationResult(result);
        this.showMessage('CFDI validado exitosamente', 'success');
      } else {
        throw new Error(result.error || 'Error al validar CFDI');
      }

    } catch (error) {
      console.error('Error validating CFDI:', error);
      this.showMessage('Error al validar CFDI: ' + error.message, 'error');
    }
  }

  displayCfdiValidationResult(result) {
    const statusDiv = document.getElementById('cfdi-validation-status');
    
    if (result.cfdi_data) {
      // Populate form fields with extracted data
      const data = result.cfdi_data;
      if (data.rfc_emisor) document.getElementById('cfdi-rfc-emisor').value = data.rfc_emisor;
      if (data.rfc_receptor) document.getElementById('cfdi-rfc-receptor').value = data.rfc_receptor;
      if (data.uuid) document.getElementById('cfdi-uuid').value = data.uuid;
      if (data.total) document.getElementById('cfdi-total').value = data.total;
    }

    // Display validation status
    const isValid = result.sat_valid;
    const statusClass = isValid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';
    const statusIcon = isValid ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';

    statusDiv.innerHTML = `
      <div class="${statusClass} border rounded-lg p-3">
        <div class="flex items-center">
          <i class="${statusIcon} mr-2"></i>
          <span class="font-semibold">
            ${isValid ? 'CFDI Válido' : 'CFDI No Válido'}
          </span>
        </div>
        ${result.validation_details ? `
          <div class="mt-2 text-sm">
            <p><strong>Detalles:</strong> ${result.validation_details}</p>
          </div>
        ` : ''}
      </div>
    `;

    statusDiv.classList.remove('hidden');
  }
}

// ===== GLOBAL FUNCTIONS =====

function applyFilters() {
  window.expensesApp.applyFilters();
}

function clearFilters() {
  window.expensesApp.clearFilters();
}

function showExpenseForm() {
  if (window.expensesApp) {
    window.expensesApp.showExpenseForm();
  }
}

function closeExpenseForm() {
  if (window.expensesApp) {
    window.expensesApp.closeExpenseForm();
  }
}

function refreshExchangeRates() {
  if (window.expensesApp) {
    // Add visual feedback
    const button = event.target;
    const icon = button.querySelector('i');
    if (icon) {
      icon.classList.add('fa-spin');
      setTimeout(() => icon.classList.remove('fa-spin'), 1000);
    }
    
    window.expensesApp.loadExchangeRates();
    
    // Add animation to cards
    const cards = document.querySelectorAll('.exchange-rate-card');
    cards.forEach(card => {
      card.classList.add('rate-update-animation');
      setTimeout(() => card.classList.remove('rate-update-animation'), 500);
    });
  }
}

async function submitExpenseForm(event) {
  event.preventDefault();
  
  if (!window.expensesApp.validateExpenseForm()) {
    return;
  }
  
  // Capture location automatically for mobile devices
  if (window.expensesApp.isMobileDevice()) {
    await captureLocationForExpense();
  }
  
  const formData = window.expensesApp.getFormData();
  
  try {
    await window.expensesApp.createExpense(formData);
  } catch (error) {
    console.error('Error submitting form:', error);
  }
}

function updateExchangeRate() {
  window.expensesApp.updateExchangeRate();
}

function refreshExchangeRate() {
  window.expensesApp.updateExchangeRate();
}

function handleFileSelect(event) {
  window.expensesApp.handleFileSelect(event.target.files);
}

// Mobile camera capture functions
function captureFromCamera() {
  const cameraInput = document.getElementById('camera-capture');
  if (cameraInput) {
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
    cameraInput.click();
  }
}

function handleCameraCapture(event) {
  const files = event.target.files;
  if (files.length > 0) {
    // Show immediate feedback for mobile users
    window.expensesApp.showMessage('📸 Foto capturada exitosamente', 'success');
    window.expensesApp.handleFileSelect(files);
    
    // Auto-fill expense date with today's date if empty
    const dateField = document.getElementById('form-expense-date');
    if (dateField && !dateField.value) {
      const today = new Date().toISOString().split('T')[0];
      dateField.value = today;
    }
  }
}

// Mobile-first optimization functions
function optimizeForMobile() {
  if (window.expensesApp.isMobileDevice()) {
    // Add mobile-specific classes for better touch targets
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    buttons.forEach(btn => {
      btn.classList.add('min-h-12', 'text-base');
    });
    
    // Improve form inputs for mobile
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.classList.add('min-h-12', 'text-base');
    });
    
    // Add mobile keyboard hints
    const amountInput = document.getElementById('form-amount');
    if (amountInput) {
      amountInput.setAttribute('inputmode', 'decimal');
      amountInput.setAttribute('pattern', '[0-9]*\\.?[0-9]*');
    }
    
    const dateInput = document.getElementById('form-expense-date');
    if (dateInput) {
      dateInput.setAttribute('inputmode', 'none');
    }
  }
}

// Auto-location for mobile expense tracking
async function captureLocationForExpense() {
  if ('geolocation' in navigator && window.expensesApp.isMobileDevice()) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000
        });
      });
      
      const { latitude, longitude } = position.coords;
      window.expensesApp.showMessage('📍 Ubicación capturada', 'info');
      
      // Store location data (could be used for expense validation)
      const locationData = {
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      };
      
      // Add to notes field if empty
      const notesField = document.getElementById('form-notes');
      if (notesField && !notesField.value.trim()) {
        notesField.value = `📍 Ubicación: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      
      return locationData;
    } catch (error) {
      console.log('Location capture failed:', error.message);
    }
  }
  return null;
}

// Drag and drop handlers
function handleFileDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const uploadArea = event.currentTarget;
  uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    window.expensesApp.handleFileSelect(files);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const uploadArea = event.currentTarget;
  uploadArea.classList.add('border-blue-400', 'bg-blue-50');
}

function handleDragLeave(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const uploadArea = event.currentTarget;
  uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
}

function saveDraft() {
  alert('Función de guardar borrador - Por implementar');
}

function editExpense(id) {
  alert(`Editar gasto #${id} - Por implementar`);
}

function viewExpense(id) {
  alert(`Ver detalles del gasto #${id} - Por implementar`);
}

function deleteExpense(id) {
  if (confirm(`¿Está seguro de eliminar el gasto #${id}?`)) {
    alert(`Eliminar gasto #${id} - Por implementar`);
  }
}

function toggleSelectAll() {
  const selectAll = document.getElementById('select-all');
  const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAll.checked;
  });
}

async function exportFiltered(format) {
  const loadingText = format === 'pdf' ? 'Generando PDF...' : 'Generando Excel...';
  
  // Show loading
  const originalText = event.target.innerHTML;
  event.target.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${loadingText}`;
  event.target.disabled = true;
  
  try {
    // Get current filters
    const filters = window.expensesApp.currentFilters || {};
    
    if (format === 'pdf') {
      // Generate PDF
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Open PDF in new window
        const pdfWindow = window.open('', '_blank');
        pdfWindow.document.write(result.html_content);
        pdfWindow.document.close();
        
        // Trigger print dialog
        setTimeout(() => {
          pdfWindow.print();
        }, 500);
        
        window.expensesApp.showSuccess(`PDF generado con ${result.total_expenses} gastos`);
      } else {
        throw new Error(result.error || 'Error al generar PDF');
      }
    } else if (format === 'excel') {
      // Generate Excel data
      const response = await fetch('/api/reports/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Convert to CSV and download
        const csv = convertToCSV(result.data);
        downloadCSV(csv, `gastos_${new Date().toISOString().split('T')[0]}.csv`);
        
        window.expensesApp.showSuccess(`Excel generado con ${result.total_records} registros`);
      } else {
        throw new Error(result.error || 'Error al generar Excel');
      }
    }
  } catch (error) {
    console.error(`Error exporting ${format}:`, error);
    window.expensesApp.showError(`Error al exportar en formato ${format.toUpperCase()}`);
  } finally {
    // Restore button
    event.target.innerHTML = originalText;
    event.target.disabled = false;
  }
}

function convertToCSV(data) {
  if (!data.length) return '';
  
  // CSV headers
  const headers = [
    'ID', 'Fecha', 'Descripción', 'Empresa', 'Usuario', 'Tipo de Gasto', 'Categoría',
    'Monto Original', 'Moneda', 'Tipo de Cambio', 'Monto MXN', 
    'Método de Pago', 'Proveedor', 'No. Factura', 'Estado', 'Facturable', 'Notas'
  ];
  
  // CSV rows
  const rows = data.map(expense => [
    expense.id,
    expense.expense_date,
    expense.description,
    expense.company_name,
    expense.user_name,
    expense.expense_type_name,
    expense.category,
    expense.amount,
    expense.currency,
    expense.exchange_rate,
    expense.amount_mxn,
    expense.payment_method,
    expense.vendor || '',
    expense.invoice_number || '',
    expense.status,
    expense.is_billable ? 'Sí' : 'No',
    expense.notes || ''
  ]);
  
  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function showImportExcel() {
  // Create import modal dynamically
  const modalHtml = `
    <div id="import-modal" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black bg-opacity-50" onclick="closeImportModal()"></div>
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">
                  <i class="fas fa-file-excel mr-2 text-green-600"></i>
                  Importar Gastos desde Excel
                </h3>
                <button onclick="closeImportModal()" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <div class="px-6 py-4">
              <div class="space-y-6">
                <!-- Step 1: Upload File -->
                <div class="step-section">
                  <h4 class="font-semibold text-gray-900 mb-3">
                    <span class="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-xs flex items-center justify-center mr-2 inline-flex">1</span>
                    Seleccionar Archivo Excel
                  </h4>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <i class="fas fa-file-excel text-4xl text-green-500 mb-4"></i>
                    <p class="text-gray-600 mb-2">Selecciona un archivo Excel (.xlsx, .csv)</p>
                    <input type="file" id="excel-file-input" accept=".xlsx,.xls,.csv" class="hidden" onchange="handleExcelFile(event)" />
                    <button onclick="document.getElementById('excel-file-input').click()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <i class="fas fa-upload mr-2"></i>
                      Seleccionar Archivo
                    </button>
                    <p class="text-xs text-gray-500 mt-2">Formatos soportados: Excel (.xlsx, .xls) y CSV</p>
                  </div>
                  <div id="file-info" class="mt-3 hidden">
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div class="flex items-center">
                        <i class="fas fa-check-circle text-green-600 mr-2"></i>
                        <span id="file-name" class="text-green-800"></span>
                        <button onclick="removeFile()" class="ml-auto text-red-600 hover:text-red-800">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Preview and Mapping -->
                <div id="mapping-section" class="step-section hidden">
                  <h4 class="font-semibold text-gray-900 mb-3">
                    <span class="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-xs flex items-center justify-center mr-2 inline-flex">2</span>
                    Mapeo de Columnas
                  </h4>
                  <p class="text-sm text-gray-600 mb-4">Asigna las columnas de tu archivo a los campos del sistema:</p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="column-mapping">
                    <!-- Mapping controls will be generated here -->
                  </div>
                </div>

                <!-- Step 3: Preview Data -->
                <div id="preview-section" class="step-section hidden">
                  <h4 class="font-semibold text-gray-900 mb-3">
                    <span class="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-xs flex items-center justify-center mr-2 inline-flex">3</span>
                    Vista Previa de Datos
                  </h4>
                  <div class="overflow-x-auto">
                    <table id="preview-table" class="min-w-full border border-gray-300">
                      <thead class="bg-gray-50">
                        <!-- Preview headers -->
                      </thead>
                      <tbody>
                        <!-- Preview data -->
                      </tbody>
                    </table>
                  </div>
                  <p id="preview-summary" class="text-sm text-gray-600 mt-2"></p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button onclick="closeImportModal()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button id="import-btn" onclick="performImport()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50" disabled>
                  <i class="fas fa-download mr-2"></i>
                  Importar Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.body.style.overflow = 'hidden';
}

function closeImportModal() {
  const modal = document.getElementById('import-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
}

let importData = null;
let columnHeaders = [];

function handleExcelFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('file-name');
  
  fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;
  fileInfo.classList.remove('hidden');

  // For demonstration, simulate reading the file
  // In a real implementation, you'd use a library like SheetJS to parse Excel files
  simulateExcelParsing(file);
}

function simulateExcelParsing(file) {
  // Simulate Excel data for demo
  const sampleData = [
    { 'Fecha': '2024-09-20', 'Descripción': 'Comida cliente', 'Monto': '850.00', 'Moneda': 'MXN', 'Proveedor': 'Restaurante' },
    { 'Fecha': '2024-09-21', 'Descripción': 'Taxi aeropuerto', 'Monto': '320.50', 'Moneda': 'MXN', 'Proveedor': 'Uber' },
    { 'Fecha': '2024-09-22', 'Descripción': 'Licencia software', 'Monto': '99.00', 'Moneda': 'USD', 'Proveedor': 'Adobe' }
  ];

  importData = sampleData;
  columnHeaders = Object.keys(sampleData[0] || {});
  
  showMappingSection();
}

function showMappingSection() {
  const mappingSection = document.getElementById('mapping-section');
  const columnMapping = document.getElementById('column-mapping');
  
  const systemFields = [
    { key: 'expense_date', label: 'Fecha del Gasto *', required: true },
    { key: 'description', label: 'Descripción *', required: true },
    { key: 'amount', label: 'Monto *', required: true },
    { key: 'currency', label: 'Moneda', required: false },
    { key: 'vendor', label: 'Proveedor', required: false },
    { key: 'payment_method', label: 'Método de Pago', required: false },
    { key: 'notes', label: 'Notas', required: false }
  ];

  const mappingHtml = systemFields.map(field => `
    <div class="mapping-field">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        ${field.label}
        ${field.required ? '<span class="text-red-500">*</span>' : ''}
      </label>
      <select class="w-full border border-gray-300 rounded-lg px-3 py-2" data-field="${field.key}">
        <option value="">-- Seleccionar columna --</option>
        ${columnHeaders.map(header => `<option value="${header}">${header}</option>`).join('')}
      </select>
    </div>
  `).join('');

  columnMapping.innerHTML = mappingHtml;
  mappingSection.classList.remove('hidden');

  // Auto-map similar column names
  autoMapColumns();
}

function autoMapColumns() {
  const mappings = {
    'expense_date': ['fecha', 'date', 'fecha_gasto'],
    'description': ['descripcion', 'description', 'concepto'],
    'amount': ['monto', 'amount', 'importe', 'total'],
    'currency': ['moneda', 'currency'],
    'vendor': ['proveedor', 'vendor', 'establecimiento'],
    'payment_method': ['metodo_pago', 'payment_method', 'forma_pago'],
    'notes': ['notas', 'notes', 'comentarios']
  };

  Object.keys(mappings).forEach(field => {
    const select = document.querySelector(`select[data-field="${field}"]`);
    const possibleHeaders = mappings[field];
    
    for (const header of columnHeaders) {
      for (const possible of possibleHeaders) {
        if (header.toLowerCase().includes(possible.toLowerCase())) {
          select.value = header;
          break;
        }
      }
    }
  });

  showPreviewSection();
}

function showPreviewSection() {
  const previewSection = document.getElementById('preview-section');
  const previewTable = document.getElementById('preview-table');
  const previewSummary = document.getElementById('preview-summary');
  
  // Get current mappings
  const mappings = {};
  document.querySelectorAll('#column-mapping select').forEach(select => {
    if (select.value) {
      mappings[select.dataset.field] = select.value;
    }
  });

  // Generate preview table
  const previewData = importData.slice(0, 5); // Show first 5 rows
  
  const headerRow = Object.keys(mappings).map(field => `<th class="px-4 py-2 text-left">${field}</th>`).join('');
  const bodyRows = previewData.map(row => {
    const cells = Object.keys(mappings).map(field => {
      const columnName = mappings[field];
      return `<td class="px-4 py-2 border-b">${row[columnName] || ''}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  previewTable.innerHTML = `
    <thead>
      <tr class="bg-gray-50">${headerRow}</tr>
    </thead>
    <tbody>${bodyRows}</tbody>
  `;

  previewSummary.textContent = `Vista previa: ${previewData.length} de ${importData.length} registros`;
  previewSection.classList.remove('hidden');

  // Enable import button
  document.getElementById('import-btn').disabled = false;
}

async function performImport() {
  const importBtn = document.getElementById('import-btn');
  const originalText = importBtn.innerHTML;
  
  importBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Importando...';
  importBtn.disabled = true;

  try {
    // Get mappings
    const mappings = {};
    document.querySelectorAll('#column-mapping select').forEach(select => {
      if (select.value) {
        mappings[select.dataset.field] = select.value;
      }
    });

    // Get selected company (you might want to add a company selector)
    const companyId = 1; // Default to first company for demo

    const response = await fetch('/api/import/excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: importData,
        mappings: mappings,
        company_id: companyId
      })
    });

    const result = await response.json();

    if (result.success) {
      window.expensesApp.showSuccess(`${result.results.imported} gastos importados exitosamente`);
      closeImportModal();
      
      // Reload expenses if on expenses page
      if (window.expensesApp.isExpensesPage()) {
        window.expensesApp.loadExpenses();
      }
    } else {
      throw new Error(result.error || 'Error en la importación');
    }
  } catch (error) {
    console.error('Import error:', error);
    window.expensesApp.showError('Error al importar los datos');
  } finally {
    importBtn.innerHTML = originalText;
    importBtn.disabled = false;
  }
}

function removeFile() {
  document.getElementById('file-info').classList.add('hidden');
  document.getElementById('mapping-section').classList.add('hidden');
  document.getElementById('preview-section').classList.add('hidden');
  document.getElementById('import-btn').disabled = true;
  importData = null;
  columnHeaders = [];
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Dashboard-specific functions
function viewCompanyDetails(companyId) {
  // Navigate to expenses filtered by company
  window.location.href = `/expenses?company_id=${companyId}`;
}

function addExpenseForCompany(companyId) {
  // Show expense form with company pre-selected
  showExpenseForm();
  
  // Pre-select company after form loads
  setTimeout(() => {
    const companySelect = document.getElementById('form-company');
    if (companySelect) {
      companySelect.value = companyId;
    }
  }, 100);
}

function viewCompanyReport(companyId) {
  alert(`Ver reporte detallado de empresa ${companyId} - Por implementar`);
}

function toggleCompanyView() {
  alert('Vista expandida de empresas - Por implementar');
}

function viewPendingExpenses() {
  window.location.href = '/expenses?status=pending';
}

async function updateExchangeRates() {
  try {
    const response = await fetch('/api/exchange-rates/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Tipos de cambio actualizados exitosamente');
      // Reload dashboard
      window.location.reload();
    } else {
      alert('Error al actualizar tipos de cambio');
    }
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    alert('Error al actualizar tipos de cambio');
  }
}

// Currency selector handler
function handleCurrencyChange() {
  const selector = document.getElementById('currency-selector');
  if (selector) {
    selector.addEventListener('change', (e) => {
      // Update dashboard currency display
      window.expensesApp.displayCurrency = e.target.value;
      window.expensesApp.loadDashboardMetrics();
    });
  }
}

// Period selector handler  
function handlePeriodChange() {
  const selector = document.getElementById('period-selector');
  if (selector) {
    selector.addEventListener('change', async (e) => {
      // Update charts period with loading indicator
      const period = e.target.value;
      window.expensesApp.currentPeriod = period;
      
      // Show loading state on charts
      showChartsLoading();
      
      try {
        // Reload dashboard with new period
        await window.expensesApp.loadDashboardMetricsWithFilters({ period });
      } catch (error) {
        console.error('Error updating charts with period filter:', error);
        window.expensesApp.showMessage('Error al actualizar gráficas', 'error');
      }
    });
  }
}

// Analytics filters functionality
function initializeAnalyticsFilters() {
  // Period selector
  handlePeriodChange();
  
  // Company filter (if exists in analytics)
  const companyFilter = document.getElementById('analytics-company-filter');
  if (companyFilter) {
    companyFilter.addEventListener('change', async (e) => {
      await updateAnalyticsFilters();
    });
  }
  
  // Currency filter (if exists in analytics) 
  const currencyFilter = document.getElementById('analytics-currency-filter');
  if (currencyFilter) {
    currencyFilter.addEventListener('change', async (e) => {
      await updateAnalyticsFilters();
    });
  }
}

async function updateAnalyticsFilters() {
  const filters = {};
  
  // Get period
  const period = document.getElementById('period-selector')?.value;
  if (period) filters.period = period;
  
  // Get company filter
  const company = document.getElementById('analytics-company-filter')?.value;
  if (company) filters.company_id = company;
  
  // Get currency filter
  const currency = document.getElementById('analytics-currency-filter')?.value;
  if (currency) filters.currency = currency;
  
  // Show loading
  showChartsLoading();
  
  try {
    await window.expensesApp.loadDashboardMetricsWithFilters(filters);
  } catch (error) {
    console.error('Error updating analytics filters:', error);
    window.expensesApp.showMessage('Error al aplicar filtros', 'error');
  }
}

function showChartsLoading() {
  const chartContainers = ['company-chart', 'currency-chart', 'trend-chart', 'status-chart'];
  
  chartContainers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <i class="fas fa-spinner fa-spin text-2xl text-gold mb-2"></i>
            <p class="text-sm text-tertiary">Actualizando gráficas...</p>
          </div>
        </div>
      `;
    }
  });
}

// Refresh specific charts
function refreshCompanyChart() {
  if (window.expensesApp) {
    showChartsLoading();
    window.expensesApp.loadDashboardMetrics();
  }
}

function refreshStatusMetrics() {
  if (window.expensesApp) {
    showChartsLoading(); 
    window.expensesApp.loadDashboardMetrics();
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.expensesApp = new ExpensesApp();
  
  // Setup form submission
  const expenseForm = document.getElementById('expense-form');
  if (expenseForm) {
    expenseForm.addEventListener('submit', submitExpenseForm);
  }
  
  // Setup dashboard event handlers
  handleCurrencyChange();
  handlePeriodChange();
  
  // Initialize analytics filters after a small delay
  setTimeout(() => {
    if (window.expensesApp && window.expensesApp.isDashboardPage()) {
      initializeAnalyticsFilters();
    }
  }, 500);
});

// ===== AUTHENTICATION GLOBAL FUNCTIONS =====

function showLoginModal() {
  window.expensesApp.showLoginModal();
}

function closeLoginModal() {
  window.expensesApp.hideLoginModal();
}

async function submitLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const email = formData.get('email');
  const password = formData.get('password');
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Iniciando...';
  
  try {
    const success = await window.expensesApp.login(email, password);
    if (!success) {
      // Error already shown in login method
    }
  } catch (error) {
    window.expensesApp.showMessage('Error de conexión', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function logout() {
  window.expensesApp.logout();
}

// ===== CFDI VALIDATION GLOBAL FUNCTIONS =====

function closeCfdiModal() {
  const modal = document.getElementById('cfdi-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

function handleCfdiFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    displayCfdiFileInfo(file);
    
    // Auto-validate if file is selected
    const companyId = document.getElementById('cfdi-company-id').value;
    if (companyId) {
      window.expensesApp.validateCfdiFile(file, companyId);
    }
  }
}

function handleCfdiFileDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const uploadArea = event.currentTarget;
  uploadArea.classList.remove('border-purple-400', 'bg-purple-50');
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    
    // Check file type
    if (file.type === 'text/xml' || file.type === 'application/xml' || 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.xml')) {
      
      displayCfdiFileInfo(file);
      
      // Auto-validate
      const companyId = document.getElementById('cfdi-company-id').value;
      if (companyId) {
        window.expensesApp.validateCfdiFile(file, companyId);
      }
    } else {
      window.expensesApp.showMessage('Solo se permiten archivos XML o PDF', 'error');
    }
  }
}

function displayCfdiFileInfo(file) {
  const previewDiv = document.getElementById('cfdi-file-preview');
  const fileInfoDiv = document.getElementById('cfdi-file-info');
  
  const fileSize = window.expensesApp.formatFileSize(file.size);
  const fileIcon = file.type === 'application/pdf' ? 'fas fa-file-pdf text-red-600' : 'fas fa-file-code text-blue-600';
  
  fileInfoDiv.innerHTML = `
    <div class="flex items-center space-x-3">
      <i class="${fileIcon} text-xl"></i>
      <div>
        <p class="text-sm font-medium text-gray-900">${file.name}</p>
        <p class="text-xs text-gray-500">${fileSize} - ${file.type}</p>
      </div>
    </div>
    <button type="button" onclick="clearCfdiFile()" class="text-red-600 hover:text-red-800">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  previewDiv.classList.remove('hidden');
}

function clearCfdiFile() {
  document.getElementById('cfdi-file-input').value = '';
  document.getElementById('cfdi-file-preview').classList.add('hidden');
  document.getElementById('cfdi-validation-status').classList.add('hidden');
}

async function submitCfdiValidation(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const companyId = document.getElementById('cfdi-company-id').value;
  
  // Validate required fields
  const rfcEmisor = formData.get('rfc_emisor');
  const rfcReceptor = formData.get('rfc_receptor');
  const uuid = formData.get('uuid');
  
  if (!rfcEmisor || !rfcReceptor || !uuid) {
    window.expensesApp.showMessage('Por favor complete todos los campos obligatorios', 'error');
    return;
  }
  
  try {
    window.expensesApp.showMessage('Validando datos CFDI...', 'info');
    
    const response = await fetch('/api/cfdi/validate-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        company_id: companyId,
        rfc_emisor: rfcEmisor,
        rfc_receptor: rfcReceptor,
        uuid: uuid,
        total: formData.get('total')
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      window.expensesApp.displayCfdiValidationResult(result);
      window.expensesApp.showMessage('CFDI validado exitosamente', 'success');
      
      // Auto-close modal after success
      setTimeout(() => {
        closeCfdiModal();
      }, 2000);
      
    } else {
      throw new Error(result.error || 'Error al validar CFDI');
    }
    
  } catch (error) {
    console.error('Error validating CFDI:', error);
    window.expensesApp.showMessage('Error al validar CFDI: ' + error.message, 'error');
  }
}