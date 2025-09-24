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
      
      // Update charts
      this.renderCompanyChart(response.company_metrics);
      this.renderCurrencyChart(response.currency_metrics);
      
      // Update recent expenses table
      this.renderRecentExpenses(response.recent_expenses);
      
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    }
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

// ===== GLOBAL FUNCTIONS =====

function applyFilters() {
  window.expensesApp.applyFilters();
}

function clearFilters() {
  window.expensesApp.clearFilters();
}

function showExpenseForm() {
  alert('Formulario de gastos - Por implementar');
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.expensesApp = new ExpensesApp();
});