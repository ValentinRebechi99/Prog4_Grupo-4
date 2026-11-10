import express from 'express';
import multer from 'multer';
import { storage } from '../src/config/multer.js';
import UsuariosControlador from '../controllers/usuarios-controller.js';
import autenticar from '../middlewares/autenticar.js';
import autorizarUsuarios from '../middlewares/autorizarUsuario.js';

const router = express.Router();
const usuariosControlador = new UsuariosControlador();
const upload = multer({ storage });

router.get('/', autenticar, autorizarUsuarios([1]), usuariosControlador.buscarPorRol);
router.post('/actualizar-avatar', upload.single('avatar'), usuariosControlador.actualizarAvatar);

export default router;