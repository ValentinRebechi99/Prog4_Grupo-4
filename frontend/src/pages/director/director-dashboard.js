// ====================================
// DIRECTOR - DASHBOARD
// ====================================

const API_BASE = 'http://localhost:3000/api';

async function actualizarEstadisticas() {
    try {
        const res = await fetch(`${API_BASE}/incidencias`);
        if (!res.ok) throw new Error('Error al obtener incidencias');
        const incidencias = await res.json();

        // Estados
        let pendientes = 0;
        let proceso = 0;
        let resueltas = 0;
        let canceladas = 0;

        // Fechas
        const ahora = new Date();
        const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
        const hace7Dias = hoyInicio - (7 * 24 * 60 * 60 * 1000);
        let hoyCount = 0;
        let semanaCount = 0;
        let mesCount = 0;

        // Prioridades
        let criticas = 0;
        let altas = 0;
        let medias = 0;
        let bajas = 0;

        incidencias.forEach((inc) => {
            // Estado
            const idEstado = Number(inc.id_estado);
            const estTexto = (inc.estado || '').toLowerCase().trim();
            if (idEstado === 1 || estTexto === 'pendiente') pendientes++;
            else if (idEstado === 2 || estTexto === 'en proceso') proceso++;
            else if (idEstado === 3 || estTexto.startsWith('resuelt')) resueltas++;
            else if (idEstado === 4 || estTexto.startsWith('cancelad')) canceladas++;
            else pendientes++;

            // Fecha
            if (inc.fecha_creacion) {
                const f = new Date(inc.fecha_creacion);
                const t = f.getTime();
                if (t >= hoyInicio) hoyCount++;
                if (t >= hace7Dias) semanaCount++;
                if (f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear()) mesCount++;
            }

            // Prioridad
            const prio = String(inc.prioridad || '').trim().toLowerCase();
            if (prio === 'crítica' || prio === 'critica') criticas++;
            else if (prio === 'alta' || prio === '1') altas++;
            else if (prio === 'media' || prio === '2') medias++;
            else if (prio === 'baja' || prio === '3') bajas++;
            else medias++;
        });

        // Actualizar DOM
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setVal('stat-pendientes', pendientes);
        setVal('stat-proceso', proceso);
        setVal('stat-resueltas', resueltas);
        setVal('stat-canceladas', canceladas);

        setVal('stat-hoy', hoyCount);
        setVal('stat-semana', semanaCount);
        setVal('stat-mes', mesCount);
        setVal('stat-total', incidencias.length);

        setVal('stat-criticas', criticas);
        setVal('stat-altas', altas);
        setVal('stat-medias', medias);
        setVal('stat-bajas', bajas);
    } catch (error) {
        console.error('Error al actualizar estadísticas del dashboard:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarEstadisticas();
});

