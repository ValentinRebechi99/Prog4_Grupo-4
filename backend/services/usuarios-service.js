import UsuariosDatos from '../repositories/usuarios-repository.js';

export default class UsuariosServicio {

    constructor(){
        this.usuario = new UsuariosDatos();
    }

    buscarPorUsuarioContrasenia = (usuario, constrania) => {
        return this.usuario.buscarPorUsuarioContrasenia(usuario, constrania);
    }

    buscarPorId = (usuarioId) => {
        return this.usuario.buscarPorId(usuarioId);
    }

    actualizarAvatar = (id_usuario, avatar) => {
        return this.usuario.actualizarAvatar(id_usuario, avatar);
    }

    buscarPorRol = (rol) => {
        return this.usuario.buscarPorRol(rol);
    }
}