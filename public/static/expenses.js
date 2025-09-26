// ===== LYRA EXPENSES - JAVASCRIPT FUNCTIONS V2.0 - FIXED FILTERING =====

// Variables globales
let uploadedAttachments = [];
let ocrResults = [];
let allExpenses = [];
let filteredExpenses = [];
let allCompanies = []; // NUEVO: Cache de empresas para mostrar nombres

// Filtros aplicados
let currentFilters = {
    dateFrom: '',
    dateTo: '',
    company: '',
    user: '',
    type: '',
    category: '',
    status: '',
    currency: ''
};

// FUNCIÓN PRINCIPAL - ABRIR MODAL
async function showAddExpenseModal() {
    console.log('🚀 ABRIENDO MODAL GUSBIT...');
    const modal = document.getElementById('add-expense-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Configurar fecha actual por defecto
        const today = new Date().toISOString().split('T')[0];
        const fechaField = document.getElementById('gusbit-fecha');
        if (fechaField) fechaField.value = today;
        
        // CRÍTICO: Cargar empresas en el selector
        await loadCompaniesForExpense();
        
        // Focus en el selector de empresa (nuevo primer campo)
        const empresaField = document.getElementById('gusbit-empresa');
        if (empresaField) {
            empresaField.focus();
        } else {
            // Fallback al destino si no encuentra empresa
            const destinoField = document.getElementById('gusbit-destino');
            if (destinoField) destinoField.focus();
        }
        
        // CRÍTICO: Configurar validación en tiempo real para este modal
        setTimeout(() => {
            setupRealTimeValidation();
            updateSubmitButtonState(); // Estado inicial del botón
        }, 100);
        
        console.log('✅ Modal abierto exitosamente con validación configurada');
    } else {
        console.error('❌ Modal no encontrado');
        alert('Error: Modal no encontrado');
    }
}

// FUNCIÓN CRÍTICA - CARGAR EMPRESAS PARA SELECTOR
async function loadCompaniesForExpense() {
    console.log('🏢 Cargando empresas para selector...');
    
    try {
        const response = await fetch('/api/companies');
        const result = await response.json();
        
        if (result.companies) {
            const empresaSelect = document.getElementById('gusbit-empresa');
            if (empresaSelect) {
                // Limpiar opciones existentes excepto la primera
                empresaSelect.innerHTML = '<option value="">⚠️ SELECCIONAR EMPRESA...</option>';
                
                // Agregar empresas activas
                result.companies
                    .filter(company => company.active)
                    .forEach(company => {
                        const option = document.createElement('option');
                        option.value = company.id;
                        option.textContent = `🏢 ${company.name} (${company.country} - ${company.primary_currency})`;
                        empresaSelect.appendChild(option);
                    });
                
                console.log(`✅ Cargadas ${result.companies.length} empresas en selector`);
            } else {
                console.error('❌ Selector de empresa no encontrado');
            }
        } else {
            console.error('❌ Error al cargar empresas:', result.error);
        }
    } catch (error) {
        console.error('❌ Error cargando empresas:', error);
        alert('Error cargando empresas. Intenta recargar la página.');
    }
}

// FUNCIÓN - CERRAR MODAL
function closeAddExpenseModal() {
    const modal = document.getElementById('add-expense-modal');
    if (modal) modal.style.display = 'none';
    
    const form = document.getElementById('expense-form');
    if (form) form.reset();
    
    // Limpiar attachments
    uploadedAttachments = [];
    ocrResults = [];
    
    const uploadedFiles = document.getElementById('uploaded-files');
    if (uploadedFiles) uploadedFiles.innerHTML = '';
    
    const ocrResultsDiv = document.getElementById('ocr-results');
    if (ocrResultsDiv) ocrResultsDiv.style.display = 'none';
}

