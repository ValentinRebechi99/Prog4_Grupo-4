import IncidenciasDatos from '../repositories/incidencias-repository.js';

export default class IncidenciasServicio {
    constructor() {
        this.incidencias = new IncidenciasDatos();
    }

    buscarTodos = (filtros) => {
        return this.incidencias.buscarTodos(filtros);
    };

    buscarPorId = (id) => {
        return this.incidencias.buscarPorId(id);
    };

    crear = (datos) => {
        return this.incidencias.crear(datos);
    };

    editar = (id, datos) => {
        return this.incidencias.editar(id, datos);
    };

    cambiarEstado = async (id, { id_estado, descripcion_resolucion, asignado_a }) => {
        const incidenciaActual = await this.incidencias.buscarEstadoActual(id);
        if (!incidenciaActual) {
            return { status: 404, error: 'Incidencia no encontrada' };
        }

        // Solo se permite cancelar (id_estado = 4) cuando está Pendiente (id_estado = 1)
        if (Number(id_estado) === 4 && Number(incidenciaActual.id_estado) !== 1) {
            return {
                status: 400,
                error: 'Solo se puede cancelar una incidencia cuando su estado es Pendiente'
            };
        }

        const incidencia = await this.incidencias.cambiarEstado(id, {
            id_estado,
            descripcion_resolucion,
            asignado_a
        });
        if (!incidencia) {
            return { status: 404, error: 'Incidencia no encontrada' };
        }
        return { status: 200, data: incidencia };
    };
}
