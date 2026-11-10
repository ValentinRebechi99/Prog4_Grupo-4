import {pool} from '../src/config/bd.js';

export default class IncidenciasDatos {

    buscarTodos = async (filtros = {}) => {
        let query = `
            SELECT 
                i.*, 
                art.descripcion AS articulo_descripcion,
                CONCAT_WS(' ', u_creador.nombres, u_creador.apellidos) AS creado_por_nombre,
                u_creador.usuario AS email_usuario,
                CONCAT_WS(' ', u_asignado.nombres, u_asignado.apellidos) AS asignado_a_nombre,
                e.descripcion AS estado
            FROM incidencias i
            LEFT JOIN articulos art ON i.id_articulo = art.id_articulo
            LEFT JOIN usuarios u_creador ON i.creado_por = u_creador.id_usuario
            LEFT JOIN usuarios u_asignado ON i.asignado_a = u_asignado.id_usuario
            LEFT JOIN estados e ON i.id_estado = e.id_estado
        `;

        const condiciones = [];
        const valores = [];

        if (filtros.asignado_a !== undefined && filtros.asignado_a !== null) {
            valores.push(filtros.asignado_a);
            condiciones.push(`i.asignado_a = $${valores.length}`);
        }

        if (filtros.creado_por !== undefined && filtros.creado_por !== null) {
            valores.push(filtros.creado_por);
            condiciones.push(`i.creado_por = $${valores.length}`);
        }

        if (condiciones.length > 0) {
            query += ` WHERE ${condiciones.join(' AND ')}`;
        }

        query += ` ORDER BY i.id_incidencia DESC`;

        const result = await pool.query(query, valores);
        return result.rows;
    };

    buscarPorId = async (id) => {
        const query = `
            SELECT 
                i.*, 
                art.descripcion AS articulo_descripcion,
                CONCAT_WS(' ', u_creador.nombres, u_creador.apellidos) AS creado_por_nombre,
                u_creador.usuario AS email_usuario, 
                CONCAT_WS(' ', u_asignado.nombres, u_asignado.apellidos) AS asignado_a_nombre,
                e.descripcion AS estado
            FROM incidencias i
            LEFT JOIN articulos art ON i.id_articulo = art.id_articulo
            LEFT JOIN usuarios u_creador ON i.creado_por = u_creador.id_usuario
            LEFT JOIN usuarios u_asignado ON i.asignado_a = u_asignado.id_usuario
            LEFT JOIN estados e ON i.id_estado = e.id_estado
            WHERE i.id_incidencia = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    };

    buscarEstadoActual = async (id) => {
        const query = `SELECT id_estado FROM incidencias WHERE id_incidencia = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    };

    crear = async (datos) => {
        const { id_articulo, descripcion_pedido, prioridad, creado_por, asignado_a } = datos;
        const query = `
            INSERT INTO incidencias (id_articulo, descripcion_pedido, prioridad, creado_por, asignado_a, id_estado, creado)
            VALUES ($1, $2, $3, $4, $5, 1, NOW())
            RETURNING *;
        `;
        const result = await pool.query(query, [id_articulo, descripcion_pedido, prioridad, creado_por, asignado_a]);
        return result.rows[0];
    };

    editar = async (id, datos) => {
        const { descripcion_pedido, prioridad } = datos;
        const query = `
            UPDATE incidencias 
            SET descripcion_pedido = $1, prioridad = $2
            WHERE id_incidencia = $3
            RETURNING *;
        `;
        const result = await pool.query(query, [descripcion_pedido, prioridad, id]);
        return result.rows[0];
    };

    cambiarEstado = async (id, datos) => {
        const { id_estado, descripcion_resolucion, asignado_a } = datos;
        const query = `
            UPDATE incidencias 
            SET id_estado = $1, 
                descripcion_resolucion = COALESCE($2, descripcion_resolucion),
                asignado_a = COALESCE($3, asignado_a)
            WHERE id_incidencia = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [id_estado, descripcion_resolucion, asignado_a, id]);
        return result.rows[0];
    };
}