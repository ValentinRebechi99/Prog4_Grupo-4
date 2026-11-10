import IncidenciasServicio from '../services/incidencias-service.js';

export default class IncidenciasControlador {
    constructor() {
        this.incidencias = new IncidenciasServicio();
    }

    buscarTodos = async (req, res) => {
        try {
            const filtros = {};
            if (Number(req.usuario?.rol) === 2) {
                filtros.asignado_a = Number(req.usuario.id_usuario);
            } else if (req.query.asignado_a) {
                filtros.asignado_a = Number(req.query.asignado_a);
            }

            const rows = await this.incidencias.buscarTodos(filtros);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error en GET /api/incidencias:', error);
            res.status(500).json({ error: 'Error al obtener las incidencias' });
        }
    };

    buscarPorId = async (req, res) => {
        try {
            const incidencia = await this.incidencias.buscarPorId(req.params.id);
            if (!incidencia) {
                return res.status(404).json({ error: 'Incidencia no encontrada' });
            }
            res.status(200).json(incidencia);
        } catch (error) {
            console.error('Error en GET /api/incidencias/:id:', error);
            res.status(500).json({ error: 'Error al consultar la incidencia' });
        }
    };

    crear = async (req, res) => {
        try {
            const { id_articulo, descripcion_pedido, prioridad, creado_por, asignado_a } = req.body;
            if (!id_articulo || !descripcion_pedido || !String(descripcion_pedido).trim()) {
                return res.status(400).json({ error: 'id_articulo y descripcion_pedido son obligatorios' });
            }

            const incidencia = await this.incidencias.crear({
                id_articulo,
                descripcion_pedido,
                prioridad,
                creado_por: req.usuario?.id_usuario || creado_por || 1,
                asignado_a: asignado_a || null
            });
            res.status(201).json(incidencia);
        } catch (error) {
            console.error('Error en POST /api/incidencias:', error);
            res.status(500).json({ error: 'Error al crear la incidencia' });
        }
    };

    editar = async (req, res) => {
        try {
            const { descripcion_pedido, prioridad } = req.body;
            if (!descripcion_pedido || !String(descripcion_pedido).trim()) {
                return res.status(400).json({ error: 'La descripción del pedido es obligatoria' });
            }

            const incidencia = await this.incidencias.editar(req.params.id, {
                descripcion_pedido,
                prioridad
            });
            if (!incidencia) {
                return res.status(404).json({ error: 'Incidencia no encontrada' });
            }
            res.status(200).json(incidencia);
        } catch (error) {
            console.error('Error en PUT /api/incidencias/:id:', error);
            res.status(500).json({ error: 'Error al actualizar la incidencia' });
        }
    };

    cambiarEstado = async (req, res) => {
        try {
            const { id_estado, descripcion_resolucion, asignado_a } = req.body;
            if (!id_estado) {
                return res.status(400).json({ error: 'id_estado es obligatorio' });
            }

            const resultado = await this.incidencias.cambiarEstado(req.params.id, {
                id_estado,
                descripcion_resolucion,
                asignado_a
            });
            if (resultado.error) {
                return res.status(resultado.status).json({ error: resultado.error });
            }
            res.status(200).json(resultado.data);
        } catch (error) {
            console.error('Error en PATCH /api/incidencias/:id/estado:', error);
            res.status(500).json({ error: 'Error al cambiar el estado de la incidencia' });
        }
    };
}