// FUNCIÓN - CARGAR GASTOS DESDE API
async function loadExpenses() {
    console.log('🔄 Cargando gastos desde API...');
    
    try {
        // Cargar empresas PRIMERO para mostrar nombres
        await loadCompaniesCache();
        
        const response = await fetch('/api/expenses');
        if (response.ok) {
            const data = await response.json();
            allExpenses = data.expenses || [];
            filteredExpenses = [...allExpenses];
            
            console.log('✅ Gastos cargados:', allExpenses.length);
            
            // CRÍTICO: Aplicar filtros URL después de cargar datos
            console.log('🚀 ANTES de llamar applyUrlFiltersAfterLoad()');
            try {
                applyUrlFiltersAfterLoad();
                console.log('✅ applyUrlFiltersAfterLoad() ejecutado sin errores');
            } catch (error) {
                console.error('❌ ERROR en applyUrlFiltersAfterLoad():', error);
            }
            
            displayExpenses();
            updateExpenseTotals();
        } else {
            throw new Error(`Error HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error cargando gastos:', error);
        showMessage('Error cargando gastos: ' + error.message, 'error');
    }
}

// FUNCIÓN NUEVA - CARGAR EMPRESAS EN CACHE
async function loadCompaniesCache() {
    console.log('🏢 Cargando empresas en cache...');
    
    try {
        const response = await fetch('/api/companies');
        const result = await response.json();
        
        if (result.companies) {
            allCompanies = result.companies;
            
            // CRÍTICO: También poblar el filtro de empresas
            populateCompanyFilter();
            
            console.log(`✅ Cache de empresas actualizado: ${allCompanies.length} empresas`);
        } else {
            console.error('❌ Error al cargar empresas para cache:', result.error);
        }
    } catch (error) {
        console.error('❌ Error cargando empresas para cache:', error);
    }
}

// FUNCIÓN NUEVA - POBLAR FILTRO DE EMPRESAS DINÁMICAMENTE
function populateCompanyFilter() {
    const filterSelect = document.getElementById('filter-company');
    if (!filterSelect) {
        console.warn('⚠️ Filtro de empresa no encontrado');
        return;
    }
    
    // Limpiar opciones existentes
    filterSelect.innerHTML = '<option value="">Todas las Empresas</option>';
    
    // Agregar todas las empresas del cache
    allCompanies
        .filter(company => company.active) // Solo empresas activas
        .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente
        .forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            
            const flag = company.country === 'MX' ? '🇲🇽' : company.country === 'ES' ? '🇪🇸' : '🌍';
            option.textContent = `${flag} ${company.name}`;
            
            filterSelect.appendChild(option);
        });
    
    console.log(`✅ Filtro de empresas poblado con ${allCompanies.length} empresas activas`);
}

// FUNCIÓN HELPER - OBTENER NOMBRE DE EMPRESA POR ID
function getCompanyName(companyId) {
    const company = allCompanies.find(c => c.id === parseInt(companyId));
    if (company) {
        const flag = company.country === 'MX' ? '🇲🇽' : company.country === 'ES' ? '🇪🇸' : '🌍';
        return `${flag} ${company.name}`;
    }
    return '🏢 Sin empresa';
}

// FUNCIÓN HELPER - OBTENER NOMBRE DE USUARIO POR ID
function getUserName(userId) {
    const userMap = {
        1: '👑 Alejandro Rodríguez',
        2: '✏️ María López', 
        3: '⭐ Carlos Martínez',
        4: '✏️ Ana García',
        5: '⭐ Pedro Sánchez',
        6: '✏️ Elena Torres'
    };
    return userMap[parseInt(userId)] || `Usuario #${userId}`;
}

// FUNCIÓN - MOSTRAR GASTOS EN TABLA
function displayExpenses() {
    const tbody = document.getElementById('expenses-list');
    if (!tbody) {
        console.error('❌ No se encontró el tbody de la tabla');
        return;
    }
    
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="14" class="text-center py-8 text-text-secondary">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>No hay gastos registrados aún</p>
                    <button onclick="showAddExpenseModal()" class="mt-4 premium-button text-sm">
                        <i class="fas fa-plus mr-2"></i>Agregar Primer Gasto
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredExpenses.map(expense => {
        // Extraer datos GUSBit del campo notes (donde se guarda todo)
        // Debug removido para producción
        const gusbitData = extractGusbitFromNotes(expense.notes || '');
        
        return `
            <tr class="hover:bg-glass-hover transition-colors cursor-pointer" onclick="viewExpenseDetails(${expense.id})">
                <!-- 1. FECHA -->
                <td class="px-4 py-3 text-sm w-32 min-w-32 whitespace-nowrap">${gusbitData.fecha || expense.expense_date || 'N/A'}</td>
                <!-- 2. EMPRESA -->
                <td class="px-4 py-3 text-sm font-semibold">
                    ${getCompanyName(expense.company_id)}
                </td>
                <!-- 3. USUARIO -->
                <td class="px-4 py-3 text-sm">${getUserName(gusbitData.usuario || expense.user_id)}</td>
                <!-- 4. TIPO GASTO -->
                <td class="px-4 py-3 text-sm">${getTipoExpanded(gusbitData.tipo)}</td>
                <!-- 5. CATEGORÍA -->
                <td class="px-4 py-3 text-sm">${getCategoryName(gusbitData.categoria || expense.expense_type_id)}</td>
                <!-- 6. DESTINO -->
                <td class="px-4 py-3 text-sm">${gusbitData.destino || 'N/A'}</td>
                <!-- 7. LUGAR -->
                <td class="px-4 py-3 text-sm">${gusbitData.lugar || expense.vendor || 'N/A'}</td>
                <!-- 8. DESCRIPCIÓN -->
                <td class="px-4 py-3 text-sm">${gusbitData.descripcion || expense.description || 'N/A'}</td>
                <!-- 9. MONTO -->
                <td class="px-4 py-3 text-sm font-semibold text-emerald">
                    ${formatCurrency(gusbitData.monto || expense.amount, gusbitData.moneda || expense.currency)}
                </td>
                <!-- 10. MONEDA -->
                <td class="px-4 py-3 text-sm">${gusbitData.moneda || expense.currency || 'MXN'}</td>
                <!-- 11. FORMA PAGO -->
                <td class="px-4 py-3 text-sm">${gusbitData.forma_pago || expense.payment_method || 'N/A'}</td>
                <!-- 12. QUIÉN CAPTURÓ -->
                <td class="px-4 py-3 text-sm">${getUserName(gusbitData.quien_capturo) || 'N/A'}</td>
                <!-- 13. STATUS -->
                <td class="px-4 py-3 text-sm">
                    <span class="status-badge status-${expense.status}">
                        ${getStatusIcon(expense.status)} ${gusbitData.status || expense.status || 'N/A'}
                    </span>
                </td>
                <!-- ACCIONES -->
                <td class="px-4 py-3 text-sm">
                    <button onclick="event.stopPropagation(); viewExpenseDetails(${expense.id})" class="premium-button text-xs" style="background: var(--gradient-sapphire); padding: 4px 8px;">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('✅ Tabla actualizada con', filteredExpenses.length, 'gastos');
    
    // Actualizar totales
    updateExpenseTotals();
}

// FUNCIÓN - ACTUALIZAR TOTALES
function updateExpenseTotals() {
    // Elementos KPI originales
    const totalCountEl = document.getElementById('total-count');
    const totalAmountEl = document.getElementById('total-amount');
    
    // Elementos KPI nuevos
    const pendingCountEl = document.getElementById('pending-count');
    const approvedCountEl = document.getElementById('approved-count');
    const companiesCountEl = document.getElementById('companies-count');
    const reimbursedAmountEl = document.getElementById('reimbursed-amount');
    
    if (!totalCountEl || !totalAmountEl) {
        console.warn('⚠️ Elementos de totales no encontrados');
        return;
    }
    
    // Calcular totales básicos
    const totalCount = filteredExpenses.length;
    let totalMXN = 0;
    let totalUSD = 0;
    let totalEUR = 0;
    
    // Calcular KPIs avanzados
    let pendingCount = 0;
    let approvedCount = 0;
    let reimbursedTotalMXN = 0;
    let reimbursedTotalUSD = 0;
    let reimbursedTotalEUR = 0;
    const uniqueCompanies = new Set();
    
    filteredExpenses.forEach(expense => {
        const amount = parseFloat(expense.amount) || 0;
        
        // Calcular totales por moneda
        if (expense.currency === 'USD') {
            totalUSD += amount;
            totalMXN += amount * 18.25; // Conversión aproximada
        } else if (expense.currency === 'EUR') {
            totalEUR += amount;
            totalMXN += amount * 20.15; // Conversión aproximada
        } else {
            totalMXN += amount;
        }
        
        // Contar por status
        if (expense.status === 'pending') {
            pendingCount++;
        } else if (expense.status === 'approved') {
            approvedCount++;
        }
        
        // Calcular total por reembolsar (aprobados que no han sido reembolsados)
        if (expense.status === 'approved') {
            if (expense.currency === 'USD') {
                reimbursedTotalUSD += amount;
            } else if (expense.currency === 'EUR') {
                reimbursedTotalEUR += amount;
            } else {
                reimbursedTotalMXN += amount;
            }
        }
        
        // Contar empresas únicas
        if (expense.company_id) {
            uniqueCompanies.add(expense.company_id);
        }
    });
    
    // Actualizar KPIs básicos
    totalCountEl.textContent = totalCount.toLocaleString();
    
    // Mostrar totales organizados por moneda - FORMATO VERTICAL CON LETRA PEQUEÑA
    const currencyRows = [];
    
    // Agregar MXN (siempre presente, incluso si es 0)
    const totalMXNPesos = filteredExpenses
        .filter(expense => expense.currency === 'MXN' || !expense.currency)
        .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    
    currencyRows.push(`<div class="text-sm"><span class="font-medium">💰 MXN:</span> $${totalMXNPesos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`);
    
    // Agregar USD si hay gastos en dólares
    if (totalUSD > 0) {
        currencyRows.push(`<div class="text-sm"><span class="font-medium">💵 USD:</span> $${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`);
    }
    
    // Agregar EUR si hay gastos en euros
    if (totalEUR > 0) {
        currencyRows.push(`<div class="text-sm"><span class="font-medium">💶 EUR:</span> €${totalEUR.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`);
    }
    
    const amountText = `<div class="space-y-1">${currencyRows.join('')}</div>`;
    totalAmountEl.innerHTML = amountText;
    
    // Actualizar KPIs nuevos si existen los elementos
    if (pendingCountEl) {
        pendingCountEl.textContent = pendingCount.toLocaleString();
    }
    
    if (approvedCountEl) {
        approvedCountEl.textContent = approvedCount.toLocaleString();
    }
    
    if (companiesCountEl) {
        companiesCountEl.textContent = uniqueCompanies.size.toLocaleString();
    }
    
    if (reimbursedAmountEl) {
        // Mostrar total por reembolsar en formato compacto
        let reimbursedDisplay = '';
        
        if (reimbursedTotalMXN > 0 || (reimbursedTotalUSD === 0 && reimbursedTotalEUR === 0)) {
            reimbursedDisplay = `$${reimbursedTotalMXN.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (reimbursedTotalUSD > reimbursedTotalEUR) {
            reimbursedDisplay = `$${reimbursedTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
        } else if (reimbursedTotalEUR > 0) {
            reimbursedDisplay = `€${reimbursedTotalEUR.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            reimbursedDisplay = '$0.00';
        }
        
        reimbursedAmountEl.textContent = reimbursedDisplay;
    }
    
    // Actualizar fila de totales en tabla
    updateTableTotalsRow(totalCount, totalMXN, totalUSD, totalEUR);
    
    console.log('📊 Todos los KPIs actualizados:', {
        count: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        companies: uniqueCompanies.size,
        reimbursedMXN: reimbursedTotalMXN,
        reimbursedUSD: reimbursedTotalUSD,
        reimbursedEUR: reimbursedTotalEUR,
        totalMXN: totalMXN,
        totalUSD: totalUSD,
        totalEUR: totalEUR
    });
}

// FUNCIÓN - ACTUALIZAR FILA DE TOTALES EN TABLA
function updateTableTotalsRow(totalCount, totalMXN, totalUSD, totalEUR) {
    const tfoot = document.getElementById('expenses-totals');
    if (!tfoot) return;
    
    if (totalCount === 0) {
        tfoot.innerHTML = '';
        return;
    }
    
    // Crear fila de totales
    let totalDisplayMXN = totalMXN.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let totalDisplay = `$${totalDisplayMXN} MXN`;
    
    if (totalUSD > 0 || totalEUR > 0) {
        const breakdowns = [];
        if (totalUSD > 0) breakdowns.push(`$${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`);
        if (totalEUR > 0) breakdowns.push(`€${totalEUR.toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR`);
        totalDisplay += ` (${breakdowns.join(' + ')})`;
    }
    
    tfoot.innerHTML = `
        <tr class="border-t-2 border-accent-gold bg-glass font-bold">
            <td colspan="8" class="px-4 py-4 text-right text-accent-gold">
                <i class="fas fa-calculator mr-2"></i>
                TOTALES: ${totalCount.toLocaleString()} gasto${totalCount !== 1 ? 's' : ''}
            </td>
            <td class="px-4 py-4 text-center text-accent-emerald font-bold text-lg">
                ${totalDisplay}
            </td>
            <td colspan="7" class="px-4 py-4 text-accent-gold">
                <i class="fas fa-chart-line mr-2"></i>
                Resumen consolidado de gastos registrados
            </td>
        </tr>
    `;
}

// FUNCIÓN HELPER - EXTRAER DATOS GUSBIT DE LAS NOTAS (NUEVO ORDEN 13 CAMPOS)
function extractGusbitFromNotes(notes) {
    const data = {};
    
    if (!notes || (!notes.includes('REGISTRO GUSBIT NUEVO ORDEN') && !notes.includes('REGISTRO GUSBIT COMPLETO'))) {
        return data;
    }
    
    // Extraer cada campo usando regex - NUEVO ORDEN DE 13 CAMPOS
    const patterns = {
        // Campo 1: Fecha
        fecha: /1\.\s*Fecha:\s*(.+)/,
        // Campo 2: Empresa (ID se extrae pero no se usa directamente)
        empresa_id: /2\.\s*Empresa:\s*ID\s*(\d+)/,
        // Campo 3: Usuario (ID se extrae pero no se usa directamente) 
        usuario_id: /3\.\s*Usuario:\s*ID\s*(\d+)/,
        // Campo 4: Tipo (V o G)
        tipo: /4\.\s*Tipo:\s*([VG])\s*\([^)]+\)/,
        // Campo 5: Categoría 
        categoria: /5\.\s*Categoría:\s*([^\n\r]+)/,
        // Campo 6: Destino
        destino: /6\.\s*Destino:\s*([^\n\r]+)/,
        // Campo 7: Lugar/Negocio
        lugar: /7\.\s*Lugar\/Negocio:\s*([^\n\r]+)/,
        // Campo 8: Descripción
        descripcion: /8\.\s*Descripción:\s*([^\n\r]+)/,
        // Campo 9: Monto
        monto: /9\.\s*Monto:\s*([^\n\r]+)/,
        // Campo 10: Moneda
        moneda: /10\.\s*Moneda:\s*([^\n\r]+)/,
        // Campo 11: Forma de Pago
        forma_pago: /11\.\s*Forma\s*de\s*Pago:\s*([^\n\r]+)/,
        // Campo 12: Quién lo Capturó
        quien_capturo: /12\.\s*Quién\s*lo\s*Capturó:\s*([^\n\r]+)/,
        // Campo 13: Status
        status: /13\.\s*Status:\s*([^\n\r]+)/
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
        const match = notes.match(pattern);
        if (match && match[1] && match[1].trim() !== 'N/A') {
            data[key] = match[1].trim();
        }
    }
    
    // Debug removido para producción
    return data;
}

// FUNCIÓN - VALIDACIÓN COMPLETA DE TODOS LOS 13 CAMPOS GUSBIT
function validateAllGusbitFields(gusbitData) {
    const validations = [
        {
            field: 'gusbit_fecha',
            value: gusbitData.gusbit_fecha,
            message: 'Debe seleccionar la FECHA del gasto (Campo 1)',
            focusField: 'gusbit-fecha'
        },
        {
            field: 'gusbit_empresa',
            value: gusbitData.gusbit_empresa,
            message: 'Debe seleccionar una EMPRESA (Campo 2)',
            focusField: 'gusbit-empresa'
        },
        {
            field: 'gusbit_usuario',
            value: gusbitData.gusbit_usuario,
            message: 'Debe seleccionar un USUARIO (Campo 3)',
            focusField: 'gusbit-usuario'
        },
        {
            field: 'gusbit_tipo',
            value: gusbitData.gusbit_tipo,
            message: 'Debe seleccionar el TIPO (Viático o Gasto) (Campo 4)',
            focusField: 'gusbit-tipo'
        },
        {
            field: 'gusbit_categoria',
            value: gusbitData.gusbit_categoria,
            message: 'Debe seleccionar una CATEGORÍA (Campo 5)',
            focusField: 'gusbit-categoria'
        },
        {
            field: 'gusbit_destino',
            value: gusbitData.gusbit_destino?.trim(),
            message: 'Debe ingresar el DESTINO (Campo 6)',
            focusField: 'gusbit-destino'
        },
        {
            field: 'gusbit_lugar',
            value: gusbitData.gusbit_lugar?.trim(),
            message: 'Debe ingresar el LUGAR o negocio (Campo 7)',
            focusField: 'gusbit-lugar'
        },
        {
            field: 'gusbit_descripcion',
            value: gusbitData.gusbit_descripcion?.trim(),
            message: 'Debe ingresar una DESCRIPCIÓN (Campo 8)',
            focusField: 'gusbit-descripcion'
        },
        {
            field: 'gusbit_monto',
            value: gusbitData.gusbit_monto,
            message: 'Debe ingresar un MONTO válido mayor a 0 (Campo 9)',
            focusField: 'gusbit-monto',
            customValidation: (value) => !isNaN(value) && parseFloat(value) > 0
        },
        {
            field: 'gusbit_moneda',
            value: gusbitData.gusbit_moneda,
            message: 'Debe seleccionar la MONEDA (Campo 10)',
            focusField: 'gusbit-moneda'
        },
        {
            field: 'gusbit_forma_pago',
            value: gusbitData.gusbit_forma_pago,
            message: 'Debe seleccionar la FORMA DE PAGO (Campo 11)',
            focusField: 'gusbit-forma-pago'
        },
        {
            field: 'gusbit_quien_capturo',
            value: gusbitData.gusbit_quien_capturo,
            message: 'Debe seleccionar QUIÉN LO CAPTURÓ (Campo 12)',
            focusField: 'gusbit-quien-capturo'
        },
        {
            field: 'gusbit_status',
            value: gusbitData.gusbit_status,
            message: 'Debe seleccionar el STATUS del gasto (Campo 13)',
            focusField: 'gusbit-status'
        }
    ];

    // Verificar cada campo uno por uno
    for (const validation of validations) {
        // Validación personalizada si existe
        if (validation.customValidation) {
            if (!validation.customValidation(validation.value)) {
                return {
                    isValid: false,
                    message: validation.message,
                    focusField: validation.focusField,
                    field: validation.field
                };
            }
        } else {
            // Validación estándar (no vacío, no null, no undefined)
            if (!validation.value || validation.value === '' || validation.value === 0) {
                return {
                    isValid: false,
                    message: validation.message,
                    focusField: validation.focusField,
                    field: validation.field
                };
            }
        }
    }

    // Todos los campos son válidos
    return {
        isValid: true,
        message: 'Todos los campos están completos correctamente'
    };
}

// FUNCIÓN - ENVIAR GASTO GUSBIT
async function submitExpenseGusbit(event) {
    event.preventDefault();
    console.log('🚀 INICIANDO GUARDADO GUSBIT - 13 campos según nuevo orden...');
    
    // NUEVO ORDEN DE CAMPOS SEGÚN ESPECIFICACIÓN DE GUS
    const gusbitData = {
        // 1. FECHA
        gusbit_fecha: document.getElementById('gusbit-fecha').value,
        
        // 2. EMPRESA 
        gusbit_empresa: parseInt(document.getElementById('gusbit-empresa').value),
        
        // 3. USUARIO
        gusbit_usuario: parseInt(document.getElementById('gusbit-usuario').value),
        
        // 4. SI ES VIÁTICO O GASTO (V o G)
        gusbit_tipo: document.getElementById('gusbit-tipo').value,
        
        // 5. CATEGORÍA
        gusbit_categoria: parseInt(document.getElementById('gusbit-categoria').value),
        
        // 6. DESTINO
        gusbit_destino: document.getElementById('gusbit-destino').value,
        
        // 7. LUGAR O NEGOCIO
        gusbit_lugar: document.getElementById('gusbit-lugar').value,
        
        // 8. DESCRIPCIÓN
        gusbit_descripcion: document.getElementById('gusbit-descripcion').value,
        
        // 9. MONTO (limpiar formato de comas antes de convertir)
        gusbit_monto: parseFloat((document.getElementById('gusbit-monto').value || '').replace(/,/g, '')),
        
        // 10. MONEDA
        gusbit_moneda: document.getElementById('gusbit-moneda').value,
        
        // 11. FORMA DE PAGO
        gusbit_forma_pago: document.getElementById('gusbit-forma-pago').value,
        
        // 12. QUIÉN LO CAPTURÓ
        gusbit_quien_capturo: document.getElementById('gusbit-quien-capturo').value,
        
        // 13. STATUS
        gusbit_status: document.getElementById('gusbit-status').value
    };
    
    // VALIDACIÓN COMPLETA DE TODOS LOS 13 CAMPOS OBLIGATORIOS
    const validation = validateAllGusbitFields(gusbitData);
    if (!validation.isValid) {
        alert(`⚠️ ERROR: ${validation.message}`);
        // Hacer foco en el primer campo con error
        if (validation.focusField) {
            document.getElementById(validation.focusField).focus();
        }
        return;
    }

    console.log('📋 Datos GUSBit recolectados:', gusbitData);

    // Mapear a la estructura de la API
    const apiData = {
        // Campos requeridos por la API
        company_id: gusbitData.gusbit_empresa,
        user_id: gusbitData.gusbit_usuario,
        expense_type_id: gusbitData.gusbit_categoria,
        description: gusbitData.gusbit_descripcion,
        expense_date: gusbitData.gusbit_fecha,
        amount: gusbitData.gusbit_monto,
        currency: gusbitData.gusbit_moneda,
        
        // Mapear campos GUSBit a campos del sistema
        vendor: gusbitData.gusbit_lugar, // Campo 7: Lugar o Negocio → Vendor
        payment_method: mapFormaPagoToSystem(gusbitData.gusbit_forma_pago),
        status: gusbitData.gusbit_status, // Campo 13: Status
        is_billable: false,
        
        // Consolidar todas las notas GUSBit en el campo notes
        notes: `REGISTRO GUSBIT NUEVO ORDEN (13 CAMPOS):
═══════════════════════════════════════
1. Fecha: ${gusbitData.gusbit_fecha}
2. Empresa: ID ${gusbitData.gusbit_empresa}
3. Usuario: ID ${gusbitData.gusbit_usuario}
4. Tipo: ${gusbitData.gusbit_tipo} (${gusbitData.gusbit_tipo === 'V' ? 'Viático' : 'Gasto'})
5. Categoría: ${getCategoryName(gusbitData.gusbit_categoria)}
6. Destino: ${gusbitData.gusbit_destino}
7. Lugar/Negocio: ${gusbitData.gusbit_lugar}
8. Descripción: ${gusbitData.gusbit_descripcion}
9. Monto: ${gusbitData.gusbit_monto}
10. Moneda: ${gusbitData.gusbit_moneda}
11. Forma de Pago: ${gusbitData.gusbit_forma_pago}
12. Quién lo Capturó: ${gusbitData.gusbit_quien_capturo}
13. Status: ${gusbitData.gusbit_status}`
    };

    try {
        console.log('💾 Enviando gasto GUSBIT completo al servidor:', apiData);
        
        const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Gasto GUSBIT guardado exitosamente:', result);
            showMessage('¡Gasto GUSBit guardado exitosamente con todos los 12 campos!', 'success');
            closeAddExpenseModal();
            
            // CRITICAL: Recargar la lista de gastos
            await loadExpenses();
            
        } else {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('❌ Error guardando gasto GUSBIT:', error);
        showMessage(`Error al guardar gasto GUSBit: ${error.message}`, 'error');
    }
}

// FUNCIÓN - APLICAR FILTROS AVANZADOS
function applyFilters() {
    // Recopilar todos los valores de filtros
    currentFilters.dateFrom = document.getElementById('filter-date-from')?.value || '';
    currentFilters.dateTo = document.getElementById('filter-date-to')?.value || '';
    currentFilters.company = document.getElementById('filter-company')?.value || '';
    currentFilters.user = document.getElementById('filter-user')?.value || '';
    currentFilters.type = document.getElementById('filter-type')?.value || '';
    currentFilters.category = document.getElementById('filter-category')?.value || '';
    currentFilters.status = document.getElementById('filter-status')?.value || '';
    currentFilters.currency = document.getElementById('filter-currency')?.value || '';
    
    // Aplicar filtros
    filteredExpenses = allExpenses.filter(expense => {
        // Filtro por fecha (rango)
        if (currentFilters.dateFrom || currentFilters.dateTo) {
            const expenseDate = expense.expense_date;
            if (currentFilters.dateFrom && expenseDate < currentFilters.dateFrom) return false;
            if (currentFilters.dateTo && expenseDate > currentFilters.dateTo) return false;
        }
        
        // Filtro por empresa
        if (currentFilters.company && expense.company_id != currentFilters.company) return false;
        
        // Filtro por usuario
        if (currentFilters.user && expense.user_id != currentFilters.user) return false;
        
        // Filtro por tipo de gasto (G = Gastos, V = Viáticos)
        if (currentFilters.type) {
            const notes = expense.notes?.toLowerCase() || '';
            
            if (currentFilters.type === 'G') {
                // Filtrar por Gastos - buscar "tipo: g (gasto)" en las notas
                if (!notes.includes('tipo: g') && !notes.includes('(gasto)')) return false;
            } else if (currentFilters.type === 'V') {
                // Filtrar por Viáticos - buscar "tipo: v (viático)" en las notas  
                if (!notes.includes('tipo: v') && !notes.includes('(viático)')) return false;
            }
        }
        
        // Filtro por categoría (si está disponible en el expense)
        if (currentFilters.category) {
            // Mapear expense_type_id a categorías
            const categoryMapping = {
                1: 'meals',        // Comidas de Trabajo
                2: 'transport',    // Transporte Terrestre
                3: 'transport',    // Combustible
                4: 'accommodation', // Hospedaje
                5: 'travel',       // Vuelos
                6: 'supplies',     // Material de Oficina
                7: 'services',     // Software y Licencias
                8: 'services',     // Capacitación
                9: 'services',     // Marketing
                10: 'general'      // Otros Gastos
            };
            
            const expenseCategory = categoryMapping[expense.expense_type_id];
            if (expenseCategory !== currentFilters.category) return false;
        }
        
        // Filtro por status
        if (currentFilters.status && expense.status !== currentFilters.status) return false;
        
        // Filtro por moneda
        if (currentFilters.currency && expense.currency !== currentFilters.currency) return false;
        
        return true;
    });
    
    displayExpenses();
    updateExpenseTotals();
    console.log('🔍 Filtros avanzados aplicados:', {
        dateRange: currentFilters.dateFrom || currentFilters.dateTo ? `${currentFilters.dateFrom} - ${currentFilters.dateTo}` : 'Sin filtro',
        company: currentFilters.company || 'Todas',
        user: currentFilters.user || 'Todos',
        type: currentFilters.type || 'Todos',
        category: currentFilters.category || 'Todas',
        status: currentFilters.status || 'Todos',
        currency: currentFilters.currency || 'Todas',
        results: `${filteredExpenses.length} de ${allExpenses.length} gastos`
    });
}

// FUNCIÓN HELPER: Mapear forma de pago GUSBit a sistema
function mapFormaPagoToSystem(gusbitFormaPago) {
    const mapping = {
        'efectivo': 'cash',
        'tarjeta_credito': 'credit_card',
        'tarjeta_debito': 'debit_card',
        'tarjeta_empresarial': 'company_card',
        'transferencia': 'bank_transfer',
        'cheque': 'bank_transfer',
        'vales': 'petty_cash',
        'caja_chica': 'petty_cash'
    };
    return mapping[gusbitFormaPago] || 'cash';
}

// FUNCIÓN HELPER: Expandir tipo de gasto
function getTipoExpanded(tipo) {
    if (!tipo) return 'N/A';
    if (tipo === 'V') return '✈️ Viático';
    if (tipo === 'G') return '💰 Gasto';
    return tipo;
}

// FUNCIÓN HELPER: Formatear número con comas y decimales
function formatCurrency(amount, currency = '') {
    if (!amount || isNaN(amount)) return 'N/A';
    
    const number = parseFloat(amount);
    
    // Formatear según la moneda
    let options = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    };
    
    let formattedNumber = '';
    
    if (currency === 'USD') {
        formattedNumber = '$' + number.toLocaleString('en-US', options);
    } else if (currency === 'EUR') {
        formattedNumber = '€' + number.toLocaleString('de-DE', options);
    } else {
        // MXN por defecto
        formattedNumber = '$' + number.toLocaleString('es-MX', options);
    }
    
    return formattedNumber;
}

// FUNCIÓN HELPER: Obtener nombre de categoría por ID
function getCategoryName(categoryId) {
    const categories = {
        '1': 'Comidas de Trabajo',
        '2': 'Transporte Terrestre',
        '3': 'Combustible',
        '4': 'Hospedaje',
        '5': 'Vuelos',
        '6': 'Material de Oficina',
        '7': 'Software y Licencias',
        '8': 'Capacitación',
        '9': 'Marketing',
        '10': 'Otros Gastos'
    };
    return categories[categoryId?.toString()] || 'Categoría Desconocida';
}

// FUNCIÓN HELPER: Obtener icono de status
function getStatusIcon(status) {
    const icons = {
        'pending': '⏳',
        'approved': '✅',
        'rejected': '❌',
        'reimbursed': '💰',
        'invoiced': '📄'
    };
    return icons[status] || '📋';
}

// FUNCIÓN - VER DETALLES DE GASTO
function viewExpenseDetails(expenseId) {
    const expense = allExpenses.find(e => e.id === expenseId);
    if (expense) {
        console.log('👀 Ver detalles del gasto:', expense);
        // Aquí se puede implementar un modal de detalles
        alert(`Gasto ID: ${expense.id}\nDescripción: ${expense.description}\nMonto: $${expense.amount} ${expense.currency}`);
    }
}

// FUNCIÓN - MOSTRAR MENSAJE
function showMessage(message, type = 'info') {
    // Crear el elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Agregar estilos
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
    
    // Agregar al body
    document.body.appendChild(messageDiv);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 4000);
}

// FUNCIÓN PARA LIMPIAR TODOS LOS FILTROS
function clearAllFilters() {
    console.log('🧹 Limpiando todos los filtros...');
    
    // Limpiar filtros en la interfaz
    const filters = [
        'filter-date-from',
        'filter-date-to',
        'filter-company',
        'filter-user', 
        'filter-type',
        'filter-category',
        'filter-status',
        'filter-currency'
    ];
    
    filters.forEach(filterId => {
        const filterElement = document.getElementById(filterId);
        if (filterElement) {
            filterElement.value = '';
        }
    });
    
    // Resetear filtros globales
    currentFilters = {
        dateFrom: '',
        dateTo: '',
        company: '',
        user: '',
        type: '',
        category: '',
        status: '',
        currency: ''
    };
    
    // Limpiar URL parameters
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, document.title, url);
    
    // Recargar gastos sin filtros
    loadExpenses();
    
    console.log('✅ Todos los filtros han sido limpiados');
}

// FUNCIÓN PARA APLICAR FILTROS URL DESPUÉS DE CARGAR DATOS
function applyUrlFiltersAfterLoad() {
    console.log('🎯 INICIO: Aplicando filtros URL después de cargar datos...');
    
    // Obtener TODOS los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const highlight = urlParams.get('highlight');
    const companyId = urlParams.get('company_id');
    const userId = urlParams.get('user_id');
    const dateFrom = urlParams.get('date_from');
    const dateTo = urlParams.get('date_to');
    
    console.log('📋 TODOS los parámetros URL detectados:', { 
        status, highlight, companyId, userId, dateFrom, dateTo 
    });
    
    let filtersApplied = false;
    
    // Aplicar filtro de status
    if (status) {
        console.log('🎯 Aplicando filtro automático: status=' + status);
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) {
            statusFilter.value = status;
            console.log('✅ Filtro de status actualizado a "' + status + '"');
        }
        currentFilters.status = status;
        filtersApplied = true;
    }
    
    // Aplicar filtro de empresa
    if (companyId) {
        console.log('🎯 Aplicando filtro automático: company_id=' + companyId);
        const companyFilter = document.getElementById('filter-company');
        if (companyFilter) {
            companyFilter.value = companyId;
            console.log('✅ Filtro de empresa actualizado a "' + companyId + '"');
        }
        currentFilters.company = companyId;
        filtersApplied = true;
    }
    
    // Aplicar filtro de usuario
    if (userId) {
        console.log('🎯 Aplicando filtro automático: user_id=' + userId);
        const userFilter = document.getElementById('filter-user');
        if (userFilter) {
            userFilter.value = userId;
            console.log('✅ Filtro de usuario actualizado a "' + userId + '"');
        }
        currentFilters.user = userId;
        filtersApplied = true;
    }
    
    // Si se aplicó algún filtro, ejecutar filtrado
    if (filtersApplied) {
        applyFilters();
        console.log('✅ Filtros URL aplicados exitosamente');
        
        // Si hay highlight=pending, mostrar mensaje informativo
        if (highlight === 'pending') {
            showUrlFilterMessage();
        }
    }
}

// FUNCIÓN PARA MOSTRAR MENSAJE DE FILTRO APLICADO
function showUrlFilterMessage() {
    console.log('💡 Mostrando mensaje de filtro aplicado...');
    
    setTimeout(() => {
        const alertDiv = document.createElement('div');
        alertDiv.innerHTML = `
            <div class="glass-panel p-4 mb-6 border-l-4 border-red-500 bg-red-50">
                <div class="flex items-center">
                    <i class="fas fa-filter text-red-600 mr-3"></i>
                    <div>
                        <h4 class="text-red-800 font-semibold">Filtro Aplicado Automáticamente</h4>
                        <p class="text-red-700 text-sm">Mostrando solo gastos <strong>pendientes de autorización</strong></p>
                        <button onclick="clearAllFilters()" class="text-red-600 hover:text-red-800 text-sm underline mt-1">
                            Limpiar filtros y ver todos los gastos
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar antes de la tabla de gastos
        const expensesContainer = document.getElementById('expenses-list') || document.querySelector('.glass-panel');
        if (expensesContainer && expensesContainer.parentNode) {
            expensesContainer.parentNode.insertBefore(alertDiv, expensesContainer);
            
            // Auto-remove después de 10 segundos
            setTimeout(() => {
                if (alertDiv && alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 10000);
        }
    }, 500);
}

// FUNCIÓN PARA LEER PARÁMETROS URL Y APLICAR FILTROS AUTOMÁTICOS (LEGACY)
function applyUrlFilters() {
    console.log('🔍 Verificando parámetros URL para filtros automáticos...');
    
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const highlight = urlParams.get('highlight');
    
    console.log('📋 Parámetros URL detectados:', { status, highlight });
    
    // Si hay parámetro status=pending, aplicar filtro automáticamente
    if (status === 'pending') {
        console.log('🎯 Aplicando filtro automático: status=pending');
        
        // Actualizar el filtro en la interfaz
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) {
            statusFilter.value = 'pending';
            console.log('✅ Filtro de status actualizado a "pending"');
        }
        
        // Actualizar filtros globales
        currentFilters.status = 'pending';
        
        // Si hay highlight=pending, mostrar mensaje informativo
        if (highlight === 'pending') {
            console.log('💡 Mostrando mensaje de filtro aplicado...');
            
            // Crear mensaje temporal
            setTimeout(() => {
                const alertDiv = document.createElement('div');
                alertDiv.innerHTML = `
                    <div class="glass-panel p-4 mb-6 border-l-4 border-red-500 bg-red-50">
                        <div class="flex items-center">
                            <i class="fas fa-filter text-red-600 mr-3"></i>
                            <div>
                                <h4 class="text-red-800 font-semibold">Filtro Aplicado Automáticamente</h4>
                                <p class="text-red-700 text-sm">Mostrando solo gastos <strong>pendientes de autorización</strong></p>
                                <button onclick="clearAllFilters()" class="text-red-600 hover:text-red-800 text-sm underline mt-1">
                                    Limpiar filtros y ver todos los gastos
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Insertar antes de la tabla de gastos
                const expensesContainer = document.getElementById('expenses-list') || document.querySelector('.glass-panel');
                if (expensesContainer && expensesContainer.parentNode) {
                    expensesContainer.parentNode.insertBefore(alertDiv, expensesContainer);
                    
                    // Auto-remove después de 10 segundos
                    setTimeout(() => {
                        if (alertDiv && alertDiv.parentNode) {
                            alertDiv.parentNode.removeChild(alertDiv);
                        }
                    }, 10000);
                }
            }, 500); // Pequeño delay para asegurar que la UI esté lista
        }
        
        // Aplicar filtros después de cargar los datos
        setTimeout(() => {
            applyFilters();
            console.log('✅ Filtros automáticos aplicados exitosamente');
        }, 1000);
    }
}

// FUNCIÓN - VALIDACIÓN VISUAL EN TIEMPO REAL
function setupRealTimeValidation() {
    const requiredFields = [
        'gusbit-fecha', 'gusbit-empresa', 'gusbit-usuario', 'gusbit-tipo',
        'gusbit-categoria', 'gusbit-destino', 'gusbit-lugar', 'gusbit-descripcion',
        'gusbit-monto', 'gusbit-moneda', 'gusbit-forma-pago', 'gusbit-quien-capturo',
        'gusbit-status'
    ];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', validateFieldVisually);
            field.addEventListener('change', validateFieldVisually);
            field.addEventListener('blur', validateFieldVisually);
        }
    });

    // Validar botón de envío en tiempo real
    const form = document.getElementById('expense-form');
    if (form) {
        form.addEventListener('input', updateSubmitButtonState);
        form.addEventListener('change', updateSubmitButtonState);
    }
}

