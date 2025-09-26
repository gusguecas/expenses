const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capturar logs
  page.on('console', msg => console.log('🖥️ CONSOLA:', msg.text()));
  
  console.log('📱 Navegando al dashboard...');
  await page.goto('https://3000-ial41s29t0kzpd2ozwkwe-6532622b.e2b.dev/analytics');
  
  // Esperar a que cargue
  await page.waitForTimeout(5000);
  
  console.log('📅 Configurando fechas...');
  
  // Simular cambio de fecha exacto
  await page.fill('#filter-date-from', '2024-09-20');
  await page.fill('#filter-date-to', '2024-09-22');
  
  console.log('🎯 Esperando respuesta...');
  await page.waitForTimeout(3000);
  
  console.log('✅ Test completado');
  await browser.close();
})();
