import UsuariosServicio from '../services/usuarios-service.js';

export default class UsuariosControaldor {

    constructor (){        
        this.usuarios = new UsuariosServicio();
    }

    actualizarAvatar = async (req, res) => {
        try{
            const avatar = req.file ? req.file.filename : null;
            const rows = await this.usuarios.actualizarAvatar(req.usuario.id_usuario, avatar);

            if(rows === null){
                return res.status(200).json({mensaje: 'El avatar no pudo ser actualizado.'});
            }

            return res.status(200).json({
                mensaje: 'Avatar actualizado.',
                avatar: avatar
            });
            
        }catch(error){
            console.error('Error al crear Artículo:', error.message);
            return res.status(500).json({ 
                error: 'Error interno del servidor.' 
            });
        }
    }

    buscarPorRol = async (req, res) => {
        try {
            const rol = Number(req.query.rol || 2);
            if (!Number.isInteger(rol) || rol <= 0) {
                return res.status(400).json({ error: 'El rol debe ser un número válido.' });
            }
            const usuarios = await this.usuarios.buscarPorRol(rol);
            return res.status(200).json(usuarios);
        } catch (error) {
            console.error('Error al obtener usuarios por rol:', error.message);
            return res.status(500).json({
                error: 'Error interno del servidor.'
            });
        }
    }
}