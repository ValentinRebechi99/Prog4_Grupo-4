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

// ========== GENERAR REPORTE PDF DE INCIDENCIA RESUELTA ==========
function descargarReporteIncidenciaPDF(inc) {
    const ventanaImpresion = window.open('', '_blank');
    
    const codigo = `#${inc.id_incidencia || 'N/D'}`;
    const fecha = formatearFecha(inc.fecha_creacion);
    const articulo = inc.articulo_descripcion || (inc.id_articulo ? `Artículo #${inc.id_articulo}` : 'Sin artículo');
    const prioridad = formatearPrioridad(inc.prioridad);
    const empleadoAsignado = inc.asignado_a_nombre || 'Personal de Sistemas';
    const descripcionPedido = inc.descripcion_pedido || inc.descripcion || 'Sin descripción registrada.';
    const descripcionResolucion = inc.descripcion_resolucion || inc.resolucion || 'Incidencia finalizada correctamente.';

    const contenidoHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Incidencia Resuelta ${codigo}</title>
            <style>
                body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f6f9; }
                .report-container { max-width: 750px; margin: auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
                .header h1 { font-size: 22px; color: #0056b3; margin: 0; }
                .header span { font-size: 14px; color: #666; }
                .section-title { font-size: 16px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; }
                .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
                .info-group label { font-size: 12px; color: #777; display: block; margin-bottom: 3px; text-transform: uppercase; }
                .info-group p { font-size: 14px; font-weight: bold; color: #222; margin: 0; }
                .text-box { background: #f9fbfd; border: 1px solid #e1e8ed; padding: 12px 15px; border-radius: 6px; font-size: 14px; line-height: 1.5; color: #444; margin-bottom: 15px; }
                .badge-resuelto { display: inline-block; background-color: #d4edda; color: #155724; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: bold; }
                @media print { body { background: none; padding: 0; } .report-container { box-shadow: none; padding: 0; } .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="header">
                    <div>
                        <h1>Comprobante de Resolución Técnica</h1>
                        <span>Sistema de Gestión de Incidencias Municipales</span>
                    </div>
                    <div>
                        <span class="badge-resuelto">RESUELTA</span>
                    </div>
                </div>

                <div class="section-title">Información General</div>
                <div class="grid-info">
                    <div class="info-group">
                        <label>Código de Incidencia</label>
                        <p>${codigo}</p>
                    </div>
                    <div class="info-group">
                        <label>Fecha de Registro</label>
                        <p>${fecha}</p>
                    </div>
                    <div class="info-group">
                        <label>Artículo / Equipamiento</label>
                        <p>${articulo}</p>
                    </div>
                    <div class="info-group">
                        <label>Nivel de Prioridad</label>
                        <p>${prioridad}</p>
                    </div>
                </div>

                <div class="section-title">Detalle del Pedido Inicial</div>
                <div class="text-box">${descripcionPedido}</div>

                <div class="section-title">Informe de Resolución</div>
                <div class="grid-info">
                    <div class="info-group" style="grid-column: span 2;">
                        <label>Técnico / Empleado Asignado</label>
                        <p>${empleadoAsignado}</p>
                    </div>
                </div>
                <div class="text-box" style="background-color: #f0fff4; border-color: #c3e6cb;">
                    <strong style="color: #155724; display:block; margin-bottom:5px;">Comentarios de cierre:</strong>
                    ${descripcionResolucion}
                </div>

                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="background-color: #0056b3; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-size: 14px; cursor: pointer;">Imprimir / Guardar como PDF</button>
                </div>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(() => { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `;

    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
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
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error al conectar con el servidor.</td></tr>';
    }
}

function renderizarTabla(lista) {
    const tbody = document.querySelector('#reportes-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">No se encontraron incidencias con los filtros aplicados.</td></tr>';
        return;
    }

    lista.forEach((inc) => {
        const codigo = `#${inc.id_incidencia}`;
        const fecha = formatearFecha(inc.fecha_creacion);
        const articulo = inc.articulo_descripcion || (inc.id_articulo ? `Artículo #${inc.id_articulo}` : 'Sin artículo');
        
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
        
        const esResuelta = inc.id_estado === 3 || estLower.includes('resuel') || estLower.includes('resue');
        let accionHtml = '<span style="color: #999;">—</span>';
        if (esResuelta) {
            accionHtml = `<button type="button" class="btn-action btn-pdf" style="background-color: #17a2b8; color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer;">Descargar PDF</button>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${codigo}</td>
            <td>${fecha}</td>
            <td>${articulo}</td>
            <td>${badgePrioridad}</td>
            <td>${badgeEstado}</td>
            <td class="td-empleado"></td>
            <td class="td-accion">${accionHtml}</td>
        `;

        const tdEmpleado = row.querySelector('.td-empleado');
        if (inc.asignado_a_nombre) {
            tdEmpleado.textContent = inc.asignado_a_nombre;
        } else {
            tdEmpleado.innerHTML = '<span style="color: #dc3545; font-weight: 600;">Sin Asignar</span>';
        }

        const btnPdf = row.querySelector('.btn-pdf');
        if (btnPdf) {
            btnPdf.addEventListener('click', () => {
                descargarReporteIncidenciaPDF(inc);
            });
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
        if (filterCodigo) {
            const cod = String(inc.id_incidencia).toLowerCase();
            if (!cod.includes(filterCodigo.replace('#', ''))) return false;
        }

        if (filterFecha && inc.fecha_creacion) {
            const fechaInc = new Date(inc.fecha_creacion).toISOString().split('T')[0];
            if (fechaInc !== filterFecha) return false;
        }

        if (filterArticulo) {
            const artDesc = (inc.articulo_descripcion || '').toLowerCase();
            if (!artDesc.includes(filterArticulo)) return false;
        }

        if (filterPrioridad) {
            const prio = formatearPrioridad(inc.prioridad).toLowerCase();
            if (prio !== filterPrioridad) return false;
        }

        if (filterEstado) {
            let estNorm = (inc.estado || inc.descripcion_estado || '').toLowerCase();
            if (estNorm.includes('resue') || estNorm.includes('resuel')) estNorm = 'resuelta';
            if (estNorm.includes('cancel')) estNorm = 'cancelada';
            if (estNorm.includes('proceso')) estNorm = 'en proceso';
            if (estNorm.includes('pend')) estNorm = 'pendiente';

            let filtroNorm = filterEstado;
            if (filtroNorm.includes('resue') || filtroNorm.includes('resuel')) filtroNorm = 'resuelta';
            if (filtroNorm.includes('cancel')) filtroNorm = 'cancelada';
            if (filtroNorm.includes('proceso')) filtroNorm = 'en proceso';
            if (filtroNorm.includes('pend')) filtroNorm = 'pendiente';

            if (!estNorm.includes(filtroNorm)) return false;
        }

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