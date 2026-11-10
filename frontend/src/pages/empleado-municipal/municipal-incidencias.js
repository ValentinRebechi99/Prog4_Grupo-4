// ====================================
// EMPLEADO MUNICIPAL - INCIDENCIAS
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

// ========== NAVEGACIÓN DE SECCIONES (CREAR vs LISTADO) ==========
function cambiarSeccionMunicipal(seccionId) {
    const secCreate = document.getElementById('create-incident');
    const secIncidents = document.getElementById('incidents');
    const menuCreate = document.getElementById('menu-create-incident');
    const menuIncidents = document.getElementById('menu-incidents');

    if (seccionId === 'create-incident') {
        if (secCreate) secCreate.classList.add('active');
        if (secIncidents) secIncidents.classList.remove('active');
        if (menuCreate) menuCreate.classList.add('active');
        if (menuIncidents) menuIncidents.classList.remove('active');
    } else {
        if (secCreate) secCreate.classList.remove('active');
        if (secIncidents) secIncidents.classList.add('active');
        if (menuCreate) menuCreate.classList.remove('active');
        if (menuIncidents) menuIncidents.classList.add('active');
    }
}

function setupNavegacion() {
    const menuCreate = document.getElementById('menu-create-incident');
    const menuIncidents = document.getElementById('menu-incidents');
    const btnCancel = document.getElementById('btn-cancel-incident');

    if (menuCreate) {
        menuCreate.addEventListener('click', (e) => {
            e.preventDefault();
            cambiarSeccionMunicipal('create-incident');
            window.location.hash = 'create-incident';
        });
    }

    if (menuIncidents) {
        menuIncidents.addEventListener('click', (e) => {
            e.preventDefault();
            cambiarSeccionMunicipal('incidents');
            window.location.hash = 'incidents';
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            cambiarSeccionMunicipal('incidents');
            window.location.hash = 'incidents';
        });
    }

    // Hash check
    if (window.location.hash === '#create-incident') {
        cambiarSeccionMunicipal('create-incident');
    } else {
        cambiarSeccionMunicipal('incidents');
    }

    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#create-incident') {
            cambiarSeccionMunicipal('create-incident');
        } else {
            cambiarSeccionMunicipal('incidents');
        }
    });
}

// ========== ARTÍCULOS PARA SELECT ==========
async function cargarArticulosSelect() {
    const select = document.getElementById('incident-article');
    if (!select) return;

    try {
        const res = await fetch(`${API_BASE}/articulos`, {
            headers: window.PortalAuth?.authHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener artículos');
        const articulos = await res.json();

        select.innerHTML = '<option value="">Selecciona un artículo</option>';
        articulos.forEach((art) => {
            const opt = document.createElement('option');
            opt.value = art.id_articulo;
            const desc = art.descripcion_articulo || art.descripcion || `Artículo #${art.id_articulo}`;
            const area = art.area_nombre ? ` (${art.area_nombre})` : '';
            opt.textContent = `${desc}${area}`;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error('Error al cargar artículos en select:', error);
    }
}

// ========== CREAR INCIDENCIA ==========
function setupFormularioIncidencia() {
    const form = document.getElementById('create-incident-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id_articulo = document.getElementById('incident-article').value;
        const descripcion_pedido = document.getElementById('incident-description').value;
        const prioridadTexto = document.getElementById('incident-priority').value;

        let prioridad = 2; // Media por defecto
        if (prioridadTexto === 'Alta') prioridad = 1;
        else if (prioridadTexto === 'Baja') prioridad = 3;

        try {
            const res = await fetch(`${API_BASE}/incidencias`, {
                method: 'POST',
                headers: window.PortalAuth ? window.PortalAuth.authHeaders({ 'Content-Type': 'application/json' }) : { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_articulo,
                    descripcion_pedido,
                    prioridad
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error al crear la incidencia');
            }

            form.reset();
            cambiarSeccionMunicipal('incidents');
            window.location.hash = 'incidents';
            await cargarIncidencias();
            await window.PortalUI.alert({
                title: 'Incidencia creada',
                message: 'Incidencia creada con éxito.',
                type: 'success'
            });
        } catch (error) {
            await window.PortalUI.alert({
                title: 'Error al registrar',
                message: 'Error al registrar incidencia: ' + error.message,
                type: 'error'
            });
        }
    });
}

// ========== CARGAR TABLA DE INCIDENCIAS ==========
async function cargarIncidencias() {
    const tbody = document.getElementById('incidents-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/incidencias`, {
            headers: window.PortalAuth?.authHeaders()
        });
        if (!res.ok) throw new Error('Error al obtener incidencias');
        const incidencias = await res.json();

        tbody.innerHTML = '';
        if (incidencias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No hay incidencias registradas.</td></tr>';
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

            if (esPendiente) {
                accion = `
                    <button type="button" class="btn-action btn-cancel-incident btn-cancelar-incidencia">Cancelar</button>
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
                        await cancelarIncidencia(inc.id_incidencia);
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

async function cancelarIncidencia(id) {
    try {
        const res = await fetch(`${API_BASE}/incidencias/${id}/estado`, {
            method: 'PATCH',
            headers: window.PortalAuth ? window.PortalAuth.authHeaders({ 'Content-Type': 'application/json' }) : { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_estado: 4, descripcion_resolucion: 'Cancelada por el usuario' })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al cancelar la incidencia');
        }

        await cargarIncidencias();
    } catch (error) {
        await window.PortalUI.alert({
            title: 'Error',
            message: 'Error al cancelar incidencia: ' + error.message,
            type: 'error'
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    setupNavegacion();
    setupFormularioIncidencia();
    await cargarArticulosSelect();
    await cargarIncidencias();
});

