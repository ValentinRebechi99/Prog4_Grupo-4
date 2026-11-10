export default function autorizarUsuarios(perfilAutorizados = []) {
    return (req, res, next) => {
        const usuario = req.usuario;
        
        // Debug para verificar que tome el rol correctamente
        console.log("--- DEBUG AUTORIZACIÓN ---");
        console.log("Rol del usuario:", usuario?.rol, typeof usuario?.rol);
        console.log("Roles permitidos en ruta:", perfilAutorizados);

        if (!usuario || !perfilAutorizados.includes(Number(usuario.rol))) {
            return res.status(403).json({ mensaje: 'Acceso Denegado' });
        }

        next();
    };
}