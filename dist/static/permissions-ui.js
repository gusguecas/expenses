// ===== LYRA PERMISSIONS-BASED UI SYSTEM =====

// Global variables for user permissions
let currentUserPermissions = null;
let userCapabilities = null;
let currentUser = null;

// Initialize permissions-based UI
async function initPermissionsUI() {
    console.log('🎨 Initializing permissions-based UI...');
    
    try {
        // Get user permissions from API
        const response = await fetch('/api/user/permissions', {
            headers: getAuthHeader()
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            currentUserPermissions = data.permissions;
            userCapabilities = data.capabilities;
            
            console.log('✅ User permissions loaded:', userCapabilities);
            
            // Apply UI modifications based on permissions
            applyPermissionBasedUI();
            
            // Update navigation menu
            updateNavigationMenu();
            
            // Update user info display
            updateUserInfoDisplay();
            
        } else {
            throw new Error('Failed to load user permissions');
        }
    } catch (error) {
        console.error('❌ Error loading permissions:', error);
        // Fallback to basic user interface
        applyBasicUI();
    }
}

// Apply permission-based UI modifications
function applyPermissionBasedUI() {
    console.log('🎛️ Applying permission-based UI modifications...');
    
    // Hide/show navigation items based on capabilities
    toggleNavigationItems();
    
    // Modify dashboard based on permissions
    modifyDashboardView();
    
    // Update action buttons throughout the app
    updateActionButtons();
    
    // Apply company filtering in dropdowns
    filterCompanyOptions();
    
    // Add permission indicators
    addPermissionIndicators();
}

// Toggle navigation items based on permissions
function toggleNavigationItems() {
    // User Management - Only for CFO or users with manage permissions
    const usersNavItem = document.querySelector('a[href="/users"]');
    if (usersNavItem) {
        if (!userCapabilities.can_manage_users) {
            usersNavItem.style.display = 'none';
            console.log('🚫 Hidden Users navigation (no management permissions)');
        } else {
            console.log('✅ Users navigation visible (has management permissions)');
        }
    }
    
    // Employees Management - Similar logic
    const employeesNavItem = document.querySelector('a[href="/employees"]');
    if (employeesNavItem) {
        if (!userCapabilities.can_manage_users) {
            employeesNavItem.style.display = 'none';
            console.log('🚫 Hidden Employees navigation (no management permissions)');
        } else {
            console.log('✅ Employees navigation visible (has management permissions)');
        }
    }
    
    // Companies - Show but will be filtered in API
    console.log('🏢 Companies navigation available (filtered by backend)');
}

// Modify dashboard view based on permissions
function modifyDashboardView() {
    // Add role-based dashboard indicators
    const dashboardTitle = document.querySelector('h1');
    if (dashboardTitle && currentUser) {
        const roleIndicator = document.createElement('span');
        roleIndicator.className = 'ml-4 px-3 py-1 text-xs rounded-full';
        
        if (currentUser.is_cfo) {
            roleIndicator.textContent = '👑 CFO';
            roleIndicator.classList.add('bg-yellow-100', 'text-yellow-800', 'border', 'border-yellow-300');
        } else if (userCapabilities.can_approve_expenses) {
            roleIndicator.textContent = '👔 Manager';
            roleIndicator.classList.add('bg-blue-100', 'text-blue-800', 'border', 'border-blue-300');
        } else {
            roleIndicator.textContent = '👤 Usuario';
            roleIndicator.classList.add('bg-gray-100', 'text-gray-800', 'border', 'border-gray-300');
        }
        
        // Only add if not already present
        if (!dashboardTitle.querySelector('.ml-4')) {
            dashboardTitle.appendChild(roleIndicator);
        }
    }
    
    // Show/hide dashboard sections based on permissions
    modifyDashboardSections();
}

// Modify dashboard sections based on capabilities
function modifyDashboardSections() {
    // Add permission summary to dashboard
    const dashboardContainer = document.querySelector('.container.mx-auto.px-6.pb-8');
    if (dashboardContainer && !document.getElementById('permissions-summary')) {
        const permissionsSummary = createPermissionsSummary();
        dashboardContainer.insertBefore(permissionsSummary, dashboardContainer.firstChild);
    }
}

// Create permissions summary widget
function createPermissionsSummary() {
    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'permissions-summary';
    summaryDiv.className = 'glass-panel p-6 mb-8';
    
    let accessibleCompanies = 'Todas';
    if (userCapabilities.accessible_companies !== 'all') {
        const companyNames = currentUserPermissions.map(p => p.company_name);
        accessibleCompanies = companyNames.join(', ');
    }
    
    summaryDiv.innerHTML = `
        <h3 class="text-xl font-bold text-accent-gold mb-4">
            <i class="fas fa-user-shield mr-3"></i>Tu Perfil de Acceso
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-xs text-blue-600 font-medium">ROL</div>
                        <div class="text-lg font-bold text-blue-800">${currentUser.is_cfo ? 'CFO' : 'Usuario'}</div>
                    </div>
                    <div class="text-2xl">${currentUser.is_cfo ? '👑' : '👤'}</div>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-xs text-green-600 font-medium">EMPRESAS</div>
                        <div class="text-lg font-bold text-green-800">${userCapabilities.accessible_companies === 'all' ? 'Todas' : userCapabilities.accessible_companies.length}</div>
                    </div>
                    <div class="text-2xl">🏢</div>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-xs text-purple-600 font-medium">CREAR GASTOS</div>
                        <div class="text-lg font-bold text-purple-800">${userCapabilities.can_create_expenses ? 'Sí' : 'No'}</div>
                    </div>
                    <div class="text-2xl">${userCapabilities.can_create_expenses ? '✏️' : '❌'}</div>
                </div>
            </div>
            
            <div class="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-xs text-orange-600 font-medium">APROBAR</div>
                        <div class="text-lg font-bold text-orange-800">${userCapabilities.can_approve_expenses ? 'Sí' : 'No'}</div>
                    </div>
                    <div class="text-2xl">${userCapabilities.can_approve_expenses ? '✅' : '❌'}</div>
                </div>
            </div>
        </div>
        
        <div class="mt-4 p-3 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600">
                <strong>Empresas con acceso:</strong> ${accessibleCompanies}
            </div>
        </div>
    `;
    
    return summaryDiv;
}

// Update action buttons based on permissions
function updateActionButtons() {
    // Expense approval buttons - hide if user can't approve
    if (!userCapabilities.can_approve_expenses) {
        hideApprovalButtons();
        console.log('🚫 Hidden approval buttons (no approval permissions)');
    }
    
    // Create expense buttons - modify based on company permissions
    modifyCreateButtons();
    
    // Administrative buttons
    hideAdministrativeButtons();
}

// Hide approval buttons for non-approvers
function hideApprovalButtons() {
    const approvalButtons = [
        'button[onclick*="authorizeExpense"]',
        'button[onclick*="rejectExpense"]',
        'button[onclick*="requestMoreInfo"]',
        '.premium-button[style*="background: var(--gradient-emerald)"]', // Green buttons (approve)
        '.premium-button[style*="background: var(--gradient-accent)"]'   // Red buttons (reject)
    ];
    
    approvalButtons.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
            // Instead of hiding completely, disable and add explanation
            if (button.textContent.includes('Autorizar') || 
                button.textContent.includes('Rechazar') || 
                button.textContent.includes('Más Info')) {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
                button.title = 'No tienes permisos para aprobar gastos';
                
                // Remove onclick handlers
                button.removeAttribute('onclick');
            }
        });
    });
}

