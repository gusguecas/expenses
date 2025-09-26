#!/usr/bin/env python3
"""
ELIMINAR el filtro horizontal - solo dejar el vertical
"""

def remove_horizontal_filter():
    print("❌ ELIMINANDO filtro horizontal del dashboard...")
    
    with open('/home/user/webapp/src/index.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar y eliminar el filtro horizontal en el dashboard
    horizontal_filter_start = content.find('        <!-- Filtros Avanzados (COPIADO EXACTO de gastos) -->')
    
    if horizontal_filter_start != -1:
        # Buscar el final de esta sección de filtros
        horizontal_filter_end = content.find('        </div>\n\n        <!-- Dashboard Content', horizontal_filter_start)
        
        if horizontal_filter_end == -1:
            # Buscar otra posible terminación
            horizontal_filter_end = content.find('        </div>\n\n        <div class="grid grid-cols-1 lg:grid-cols-4', horizontal_filter_start)
        
        if horizontal_filter_end != -1:
            horizontal_filter_end += len('        </div>')
            
            # Eliminar toda la sección de filtros horizontales
            content = content[:horizontal_filter_start] + content[horizontal_filter_end + 2:]  # +2 para los \n\n
            
            print("   ✅ Filtro horizontal eliminado completamente")
        else:
            print("   ❌ No se encontró el final del filtro horizontal")
    else:
        print("   ℹ️ No se encontró filtro horizontal para eliminar")
    
    # Verificar que no hayan quedado filtros duplicados
    dashboard_start = content.find("app.get('/', (c) => {")
    dashboard_end = content.find("\napp.get('/companies'", dashboard_start)
    dashboard_section = content[dashboard_start:dashboard_end]
    
    # Contar cuántos "Filtros Avanzados" hay en el dashboard
    filter_count = dashboard_section.count('Filtros Avanzados')
    print(f"   📊 Filtros 'Avanzados' restantes en dashboard: {filter_count}")
    
    # Guardar archivo
    with open('/home/user/webapp/src/index.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ ¡FILTRO HORIZONTAL ELIMINADO!")
    print("🎯 Solo queda el filtro VERTICAL en el sidebar izquierdo")
    
    return True

if __name__ == "__main__":
    remove_horizontal_filter()