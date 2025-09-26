// ===== LYRA USERS MANAGEMENT - JAVASCRIPT V1.0 =====

// Variables globales
let allUsers = [];
let filteredUsers = [];
let allCompanies = [];
let currentEditingUser = null;

// Filtros actuales
let currentFilters = {
    search: '',
    role: '',
    status: ''
};

// FUNCIÓN PRINCIPAL - CARGAR USUARIOS
async function loadUsers() {
    console.log('👥 Cargando usuarios del sistema...');
    
    try {
        // Cargar empresas PRIMERO para mostrar nombres
        await loadCompaniesCache();
        
        // Obtener token de autenticación  
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch('/api/users', { headers });
        if (response.ok) {
            const data = await response.json();
            allUsers = data.users || [];
            filteredUsers = [...allUsers];
            
            console.log('✅ Usuarios cargados:', allUsers.length);
            
            displayUsers();
            updateUsersStatistics();
        } else {
            throw new Error(`Error HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error cargando usuarios:', error);
        showMessage('Error cargando usuarios: ' + error.message, 'error');
    }
}

// FUNCIÓN - CARGAR EMPRESAS EN CACHE
async function loadCompaniesCache() {
    console.log('🏢 Cargando empresas en cache...');
    
    try {
        // Obtener token de autenticación
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch('/api/companies', { headers });
        const result = await response.json();
        
        if (result.companies) {
            allCompanies = result.companies;
            console.log(`✅ Cache de empresas actualizado: ${allCompanies.length} empresas`);
        } else {
            console.error('❌ Error al cargar empresas para cache:', result.error);
        }
    } catch (error) {
        console.error('❌ Error cargando empresas para cache:', error);
    }
}

// FUNCIÓN - MOSTRAR USUARIOS EN TABLA
function displayUsers() {
    const tbody = document.getElementById('users-list');
    if (!tbody) {
        console.error('❌ No se encontró el tbody de usuarios');
        return;
    }
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-text-secondary">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>No hay usuarios registrados aún</p>
                    <button onclick="showAddUserModal()" class="mt-4 premium-button text-sm">
                        <i class="fas fa-user-plus mr-2"></i>Agregar Primer Usuario
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredUsers.map(user => {
        const roleInfo = getRoleInfo(user.role);
        const statusClass = user.active ? 'status-active' : 'status-inactive';
        const statusIcon = user.active ? '✅' : '❌';
        const statusText = user.active ? 'Activo' : 'Inactivo';
        const lastLogin = user.last_login ? formatDate(user.last_login) : 'Nunca';
        
        return `
            <tr class="hover:bg-glass-hover transition-colors">
                <!-- Usuario -->
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-gradient-to-br ${roleInfo.gradient} flex items-center justify-center">
                                <i class="fas ${roleInfo.icon} text-white"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-text-primary">${user.name}</div>
                            <div class="text-sm text-text-secondary">ID: ${user.id}</div>
                        </div>
                    </div>
                </td>
                <!-- Email -->
                <td class="px-6 py-4 text-sm text-text-primary">${user.email}</td>
                <!-- Rol -->
                <td class="px-6 py-4">
                    <span class="role-badge role-${user.role}">
                        ${roleInfo.icon} ${roleInfo.label}
                    </span>
                </td>
                <!-- Estado -->
                <td class="px-6 py-4">
                    <span class="${statusClass}">${statusIcon} ${statusText}</span>
                </td>
                <!-- Último Acceso -->
                <td class="px-6 py-4 text-sm text-text-secondary">${lastLogin}</td>
                <!-- Empresas Asignadas -->
                <td class="px-6 py-4 text-sm text-text-primary">
                    <div class="flex flex-wrap gap-1">
                        ${getUserCompanies(user.id)}
                    </div>
                </td>
                <!-- Acciones -->
                <td class="px-6 py-4 text-sm">
                    <div class="flex items-center gap-2">
                        <button onclick="editUser(${user.id})" class="premium-button text-xs" style="background: var(--gradient-sapphire); padding: 6px 12px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="viewUserDetails(${user.id})" class="premium-button secondary text-xs" style="padding: 6px 12px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${user.active ? 
                            `<button onclick="deactivateUser(${user.id})" class="premium-button danger text-xs" style="padding: 6px 12px;">
                                <i class="fas fa-user-slash"></i>
                            </button>` :
                            `<button onclick="activateUser(${user.id})" class="premium-button text-xs" style="background: var(--gradient-emerald); padding: 6px 12px;">
                                <i class="fas fa-user-check"></i>
                            </button>`
                        }
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('✅ Tabla de usuarios actualizada con', filteredUsers.length, 'usuarios');
}

// FUNCIÓN - OBTENER INFORMACIÓN DEL ROL
function getRoleInfo(role) {
    const roles = {
        'viewer': { 
            label: 'Solo Lectura', 
            icon: 'fa-eye',
            gradient: 'from-blue-500 to-blue-600'
        },
        'editor': { 
            label: 'Editor', 
            icon: 'fa-edit',
            gradient: 'from-green-500 to-green-600'
        },
        'advanced': { 
            label: 'Avanzado', 
            icon: 'fa-star',
            gradient: 'from-amber-500 to-amber-600'
        },
        'admin': { 
            label: 'Administrador', 
            icon: 'fa-crown',
            gradient: 'from-purple-500 to-purple-600'
        }
    };
    return roles[role] || { label: 'Desconocido', icon: 'fa-user', gradient: 'from-gray-500 to-gray-600' };
}

// FUNCIÓN - OBTENER EMPRESAS DEL USUARIO
function getUserCompanies(userId) {
    // Mock data - en producción esto vendría de la API
    const userCompanies = [
        { userId: 1, companies: ['TechMX Solutions', 'Innovación Digital'] },
        { userId: 2, companies: ['TechES Barcelona'] },
        { userId: 3, companies: ['TechMX Solutions'] }
    ];
    
    const userCompanyData = userCompanies.find(uc => uc.userId === userId);
    if (!userCompanyData) return '<span class="text-xs text-text-secondary">Sin asignar</span>';
    
    return userCompanyData.companies.map(company => 
        `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent-emerald/10 text-accent-emerald">${company}</span>`
    ).join(' ');
}

// FUNCIÓN - ACTUALIZAR ESTADÍSTICAS
function updateUsersStatistics() {
    const totalCount = allUsers.length;
    const activeCount = allUsers.filter(u => u.active).length;
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    const recentLoginsCount = allUsers.filter(u => {
        if (!u.last_login) return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(u.last_login) > thirtyDaysAgo;
    }).length;
    
    // Actualizar elementos
    const totalElement = document.getElementById('total-users-count');
    const activeElement = document.getElementById('active-users-count');
    const adminElement = document.getElementById('admin-users-count');
    const recentElement = document.getElementById('recent-logins-count');
    
    if (totalElement) totalElement.textContent = totalCount.toLocaleString();
    if (activeElement) activeElement.textContent = activeCount.toLocaleString();
    if (adminElement) adminElement.textContent = adminCount.toLocaleString();
    if (recentElement) recentElement.textContent = recentLoginsCount.toLocaleString();
    
    console.log('📊 Estadísticas de usuarios actualizadas:', {
        total: totalCount,
        active: activeCount,
        admin: adminCount,
        recentLogins: recentLoginsCount
    });
}

// FUNCIÓN - MOSTRAR MODAL DE AGREGAR USUARIO
function showAddUserModal() {
    currentEditingUser = null;
    document.getElementById('modal-title').textContent = 'Nuevo Usuario del Sistema';
    document.getElementById('userForm').reset();
    
    // Cargar permisos de empresa
    loadCompanyPermissions();
    
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Focus en nombre
        const nameField = document.getElementById('user-name');
        if (nameField) nameField.focus();
    }
}

// FUNCIÓN - CERRAR MODAL
function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    currentEditingUser = null;
}

// FUNCIÓN - CARGAR PERMISOS DE EMPRESA
function loadCompanyPermissions() {
    const container = document.getElementById('company-permissions');
    if (!container) return;
    
    if (allCompanies.length === 0) {
        container.innerHTML = '<p class="text-text-secondary">Cargando empresas...</p>';
        return;
    }
    
    container.innerHTML = allCompanies.map(company => `
        <div class="glass-panel p-4 rounded-lg">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                    <span class="text-lg mr-2">${company.country === 'MX' ? '🇲🇽' : '🇪🇸'}</span>
                    <span class="font-medium text-text-primary">${company.name}</span>
                </div>
                <div class="text-xs text-text-secondary">${company.primary_currency}</div>
            </div>
            <div class="flex gap-4">
                <label class="flex items-center text-sm">
                    <input 
                        type="checkbox" 
                        name="company-${company.id}-view" 
                        class="mr-2 w-4 h-4 text-accent-emerald bg-glass-input border-border-primary rounded focus:ring-accent-emerald focus:ring-2"
                    >
                    👀 Ver
                </label>
                <label class="flex items-center text-sm">
                    <input 
                        type="checkbox" 
                        name="company-${company.id}-edit" 
                        class="mr-2 w-4 h-4 text-accent-emerald bg-glass-input border-border-primary rounded focus:ring-accent-emerald focus:ring-2"
                    >
                    ✏️ Editar
                </label>
                <label class="flex items-center text-sm">
                    <input 
                        type="checkbox" 
                        name="company-${company.id}-admin" 
                        class="mr-2 w-4 h-4 text-accent-emerald bg-glass-input border-border-primary rounded focus:ring-accent-emerald focus:ring-2"
                    >
                    👑 Admin
                </label>
            </div>
        </div>
    `).join('');
}

// FUNCIÓN - GUARDAR USUARIO
async function saveUser(event) {
    event.preventDefault();
    console.log('💾 Guardando usuario...');
    
    const userData = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role').value,
        active: document.getElementById('user-active').checked
    };
    
    // Recopilar permisos de empresas
    const companyPermissions = [];
    allCompanies.forEach(company => {
        const canView = document.querySelector(`input[name="company-${company.id}-view"]`)?.checked || false;
        const canEdit = document.querySelector(`input[name="company-${company.id}-edit"]`)?.checked || false;
        const canAdmin = document.querySelector(`input[name="company-${company.id}-admin"]`)?.checked || false;
        
        if (canView || canEdit || canAdmin) {
            companyPermissions.push({
                company_id: company.id,
                can_view: canView,
                can_edit: canEdit,
                can_admin: canAdmin
            });
        }
    });
    
    userData.company_permissions = companyPermissions;
    
    try {
        const url = currentEditingUser ? `/api/users/${currentEditingUser}` : '/api/users';
        const method = currentEditingUser ? 'PUT' : 'POST';
        
        const token = localStorage.getItem('auth_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        
        const response = await fetch(url, {
            method: method,
            headers,
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Usuario guardado exitosamente:', result);
            showMessage(`Usuario ${currentEditingUser ? 'actualizado' : 'creado'} exitosamente`, 'success');
            closeUserModal();
            await loadUsers();
        } else {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('❌ Error guardando usuario:', error);
        showMessage(`Error al guardar usuario: ${error.message}`, 'error');
    }
}

// FUNCIÓN - EDITAR USUARIO
async function editUser(userId) {
    console.log('✏️ Editando usuario:', userId);
    
    try {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`/api/users/${userId}`, { headers });
        if (response.ok) {
            const userData = await response.json();
            currentEditingUser = userId;
            
            // Poblar formulario
            document.getElementById('modal-title').textContent = 'Editar Usuario';
            document.getElementById('user-name').value = userData.name;
            document.getElementById('user-email').value = userData.email;
            document.getElementById('user-role').value = userData.role;
            document.getElementById('user-active').checked = userData.active;
            
            // Hacer el password opcional al editar
            const passwordField = document.getElementById('user-password');
            passwordField.required = false;
            passwordField.placeholder = 'Dejar vacío para mantener contraseña actual';
            
            // Cargar permisos y mostrar modal
            loadCompanyPermissions();
            // TODO: Cargar permisos actuales del usuario
            
            const modal = document.getElementById('userModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        } else {
            throw new Error('Error cargando datos del usuario');
        }
    } catch (error) {
        console.error('❌ Error editando usuario:', error);
        showMessage('Error cargando datos del usuario', 'error');
    }
}

// FUNCIÓN - VER DETALLES DEL USUARIO
function viewUserDetails(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        console.log('👀 Ver detalles del usuario:', user);
        alert(`Usuario: ${user.name}\nEmail: ${user.email}\nRol: ${user.role}\nEstado: ${user.active ? 'Activo' : 'Inactivo'}`);
    }
}

// FUNCIÓN - DESACTIVAR USUARIO
async function deactivateUser(userId) {
    if (!confirm('¿Estás seguro de que deseas desactivar este usuario?')) return;
    
    await updateUserStatus(userId, false);
}

// FUNCIÓN - ACTIVAR USUARIO
async function activateUser(userId) {
    await updateUserStatus(userId, true);
}

// FUNCIÓN HELPER - ACTUALIZAR ESTADO DEL USUARIO
async function updateUserStatus(userId, active) {
    try {
        const token = localStorage.getItem('auth_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        
        const response = await fetch(`/api/users/${userId}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ active })
        });
        
        if (response.ok) {
            showMessage(`Usuario ${active ? 'activado' : 'desactivado'} exitosamente`, 'success');
            await loadUsers();
        } else {
            throw new Error('Error actualizando estado del usuario');
        }
    } catch (error) {
        console.error('❌ Error actualizando estado:', error);
        showMessage('Error actualizando estado del usuario', 'error');
    }
}

// FUNCIÓN - APLICAR FILTROS
function applyUserFilters() {
    currentFilters.search = document.getElementById('search-user')?.value.toLowerCase() || '';
    currentFilters.role = document.getElementById('filter-role')?.value || '';
    currentFilters.status = document.getElementById('filter-status')?.value || '';
    
    filteredUsers = allUsers.filter(user => {
        // Filtro de búsqueda
        if (currentFilters.search) {
            const searchText = `${user.name} ${user.email} ${user.id}`.toLowerCase();
            if (!searchText.includes(currentFilters.search)) return false;
        }
        
        // Filtro de rol
        if (currentFilters.role && user.role !== currentFilters.role) return false;
        
        // Filtro de estado
        if (currentFilters.status) {
            const isActive = currentFilters.status === 'active';
            if (user.active !== isActive) return false;
        }
        
        return true;
    });
    
    displayUsers();
    console.log('🔍 Filtros aplicados:', currentFilters, `${filteredUsers.length} de ${allUsers.length} usuarios`);
}

// FUNCIÓN - LIMPIAR FILTROS
function clearUserFilters() {
    document.getElementById('search-user').value = '';
    document.getElementById('filter-role').value = '';
    document.getElementById('filter-status').value = '';
    
    currentFilters = { search: '', role: '', status: '' };
    filteredUsers = [...allUsers];
    displayUsers();
    
    console.log('🧹 Filtros de usuarios limpiados');
}

// FUNCIÓN - EXPORTAR USUARIOS
function exportUsers() {
    console.log('📥 Exportando usuarios...');
    // TODO: Implementar exportación a CSV/Excel
    showMessage('Función de exportación en desarrollo', 'info');
}

// FUNCIÓN HELPER - FORMATEAR FECHA
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// FUNCIÓN - MOSTRAR MENSAJE
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '15px 25px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.color = '#ffffff';
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else if (type === 'error') {
        messageDiv.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 4000);
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM ready - users.js cargado');
    
    // Cargar usuarios al iniciar
    loadUsers();
    
    // Configurar event listeners para filtros en tiempo real
    const searchInput = document.getElementById('search-user');
    const roleSelect = document.getElementById('filter-role');
    const statusSelect = document.getElementById('filter-status');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyUserFilters, 300));
    }
    if (roleSelect) {
        roleSelect.addEventListener('change', applyUserFilters);
    }
    if (statusSelect) {
        statusSelect.addEventListener('change', applyUserFilters);
    }
    
    console.log('✅ users.js inicializado completamente');
});

// FUNCIÓN HELPER - DEBOUNCE PARA BÚSQUEDA
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('✅ users.js cargado exitosamente');