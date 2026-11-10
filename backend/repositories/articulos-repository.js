import { pool } from '../src/config/bd.js';

export default class ArticulosDatos {

    buscarTodos = async () => {
        const query = `
            SELECT 
                a.id_articulo, 
                a.descripcion, 
                a.id_area, 
                ar.descripcion AS area_nombre,
                a.id_categoria, 
                c.descripcion AS categoria_nombre,
                a.activo
            FROM articulos a
            LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
            LEFT JOIN areas ar ON a.id_area = ar.id_area
            WHERE a.activo = 1
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    buscarPorId = async (id_articulo) => {
        const query = `
            SELECT 
                a.id_articulo, 
                a.descripcion, 
                a.id_area, 
                ar.descripcion AS area_nombre,
                a.id_categoria, 
                c.descripcion AS categoria_nombre,
                a.activo
            FROM articulos a
            LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
            LEFT JOIN areas ar ON a.id_area = ar.id_area
            WHERE a.id_articulo = $1 AND a.activo = 1
        `;
        const { rows } = await pool.query(query, [id_articulo]);
        return rows[0] || null; 
    }

    crear = async (articulo) => {
        const query = `
            INSERT INTO articulos (id_area, id_categoria, descripcion, activo) 
            VALUES ($1, $2, $3, 1) 
            RETURNING *
        `;
        const values = [articulo.id_area, articulo.id_categoria, articulo.descripcion];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    editar = async (id_articulo, articulo) => {
        const query = `
            UPDATE articulos 
            SET id_area = $1, id_categoria = $2, descripcion = $3 
            WHERE id_articulo = $4 AND activo = 1 
            RETURNING *
        `;
        const values = [articulo.id_area, articulo.id_categoria, articulo.descripcion, id_articulo];
        const { rows } = await pool.query(query, values);
        return rows[0] || null;
    }

    borrar = async (id_articulo) => {
        const query = `
            UPDATE articulos 
            SET activo = 0 
            WHERE id_articulo = $1 
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id_articulo]);
        return rows[0] || null;
    }
}