// Modify create buttons based on company permissions
function modifyCreateButtons() {
    const createButtons = document.querySelectorAll('button[onclick*="createExpense"], button[onclick*="showAddExpenseModal"]');
    
    createButtons.forEach(button => {
        if (!userCapabilities.can_create_expenses) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'No tienes permisos para crear gastos';
        } else {
            // Add company restriction info
            button.title = `Puedes crear gastos en: ${getAccessibleCompaniesText()}`;
        }
    });
}

// Hide administrative buttons
function hideAdministrativeButtons() {
    if (!userCapabilities.can_manage_users) {
        const adminButtons = [
            'button[onclick*="addUser"]',
            'button[onclick*="editUser"]',
            'button[onclick*="deleteUser"]',
            'button[onclick*="managePermissions"]'
        ];
        
        adminButtons.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                button.style.display = 'none';
            });
        });
        
        console.log('🚫 Hidden administrative buttons (no user management permissions)');
    }
}

// Filter company options in dropdowns
function filterCompanyOptions() {
    const companySelects = document.querySelectorAll('select[id*="company"], select[name*="company"]');
    
    companySelects.forEach(select => {
        // Only filter if user is not CFO
        if (currentUser && !currentUser.is_cfo) {
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                if (option.value && option.value !== '') {
                    const companyId = parseInt(option.value);
                    if (!userCapabilities.accessible_companies.includes(companyId)) {
                        option.style.display = 'none';
                        option.disabled = true;
                    }
                }
            });
            
            console.log(`🏢 Filtered company options in dropdown (${userCapabilities.accessible_companies.length} accessible)`);
        }
    });
}

// Add permission indicators throughout the interface
function addPermissionIndicators() {
    // Add indicators to expense rows
    addExpensePermissionIndicators();
    
    // Add indicators to user rows (if visible)
    addUserPermissionIndicators();
}

