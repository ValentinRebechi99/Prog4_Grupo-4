// ====================================
// EMPLEADO MUNICIPAL - ARTÍCULOS
// ====================================

const API_BASE = 'http://localhost:3000/api';

async function cargarArticulos() {
    const tbody = document.getElementById('articles-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/articulos`, {
            headers: window.PortalAuth?.authHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener artículos');
        const articulos = await res.json();

        tbody.innerHTML = '';
        if (articulos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #888;">No hay artículos registrados.</td></tr>';
            return;
        }

        articulos.forEach((art) => {
            const codigo = `#${art.id_articulo}`;
            const tipo = art.categoria_nombre || 'Sin categoría';
            const descripcion = art.descripcion_articulo || art.descripcion || '—';
            const area = art.area_nombre || 'Sin área';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${codigo}</td>
                <td>${tipo}</td>
                <td>${descripcion}</td>
                <td>${area}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar artículos:', error);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al conectar con el servidor.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarArticulos();
});

