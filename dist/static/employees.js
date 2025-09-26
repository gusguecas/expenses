// ===== LYRA EMPLOYEES MANAGEMENT - JAVASCRIPT V1.0 =====

// Variables globales
let allEmployees = [];
let filteredEmployees = [];
let allCompanies = [];
let currentEditingEmployee = null;

// Filtros actuales
let currentFilters = {
    search: '',
    department: '',
    company: ''
};

// FUNCIÓN PRINCIPAL - CARGAR EMPLEADOS
async function loadEmployees() {
    console.log('👥 Cargando empleados...');
    
    try {
        // Cargar empresas PRIMERO para mostrar nombres
        await loadCompaniesCache();
        
        const response = await fetch('/api/employees');
        if (response.ok) {
            const data = await response.json();
            allEmployees = data.employees || [];
            filteredEmployees = [...allEmployees];
            
            console.log('✅ Empleados cargados:', allEmployees.length);
            
            displayEmployees();
            updateEmployeesStatistics();
        } else {
            throw new Error(`Error HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error cargando empleados:', error);
        showMessage('Error cargando empleados: ' + error.message, 'error');
    }
}

// FUNCIÓN - CARGAR EMPRESAS EN CACHE
async function loadCompaniesCache() {
    console.log('🏢 Cargando empresas en cache...');
    
    try {
        const response = await fetch('/api/companies');
        const result = await response.json();
        
        if (result.companies) {
            allCompanies = result.companies;
            
            // Poblar filtro de empresas
            populateCompanyFilter();
            
            console.log(`✅ Cache de empresas actualizado: ${allCompanies.length} empresas`);
        } else {
            console.error('❌ Error al cargar empresas para cache:', result.error);
        }
    } catch (error) {
        console.error('❌ Error cargando empresas para cache:', error);
    }
}

// FUNCIÓN - POBLAR FILTRO DE EMPRESAS
function populateCompanyFilter() {
    const filterSelect = document.getElementById('filter-company');
    const modalSelect = document.getElementById('employee-company');
    
    if (!filterSelect || !modalSelect) return;
    
    const optionsHTML = allCompanies.map(company => {
        const flag = company.country === 'MX' ? '🇲🇽' : '🇪🇸';
        return `<option value="${company.id}">${flag} ${company.name}</option>`;
    }).join('');
    
    // Filtro
    filterSelect.innerHTML = '<option value="">Todas las Empresas</option>' + optionsHTML;
    
    // Modal
    modalSelect.innerHTML = '<option value="">Seleccionar Empresa...</option>' + optionsHTML;
}

// FUNCIÓN - MOSTRAR EMPLEADOS EN TABLA
function displayEmployees() {
    const tbody = document.getElementById('employees-list');
    if (!tbody) {
        console.error('❌ No se encontró el tbody de empleados');
        return;
    }
    
    if (filteredEmployees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8 text-text-secondary">
                    <i class="fas fa-id-card text-4xl mb-4"></i>
                    <p>No hay empleados registrados aún</p>
                    <button onclick="showAddEmployeeModal()" class="mt-4 premium-button text-sm">
                        <i class="fas fa-user-plus mr-2"></i>Agregar Primer Empleado
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredEmployees.map(employee => {
        const deptInfo = getDepartmentInfo(employee.department);
        const companyName = getCompanyName(employee.company_id);
        const statusClass = employee.active ? 'status-active' : 'status-inactive';
        const statusIcon = employee.active ? '✅' : '❌';
        const statusText = employee.active ? 'Activo' : 'Inactivo';
        
        return `
            <tr class="hover:bg-glass-hover transition-colors">
                <!-- Empleado -->
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-gradient-to-br ${deptInfo.gradient} flex items-center justify-center">
                                <i class="fas ${deptInfo.icon} text-white"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-text-primary">${employee.name}</div>
                            <div class="text-sm text-text-secondary">ID: ${employee.employee_number || employee.id}</div>
                        </div>
                    </div>
                </td>
                <!-- Puesto -->
                <td class="px-6 py-4 text-sm text-text-primary">${employee.position}</td>
                <!-- Departamento -->
                <td class="px-6 py-4">
                    <span class="department-badge dept-${employee.department}">
                        ${deptInfo.icon} ${deptInfo.label}
                    </span>
                </td>
                <!-- Empresa -->
                <td class="px-6 py-4 text-sm text-text-primary">${companyName}</td>
                <!-- Email -->
                <td class="px-6 py-4 text-sm text-text-primary">${employee.email || 'N/A'}</td>
                <!-- Teléfono -->
                <td class="px-6 py-4 text-sm text-text-primary">${employee.phone || 'N/A'}</td>
                <!-- Estado -->
                <td class="px-6 py-4">
                    <span class="${statusClass}">${statusIcon} ${statusText}</span>
                </td>
                <!-- Acciones -->
                <td class="px-6 py-4 text-sm">
                    <div class="flex items-center gap-2">
                        <button onclick="editEmployee(${employee.id})" class="premium-button text-xs" style="background: var(--gradient-sapphire); padding: 6px 12px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="viewEmployeeDetails(${employee.id})" class="premium-button secondary text-xs" style="padding: 6px 12px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="viewEmployeeExpenses(${employee.id})" class="premium-button text-xs" style="background: var(--gradient-emerald); padding: 6px 12px;">
                            <i class="fas fa-receipt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('✅ Tabla de empleados actualizada con', filteredEmployees.length, 'empleados');
}

// FUNCIÓN - OBTENER INFORMACIÓN DEL DEPARTAMENTO
function getDepartmentInfo(department) {
    const departments = {
        'it': { 
            label: 'Tecnología', 
            icon: 'fa-laptop-code',
            gradient: 'from-blue-500 to-blue-600'
        },
        'sales': { 
            label: 'Ventas', 
            icon: 'fa-chart-line',
            gradient: 'from-green-500 to-green-600'
        },
        'hr': { 
            label: 'RH', 
            icon: 'fa-users',
            gradient: 'from-amber-500 to-amber-600'
        },
        'finance': { 
            label: 'Finanzas', 
            icon: 'fa-calculator',
            gradient: 'from-purple-500 to-purple-600'
        },
        'operations': { 
            label: 'Operaciones', 
            icon: 'fa-cogs',
            gradient: 'from-indigo-500 to-indigo-600'
        },
        'management': { 
            label: 'Dirección', 
            icon: 'fa-crown',
            gradient: 'from-yellow-500 to-yellow-600'
        }
    };
    return departments[department] || { 
        label: 'Otro', 
        icon: 'fa-user', 
        gradient: 'from-gray-500 to-gray-600' 
    };
}

// FUNCIÓN HELPER - OBTENER NOMBRE DE EMPRESA POR ID
function getCompanyName(companyId) {
    const company = allCompanies.find(c => c.id === parseInt(companyId));
    if (company) {
        const flag = company.country === 'MX' ? '🇲🇽' : '🇪🇸';
        return `${flag} ${company.name}`;
    }
    return '🏢 Sin empresa';
}

// FUNCIÓN - ACTUALIZAR ESTADÍSTICAS
function updateEmployeesStatistics() {
    const totalCount = allEmployees.length;
    const activeCount = allEmployees.filter(e => e.active).length;
    const departmentCount = new Set(allEmployees.map(e => e.department)).size;
    const withExpensesCount = allEmployees.filter(e => e.has_expenses).length; // Mock field
    
    // Actualizar elementos
    const totalElement = document.getElementById('total-employees-count');
    const activeElement = document.getElementById('active-employees-count');
    const deptElement = document.getElementById('departments-count');
    const expensesElement = document.getElementById('with-expenses-count');
    
    if (totalElement) totalElement.textContent = totalCount.toLocaleString();
    if (activeElement) activeElement.textContent = activeCount.toLocaleString();
    if (deptElement) deptElement.textContent = departmentCount.toLocaleString();
    if (expensesElement) expensesElement.textContent = withExpensesCount.toLocaleString();
    
    console.log('📊 Estadísticas de empleados actualizadas:', {
        total: totalCount,
        active: activeCount,
        departments: departmentCount,
        withExpenses: withExpensesCount
    });
}

// FUNCIÓN - MOSTRAR MODAL DE AGREGAR EMPLEADO
function showAddEmployeeModal() {
    currentEditingEmployee = null;
    document.getElementById('employee-modal-title').textContent = 'Nuevo Empleado';
    document.getElementById('employeeForm').reset();
    
    // Cargar datos necesarios
    populateCompanyFilter();
    loadManagersList();
    
    const modal = document.getElementById('employeeModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Focus en nombre
        const nameField = document.getElementById('employee-name');
        if (nameField) nameField.focus();
    }
}

// FUNCIÓN - CERRAR MODAL
function closeEmployeeModal() {
    const modal = document.getElementById('employeeModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    currentEditingEmployee = null;
}

// FUNCIÓN - CARGAR LISTA DE JEFES
function loadManagersList() {
    const managerSelect = document.getElementById('employee-manager');
    if (!managerSelect) return;
    
    // Filtrar empleados que pueden ser jefes (management, advanced roles)
    const managers = allEmployees.filter(emp => 
        emp.department === 'management' || 
        emp.position.toLowerCase().includes('manager') ||
        emp.position.toLowerCase().includes('director') ||
        emp.position.toLowerCase().includes('gerente')
    );
    
    const optionsHTML = managers.map(manager => 
        `<option value="${manager.id}">${manager.name} - ${manager.position}</option>`
    ).join('');
    
    managerSelect.innerHTML = '<option value="">Sin jefe directo...</option>' + optionsHTML;
}

// FUNCIÓN - GUARDAR EMPLEADO
async function saveEmployee(event) {
    event.preventDefault();
    console.log('💾 Guardando empleado...');
    
    const employeeData = {
        name: document.getElementById('employee-name').value,
        email: document.getElementById('employee-email').value,
        phone: document.getElementById('employee-phone').value,
        rfc: document.getElementById('employee-rfc').value,
        birthdate: document.getElementById('employee-birthdate').value,
        address: document.getElementById('employee-address').value,
        company_id: parseInt(document.getElementById('employee-company').value),
        position: document.getElementById('employee-position').value,
        department: document.getElementById('employee-department').value,
        employee_number: document.getElementById('employee-number').value,
        hire_date: document.getElementById('employee-hire-date').value,
        manager_id: document.getElementById('employee-manager').value || null,
        active: document.getElementById('employee-active').checked
    };
    
    try {
        const url = currentEditingEmployee ? `/api/employees/${currentEditingEmployee}` : '/api/employees';
        const method = currentEditingEmployee ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Empleado guardado exitosamente:', result);
            showMessage(`Empleado ${currentEditingEmployee ? 'actualizado' : 'creado'} exitosamente`, 'success');
            closeEmployeeModal();
            await loadEmployees();
        } else {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('❌ Error guardando empleado:', error);
        showMessage(`Error al guardar empleado: ${error.message}`, 'error');
    }
}

// FUNCIÓN - EDITAR EMPLEADO
async function editEmployee(employeeId) {
    console.log('✏️ Editando empleado:', employeeId);
    
    try {
        const response = await fetch(`/api/employees/${employeeId}`);
        if (response.ok) {
            const employeeData = await response.json();
            currentEditingEmployee = employeeId;
            
            // Poblar formulario
            document.getElementById('employee-modal-title').textContent = 'Editar Empleado';
            document.getElementById('employee-name').value = employeeData.name || '';
            document.getElementById('employee-email').value = employeeData.email || '';
            document.getElementById('employee-phone').value = employeeData.phone || '';
            document.getElementById('employee-rfc').value = employeeData.rfc || '';
            document.getElementById('employee-birthdate').value = employeeData.birthdate || '';
            document.getElementById('employee-address').value = employeeData.address || '';
            document.getElementById('employee-company').value = employeeData.company_id || '';
            document.getElementById('employee-position').value = employeeData.position || '';
            document.getElementById('employee-department').value = employeeData.department || '';
            document.getElementById('employee-number').value = employeeData.employee_number || '';
            document.getElementById('employee-hire-date').value = employeeData.hire_date || '';
            document.getElementById('employee-manager').value = employeeData.manager_id || '';
            document.getElementById('employee-active').checked = employeeData.active !== false;
            
            // Cargar datos necesarios y mostrar modal
            populateCompanyFilter();
            loadManagersList();
            
            const modal = document.getElementById('employeeModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        } else {
            throw new Error('Error cargando datos del empleado');
        }
    } catch (error) {
        console.error('❌ Error editando empleado:', error);
        showMessage('Error cargando datos del empleado', 'error');
    }
}

// FUNCIÓN - VER DETALLES DEL EMPLEADO
function viewEmployeeDetails(employeeId) {
    const employee = allEmployees.find(e => e.id === employeeId);
    if (employee) {
        console.log('👀 Ver detalles del empleado:', employee);
        alert(`Empleado: ${employee.name}\nPuesto: ${employee.position}\nDepartamento: ${employee.department}\nEmpresa: ${getCompanyName(employee.company_id)}`);
    }
}

// FUNCIÓN - VER GASTOS DEL EMPLEADO
function viewEmployeeExpenses(employeeId) {
    console.log('📊 Ver gastos del empleado:', employeeId);
    // Redireccionar a la página de gastos con filtro por usuario
    window.location.href = `/expenses?user_id=${employeeId}&highlight=employee`;
}

// FUNCIÓN - APLICAR FILTROS
function applyEmployeeFilters() {
    currentFilters.search = document.getElementById('search-employee')?.value.toLowerCase() || '';
    currentFilters.department = document.getElementById('filter-department')?.value || '';
    currentFilters.company = document.getElementById('filter-company')?.value || '';
    
    filteredEmployees = allEmployees.filter(employee => {
        // Filtro de búsqueda
        if (currentFilters.search) {
            const searchText = `${employee.name} ${employee.email} ${employee.position} ${employee.employee_number}`.toLowerCase();
            if (!searchText.includes(currentFilters.search)) return false;
        }
        
        // Filtro de departamento
        if (currentFilters.department && employee.department !== currentFilters.department) return false;
        
        // Filtro de empresa
        if (currentFilters.company && employee.company_id != currentFilters.company) return false;
        
        return true;
    });
    
    displayEmployees();
    console.log('🔍 Filtros aplicados:', currentFilters, `${filteredEmployees.length} de ${allEmployees.length} empleados`);
}

// FUNCIÓN - LIMPIAR FILTROS
function clearEmployeeFilters() {
    document.getElementById('search-employee').value = '';
    document.getElementById('filter-department').value = '';
    document.getElementById('filter-company').value = '';
    
    currentFilters = { search: '', department: '', company: '' };
    filteredEmployees = [...allEmployees];
    displayEmployees();
    
    console.log('🧹 Filtros de empleados limpiados');
}

// FUNCIÓN - EXPORTAR EMPLEADOS
function exportEmployees() {
    console.log('📥 Exportando empleados...');
    // TODO: Implementar exportación a CSV/Excel
    showMessage('Función de exportación en desarrollo', 'info');
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
    console.log('✅ DOM ready - employees.js cargado');
    
    // Cargar empleados al iniciar
    loadEmployees();
    
    // Configurar event listeners para filtros en tiempo real
    const searchInput = document.getElementById('search-employee');
    const departmentSelect = document.getElementById('filter-department');
    const companySelect = document.getElementById('filter-company');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyEmployeeFilters, 300));
    }
    if (departmentSelect) {
        departmentSelect.addEventListener('change', applyEmployeeFilters);
    }
    if (companySelect) {
        companySelect.addEventListener('change', applyEmployeeFilters);
    }
    
    console.log('✅ employees.js inicializado completamente');
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

console.log('✅ employees.js cargado exitosamente');