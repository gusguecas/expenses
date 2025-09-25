// Lyra Expenses - Simplified Frontend JavaScript (NO AUTHENTICATION)
// Sistema 4-D: Dinero, Decisión, Dirección, Disciplina

class ExpensesAppSimple {
  constructor() {
    this.apiBase = '/api';
    this.currentFilters = {};
    this.companies = [];
    this.users = [];
    this.expenseTypes = [];
    
    // NO AUTHENTICATION - Direct access
    console.log('🚀 Lyra Expenses initialized - NO AUTH REQUIRED');
    this.init();
  }

  // Show message to user
  showMessage(message, type = 'info') {
    console.log(`📱 Message: ${message} (${type})`);
    
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.lyra-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `lyra-message fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Set styles based on type
    const colors = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white', 
      warning: 'bg-yellow-500 text-black',
      info: 'bg-blue-500 text-white'
    };
    
    messageEl.className += ` ${colors[type] || colors.info}`;
    messageEl.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => messageEl.remove(), 300);
    }, 4000);
  }

  // Initialize app
  async init() {
    try {
      console.log('✅ Initializing Lyra Expenses - No Auth Required');
      
      // Load basic data
      await this.loadCompanies();
      await this.loadUsers();
      await this.loadExpenseTypes();
      
      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      this.showMessage('Error initializing application', 'error');
    }
  }

  // API call helper (NO AUTHENTICATION)
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Load companies
  async loadCompanies() {
    try {
      const data = await this.apiCall('/companies');
      this.companies = data.companies || [];
      console.log(`✅ Loaded ${this.companies.length} companies`);
    } catch (error) {
      console.error('❌ Error loading companies:', error);
      this.companies = [];
    }
  }

  // Load users
  async loadUsers() {
    try {
      const data = await this.apiCall('/users');
      this.users = data.users || [];
      console.log(`✅ Loaded ${this.users.length} users`);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      this.users = [];
    }
  }

  // Load expense types
  async loadExpenseTypes() {
    try {
      const data = await this.apiCall('/expense-types');
      this.expenseTypes = data.expense_types || [];
      console.log(`✅ Loaded ${this.expenseTypes.length} expense types`);
    } catch (error) {
      console.error('❌ Error loading expense types:', error);
      this.expenseTypes = [];
    }
  }
}

// Global functions for easy access
function showMessage(message, type = 'info') {
  if (window.expensesApp) {
    window.expensesApp.showMessage(message, type);
  } else {
    console.log(`📱 ${type.toUpperCase()}: ${message}`);
  }
}

function reviewPending() {
  showMessage('Redirecting to pending expenses...', 'info');
  window.location.href = '/expenses';
}

function exportReport() {
  showMessage('Export functionality coming soon...', 'info');
}

// ==== COMPANY MANAGEMENT FUNCTIONS ====

// Show add company modal
function showAddCompanyModal() {
  console.log('🏢 Showing add company modal');
  const modal = document.getElementById('addCompanyModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    
    // Focus on first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input[type="text"]');
      if (firstInput) firstInput.focus();
    }, 100);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  }
}

// Close add company modal
function closeAddCompanyModal() {
  console.log('🏢 Closing add company modal');
  const modal = document.getElementById('addCompanyModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.add('hidden');
    
    // Reset form
    const form = document.getElementById('addCompanyForm');
    if (form) {
      form.reset();
      clearLogo();
    }
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
  }
}

// Handle logo file preview
function previewLogo(input) {
  console.log('🖼️ Processing logo file');
  
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Validate file size (500KB max for better performance)
    if (file.size > 500 * 1024) {
      showMessage('El archivo es muy grande. Máximo 500KB permitido para mejor rendimiento.', 'error');
      input.value = '';
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('Solo se permiten archivos de imagen.', 'error');
      input.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      // Show preview
      const uploadContent = document.getElementById('logo-upload-content');
      const preview = document.getElementById('logo-preview');
      const previewImg = document.getElementById('logo-preview-img');
      
      if (uploadContent && preview && previewImg) {
        previewImg.src = e.target.result;
        uploadContent.classList.add('hidden');
        preview.classList.remove('hidden');
      }
    };
    reader.readAsDataURL(file);
  }
}

// Clear logo preview
function clearLogo() {
  console.log('🗑️ Clearing logo');
  
  const uploadContent = document.getElementById('logo-upload-content');
  const preview = document.getElementById('logo-preview');
  const previewImg = document.getElementById('logo-preview-img');
  const fileInput = document.getElementById('logo-file-input');
  
  if (uploadContent && preview && previewImg && fileInput) {
    uploadContent.classList.remove('hidden');
    preview.classList.add('hidden');
    previewImg.src = '';
    fileInput.value = '';
  }
}

// Handle drag and drop logo upload
function handleLogoUpload(event) {
  event.preventDefault();
  console.log('📎 Handling logo drop');
  
  // Reset drag styling
  const uploadArea = document.getElementById('logo-upload-area');
  if (uploadArea) {
    uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    uploadArea.style.background = 'rgba(255, 255, 255, 0.02)';
  }
  
  const files = event.dataTransfer.files;
  if (files && files[0]) {
    const fileInput = document.getElementById('logo-file-input');
    if (fileInput) {
      // Create a new FileList-like object
      const dt = new DataTransfer();
      dt.items.add(files[0]);
      fileInput.files = dt.files;
      
      // Trigger preview
      previewLogo(fileInput);
    }
  }
}

// Sync color picker with hex input
function syncColorPicker() {
  const colorPicker = document.getElementById('company-color');
  const colorHex = document.getElementById('company-color-hex');
  
  if (colorPicker && colorHex) {
    colorPicker.addEventListener('change', function() {
      colorHex.value = this.value;
    });
    
    colorHex.addEventListener('change', function() {
      const hex = this.value;
      if (/^#[0-9A-F]{6}$/i.test(hex)) {
        colorPicker.value = hex;
      }
    });
  }
}

// Submit new company form
async function submitNewCompany(event) {
  event.preventDefault();
  console.log('🏢 Submitting new company');
  
  const form = event.target;
  const formData = new FormData(form);
  
  // Check if there's a logo file
  const logoFile = formData.get('logo');
  const hasLogo = logoFile && logoFile instanceof File && logoFile.size > 0;
  
  console.log('📎 Logo file check:', {
    logoFile: !!logoFile,
    isFile: logoFile instanceof File,
    fileName: logoFile ? logoFile.name : 'none',
    fileSize: logoFile ? logoFile.size : 0,
    hasLogo: hasLogo
  });
  
  // Additional debugging - check all form data
  console.log('📋 All FormData entries:');
  for (const [key, value] of formData.entries()) {
    if (key === 'logo') {
      if (value instanceof File) {
        console.log(`  📎 ${key}: FILE - ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  📎 ${key}: NOT A FILE - ${value}`);
      }
    } else {
      console.log(`  📝 ${key}: ${value}`);
    }
  }
  
  // Always validate required fields from FormData
  const companyData = {};
  for (const [key, value] of formData.entries()) {
    if (key !== 'logo') {
      companyData[key] = value;
    }
  }
  
  const required = ['razon_social', 'commercial_name', 'country', 'tax_id', 'primary_currency'];
  const missing = required.filter(field => !companyData[field]);
  
  if (missing.length > 0) {
    showMessage(`Campos requeridos faltantes: ${missing.join(', ')}`, 'error');
    return;
  }
  
  try {
    // Show loading
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creando...';
    submitButton.disabled = true;
    
    // ALWAYS send FormData to simplify processing
    console.log('📤 Sending FormData to server');
    
    if (hasLogo) {
      showMessage(`📎 Subiendo empresa con logo: ${logoFile.name}`, 'info');
    } else {
      showMessage('📝 Creando empresa sin logo', 'info');
    }
    
    const response = await fetch('/api/companies', {
      method: 'POST',
      body: formData // Always send FormData
    });
    
    const result = await response.json();
    
    if (result.success) {
      const logoMsg = result.logo_uploaded ? ' (con logo)' : '';
      showMessage(`✅ Empresa "${companyData.commercial_name}" creada exitosamente${logoMsg}`, 'success');
      closeAddCompanyModal();
      
      // Reload companies grid dynamically instead of full page reload
      setTimeout(() => {
        loadCompaniesGrid();
      }, 500);
    } else {
      throw new Error(result.error || 'Error creating company');
    }
    
  } catch (error) {
    console.error('❌ Error creating company:', error);
    showMessage(`Error al crear empresa: ${error.message}`, 'error');
  } finally {
    // Restore button
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Crear Empresa';
      submitButton.disabled = false;
    }
  }
}

// ==== DYNAMIC COMPANY LOADING FUNCTIONS ====

// Load and display companies in grid
async function loadCompaniesGrid() {
  console.log('🏢 Loading companies grid from API');
  
  const loadingElement = document.getElementById('companies-loading');
  const gridElement = document.getElementById('companies-grid');
  const noCompaniesElement = document.getElementById('no-companies');
  
  try {
    // Show loading state
    if (loadingElement) loadingElement.classList.remove('hidden');
    if (gridElement) gridElement.classList.add('hidden');
    if (noCompaniesElement) noCompaniesElement.classList.add('hidden');
    
    // Fetch companies from API
    const response = await fetch('/api/companies');
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Error loading companies');
    }
    
    const companies = result.companies || [];
    console.log(`✅ Loaded ${companies.length} companies from API`);
    
    // Hide loading state
    if (loadingElement) loadingElement.classList.add('hidden');
    
    if (companies.length === 0) {
      // Show empty state
      if (noCompaniesElement) noCompaniesElement.classList.remove('hidden');
    } else {
      // Show companies grid
      if (gridElement) {
        gridElement.innerHTML = companies.map(company => renderCompanyCard(company)).join('');
        gridElement.classList.remove('hidden');
      }
    }
    
    // Update summary statistics
    updateCompanySummary(companies);
    
  } catch (error) {
    console.error('❌ Error loading companies grid:', error);
    showMessage(`Error loading companies: ${error.message}`, 'error');
    
    // Hide loading, show empty state with error message
    if (loadingElement) loadingElement.classList.add('hidden');
    if (noCompaniesElement) {
      noCompaniesElement.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-white mb-2">Error Cargando Empresas</h3>
          <p class="text-gray-400 mb-4">${error.message}</p>
          <button onclick="loadCompaniesGrid()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <i class="fas fa-redo mr-2"></i>Reintentar
          </button>
        </div>
      `;
      noCompaniesElement.classList.remove('hidden');
    }
  }
}

