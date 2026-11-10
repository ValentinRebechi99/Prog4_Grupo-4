import { pool } from '../src/config/bd.js';

export default class UsuariosDatos {

    buscarPorUsuarioContrasenia = async (usuario, contrasenia) => {
        
        const sql = `SELECT id_usuario, nombres, apellidos, rol, avatar
                    FROM usuarios AS u
                    WHERE u.activo = 1 AND u.usuario = $1 AND 
                          u.contrasenia = encode(digest($2, 'sha256'), 'hex')`;

        const {rowCount, rows} = await pool.query(sql, [usuario, contrasenia]);

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
}