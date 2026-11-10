import express  from 'express';
import UsuariosControlador from '../controllers/auth-controller.js';
import { validarCampos } from '../middlewares/validarCampos.js';
import { check } from 'express-validator';

const router = express.Router();
const authControaldor = new UsuariosControlador();

router.post('/login', 
    [
        check('usuario')
        .notEmpty().withMessage('El usuario es obligatorio.')
        .isEmail().withMessage('Revisar el formato del dato.'),
        check('contrasenia')
        .notEmpty('contrasenia').withMessage('La constraseña es obligatoria.'),
        validarCampos
    ],
    authControaldor.login);

export default router;