// Add permission indicators to expense rows
function addExpensePermissionIndicators() {
    // This will be called after expenses are loaded
    setTimeout(() => {
        const expenseRows = document.querySelectorAll('tr[data-expense-id]');
        expenseRows.forEach(row => {
            addExpenseRowIndicators(row);
        });
    }, 1000);
}

// Add indicators to individual expense row
function addExpenseRowIndicators(row) {
    const expenseUserId = row.dataset.expenseUserId;
    const expenseCompanyId = row.dataset.expenseCompanyId;
    
    if (expenseUserId && expenseCompanyId) {
        const isOwnExpense = parseInt(expenseUserId) === currentUser.id;
        const canEditCompany = userCapabilities.accessible_companies === 'all' || 
                              userCapabilities.accessible_companies.includes(parseInt(expenseCompanyId));
        
        // Add visual indicators
        const indicator = document.createElement('div');
        indicator.className = 'permission-indicator text-xs px-2 py-1 rounded ml-2 inline-block';
        
        if (isOwnExpense) {
            indicator.textContent = '✏️ Tuyo';
            indicator.classList.add('bg-green-100', 'text-green-700');
        } else if (userCapabilities.can_approve_expenses && canEditCompany) {
            indicator.textContent = '👔 Puedes aprobar';
            indicator.classList.add('bg-blue-100', 'text-blue-700');
        } else if (canEditCompany) {
            indicator.textContent = '👀 Solo ver';
            indicator.classList.add('bg-gray-100', 'text-gray-600');
        }
        
        // Add to the row's status cell
        const statusCell = row.querySelector('td:nth-last-child(2)'); // Assuming status is second-to-last column
        if (statusCell && !statusCell.querySelector('.permission-indicator')) {
            statusCell.appendChild(indicator);
        }
    }
}

// Update navigation menu with user info
function updateNavigationMenu() {
    // This is already handled by the main authentication script
    // but we can enhance it with permission details
    const userInfo = document.getElementById('userInfo');
    if (userInfo && currentUser) {
        const accessCount = userCapabilities.accessible_companies === 'all' 
            ? 'Todas' 
            : userCapabilities.accessible_companies.length;
            
        // Add permission details to the existing user info
        const existingContent = userInfo.innerHTML;
        const enhancedInfo = existingContent.replace(
            '</div>',
            `<div class="text-xs text-gray-400 mt-1">${accessCount} empresas • ${userCapabilities.can_create_expenses ? 'Crear' : 'Solo ver'}</div></div>`
        );
        userInfo.innerHTML = enhancedInfo;
    }
}

// Update user info display with enhanced details
function updateUserInfoDisplay() {
    // Add role-specific styling to user avatar or info
    const userElements = document.querySelectorAll('[id*="user"], [class*="user-info"]');
    userElements.forEach(element => {
        if (currentUser && currentUser.is_cfo) {
            element.classList.add('cfo-user');
        } else if (userCapabilities && userCapabilities.can_approve_expenses) {
            element.classList.add('manager-user');
        } else {
            element.classList.add('regular-user');
        }
    });
}

// Helper function to get accessible companies text
function getAccessibleCompaniesText() {
    if (userCapabilities.accessible_companies === 'all') {
        return 'Todas las empresas';
    }
    
    const companyNames = currentUserPermissions.map(p => p.company_name);
    return companyNames.join(', ');
}

// Apply basic UI when permissions can't be loaded
function applyBasicUI() {
    console.log('⚠️ Applying basic UI (permissions not available)');
    // Hide administrative features by default
    const adminElements = document.querySelectorAll('a[href="/users"], a[href="/employees"]');
    adminElements.forEach(element => {
        element.style.display = 'none';
    });
}

// CSS for permission-based styling
function addPermissionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .cfo-user {
            border-left: 4px solid #fbbf24;
        }
        
        .manager-user {
            border-left: 4px solid #3b82f6;
        }
        
        .regular-user {
            border-left: 4px solid #6b7280;
        }
        
        .permission-indicator {
            font-size: 10px;
            font-weight: 600;
        }
        
        button:disabled {
            cursor: not-allowed !important;
        }
        
        .hidden-for-user {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add permission styles
    addPermissionStyles();
    
    // Wait a bit for authentication to complete
    setTimeout(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            initPermissionsUI();
        }
    }, 500);
});

// Export for use in other scripts
window.PermissionsUI = {
    initPermissionsUI,
    updateActionButtons,
    filterCompanyOptions,
    addPermissionIndicators,
    currentUser: () => currentUser,
    userCapabilities: () => userCapabilities
};