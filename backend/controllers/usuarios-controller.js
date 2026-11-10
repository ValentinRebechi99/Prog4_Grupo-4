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
}