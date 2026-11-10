import jwt from 'jsonwebtoken';
import UsuariosServicio from '../services/usuarios-service.js';

export default class AuthControlador {
    constructor (){
        this.usuario = new UsuariosServicio();
    }

    login = async (req, res) => {
        try{
            const { usuario, contrasenia } = req.body;
            const usuarioBD = await this.usuario.buscarPorUsuarioContrasenia(usuario, contrasenia);
            if(usuarioBD === null){
                return res.status(401).json({mensaje:'Nombre de usuario y/o contraseña incorrectos.'});
            }

            // CREAR TOKEN
            const token = jwt.sign(usuarioBD, process.env.JWT_SECRET, {expiresIn: '1h'});

            res.status(200).json({ token: token, usuario: usuarioBD });

        }catch(error){
            console.error('Error al obtener usuario /login:', error.message);
            return res.status(500).json({ 
                estado: false, 
                error: 'Error interno del servidor.' 
            });
        }
    }

}