// Render individual company card HTML
function renderCompanyCard(company) {
  const statusIcon = company.active ? 'fa-check-circle text-green-400' : 'fa-pause-circle text-yellow-400';
  const statusText = company.active ? 'Activa' : 'Inactiva';
  
  // Format created date
  const createdDate = company.created_at ? new Date(company.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible';
  
  // Format address
  const addressDisplay = company.address ? company.address : 'Dirección no disponible';
  
  return `
    <div class="lyra-card p-6 hover:scale-105 transition-transform duration-200 cursor-pointer" onclick="viewCompany(${company.id})">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            ${company.logo_url ? 
              `<img src="${company.logo_url}" alt="${company.name}" class="w-full h-full object-cover rounded-lg" />` :
              `<i class="fas fa-building text-white text-lg"></i>`
            }
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">${company.name}</h3>
            <p class="text-sm text-gray-400">ID: ${company.id}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <i class="fas ${statusIcon}"></i>
          <span class="text-gray-300">${statusText}</span>
        </div>
      </div>
      
      <div class="space-y-2 mb-4">
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <i class="fas fa-flag w-4"></i>
          <span>${getCountryName(company.country)} (${company.primary_currency || 'EUR'})</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <i class="fas fa-id-card w-4"></i>
          <span>${company.tax_id || 'ID fiscal no disponible'}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <i class="fas fa-map-marker-alt w-4"></i>
          <span class="truncate">${addressDisplay}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <i class="fas fa-calendar w-4"></i>
          <span>Creada: ${createdDate}</span>
        </div>
      </div>
      
      <div class="flex gap-2" onclick="event.stopPropagation()">
        <button onclick="viewCompany(${company.id})" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
          <i class="fas fa-eye mr-1"></i> Ver
        </button>
        <button onclick="editCompany(${company.id})" class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
          <i class="fas fa-edit mr-1"></i> Editar
        </button>
        <button onclick="deleteCompany(${company.id}, '${company.name.replace(/'/g, "\\'")}', event)" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors" title="Eliminar empresa">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

// Get country name from code
function getCountryName(countryCode) {
  const countries = {
    'MX': 'México',
    'ES': 'España', 
    'US': 'Estados Unidos',
    'CA': 'Canadá'
  };
  return countries[countryCode] || countryCode;
}

// Update company summary statistics
function updateCompanySummary(companies) {
  console.log('📊 Updating company summary with', companies.length, 'companies');
  
  const summaryElement = document.getElementById('companies-summary');
  if (!summaryElement) return;
  
  // Calculate statistics
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.active).length;
  const inactiveCompanies = totalCompanies - activeCompanies;
  
  // Count countries and currencies
  const countries = [...new Set(companies.map(c => c.country))];
  const currencies = [...new Set(companies.map(c => c.primary_currency))];
  
  // Update summary HTML
  summaryElement.innerHTML = `
    <div class="lyra-card p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-building text-white"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">${totalCompanies}</p>
          <p class="text-sm text-gray-400">Total Empresas</p>
        </div>
      </div>
    </div>
    
    <div class="lyra-card p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-check-circle text-white"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">${activeCompanies}</p>
          <p class="text-sm text-gray-400">Empresas Activas</p>
        </div>
      </div>
    </div>
    
    <div class="lyra-card p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-pause-circle text-white"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">${inactiveCompanies}</p>
          <p class="text-sm text-gray-400">Empresas Inactivas</p>
        </div>
      </div>
    </div>
    
    <div class="lyra-card p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-dollar-sign text-white"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">${currencies.length}</p>
          <p class="text-sm text-gray-400">Monedas</p>
        </div>
      </div>
    </div>
    
    <div class="lyra-card p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-globe text-white"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">${countries.length}</p>
          <p class="text-sm text-gray-400">Países</p>
        </div>
      </div>
    </div>
  `;
}

// Initialize company modal interactions
function initCompanyModal() {
  // Sync color picker when modal is shown
  syncColorPicker();
  
  // Close modal on ESC key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeAddCompanyModal();
    }
  });
  
  // Close modal when clicking backdrop
  const modal = document.getElementById('addCompanyModal');
  if (modal) {
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeAddCompanyModal();
      }
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM ready - initializing Lyra Expenses (No Auth)');
  window.expensesApp = new ExpensesAppSimple();
  
  // Initialize company modal if we're on companies page
  if (document.getElementById('addCompanyModal')) {
    initCompanyModal();
    console.log('🏢 Company modal initialized');
    
    // Load companies grid dynamically
    loadCompaniesGrid();
    console.log('🏢 Loading companies grid...');
  }
});

// ==== COMPANY DETAILS FUNCTIONS ====

// Navigate to company details page
function viewCompany(companyId) {
  console.log(`🏢 Navigating to company ${companyId}`);
  window.location.href = `/companies/${companyId}`;
}

// Edit company (placeholder for future implementation)
function editCompany(companyId) {
  console.log(`✏️ Edit company ${companyId}`);
  showMessage('Función de edición próximamente...', 'info');
}

// Delete company with confirmation
async function deleteCompany(companyId, companyName, event) {
  // Stop event propagation to prevent card click
  if (event) {
    event.stopPropagation();
  }
  
  console.log(`🗑️ Delete company ${companyId}: ${companyName}`);
  
  // Show confirmation dialog with strong warning
  const confirmed = confirm(
    `⚠️ ADVERTENCIA IMPORTANTE ⚠️\n\n` +
    `¿Estás seguro de que quieres ELIMINAR la empresa "${companyName}"?\n\n` +
    `🚨 ESTA ACCIÓN NO SE PUEDE DESHACER 🚨\n\n` +
    `Se eliminarán TODOS los datos asociados a esta empresa:\n` +
    `• Información de la empresa\n` +
    `• Logo corporativo\n` +
    `• Gastos asociados\n` +
    `• Usuarios vinculados\n` +
    `• Configuraciones\n\n` +
    `¿Continuar con la eliminación?`
  );
  
  if (!confirmed) {
    console.log('🚫 Company deletion cancelled by user');
    showMessage('Eliminación cancelada', 'info');
    return;
  }
  
  // Second confirmation for extra safety
  const finalConfirmed = confirm(
    `🚨 CONFIRMACIÓN FINAL 🚨\n\n` +
    `Última oportunidad para cancelar.\n\n` +
    `¿REALMENTE quieres eliminar "${companyName}"?\n\n` +
    `Esta acción es IRREVERSIBLE.\n\n` +
    `Presiona OK para ELIMINAR DEFINITIVAMENTE`
  );
  
  if (!finalConfirmed) {
    console.log('🚫 Company deletion cancelled on final confirmation');
    showMessage('Eliminación cancelada', 'info');
    return;
  }
  
  try {
    console.log(`🗑️ Proceeding to delete company ${companyId}`);
    showMessage('🗑️ Eliminando empresa...', 'warning');
    
    // Make API call to delete company
    const response = await fetch(`/api/companies/${companyId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage(`✅ ${result.message}`, 'success');
      
      // Reload companies grid to reflect changes
      setTimeout(() => {
        loadCompaniesGrid();
      }, 1500);
      
    } else {
      throw new Error(result.error || 'Error eliminando empresa');
    }
    
  } catch (error) {
    console.error('❌ Error deleting company:', error);
    showMessage(`❌ Error al eliminar empresa: ${error.message}`, 'error');
  }
}

