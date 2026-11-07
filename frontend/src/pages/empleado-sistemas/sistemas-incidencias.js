// ====================================
// EMPLEADO SISTEMAS - INCIDENCIAS
// ====================================

const API_BASE = 'http://localhost:3000/api';

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
    const tbody = document.getElementById('incidents-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/incidencias`);
        if (!res.ok) throw new Error('Error al obtener incidencias');
        const incidencias = await res.json();

        tbody.innerHTML = '';
        if (incidencias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No hay incidencias asignadas.</td></tr>';
            return;
        }

        incidencias.forEach((inc) => {
            const codigo = `#${inc.id_incidencia}`;
            const articulo = inc.articulo_descripcion || (inc.id_articulo ? `Artículo #${inc.id_articulo}` : 'Sin artículo');
            const estadoTexto = inc.estado || (inc.id_estado === 1 ? 'Pendiente' : inc.id_estado === 2 ? 'En Proceso' : inc.id_estado === 3 ? 'Resuelto' : inc.id_estado === 4 ? 'Cancelado' : 'Pendiente');
            const badgeEstado = `<span class="badge ${claseBadgeEstado(estadoTexto)}">${estadoTexto}</span>`;
            const prioridadTexto = formatearPrioridad(inc.prioridad);
            const badgePrioridad = `<span class="badge ${claseBadgePrioridad(prioridadTexto)}">${prioridadTexto}</span>`;

            let accion = '<span style="color: #999;">—</span>';
            const estadoNormalizado = (inc.estado || '').trim().toLowerCase();
            const esPendiente = inc.id_estado === 1 || estadoNormalizado === 'pendiente' || !inc.estado;
            const esEnProceso = inc.id_estado === 2 || estadoNormalizado === 'en proceso';

            if (esPendiente) {
                accion = `
                    <button type="button" class="btn-finalize-incident" style="background-color: #28a745; color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer; margin-right: 4px;">Finalizar</button>
                    <button type="button" class="btn-action btn-cancel-incident btn-cancelar-incidencia">Cancelar</button>
                `;
            } else if (esEnProceso) {
                accion = `
                    <button type="button" class="btn-finalize-incident" style="background-color: #28a745; color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer;">Finalizar</button>
                `;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${codigo}</td>
                <td>${articulo}</td>
                <td>${badgePrioridad}</td>
                <td>${badgeEstado}</td>
                <td>${accion}</td>
            `;

            const btnFinalizar = row.querySelector('.btn-finalize-incident');
            if (btnFinalizar) {
                btnFinalizar.addEventListener('click', async () => {
                    const resolucion = prompt('Ingrese la descripción de la resolución (opcional):') || '';
                    await cambiarEstadoIncidencia(inc.id_incidencia, 3, resolucion);
                });
            }

            const btnCancelar = row.querySelector('.btn-cancelar-incidencia');
            if (btnCancelar) {
                btnCancelar.addEventListener('click', async () => {
                    const confirmar = confirm(`¿Estás seguro de que deseas cancelar la incidencia ${codigo}?`);
                    if (confirmar) {
                        await cambiarEstadoIncidencia(inc.id_incidencia, 4, 'Cancelada por el usuario');
                    }
                });
            }

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar incidencias:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al conectar con el servidor.</td></tr>';
    }
}

async function cambiarEstadoIncidencia(id, id_estado, descripcion_resolucion = '') {
    try {
        const res = await fetch(`${API_BASE}/incidencias/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_estado, descripcion_resolucion })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al actualizar el estado');
        }

        await cargarIncidencias();
    } catch (error) {
        alert('Error al actualizar la incidencia: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarIncidencias();
});

