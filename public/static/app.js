// Lyra Expenses - Frontend JavaScript
// Sistema 4-D: Dinero, Decisión, Dirección, Disciplina

class ExpensesApp {
  constructor() {
    this.apiBase = '/api';
    this.currentFilters = {};
    this.companies = [];
    this.users = [];
    this.expenseTypes = [];
    
    this.init();
  }

  async init() {
    try {
      // Load initial data
      await this.loadCompanies();
      await this.loadUsers();
      await this.loadExpenseTypes();
      
      // Load dashboard metrics if on dashboard page
      if (this.isDashboardPage()) {
        await this.loadDashboardMetrics();
      }
      
      // Load expenses if on expenses page
      if (this.isExpensesPage()) {
        await this.loadExpenses();
        this.setupFilters();
      }
      
      // Setup event listeners
      this.setupEventListeners();
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

  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

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
      
      // Update charts
      this.renderCompanyChart(response.company_metrics);
      this.renderCurrencyChart(response.currency_metrics);
      
      // Render recent activity and pending actions
      this.renderRecentActivity(response.recent_expenses);
      this.renderPendingActions(response.status_metrics);
      
      // Update recent expenses table
      this.renderRecentExpenses(response.recent_expenses);
      
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    }
  }

  renderCompaniesMosaic(companyMetrics) {
    const mosaicContainer = document.getElementById('companies-mosaic');
    if (!mosaicContainer) return;

    // Create company cards with metrics
    const companyCards = this.companies.map(company => {
      const metrics = companyMetrics.find(m => m.company === company.name) || { count: 0, total_mxn: 0 };
      const flag = company.country === 'MX' ? '🇲🇽' : '🇪🇸';
      
      return `
        <div class="company-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer" onclick="viewCompanyDetails(${company.id})">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  ${company.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">${company.name}</h3>
                  <p class="text-sm text-gray-500">${flag} ${company.country === 'MX' ? 'México' : 'España'}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900">${metrics.count}</div>
                <div class="text-xs text-gray-500">gastos</div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Total gastado:</span>
                <span class="font-semibold text-green-600">${this.formatCurrency(metrics.total_mxn)}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Moneda principal:</span>
                <span class="text-sm font-medium">${company.primary_currency}</span>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: ${Math.min((metrics.total_mxn / 50000) * 100, 100)}%"></div>
              </div>
            </div>
            
            <div class="mt-4 flex justify-between">
              <button onclick="event.stopPropagation(); addExpenseForCompany(${company.id})" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200">
                <i class="fas fa-plus mr-1"></i>
                Agregar Gasto
              </button>
              <button onclick="event.stopPropagation(); viewCompanyReport(${company.id})" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200">
                <i class="fas fa-chart-bar mr-1"></i>
                Ver Reporte
              </button>
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

  handleFileSelect(files) {
    const attachmentsList = document.getElementById('attachments-list');
    const attachmentsPreview = document.getElementById('attachments-preview');
    
    if (!attachmentsList || !files.length) return;

    attachmentsPreview.classList.remove('hidden');
    
    Array.from(files).forEach((file, index) => {
      const fileDiv = document.createElement('div');
      fileDiv.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg border';
      
      const fileInfo = document.createElement('div');
      fileInfo.className = 'flex items-center space-x-3';
      
      const icon = this.getFileIcon(file.type);
      const fileSize = this.formatFileSize(file.size);
      
      fileInfo.innerHTML = `
        <i class="${icon} text-blue-600"></i>
        <div>
          <p class="text-sm font-medium text-gray-900">${file.name}</p>
          <p class="text-xs text-gray-500">${fileSize} - ${file.type}</p>
        </div>
      `;
      
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'text-red-600 hover:text-red-800';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.onclick = () => {
        fileDiv.remove();
        if (attachmentsList.children.length === 0) {
          attachmentsPreview.classList.add('hidden');
        }
      };
      
      fileDiv.appendChild(fileInfo);
      fileDiv.appendChild(removeBtn);
      attachmentsList.appendChild(fileDiv);
    });
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
}

// ===== GLOBAL FUNCTIONS =====

function applyFilters() {
  window.expensesApp.applyFilters();
}

function clearFilters() {
  window.expensesApp.clearFilters();
}

function showExpenseForm() {
  const modal = document.getElementById('expense-modal');
  if (modal) {
    // Reset and populate form
    window.expensesApp.resetExpenseForm();
    window.expensesApp.populateExpenseForm();
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeExpenseForm() {
  const modal = document.getElementById('expense-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

async function submitExpenseForm(event) {
  event.preventDefault();
  
  if (!window.expensesApp.validateExpenseForm()) {
    return;
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
    selector.addEventListener('change', (e) => {
      // Update charts period
      window.expensesApp.currentPeriod = e.target.value;
      window.expensesApp.loadDashboardMetrics();
    });
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
});