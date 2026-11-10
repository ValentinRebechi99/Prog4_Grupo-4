import {pool} from '../src/config/bd.js';

export default class ArticulosRepository {

    buscarTodos = async () => {
        try {
            const query = `
                SELECT 
                    a.id_articulo, 
                    a.descripcion, 
                    a.activo,
                    a.id_categoria,
                    a.id_area,
                    c.descripcion AS categoria_nombre,
                    ar.descripcion AS area_nombre
                FROM articulos a
                LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
                LEFT JOIN areas ar ON a.id_area = ar.id_area
                WHERE a.activo = 1
                ORDER BY a.id_articulo ASC
            `;
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('--- ERROR EN REPOSITORIO ARTICULOS ---', error);
            throw error;
        }
    }

    buscarPorId = async (id_articulo) => {
        const query = 'SELECT * FROM articulos WHERE id_articulo = $1 AND activo = 1';
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

    // 2. HACER EL BORRADO LÓGICO (SOFT DELETE) CAMBIANDO A 0
    borrar = async (id_articulo) => {
        const query = `
            UPDATE articulos 
            SET activo = 0 
            WHERE id_articulo = $1 AND activo = 1 
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id_articulo]);
        return rows[0] || null; // Si ya estaba borrado, devuelve null y el sistema manejará el 404 correctamente
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
}