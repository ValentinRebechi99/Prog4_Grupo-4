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


    async createIncidencia({ id_articulo, descripcion, prioridad }) {
        const res = await fetch(INCIDENCIAS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_articulo, descripcion, prioridad })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al crear la incidencia');
        }
        return await res.json();
    }


    async updateIncidencia(id, { descripcion, prioridad }) {
        const res = await fetch(`${INCIDENCIAS_API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion, prioridad })
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
    const mapa = {
        'Pendiente': 'badge-pendiente',
        'En Proceso': 'badge-en-proceso',
        'Resuelto': 'badge-resuelto',
        'Cancelado': 'badge-cancelado'
    };
    return mapa[estado] || '';
}

function claseBadgePrioridad(prioridad) {
    const mapa = {
        'Crítica': 'badge-crítica',
        'Alta': 'badge-alta',
        'Media': 'badge-media',
        'Baja': 'badge-baja'
    };
    return mapa[prioridad] || '';
}