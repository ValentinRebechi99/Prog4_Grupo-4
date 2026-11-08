import { pool } from '../src/config/bd.js';

export default class AreasDatos {

    buscarTodos = async () => {
        const sql = `SELECT id_area, descripcion 
                    FROM areas 
                    WHERE activo = 1 
                    ORDER BY descripcion ASC;`;

        const { rowCount, rows } = await pool.query(sql);

        if (rowCount === 0) {
            return null;
        }
        return rows;
    }
}