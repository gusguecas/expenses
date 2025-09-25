// ===== LYRA EXPENSES - JAVASCRIPT FUNCTIONS =====

// Variables globales
let uploadedAttachments = [];
let ocrResults = [];
let allExpenses = [];
let filteredExpenses = [];
let allCompanies = []; // NUEVO: Cache de empresas para mostrar nombres

// Filtros aplicados
let currentFilters = {
    company: '',
    user: '',
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
        
        console.log('✅ Modal abierto exitosamente');
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
        
        if (result.success && result.companies) {
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
        
        if (result.success && result.companies) {
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
                <td colspan="16" class="text-center py-8 text-text-secondary">
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
        const gusbitData = extractGusbitFromNotes(expense.notes || '');
        
        return `
            <tr class="hover:bg-glass-hover transition-colors cursor-pointer" onclick="viewExpenseDetails(${expense.id})">
                <td class="px-4 py-3 text-sm">${gusbitData.fecha || expense.expense_date || 'N/A'}</td>
                <td class="px-4 py-3 text-sm font-semibold" style="background: rgba(255, 215, 0, 0.05); border-left: 3px solid #FFD700;">
                    ${getCompanyName(expense.company_id)}
                </td>
                <td class="px-4 py-3 text-sm">${gusbitData.destino || 'N/A'}</td>
                <td class="px-4 py-3 text-sm">${gusbitData.lugar || expense.vendor || 'N/A'}</td>
                <td class="px-4 py-3 text-sm">${gusbitData.descripcion || expense.description || 'N/A'}</td>
                <td class="px-4 py-3 text-sm">${gusbitData.reservacion || 'N/A'}</td>
                <td class="px-4 py-3 text-sm">${gusbitData.ciudad || 'N/A'}</td>
                <td class="px-4 py-3 text-sm">${gusbitData.integrantes || 'N/A'}</td>
                <td class="px-4 py-3 text-sm font-semibold text-emerald">
                    $${expense.amount} ${expense.currency}
                </td>
                <td class="px-4 py-3 text-sm">${gusbitData.quien_pago || 'N/A'}</td>
                <td class="px-4 py-3 text-sm">${gusbitData.forma_pago || expense.payment_method || 'N/A'}</td>
                <td class="px-4 py-3 text-sm">${getCategoryName(expense.expense_type_id)}</td>
                <td class="px-4 py-3 text-sm">
                    <span class="status-badge status-${expense.status}">
                        ${getStatusIcon(expense.status)} ${gusbitData.estatus_reposicion || expense.status || 'N/A'}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm">${gusbitData.de_quien_gasto || 'N/A'}</td>
                <td class="px-4 py-3 text-sm">${gusbitData.quien_capturo || 'N/A'}</td>
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
    const totalCountEl = document.getElementById('total-count');
    const totalAmountEl = document.getElementById('total-amount');
    
    if (!totalCountEl || !totalAmountEl) {
        console.warn('⚠️ Elementos de totales no encontrados');
        return;
    }
    
    // Calcular totales
    const totalCount = filteredExpenses.length;
    let totalMXN = 0;
    let totalUSD = 0;
    let totalEUR = 0;
    
    filteredExpenses.forEach(expense => {
        const amount = parseFloat(expense.amount) || 0;
        if (expense.currency === 'USD') {
            totalUSD += amount;
            totalMXN += amount * 18.25; // Conversión aproximada
        } else if (expense.currency === 'EUR') {
            totalEUR += amount;
            totalMXN += amount * 20.15; // Conversión aproximada
        } else {
            totalMXN += amount;
        }
    });
    
    // Actualizar elementos
    totalCountEl.textContent = totalCount.toLocaleString();
    
    // Mostrar total principal en MXN y desglose si hay otras monedas
    let amountText = `$${totalMXN.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
    
    if (totalUSD > 0 || totalEUR > 0) {
        amountText += ' (';
        const breakdowns = [];
        if (totalUSD > 0) breakdowns.push(`$${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`);
        if (totalEUR > 0) breakdowns.push(`€${totalEUR.toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR`);
        amountText += breakdowns.join(' + ') + ')';
    }
    
    totalAmountEl.innerHTML = amountText;
    
    // Actualizar fila de totales en tabla
    updateTableTotalsRow(totalCount, totalMXN, totalUSD, totalEUR);
    
    console.log('📊 Totales actualizados:', {
        count: totalCount,
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

// FUNCIÓN HELPER - EXTRAER DATOS GUSBIT DE LAS NOTAS
function extractGusbitFromNotes(notes) {
    const data = {};
    
    if (!notes || !notes.includes('REGISTRO GUSBIT COMPLETO')) {
        return data;
    }
    
    // Extraer cada campo usando regex
    const patterns = {
        fecha: /1\.\s*Fecha:\s*(.+)/,
        destino: /2\.\s*Destino:\s*(.+)/,
        lugar: /3\.\s*Lugar\/Negocio:\s*(.+)/,
        descripcion: /4\.\s*Descripción:\s*(.+)/,
        reservacion: /5\.\s*No\.\s*Reservación:\s*(.+)/,
        ciudad: /6\.\s*Ciudad:\s*(.+)/,
        integrantes: /7\.\s*Integrantes:\s*(.+)/,
        quien_pago: /9\.\s*Quién\s*Pagó:\s*(.+)/,
        forma_pago: /10\.\s*Forma\s*de\s*Pago:\s*(.+)/,
        estatus_reposicion: /12\.\s*Estatus\s*Reposición:\s*(.+)/,
        de_quien_gasto: /13\.\s*De\s*Quién\s*es\s*el\s*Gasto:\s*(.+)/,
        quien_capturo: /14\.\s*Quién\s*lo\s*Capturó:\s*(.+)/
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
        const match = notes.match(pattern);
        if (match && match[1] && match[1].trim() !== 'N/A') {
            data[key] = match[1].trim();
        }
    }
    
    return data;
}

// FUNCIÓN - ENVIAR GASTO GUSBIT
async function submitExpenseGusbit(event) {
    event.preventDefault();
    console.log('🚀 INICIANDO GUARDADO GUSBIT - 12 campos completos...');
    
    // CRÍTICO: Validar que se seleccionó empresa
    const empresaId = document.getElementById('gusbit-empresa').value;
    if (!empresaId) {
        alert('⚠️ ERROR CRÍTICO: Debe seleccionar una empresa antes de guardar el gasto.');
        document.getElementById('gusbit-empresa').focus();
        return;
    }
    
    // Recolectar TODOS los campos GUSBit en orden
    const gusbitData = {
        // Campo 0: EMPRESA (CRÍTICO)
        gusbit_empresa: parseInt(empresaId),
        
        // Campos GUSBit del 1-12 en orden exacto
        gusbit_fecha: document.getElementById('gusbit-fecha').value,
        gusbit_destino: document.getElementById('gusbit-destino').value,
        gusbit_lugar: document.getElementById('gusbit-lugar').value,
        gusbit_descripcion: document.getElementById('gusbit-descripcion').value,
        gusbit_reservacion: document.getElementById('gusbit-reservacion').value,
        gusbit_ciudad: document.getElementById('gusbit-ciudad').value,
        gusbit_integrantes: document.getElementById('gusbit-integrantes').value,
        gusbit_costo: parseFloat(document.getElementById('gusbit-costo').value),
        gusbit_moneda: document.getElementById('gusbit-moneda').value,
        gusbit_quien_pago: document.getElementById('gusbit-quien-pago').value,
        gusbit_forma_pago: document.getElementById('gusbit-forma-pago').value,
        gusbit_categoria: parseInt(document.getElementById('gusbit-categoria').value),
        gusbit_estatus_reposicion: document.getElementById('gusbit-estatus-reposicion').value,
        
        // Campos adicionales 13-14
        gusbit_de_quien_gasto: document.getElementById('gusbit-de-quien-gasto').value,
        gusbit_quien_capturo: document.getElementById('gusbit-quien-capturo').value,
        
        // Campos del sistema
        company_id: parseInt(empresaId), // CRÍTICO: Ahora toma el valor del selector
        user_id: 1, // Valor por defecto (usuario logueado)
        invoice_number: '', // Opcional
        is_billable: false, // Por defecto no facturable
        notes_sistema: '' // Sin notas adicionales
    };

    console.log('📋 Datos GUSBit recolectados:', gusbitData);

    // Mapear a la estructura de la API
    const apiData = {
        // Campos requeridos por la API
        company_id: gusbitData.company_id,
        user_id: gusbitData.user_id,
        expense_type_id: gusbitData.gusbit_categoria,
        description: gusbitData.gusbit_descripcion,
        expense_date: gusbitData.gusbit_fecha,
        amount: gusbitData.gusbit_costo,
        currency: gusbitData.gusbit_moneda,
        
        // Mapear campos GUSBit a campos del sistema
        vendor: gusbitData.gusbit_lugar, // Campo 3: Lugar → Vendor
        payment_method: mapFormaPagoToSystem(gusbitData.gusbit_forma_pago),
        invoice_number: gusbitData.invoice_number,
        is_billable: gusbitData.is_billable,
        
        // Consolidar todas las notas GUSBit en el campo notes
        notes: `REGISTRO GUSBIT COMPLETO (12 CAMPOS):
═══════════════════════════════════════
1. Fecha: ${gusbitData.gusbit_fecha}
2. Destino: ${gusbitData.gusbit_destino}
3. Lugar/Negocio: ${gusbitData.gusbit_lugar}
4. Descripción: ${gusbitData.gusbit_descripcion}
5. No. Reservación: ${gusbitData.gusbit_reservacion || 'N/A'}
6. Ciudad: ${gusbitData.gusbit_ciudad}
7. Integrantes: ${gusbitData.gusbit_integrantes || 'N/A'}
8. Costo: ${gusbitData.gusbit_costo} ${gusbitData.gusbit_moneda}
9. Quién Pagó: ${gusbitData.gusbit_quien_pago}
10. Forma de Pago: ${gusbitData.gusbit_forma_pago}
11. Categoría: ${getCategoryName(gusbitData.gusbit_categoria)}
12. Estatus Reposición: ${gusbitData.gusbit_estatus_reposicion}
13. De Quién es el Gasto: ${gusbitData.gusbit_de_quien_gasto}
14. Quién lo Capturó: ${gusbitData.gusbit_quien_capturo}

NOTAS SISTEMA: ${gusbitData.notes_sistema || 'Sin notas adicionales'}`
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

// FUNCIÓN - APLICAR FILTROS
function applyFilters() {
    currentFilters.company = document.getElementById('filter-company')?.value || '';
    currentFilters.user = document.getElementById('filter-user')?.value || '';
    currentFilters.status = document.getElementById('filter-status')?.value || '';
    currentFilters.currency = document.getElementById('filter-currency')?.value || '';
    
    filteredExpenses = allExpenses.filter(expense => {
        if (currentFilters.company && expense.company_id != currentFilters.company) return false;
        if (currentFilters.user && expense.user_id != currentFilters.user) return false;
        if (currentFilters.status && expense.status !== currentFilters.status) return false;
        if (currentFilters.currency && expense.currency !== currentFilters.currency) return false;
        return true;
    });
    
    displayExpenses();
    updateExpenseTotals();
    console.log('🔍 Filtros aplicados, mostrando', filteredExpenses.length, 'de', allExpenses.length, 'gastos');
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

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM ready - expenses.js cargado');
    
    // Cargar gastos al iniciar
    loadExpenses();
    
    console.log('✅ expenses.js inicializado completamente');
});

console.log('✅ expenses.js cargado exitosamente');