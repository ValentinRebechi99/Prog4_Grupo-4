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
        'Resuelta': 'badge-resuelto',
        'RESUELTA': 'badge-resuelto',
        'Resuelto': 'badge-resuelto',
        'RESUELTO': 'badge-resuelto',
        'Cancelada': 'badge-cancelada',
        'CANCELADA': 'badge-cancelada',
        'Cancelado': 'badge-cancelada',
        'CANCELADO': 'badge-cancelada',
        1: 'badge-pendiente',
        2: 'badge-en-proceso',
        3: 'badge-resuelto',
        4: 'badge-cancelado'
    };
    return mapa[est] || mapa[estado] || 'badge-pendiente';
}

function claseBadgePrioridad(prioridad) {
    const mapa = {
        'Crítica': 'badge-alta',
        'CRÍTICA': 'badge-alta',
        'Alta': 'badge-alta',
        'ALTA': 'badge-alta',
        'Media': 'badge-media',
        'MEDIA': 'badge-media',
        'Baja': 'badge-baja',
        'BAJA': 'badge-baja',
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
        const usuario = window.PortalAuth?.getSession()?.usuario;
        const query = usuario?.id_usuario ? `?asignado_a=${usuario.id_usuario}` : '';
        const res = await fetch(`${API_BASE}/incidencias${query}`, {
            headers: window.PortalAuth?.authHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener incidencias');
        const incidencias = await res.json();

        tbody.innerHTML = '';
        if (incidencias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">No hay incidencias asignadas.</td></tr>';
            return;
        }

        incidencias.forEach((inc) => {
            const codigo = `#${inc.id_incidencia}`;
            const articulo = inc.articulo_descripcion || (inc.id_articulo ? `Artículo #${inc.id_articulo}` : 'Sin artículo');
            const descripcionPedido = inc.descripcion_pedido || inc.descripcion || 'Sin descripción registrada.';
            
            // Limpieza y normalización estricta del estado para corregir "resuela" / "resuelto" a "Resuelta"
            let estadoTexto = inc.estado || inc.descripcion_estado || (inc.id_estado === 1 ? 'Pendiente' : inc.id_estado === 2 ? 'En Proceso' : inc.id_estado === 3 ? 'Resuelta' : inc.id_estado === 4 ? 'Cancelada' : 'Pendiente');
            const estLower = String(estadoTexto).toLowerCase().trim();
            if (estLower.includes('resuel') || estLower.includes('resue')) {
                estadoTexto = 'Resuelta';
            } else if (estLower.includes('cancel')) {
                estadoTexto = 'Cancelada';
            } else if (estLower.includes('proceso')) {
                estadoTexto = 'En Proceso';
            } else if (estLower.includes('pend')) {
                estadoTexto = 'Pendiente';
            }

            const badgeEstado = `<span class="badge ${claseBadgeEstado(estadoTexto)}">${estadoTexto}</span>`;
            const prioridadTexto = formatearPrioridad(inc.prioridad);
            const badgePrioridad = `<span class="badge ${claseBadgePrioridad(prioridadTexto)}">${prioridadTexto}</span>`;

            let accion = '<span style="color: #999;">—</span>';
            const estadoNormalizado = estLower;
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
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${descripcionPedido}">${descripcionPedido}</td>
                <td>${badgePrioridad}</td>
                <td>${badgeEstado}</td>
                <td>${accion}</td>
            `;

            const btnFinalizar = row.querySelector('.btn-finalize-incident');
            if (btnFinalizar) {
                btnFinalizar.addEventListener('click', async () => {
                    const resolucion = await window.PortalUI.prompt({
                        title: `Finalizar Incidencia ${codigo}`,
                        label: 'Ingrese la descripción de la resolución (opcional):',
                        placeholder: 'Escribí un comentario sobre la resolución...',
                        confirmText: 'Finalizar',
                        cancelText: 'Cancelar'
                    });
                    if (resolucion === null) return;
                    await cambiarEstadoIncidencia(inc.id_incidencia, 3, resolucion);
                });
            }

            const btnCancelar = row.querySelector('.btn-cancelar-incidencia');
            if (btnCancelar) {
                btnCancelar.addEventListener('click', async () => {
                    const confirmar = await window.PortalUI.confirm({
                        title: `Cancelar Incidencia ${codigo}`,
                        message: `¿Estás seguro de que deseas cancelar la incidencia ${codigo}?`,
                        confirmText: 'Sí, cancelar',
                        cancelText: 'Volver',
                        danger: true
                    });
                    if (confirmar) {
                        await cambiarEstadoIncidencia(inc.id_incidencia, 4, 'Cancelada por el usuario');
                    }
                });
            }

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar incidencias:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al conectar con el servidor.</td></tr>';
    }
}

async function cambiarEstadoIncidencia(id, id_estado, descripcion_resolucion = '') {
    try {
        const res = await fetch(`${API_BASE}/incidencias/${id}/estado`, {
            method: 'PATCH',
            headers: window.PortalAuth ? window.PortalAuth.authHeaders({ 'Content-Type': 'application/json' }) : { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_estado, descripcion_resolucion })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al actualizar el estado');
        }

        await cargarIncidencias();
    } catch (error) {
        await window.PortalUI.alert({
            title: 'Error',
            message: 'Error al actualizar la incidencia: ' + error.message,
            type: 'error'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarIncidencias();
});