// Load company details for individual company page
async function loadCompanyDetails(companyId) {
  console.log(`🏢 Loading details for company ${companyId}`);
  
  const loadingElement = document.getElementById('company-loading');
  const detailsElement = document.getElementById('company-details');
  const errorElement = document.getElementById('company-error');
  
  try {
    // Show loading state
    if (loadingElement) loadingElement.classList.remove('hidden');
    if (detailsElement) detailsElement.classList.add('hidden');
    if (errorElement) errorElement.classList.add('hidden');
    
    // Fetch company details
    const response = await fetch(`/api/companies/${companyId}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Company not found');
    }
    
    const company = result.company;
    console.log('✅ Company details loaded:', company);
    
    // Hide loading, show details
    if (loadingElement) loadingElement.classList.add('hidden');
    if (detailsElement) detailsElement.classList.remove('hidden');
    
    // Populate company header
    const headerElement = document.getElementById('company-header');
    if (headerElement) {
      headerElement.innerHTML = renderCompanyHeader(company);
    }
    
    // Show default tab
    showCompanyTab('overview', company);
    
  } catch (error) {
    console.error('❌ Error loading company details:', error);
    
    // Hide loading, show error
    if (loadingElement) loadingElement.classList.add('hidden');
    if (errorElement) errorElement.classList.remove('hidden');
  }
}

// Render company header
function renderCompanyHeader(company) {
  const createdDate = company.created_at ? new Date(company.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible';
  
  return `
    <div class="flex items-center justify-center mb-8">
      <div class="w-40 h-40 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mr-6 shadow-2xl">
        ${company.logo_url ? 
          `<img src="${company.logo_url}" alt="${company.name}" class="w-full h-full object-cover rounded-xl" />` :
          `<i class="fas fa-building text-white text-6xl"></i>`
        }
      </div>
      <div class="text-left">
        <h2 class="text-4xl font-bold gradient-text-gold mb-2">${company.name}</h2>
        <p class="text-secondary text-lg mb-2">${getCountryName(company.country)} • ${company.primary_currency}</p>
        <div class="flex items-center gap-4 text-sm text-tertiary">
          <span class="flex items-center">
            <i class="fas fa-id-card mr-2"></i>${company.tax_id || 'N/A'}
          </span>
          <span class="flex items-center">
            <i class="fas fa-calendar mr-2"></i>Creada: ${createdDate}
          </span>
          <span class="flex items-center">
            <div class="w-2 h-2 ${company.active ? 'bg-green-400' : 'bg-yellow-400'} rounded-full mr-2"></div>
            ${company.active ? 'Activa' : 'Inactiva'}
          </span>
        </div>
      </div>
    </div>
  `;
}

// Show company tab content
function showCompanyTab(tabName, company = null) {
  console.log(`📋 Showing company tab: ${tabName}`);
  
  // Update tab buttons
  const tabButtons = document.querySelectorAll('.company-tab-btn');
  tabButtons.forEach(btn => {
    btn.classList.remove('active', 'text-gold', 'border-gold');
    btn.classList.add('text-secondary', 'border-transparent');
  });
  
  const activeButton = document.querySelector(`button[onclick="showCompanyTab('${tabName}')"]`);
  if (activeButton) {
    activeButton.classList.add('active', 'text-gold', 'border-gold');
    activeButton.classList.remove('text-secondary', 'border-transparent');
  }
  
  // Update tab content
  const contentElement = document.getElementById('company-tab-content');
  if (contentElement && company) {
    contentElement.innerHTML = renderCompanyTabContent(tabName, company);
    
    // Load expenses data if expenses tab is selected
    if (tabName === 'expenses') {
      setTimeout(() => {
        loadCompanyExpenses(company.id);
      }, 100);
    }
  }
}

// Render tab content based on tab name
function renderCompanyTabContent(tabName, company) {
  switch (tabName) {
    case 'overview':
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-6">
            <h3 class="text-xl font-bold text-gold mb-4">
              <i class="fas fa-info-circle mr-2"></i>Información Básica
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-secondary">Nombre de la Empresa</label>
                <p class="text-white text-lg">${company.name}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-secondary">País</label>
                <p class="text-white">${getCountryName(company.country)}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-secondary">Moneda Principal</label>
                <p class="text-white">${company.primary_currency}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-secondary">RFC / NIF / Tax ID</label>
                <p class="text-white">${company.tax_id || 'No disponible'}</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-6">
            <h3 class="text-xl font-bold text-emerald mb-4">
              <i class="fas fa-map-marker-alt mr-2"></i>Dirección
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-secondary">Dirección Completa</label>
                <p class="text-white">${company.address || 'No disponible'}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    
    case 'expenses':
      return `
        <!-- Expenses Filters -->
        <div class="bg-glass-card p-6 rounded-xl mb-6">
          <h3 class="text-lg font-semibold text-white mb-4">
            <i class="fas fa-filter mr-2 text-emerald"></i>Filtros de Gastos
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label class="text-sm text-secondary mb-1 block">Estado</label>
              <select id="expense-status-filter" class="form-input-premium w-full text-sm">
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="reimbursed">Reembolsado</option>
              </select>
            </div>
            
            <div>
              <label class="text-sm text-secondary mb-1 block">Tipo de Gasto</label>
              <select id="expense-type-filter" class="form-input-premium w-full text-sm">
                <option value="all">Todos los tipos</option>
                <!-- Options will be loaded dynamically -->
              </select>
            </div>
            
            <div>
              <label class="text-sm text-secondary mb-1 block">Usuario</label>
              <select id="expense-user-filter" class="form-input-premium w-full text-sm">
                <option value="all">Todos los usuarios</option>
                <!-- Options will be loaded dynamically -->
              </select>
            </div>
            
            <div>
              <label class="text-sm text-secondary mb-1 block">Buscar</label>
              <input type="text" id="expense-search-filter" placeholder="Descripción, proveedor..." class="form-input-premium w-full text-sm">
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-secondary mb-1 block">Fecha Desde</label>
              <input type="date" id="expense-date-from" class="form-input-premium w-full text-sm">
            </div>
            
            <div>
              <label class="text-sm text-secondary mb-1 block">Fecha Hasta</label>
              <input type="date" id="expense-date-to" class="form-input-premium w-full text-sm">
            </div>
          </div>
          
          <div class="flex gap-3 mt-4">
            <button onclick="loadCompanyExpenses(${company.id}, true)" class="btn-premium btn-emerald text-sm">
              <i class="fas fa-search mr-2"></i>Aplicar Filtros
            </button>
            <button onclick="clearExpenseFilters(${company.id})" class="btn-secondary text-sm">
              <i class="fas fa-times mr-2"></i>Limpiar
            </button>
            <button onclick="addExpenseForCompany(${company.id})" class="btn-premium btn-gold text-sm ml-auto">
              <i class="fas fa-plus mr-2"></i>Agregar Gasto
            </button>
          </div>
        </div>
        
        <!-- Expenses Summary -->
        <div id="expenses-summary-${company.id}" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <!-- Summary cards will be loaded here -->
        </div>
        
        <!-- Expenses Table -->
        <div class="bg-glass-card rounded-xl overflow-hidden">
          <div class="p-4 border-b border-glass-border">
            <h3 class="text-lg font-semibold text-white">
              <i class="fas fa-receipt mr-2 text-emerald"></i>Gastos de la Empresa
            </h3>
          </div>
          
          <!-- Loading State -->
          <div id="expenses-loading-${company.id}" class="p-8 text-center">
            <div class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-secondary">Cargando gastos...</span>
            </div>
          </div>
          
          <!-- Expenses Table Content -->
          <div id="expenses-table-${company.id}" class="hidden">
            <!-- Table will be loaded here -->
          </div>
          
          <!-- Empty State -->
          <div id="expenses-empty-${company.id}" class="hidden p-8 text-center">
            <i class="fas fa-receipt text-6xl text-gray-400 mb-4"></i>
            <h3 class="text-xl font-semibold text-white mb-2">No hay gastos</h3>
            <p class="text-secondary mb-4">Esta empresa no tiene gastos registrados</p>
            <button onclick="addExpenseForCompany(${company.id})" class="btn-premium btn-emerald">
              <i class="fas fa-plus mr-2"></i>Agregar Primer Gasto
            </button>
          </div>
        </div>
      `;
    
    case 'users':
      return `
        <div class="text-center py-12">
          <i class="fas fa-users text-6xl text-gray-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-white mb-2">Usuarios de la Empresa</h3>
          <p class="text-secondary mb-6">Aquí aparecerán los usuarios con acceso a esta empresa</p>
          <button class="btn-premium btn-emerald">
            <i class="fas fa-user-plus mr-2"></i>Invitar Usuario
          </button>
        </div>
      `;
    
    case 'settings':
      return `
        <div class="text-center py-12">
          <i class="fas fa-cog text-6xl text-gray-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-white mb-2">Configuración</h3>
          <p class="text-secondary mb-6">Configuración y ajustes de la empresa</p>
          <button class="btn-premium btn-gold">
            <i class="fas fa-edit mr-2"></i>Editar Empresa
          </button>
        </div>
      `;
    
    default:
      return '<p class="text-center text-secondary">Contenido no disponible</p>';
  }
}

// ==== COMPANY EXPENSES FUNCTIONS ====

// Load expenses for a specific company
async function loadCompanyExpenses(companyId, applyFilters = false) {
  console.log(`💰 Loading expenses for company ${companyId}`);
  
  const loadingElement = document.getElementById(`expenses-loading-${companyId}`);
  const tableElement = document.getElementById(`expenses-table-${companyId}`);
  const emptyElement = document.getElementById(`expenses-empty-${companyId}`);
  const summaryElement = document.getElementById(`expenses-summary-${companyId}`);
  
  try {
    // Show loading state
    if (loadingElement) loadingElement.classList.remove('hidden');
    if (tableElement) tableElement.classList.add('hidden');
    if (emptyElement) emptyElement.classList.add('hidden');
    
    // Build query parameters
    let queryParams = new URLSearchParams();
    
    if (applyFilters) {
      const status = document.getElementById('expense-status-filter')?.value;
      const typeId = document.getElementById('expense-type-filter')?.value;
      const userId = document.getElementById('expense-user-filter')?.value;
      const search = document.getElementById('expense-search-filter')?.value;
      const dateFrom = document.getElementById('expense-date-from')?.value;
      const dateTo = document.getElementById('expense-date-to')?.value;
      
      if (status && status !== 'all') queryParams.set('status', status);
      if (typeId && typeId !== 'all') queryParams.set('expense_type_id', typeId);
      if (userId && userId !== 'all') queryParams.set('user_id', userId);
      if (search) queryParams.set('search', search);
      if (dateFrom) queryParams.set('date_from', dateFrom);
      if (dateTo) queryParams.set('date_to', dateTo);
    }
    
    // Fetch expenses
    const response = await fetch(`/api/companies/${companyId}/expenses?${queryParams.toString()}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Error loading expenses');
    }
    
    const expenses = result.expenses;
    const summary = result.summary;
    
    console.log(`✅ Loaded ${expenses.length} expenses for company ${companyId}`);
    
    // Hide loading state
    if (loadingElement) loadingElement.classList.add('hidden');
    
    // Update summary
    if (summaryElement) {
      summaryElement.innerHTML = renderExpensesSummary(summary);
    }
    
    if (expenses.length === 0) {
      // Show empty state
      if (emptyElement) emptyElement.classList.remove('hidden');
    } else {
      // Show expenses table
      if (tableElement) {
        tableElement.innerHTML = renderExpensesTable(expenses);
        tableElement.classList.remove('hidden');
      }
    }
    
    // Load filter options if first load
    if (!applyFilters) {
      await loadExpenseFilterOptions();
    }
    
  } catch (error) {
    console.error('❌ Error loading company expenses:', error);
    
    if (loadingElement) loadingElement.classList.add('hidden');
    if (emptyElement) {
      emptyElement.innerHTML = `
        <div class="p-8 text-center">
          <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-white mb-2">Error Cargando Gastos</h3>
          <p class="text-secondary mb-4">${error.message}</p>
          <button onclick="loadCompanyExpenses(${companyId})" class="btn-premium btn-emerald">
            <i class="fas fa-redo mr-2"></i>Reintentar
          </button>
        </div>
      `;
      emptyElement.classList.remove('hidden');
    }
  }
}

