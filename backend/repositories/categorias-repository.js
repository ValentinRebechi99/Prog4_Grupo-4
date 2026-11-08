import { pool } from '../src/config/bd.js';
export default class CategoriasDatos {

    buscarPorId = async (id_categoria) => {
        const sql = `SELECT id_categoria, descripcion 
                    FROM categorias as c             
                    WHERE c.activo = 1 AND c.id_categoria = $1
                    ORDER BY c.descripcion ASC;`;

        const {rowCount, rows} = await pool.query(sql, [id_categoria]);

        if (rowCount === 0) {
            return null;
        }
        return rows[0];
    }

    buscarTodos = async () => {
        const sql = `SELECT id_categoria, descripcion 
                    FROM categorias as c             
                    WHERE c.activo = 1
                    ORDER BY c.descripcion ASC;`;

        const {rowCount, rows} = await pool.query(sql);

        if (rowCount === 0) {
            return null;
        }
        return rows;
    }

    crear = async (categoria) => {
        const { descripcion } = categoria;    

        const sql = `INSERT INTO categorias (descripcion, activo) 
                    VALUES ($1, 1)
                    RETURNING *;`;
                    
        const result = await pool.query(sql, [descripcion]); 
        
        if (result.rowCount === 0) {
            return null;
        }
        return result.rows[0];
    }

    borrar = async (id_categoria) => {
        const sql = `UPDATE categorias 
                    SET activo = 0 
                    WHERE id_categoria = $1;`;

        const result = await pool.query(sql, [id_categoria]);
        
        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    }

    editar = async (categoria) => {
        const { id_categoria, descripcion } = categoria;    
        const sql = `UPDATE categorias 
                    SET descripcion = $1 
                    WHERE id_categoria = $2 AND activo = 1
                    RETURNING *;`;

        const result = await pool.query(sql, [descripcion, id_categoria]);
        
        if (result.rowCount === 0) {
            return null;
        }
        return result.rows[0];
    }
}