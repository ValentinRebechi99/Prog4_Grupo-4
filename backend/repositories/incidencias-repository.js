import { pool } from '../src/config/bd.js';

const INCIDENCIA_SELECT = `
    SELECT 
        i.id_incidencia,
        i.id_articulo,
        a.descripcion AS articulo_descripcion,
        i.descripcion_pedido,
        i.descripcion_resolucion,
        i.prioridad,
        e.descripcion AS estado,
        i.id_estado,
        i.creado AS fecha_creacion,
        i.creado_por,
        i.asignado_a,
        NULLIF(TRIM(CONCAT_WS(' ', uc.nombres, uc.apellidos)), '') AS creado_por_nombre,
        NULLIF(TRIM(CONCAT_WS(' ', ua.nombres, ua.apellidos)), '') AS asignado_a_nombre
    FROM incidencias i
    LEFT JOIN articulos a ON i.id_articulo = a.id_articulo
    LEFT JOIN estados e ON i.id_estado = e.id_estado
    LEFT JOIN usuarios uc ON i.creado_por = uc.id_usuario
    LEFT JOIN usuarios ua ON i.asignado_a = ua.id_usuario
`;

export default class IncidenciasDatos {
    buscarTodos = async ({ asignado_a } = {}) => {
        if (asignado_a !== undefined && asignado_a !== null) {
            const query = `${INCIDENCIA_SELECT} WHERE i.asignado_a = $1 ORDER BY i.creado DESC`;
            const { rows } = await pool.query(query, [asignado_a]);
            return rows;
        }
        const query = `${INCIDENCIA_SELECT} ORDER BY i.creado DESC`;
        const { rows } = await pool.query(query);
        return rows;
    };

    buscarPorId = async (id) => {
        const query = `${INCIDENCIA_SELECT} WHERE i.id_incidencia = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    };

    buscarEstadoActual = async (id) => {
        const query = 'SELECT id_incidencia, id_estado, asignado_a FROM incidencias WHERE id_incidencia = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    };

    crear = async ({ id_articulo, descripcion_pedido, prioridad, creado_por, asignado_a }) => {
        const query = `
            INSERT INTO incidencias (id_articulo, id_estado, creado_por, asignado_a, prioridad, descripcion_pedido, descripcion_resolucion)
            VALUES ($1, 1, $2, $3, $4, $5, '')
            RETURNING *
        `;
        const values = [
            id_articulo,
            creado_por || 1,
            asignado_a || null,
            prioridad || 1,
            String(descripcion_pedido).trim()
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    };

    editar = async (id, { descripcion_pedido, prioridad }) => {
        const query = `
            UPDATE incidencias
            SET descripcion_pedido = $1,
                prioridad = COALESCE($2, prioridad)
            WHERE id_incidencia = $3
            RETURNING *
        `;
        const { rows } = await pool.query(query, [
            String(descripcion_pedido).trim(),
            prioridad || null,
            id
        ]);
        return rows[0] || null;
    };

    cambiarEstado = async (id, { id_estado, descripcion_resolucion, asignado_a }) => {
        const query = `
            UPDATE incidencias
            SET id_estado = $1,
                descripcion_resolucion = COALESCE($2, descripcion_resolucion),
                asignado_a = COALESCE($3, asignado_a)
            WHERE id_incidencia = $4
            RETURNING *
        `;
        const { rows } = await pool.query(query, [
            id_estado,
            descripcion_resolucion || null,
            asignado_a || null,
            id
        ]);
        return rows[0] || null;
    };
}
