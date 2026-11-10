import express from 'express';
import multer from 'multer';
import { storage } from '../src/config/multer.js';
import UsuariosControlador from '../controllers/usuarios-controller.js';

const router = express.Router();
const usuariosControlador = new UsuariosControlador();
const upload = multer({ storage });

router.post('/actualizar-avatar', upload.single('avatar'), usuariosControlador.actualizarAvatar);

export default router;