import { createHash } from 'node:crypto';
import { pool } from '../src/config/bd.js';

export default class UsuariosDatos {

    buscarPorUsuarioContrasenia = async (usuario, contrasenia) => {
        const contraseniaHash = createHash('sha256').update(String(contrasenia), 'utf8').digest('hex');
        const sql = `SELECT id_usuario, nombres, apellidos, rol, avatar
                    FROM usuarios AS u
                    WHERE u.activo = 1 AND u.usuario = $1 AND 
                          u.contrasenia = $2`;

        const {rowCount, rows} = await pool.query(sql, [usuario, contraseniaHash]);

        if (rowCount === 0) {
            return null;
        }
        return rows[0];
    };

    buscarPorId = async (id_usuario) => {
        
        const sql = `SELECT id_usuario, nombres, apellidos, rol, avatar
                    FROM usuarios AS u
                    WHERE u.activo = 1 AND u.id_usuario = $1`;

        const {rowCount, rows} = await pool.query(sql, [id_usuario]);

        if (rowCount === 0) {
            return null;
        }
        return rows[0];
    };

    actualizarAvatar = async (id_usuario, avatar) => {
        
        const sql = `UPDATE usuarios u
                    SET avatar = $1                    
                    WHERE u.activo = 1 AND u.id_usuario = $2`;

        const {rowCount, rows} = await pool.query(sql, [avatar, id_usuario ]);
        if (rowCount === 0) {
            return null;
        }
        return rows[0];
    }

    buscarPorRol = async (rol) => {
        const sql = `SELECT id_usuario, nombres, apellidos, CONCAT(nombres, ' ', apellidos) AS nombre, rol
                    FROM usuarios
                    WHERE activo = 1 AND rol = $1
                    ORDER BY nombres ASC, apellidos ASC`;

        const { rows } = await pool.query(sql, [rol]);
        return rows;
    }
}