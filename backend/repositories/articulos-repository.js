import { pool } from '../src/config/bd.js';

export default class ArticulosDatos {
    buscarTodos = async () => {
        try {
            const query = 'SELECT * FROM articulos'; // Ajusta el nombre de la tabla si es distinto en tu DB
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            throw new Error(`Error al obtener artículos en la base de datos: ${error.message}`);
        }
    }
}