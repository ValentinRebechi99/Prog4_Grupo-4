const INCIDENCIAS_API_URL = 'http://localhost:3000/api/incidencias';

class IncidenciasManager {
    async getIncidencias() {
        try {
            const res = await fetch(INCIDENCIAS_API_URL);
            if (!res.ok) throw new Error('Error al obtener las incidencias');
            return await res.json();
        } catch (error) {
            console.error('Error en getIncidencias:', error);
            return [];
        }
    }

    async getIncidenciaById(id) {
        const res = await fetch(`${INCIDENCIAS_API_URL}/${id}`);
        if (!res.ok) throw new Error('Incidencia no encontrada');
        return await res.json();
    }


    async createIncidencia({ id_articulo, descripcion, descripcion_pedido, prioridad }) {
        const desc = (descripcion_pedido || descripcion || '').trim();
        const res = await fetch(INCIDENCIAS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_articulo,
                descripcion_pedido: desc,
                descripcion: desc,
                prioridad
            })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al crear la incidencia');
        }
        return await res.json();
    }


    async updateIncidencia(id, { descripcion, descripcion_pedido, prioridad }) {
        const desc = (descripcion_pedido || descripcion || '').trim();
        const res = await fetch(`${INCIDENCIAS_API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                descripcion_pedido: desc,
                descripcion: desc,
                prioridad
            })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al actualizar la incidencia');
        }
        return await res.json();
    }

    async cambiarEstado(id, estado) {
        const res = await fetch(`${INCIDENCIAS_API_URL}/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al cambiar el estado de la incidencia');
        }
        return await res.json();
    }
}

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
        'Resuela': 'badge-resuelto',
        'RESUELA': 'badge-resuelto',
        'Cancelado': 'badge-cancelado',
        'CANCELADO': 'badge-cancelado',
        'Cancelada': 'badge-cancelado',
        'CANCELADA': 'badge-cancelado',
        1: 'badge-pendiente',
        2: 'badge-en-proceso',
        3: 'badge-resuelto',
        4: 'badge-cancelado'
    };
    return mapa[est] || mapa[estado] || '';
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
    return mapa[prioridad] || '';
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