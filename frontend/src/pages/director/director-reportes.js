// ====================================
// DIRECTOR - REPORTES DE INCIDENCIAS
// ====================================

const API_BASE = 'http://localhost:3000/api';
let incidenciasLista = [];

function claseBadgeEstado(estado) {
    if (!estado) return 'badge-pendiente';
    const est = String(estado).trim();
    const mapa = {
        'Pendiente': 'badge-pendiente',
        'PENDIENTE': 'badge-pendiente',
        'En Proceso': 'badge-en-proceso',
        'EN PROCESO': 'badge-en-proceso',
        'Resuelto': 'badge-resuelto',
        'RESUELTO': 'badge-resuelto',
        'Cancelado': 'badge-cancelado',
        'CANCELADO': 'badge-cancelado',
        'Cancelada': 'badge-cancelado',
        'CANCELADA': 'badge-cancelado',
        1: 'badge-pendiente',
        2: 'badge-en-proceso',
        3: 'badge-resuelto',
        4: 'badge-cancelado'
    };
    return mapa[est] || mapa[estado] || 'badge-pendiente';
}

function claseBadgePrioridad(prioridad) {
    const mapa = {
        'Crítica': 'badge-crítica',
        'Alta': 'badge-alta',
        'Media': 'badge-media',
        'Baja': 'badge-baja',
        1: 'badge-alta',
        2: 'badge-media',
        3: 'badge-baja'
    };
    return mapa[prioridad] || 'badge-media';
}

function formatearPrioridad(prioridad) {
    const mapa = {
        1: 'Alta',
        2: 'Media',
        3: 'Baja',
        '1': 'Alta',
        '2': 'Media',
        '3': 'Baja'
    };
    return mapa[prioridad] || prioridad || 'Media';
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '—';
    try {
        const d = new Date(fechaStr);
        return d.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch {
        return fechaStr;
    }
}

async function cargarReportes() {
    try {
        const res = await fetch(`${API_BASE}/incidencias`, {
            headers: window.PortalAuth?.authHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener incidencias');
        incidenciasLista = await res.json();
        aplicarFiltros();
    } catch (error) {
        console.error('Error al cargar incidencias para reportes:', error);
        const tbody = document.querySelector('#reportes-table tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al conectar con el servidor.</td></tr>';
    }
}

function renderizarTabla(lista) {
    const tbody = document.querySelector('#reportes-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">No se encontraron incidencias con los filtros aplicados.</td></tr>';
        return;
    }

    lista.forEach((inc) => {
        const codigo = `#${inc.id_incidencia}`;
        const fecha = formatearFecha(inc.fecha_creacion);
        const articulo = inc.articulo_descripcion || (inc.id_articulo ? `Artículo #${inc.id_articulo}` : 'Sin artículo');
        const estadoTexto = inc.estado || (inc.id_estado === 1 ? 'Pendiente' : inc.id_estado === 2 ? 'En Proceso' : inc.id_estado === 3 ? 'Resuelto' : inc.id_estado === 4 ? 'Cancelado' : 'Pendiente');
        const badgeEstado = `<span class="badge ${claseBadgeEstado(estadoTexto)}">${estadoTexto}</span>`;
        const prioridadTexto = formatearPrioridad(inc.prioridad);
        const badgePrioridad = `<span class="badge ${claseBadgePrioridad(prioridadTexto)}">${prioridadTexto}</span>`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${codigo}</td>
            <td>${fecha}</td>
            <td>${articulo}</td>
            <td>${badgePrioridad}</td>
            <td>${badgeEstado}</td>
            <td class="td-empleado"></td>
        `;
        const tdEmpleado = row.querySelector('.td-empleado');
        if (inc.asignado_a_nombre) {
            tdEmpleado.textContent = inc.asignado_a_nombre;
        } else {
            tdEmpleado.innerHTML = '<span style="color: #dc3545; font-weight: 600;">Sin Asignar</span>';
        }
        tbody.appendChild(row);
    });
}

function aplicarFiltros() {
    const filterCodigo = (document.getElementById('filter-codigo')?.value || '').toLowerCase().trim();
    const filterFecha = document.getElementById('filter-fecha')?.value || '';
    const filterArticulo = (document.getElementById('filter-articulo')?.value || '').toLowerCase().trim();
    const filterPrioridad = (document.getElementById('filter-prioridad')?.value || '').toLowerCase().trim();
    const filterEstado = (document.getElementById('filter-estado')?.value || '').toLowerCase().trim();
    const filterEmpleado = (document.getElementById('filter-empleado')?.value || '').toLowerCase().trim();

    const filtradas = incidenciasLista.filter((inc) => {
        // Código
        if (filterCodigo) {
            const cod = String(inc.id_incidencia).toLowerCase();
            if (!cod.includes(filterCodigo.replace('#', ''))) return false;
        }

        // Fecha
        if (filterFecha && inc.fecha_creacion) {
            const fechaInc = new Date(inc.fecha_creacion).toISOString().split('T')[0];
            if (fechaInc !== filterFecha) return false;
        }

        // Artículo
        if (filterArticulo) {
            const artDesc = (inc.articulo_descripcion || '').toLowerCase();
            if (!artDesc.includes(filterArticulo)) return false;
        }

        // Prioridad
        if (filterPrioridad) {
            const prio = formatearPrioridad(inc.prioridad).toLowerCase();
            if (prio !== filterPrioridad) return false;
        }

        // Estado
        if (filterEstado) {
            const est = (inc.estado || '').toLowerCase();
            if (!est.includes(filterEstado)) return false;
        }

        // Empleado
        if (filterEmpleado) {
            const emp = (inc.asignado_a_nombre || 'Sin Asignar').toLowerCase();
            if (!emp.includes(filterEmpleado)) return false;
        }

        return true;
    });

    renderizarTabla(filtradas);
}

function setupFiltros() {
    const inputs = [
        'filter-codigo',
        'filter-fecha',
        'filter-articulo',
        'filter-prioridad',
        'filter-estado',
        'filter-empleado'
    ];

    inputs.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', aplicarFiltros);
            el.addEventListener('change', aplicarFiltros);
        }
    });

    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            inputs.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            renderizarTabla(incidenciasLista);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupFiltros();
    cargarReportes();
});

