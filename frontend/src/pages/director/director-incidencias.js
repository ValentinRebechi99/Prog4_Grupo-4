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
        4: 'badge-cancelada'
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

async function cargarEmpleadosSistemas() {
    const select = document.getElementById('empleado-select');
    if (!select) return;

    try {
        const res = await fetch(`${API_BASE}/usuarios?rol=2`, {
            headers: window.PortalAuth?.authHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener empleados de sistemas');
        const empleados = await res.json();

        select.innerHTML = '<option value="">Seleccione un empleado...</option>';
        empleados.forEach((emp) => {
            const opt = document.createElement('option');
            opt.value = emp.id_usuario;
            opt.textContent = `${emp.nombres} ${emp.apellidos}`.trim();
            select.appendChild(opt);
        });
    } catch (error) {
        console.error('Error al cargar empleados de sistemas:', error);
    }
}

async function cargarIncidencias() {
    const tbody = document.querySelector('#incidencias-table tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/incidencias`, {
            headers: window.PortalAuth?.authHeaders()
        });
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
            
            // Limpieza y normalización de estados
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

            // Verificamos si está habilitado para asignar (solo si está pendiente)
            const estaDeshabilitadoAsignar = inc.id_estado !== 1 && estLower !== 'pendiente';

            const botonAsignarHTML = estaDeshabilitadoAsignar 
                ? `<button type="button" class="btn-action" style="background-color: #ccc; color: #666; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: not-allowed;" disabled>Asignar</button>`
                : `<button type="button" class="btn-action btn-asignar" style="background-color: #0084d1; color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer;">Asignar</button>`;

            // Botón de cancelar visible y activo únicamente si la incidencia está Pendiente
            const esPendiente = inc.id_estado === 1 || estLower === 'pendiente';
            const botonCancelarHTML = esPendiente
                ? `<button type="button" class="btn-action btn-cancelar-inc" style="background-color: #dc3545; color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer; margin-left: 5px;">Cancelar</button>`
                : '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${codigo}</td>
                <td>${articulo}</td>
                <td>${badgePrioridad}</td>
                <td>${badgeEstado}</td>
                <td class="td-empleado"></td>
                <td>
                    <div style="display: flex; gap: 4px; align-items: center;">
                        ${botonAsignarHTML}
                        ${botonCancelarHTML}
                    </div>
                </td>
            `;

            const tdEmpleado = row.querySelector('.td-empleado');
            if (inc.asignado_a_nombre) {
                tdEmpleado.textContent = inc.asignado_a_nombre;
            } else {
                tdEmpleado.innerHTML = '<span style="color: #dc3545; font-weight: 600;">Sin Asignar</span>';
            }

            // Evento para Asignar
            if (!estaDeshabilitadoAsignar) {
                const btnAsignar = row.querySelector('.btn-asignar');
                if (btnAsignar) {
                    btnAsignar.addEventListener('click', () => {
                        abrirModalAsignar(inc.id_incidencia, inc.asignado_a);
                    });
                }
            }

            // Evento para Cancelar incidencia Pendiente
            if (esPendiente) {
                const btnCancelarInc = row.querySelector('.btn-cancelar-inc');
                if (btnCancelarInc) {
                    btnCancelarInc.addEventListener('click', () => {
                        confirmarCancelacionIncidencia(inc.id_incidencia);
                    });
                }
            }

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar incidencias:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al conectar con el servidor.</td></tr>';
    }
}

async function confirmarCancelacionIncidencia(idIncidencia) {
    const confirmacion = await window.PortalUI.confirm ? await window.PortalUI.confirm({
        title: 'Cancelar Incidencia',
        message: `¿Estás seguro de que deseas cancelar la incidencia #${idIncidencia}?`,
        type: 'warning'
    }) : confirm(`¿Estás seguro de que deseas cancelar la incidencia #${idIncidencia}?`);

    if (!confirmacion) return;

    try {
        const res = await fetch(`${API_BASE}/incidencias/${idIncidencia}/estado`, {
            method: 'PATCH',
            headers: window.PortalAuth ? window.PortalAuth.authHeaders({ 'Content-Type': 'application/json' }) : { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_estado: 4, // Estado 4 = Cancelada
                descripcion_resolucion: 'Incidencia cancelada por el Director'
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al cancelar la incidencia');
        }

        await cargarIncidencias();
        if (window.PortalUI?.alert) {
            await window.PortalUI.alert({
                title: 'Incidencia Cancelada',
                message: 'La incidencia ha sido cancelada exitosamente.',
                type: 'success'
            });
        }
    } catch (error) {
        if (window.PortalUI?.alert) {
            await window.PortalUI.alert({
                title: 'Error',
                message: 'No se pudo cancelar la incidencia: ' + error.message,
                type: 'error'
            });
        } else {
            alert('Error: ' + error.message);
        }
    }
}

function abrirModalAsignar(id, asignadoA = '') {
    incidenciaSeleccionadaId = id;
    const select = document.getElementById('empleado-select');
    if (select) {
        select.value = asignadoA ? String(asignadoA) : '';
    }
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
                await window.PortalUI.alert({
                    title: 'Selección requerida',
                    message: 'Por favor seleccione un empleado.',
                    type: 'warning'
                });
                return;
            }
            const empleadoNombre = select.options[select.selectedIndex]?.textContent || `empleado ${empleadoVal}`;

            try {
                const res = await fetch(`${API_BASE}/incidencias/${incidenciaSeleccionadaId}/estado`, {
                    method: 'PATCH',
                    headers: window.PortalAuth ? window.PortalAuth.authHeaders({ 'Content-Type': 'application/json' }) : { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_estado: 2, // En Proceso
                        asignado_a: Number(empleadoVal),
                        descripcion_resolucion: `Asignado a ${empleadoNombre}`
                    })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Error al asignar');
                }

                cerrarModalAsignar();
                await cargarIncidencias();
                await window.PortalUI.alert({
                    title: 'Asignación completada',
                    message: 'Incidencia asignada correctamente.',
                    type: 'success'
                });
            } catch (error) {
                await window.PortalUI.alert({
                    title: 'Error al asignar',
                    message: 'Error al asignar incidencia: ' + error.message,
                    type: 'error'
                });
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupModal();
    cargarEmpleadosSistemas();
    cargarIncidencias();
});