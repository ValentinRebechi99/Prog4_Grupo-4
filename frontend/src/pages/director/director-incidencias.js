// ====================================
// DIRECTOR - GESTIÓN DE INCIDENCIAS
// ====================================

const API_BASE = 'http://localhost:3000/api';
let incidenciaSeleccionadaId = null;

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

async function cargarIncidencias() {
    const tbody = document.querySelector('#incidencias-table tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/incidencias`);
        if (!res.ok) throw new Error('Error al obtener incidencias');
        const incidencias = await res.json();

        tbody.innerHTML = '';
        if (incidencias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">No hay incidencias registradas.</td></tr>';
            return;
        }

        incidencias.forEach((inc) => {
            const codigo = `#${inc.id_incidencia}`;
            const articulo = inc.articulo_descripcion || (inc.id_articulo ? `Artículo #${inc.id_articulo}` : 'Sin artículo');
            const estadoTexto = inc.estado || (inc.id_estado === 1 ? 'Pendiente' : inc.id_estado === 2 ? 'En Proceso' : inc.id_estado === 3 ? 'Resuelto' : inc.id_estado === 4 ? 'Cancelado' : 'Pendiente');
            const badgeEstado = `<span class="badge ${claseBadgeEstado(estadoTexto)}">${estadoTexto}</span>`;
            const prioridadTexto = formatearPrioridad(inc.prioridad);
            const badgePrioridad = `<span class="badge ${claseBadgePrioridad(prioridadTexto)}">${prioridadTexto}</span>`;
            const empleado = inc.asignado_a_nombre || 'No asignado';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${codigo}</td>
                <td>${articulo}</td>
                <td>${badgePrioridad}</td>
                <td>${badgeEstado}</td>
                <td>${empleado}</td>
                <td>
                    <button type="button" class="btn-action btn-asignar" style="background-color: #0084d1; color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer;">Asignar</button>
                </td>
            `;

            const btnAsignar = row.querySelector('.btn-asignar');
            btnAsignar.addEventListener('click', () => {
                abrirModalAsignar(inc.id_incidencia);
            });

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar incidencias:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al conectar con el servidor.</td></tr>';
    }
}

function abrirModalAsignar(id) {
    incidenciaSeleccionadaId = id;
    const modal = document.getElementById('modal-asignar');
    if (modal) modal.style.display = 'flex';
}

function cerrarModalAsignar() {
    incidenciaSeleccionadaId = null;
    const modal = document.getElementById('modal-asignar');
    if (modal) modal.style.display = 'none';
}

function setupModal() {
    const modal = document.getElementById('modal-asignar');
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    const btnCancelar = document.getElementById('btn-cancelar-asignacion');
    const btnConfirmar = document.getElementById('btn-confirmar-asignacion');

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModalAsignar();
        });
    }

    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModalAsignar);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModalAsignar);

    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async () => {
            const select = document.getElementById('empleado-select');
            const empleadoVal = select ? select.value : '';
            if (!empleadoVal) {
                alert('Por favor seleccione un empleado.');
                return;
            }

            try {
                // Actualiza estado a 'En Proceso' (id_estado = 2) al asignar
                const res = await fetch(`${API_BASE}/incidencias/${incidenciaSeleccionadaId}/estado`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_estado: 2, descripcion_resolucion: `Asignado a empleado ${empleadoVal}` })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Error al asignar');
                }

                alert('Incidencia asignada correctamente.');
                cerrarModalAsignar();
                await cargarIncidencias();
            } catch (error) {
                alert('Error al asignar incidencia: ' + error.message);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupModal();
    cargarIncidencias();
});

