import express from 'express';
import apicache from 'apicache'; // 1. Importamos apicache aquí también
import { check, param } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos.js';
import ArticulosControlador from '../controllers/articulos-controller.js';
import autorizarUsuarios from '../middlewares/autorizarUsuario.js';
import autenticar from '../middlewares/autenticar.js';

const router = express.Router();
const articulosControlador = new ArticulosControlador();

const cache = apicache.middleware; // 2. Definimos el middleware de caché

// Aplicar autenticación a todas las rutas de este archivo automáticamente
router.use(autenticar);

// 3. Aplicamos la caché en el GET (ej: guarda en caché por 5 minutos)
router.get('/', cache('5 minutes'), autorizarUsuarios([2, 3]), articulosControlador.buscarTodos);

router.get('/:id_articulo', 
    cache('5 minutes'), // También se puede poner aquí si quieres cachear por ID
    [ 
        param('id_articulo')        
        .isInt().withMessage('El id debe ser un valor numérico')
        .notEmpty().withMessage('El id es obligatorio'),
        validarCampos
    ], 
    autorizarUsuarios([2]), 
    articulosControlador.buscarPorId
);

router.post('/', 
    [
        check('id_area')
        .isInt().withMessage('El id_area debe ser un valor numérico')
        .notEmpty().withMessage('El id_area es obligatorio'),
        check('id_categoria')
        .isInt().withMessage('El id_categoria debe ser un valor numérico')
        .notEmpty().withMessage('El id_categoria es obligatorio'),
        check('descripcion')
        .notEmpty().withMessage('La descripcion es obligatoria')
        .isString().withMessage('La descripcion debe ser un texto'),
        validarCampos
    ], 
    autorizarUsuarios([2]), 
    articulosControlador.crear
);

router.put('/:id_articulo', 
    [
        param('id_articulo')
        .isInt().withMessage('El id debe ser un valor numérico')
        .notEmpty().withMessage('El id es necesario para la modificación'),
        check('descripcion')
        .notEmpty().withMessage('La descripcion es obligatoria para la modificación'),
        validarCampos
    ], 
    autorizarUsuarios([2]), 
    articulosControlador.editar
);

router.delete('/:id_articulo', 
    [
        param('id_articulo')
        .isInt().withMessage('El id debe ser un valor numérico')
        .notEmpty().withMessage('El id es necesario para la eliminación'),
        validarCampos
    ], 
    autorizarUsuarios([2]), 
    articulosControlador.borrar
);

export default router;