// Render expenses summary cards
function renderExpensesSummary(summary) {
  return `
    <div class="lyra-card p-4 text-center">
      <div class="text-2xl font-bold text-emerald mb-1">${summary.total_expenses}</div>
      <div class="text-xs text-secondary">Total Gastos</div>
    </div>
    <div class="lyra-card p-4 text-center">
      <div class="text-2xl font-bold text-gold mb-1">$${formatCurrency(summary.total_amount_mxn || 0)}</div>
      <div class="text-xs text-secondary">Total MXN</div>
    </div>
    <div class="lyra-card p-4 text-center">
      <div class="text-2xl font-bold text-yellow-400 mb-1">${summary.pending_count}</div>
      <div class="text-xs text-secondary">Pendientes</div>
    </div>
    <div class="lyra-card p-4 text-center">
      <div class="text-2xl font-bold text-green-400 mb-1">${summary.approved_count}</div>
      <div class="text-xs text-secondary">Aprobados</div>
    </div>
    <div class="lyra-card p-4 text-center">
      <div class="text-2xl font-bold text-blue-400 mb-1">${summary.reimbursed_count}</div>
      <div class="text-xs text-secondary">Reembolsados</div>
    </div>
  `;
}

// Render expenses table
function renderExpensesTable(expenses) {
  const tableRows = expenses.map(expense => `
    <tr class="border-b border-glass-border hover:bg-glass-hover transition-colors">
      <td class="p-3 text-sm">
        <div class="font-medium text-white">${expense.description}</div>
        <div class="text-xs text-secondary">#${expense.id}</div>
      </td>
      <td class="p-3 text-sm">
        <div class="text-white">${formatDate(expense.expense_date)}</div>
        <div class="text-xs text-secondary">${expense.user_name || 'N/A'}</div>
      </td>
      <td class="p-3 text-sm">
        <div class="text-white font-mono">${expense.currency} $${formatCurrency(expense.amount)}</div>
        <div class="text-xs text-secondary">MXN $${formatCurrency(expense.amount_mxn)}</div>
      </td>
      <td class="p-3 text-sm">
        <div class="text-white">${expense.expense_type_name || 'N/A'}</div>
        <div class="text-xs text-secondary">${expense.expense_category || ''}</div>
      </td>
      <td class="p-3 text-sm">
        <span class="px-2 py-1 text-xs rounded-full ${getStatusColor(expense.status)}">
          ${getStatusText(expense.status)}
        </span>
      </td>
      <td class="p-3 text-sm">
        <div class="text-white">${expense.payment_method || 'N/A'}</div>
      </td>
      <td class="p-3 text-sm">
        <div class="text-white">${expense.vendor || 'N/A'}</div>
      </td>
      <td class="p-3 text-sm">
        ${expense.is_billable ? 
          '<span class="text-green-400 text-xs"><i class="fas fa-check"></i> Facturable</span>' : 
          '<span class="text-gray-400 text-xs"><i class="fas fa-times"></i> No facturable</span>'
        }
      </td>
      <td class="p-3 text-sm">
        <div class="text-white text-xs">${formatDate(expense.created_at)}</div>
      </td>
      <td class="p-3 text-sm">
        <div class="text-white text-xs truncate max-w-32" title="${expense.notes || ''}">${expense.notes || '-'}</div>
      </td>
      <td class="p-3 text-sm">
        <div class="flex gap-1">
          <button onclick="viewExpense(${expense.id})" class="text-blue-400 hover:text-blue-300 text-xs p-1" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="editExpense(${expense.id})" class="text-yellow-400 hover:text-yellow-300 text-xs p-1" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deleteExpense(${expense.id})" class="text-red-400 hover:text-red-300 text-xs p-1" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-glass-card">
          <tr class="text-xs text-secondary uppercase tracking-wider">
            <th class="p-3 text-left">Descripción</th>
            <th class="p-3 text-left">Fecha/Usuario</th>
            <th class="p-3 text-left">Monto</th>
            <th class="p-3 text-left">Tipo</th>
            <th class="p-3 text-left">Estado</th>
            <th class="p-3 text-left">Pago</th>
            <th class="p-3 text-left">Proveedor</th>
            <th class="p-3 text-left">Facturable</th>
            <th class="p-3 text-left">Creado</th>
            <th class="p-3 text-left">Notas</th>
            <th class="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}

// Load filter options
async function loadExpenseFilterOptions() {
  try {
    // Load expense types
    const typesResponse = await fetch('/api/expense-types');
    const typesResult = await typesResponse.json();
    
    const typeSelect = document.getElementById('expense-type-filter');
    if (typeSelect && typesResult.expense_types) {
      const options = typesResult.expense_types.map(type => 
        `<option value="${type.id}">${type.name}</option>`
      ).join('');
      typeSelect.innerHTML = '<option value="all">Todos los tipos</option>' + options;
    }
    
    // Load users
    const usersResponse = await fetch('/api/users');
    const usersResult = await usersResponse.json();
    
    const userSelect = document.getElementById('expense-user-filter');
    if (userSelect && usersResult.users) {
      const options = usersResult.users.map(user => 
        `<option value="${user.id}">${user.name}</option>`
      ).join('');
      userSelect.innerHTML = '<option value="all">Todos los usuarios</option>' + options;
    }
    
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

// Clear expense filters
function clearExpenseFilters(companyId) {
  document.getElementById('expense-status-filter').value = 'all';
  document.getElementById('expense-type-filter').value = 'all';
  document.getElementById('expense-user-filter').value = 'all';
  document.getElementById('expense-search-filter').value = '';
  document.getElementById('expense-date-from').value = '';
  document.getElementById('expense-date-to').value = '';
  
  loadCompanyExpenses(companyId);
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount || 0);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES');
}

function getStatusColor(status) {
  const colors = {
    'pending': 'bg-yellow-600 text-yellow-100',
    'approved': 'bg-green-600 text-green-100',
    'rejected': 'bg-red-600 text-red-100',
    'reimbursed': 'bg-blue-600 text-blue-100'
  };
  return colors[status] || 'bg-gray-600 text-gray-100';
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

// Placeholder functions for expense actions
function viewExpense(expenseId) {
  showMessage(`Ver gasto #${expenseId}`, 'info');
}

function editExpense(expenseId) {
  showMessage(`Editar gasto #${expenseId}`, 'info');
}

function deleteExpense(expenseId) {
  showMessage(`Eliminar gasto #${expenseId}`, 'warning');
}

function addExpenseForCompany(companyId) {
  showMessage(`Agregar gasto para empresa #${companyId}`, 'info');
}

console.log('📱 Lyra Expenses - Simple Version Loaded (No Authentication Required)');