function validateFieldVisually(event) {
    const field = event.target;
    const value = field.type === 'number' ? parseFloat(field.value) : field.value.trim();
    const isEmpty = !value || value === '' || (field.type === 'number' && (isNaN(value) || value <= 0));
    
    // Cambiar estilo visual según validación
    if (isEmpty) {
        field.style.borderColor = '#ef4444'; // Rojo
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    } else {
        field.style.borderColor = '#10b981'; // Verde
        field.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
    }
}

function updateSubmitButtonState() {
    const submitButton = document.querySelector('#expense-form button[type="submit"]');
    if (!submitButton) return;

    // Recopilar todos los valores actuales
    const currentData = {
        gusbit_fecha: document.getElementById('gusbit-fecha')?.value,
        gusbit_empresa: parseInt(document.getElementById('gusbit-empresa')?.value),
        gusbit_usuario: parseInt(document.getElementById('gusbit-usuario')?.value),
        gusbit_tipo: document.getElementById('gusbit-tipo')?.value,
        gusbit_categoria: parseInt(document.getElementById('gusbit-categoria')?.value),
        gusbit_destino: document.getElementById('gusbit-destino')?.value,
        gusbit_lugar: document.getElementById('gusbit-lugar')?.value,
        gusbit_descripcion: document.getElementById('gusbit-descripcion')?.value,
        gusbit_monto: parseFloat(document.getElementById('gusbit-monto')?.value),
        gusbit_moneda: document.getElementById('gusbit-moneda')?.value,
        gusbit_forma_pago: document.getElementById('gusbit-forma-pago')?.value,
        gusbit_quien_capturo: document.getElementById('gusbit-quien-capturo')?.value,
        gusbit_status: document.getElementById('gusbit-status')?.value
    };

    // Validar usando la función existente
    const validation = validateAllGusbitFields(currentData);
    
    if (validation.isValid) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>✅ Guardar Gasto Completo (13 Campos)';
        submitButton.style.background = 'var(--gradient-gold)';
        submitButton.style.cursor = 'pointer';
    } else {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>❌ Completar Todos los Campos';
        submitButton.style.background = 'var(--gradient-accent)';
        submitButton.style.cursor = 'not-allowed';
    }
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM ready - expenses.js cargado');
    
    // Cargar gastos al iniciar (los filtros URL se aplicarán automáticamente después)
    loadExpenses();
    
    // Configurar validación en tiempo real
    setupRealTimeValidation();
    
    console.log('✅ expenses.js inicializado completamente con validación en tiempo real');
});

