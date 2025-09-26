// Test script para filtro de fecha
console.log('🧪 Iniciando test del filtro de fecha...');

// Simular carga de página
setTimeout(() => {
  console.log('📅 Configurando fechas de prueba...');
  
  const dateFrom = document.getElementById('filter-date-from');
  const dateTo = document.getElementById('filter-date-to');
  
  if (dateFrom && dateTo) {
    console.log('✅ Elementos encontrados');
    dateFrom.value = '2024-09-20';
    dateTo.value = '2024-09-22';
    
    console.log('🎯 Disparando onchange...');
    dateFrom.dispatchEvent(new Event('change'));
  } else {
    console.error('❌ Elementos no encontrados');
  }
}, 3000);