// FUNCIÓN PARA LLENAR FORMULARIO AUTOMÁTICAMENTE CON OCR
function fillFormWithOCR(ocrText) {
    console.log('🤖 Llenando formulario automáticamente con OCR');
    
    if (!ocrText) return;
    
    // Extraer información automáticamente del texto OCR
    const lines = ocrText.split('\n');
    
    // Buscar monto (diferentes formatos)
    const montoMatch = ocrText.match(/TOTAL:?\s*\$?([0-9,]+\.?[0-9]*)/i);
    if (montoMatch) {
        const monto = (montoMatch[1] || montoMatch[2] || '').replace(',', '');
        const montoField = document.getElementById('gusbit-monto');
        if (montoField && monto) {
            montoField.value = monto;
            montoField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    
    // Buscar lugar/negocio
    if (ocrText.toLowerCase().includes('uber')) {
        const lugarField = document.getElementById('gusbit-lugar');
        const categoriaField = document.getElementById('gusbit-categoria');
        if (lugarField) lugarField.value = 'Uber';
        if (categoriaField) categoriaField.value = '2'; // Transporte
    }
    
    // Auto-llenar descripción con información relevante
    let descripcion = '';
    if (ocrText.toLowerCase().includes('uber')) {
        descripcion = 'Transporte Uber';
    } else if (ocrText.toLowerCase().includes('restaurant')) {
        descripcion = 'Comida en restaurante';
        const categoriaField = document.getElementById('gusbit-categoria');
        if (categoriaField) categoriaField.value = '1'; // Comidas
    } else if (ocrText.toLowerCase().includes('hotel')) {
        descripcion = 'Hospedaje';
        const categoriaField = document.getElementById('gusbit-categoria');
        if (categoriaField) categoriaField.value = '4'; // Hospedaje
    }
    
    if (descripcion) {
        const descripcionField = document.getElementById('gusbit-descripcion');
        if (descripcionField) {
            descripcionField.value = descripcion;
        }
    }
    
    // Mostrar mensaje de éxito
    showMessage('🤖 Formulario llenado automáticamente con datos OCR', 'success');
    
    // Actualizar validación visual
    setTimeout(() => {
        if (typeof updateSubmitButtonState === 'function') {
            updateSubmitButtonState();
        }
    }, 100);
}

// FUNCIÓN PARA MANEJAR SUBIDA DE ARCHIVOS CON OCR
async function handleFileUpload(input) {
    if (!input.files || input.files.length === 0) {
        return;
    }
    
    const uploadedFilesContainer = document.getElementById('uploaded-files');
    const ocrResultsContainer = document.getElementById('ocr-results');
    const ocrContentContainer = document.getElementById('ocr-content');
    
    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        
        // Crear preview del archivo
        const fileDiv = document.createElement('div');
        fileDiv.className = 'glass-panel p-4 border border-accent-gold/30 rounded-lg';
        fileDiv.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                    <i class="fas fa-file-image text-accent-emerald mr-2"></i>
                    <span class="text-sm font-semibold text-text-primary">${file.name}</span>
                </div>
                <span class="text-xs text-text-secondary">${(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <div class="w-full bg-glass-hover rounded-full h-2 mb-2">
                <div class="bg-gradient-to-r from-accent-gold to-accent-emerald h-2 rounded-full animate-pulse" style="width: 0%" id="progress-${i}"></div>
            </div>
            <div class="text-xs text-accent-gold">⚡ Procesando OCR...</div>
        `;
        uploadedFilesContainer.appendChild(fileDiv);
        
        // Simular progreso
        let progress = 0;
        const progressBar = document.getElementById(`progress-${i}`);
        const progressInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
            }
            progressBar.style.width = progress + '%';
        }, 200);
        
        // Simular subida y procesamiento OCR
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Enviar al endpoint de subida (usamos el mock de OCR)
            const response = await fetch('/api/attachments', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Actualizar el archivo con el resultado exitoso
                fileDiv.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <i class="fas fa-check-circle text-emerald mr-2"></i>
                            <span class="text-sm font-semibold text-text-primary">${file.name}</span>
                        </div>
                        <span class="text-xs text-emerald">✅ Completado</span>
                    </div>
                    <div class="text-xs text-text-secondary">
                        📄 URL: ${result.url}
                    </div>
                `;
                
                // Si hay resultados de OCR, mostrarlos
                if (result.ocr_result && result.ocr_result.text) {
                    ocrResultsContainer.style.display = 'block';
                    
                    const ocrDiv = document.createElement('div');
                    ocrDiv.className = 'glass-panel p-4 border border-accent-emerald/30 rounded-lg';
                    ocrDiv.innerHTML = `
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center">
                                <i class="fas fa-eye text-accent-emerald mr-2"></i>
                                <span class="font-semibold text-text-primary">${file.name}</span>
                            </div>
                            <span class="text-xs text-accent-emerald">Confianza: ${(result.ocr_result.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div class="text-sm text-text-primary bg-glass-hover rounded p-3 font-mono">
                            ${result.ocr_result.text.replace(/\\n/g, '<br>')}
                        </div>
                        <div class="mt-3 flex justify-end">
                            <button onclick="fillFormWithOCR(decodeURIComponent('${encodeURIComponent(result.ocr_result.text)}'))" class="premium-button text-xs">
                                <i class="fas fa-magic mr-2"></i>
                                ✨ Llenar Formulario Automáticamente
                            </button>
                        </div>
                    `;
                    ocrContentContainer.appendChild(ocrDiv);
                }
                
            } else {
                throw new Error('Error en la subida del archivo');
            }
            
        } catch (error) {
            console.error('❌ Error procesando archivo:', error);
            fileDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-circle text-red-400 mr-2"></i>
                        <span class="text-sm font-semibold text-text-primary">${file.name}</span>
                    </div>
                    <span class="text-xs text-red-400">❌ Error</span>
                </div>
                <div class="text-xs text-red-400 mt-1">Error: ${error.message}</div>
            `;
        }
    }
}

console.log('✅ expenses.js cargado exitosamente');