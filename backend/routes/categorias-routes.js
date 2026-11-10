import express from 'express';
import apicache from 'apicache';
import { check, param } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos.js';
import CategoriasControlador from '../controllers/categorias-controller.js';

const router = express.Router();
const categoriasControlador = new CategoriasControlador();
const cache = apicache.middleware;

// Listar todas las categorías activas
router.get('/', categoriasControlador.buscarTodos);

// Buscar categoría por ID
router.get('/:id_categoria', 
    [ 
        param('id_categoria')        
        .isInt().withMessage('El id debe ser un valor numérico')
        .notEmpty().withMessage('El id es obligatorio'),
        validarCampos
    ], 
    categoriasControlador.buscarPorId
);

// Crear una categoría
router.post('/', 
    [
        check('descripcion')
        .notEmpty().withMessage('La descripcion es obligatoria')
        .isString().withMessage('La descripcion debe ser un texto'),
        validarCampos
    ], 
    categoriasControlador.crear
);

// Modificar una categoría
router.put('/:id_categoria', 
    [
        param('id_categoria')
        .isInt().withMessage('El id debe ser un valor numérico')
        .notEmpty().withMessage('El id es necesario para la modificación'),
        check('descripcion')
        .notEmpty().withMessage('La descripcion es obligatoria para la modificación')
        .isString().withMessage('La descripcion debe ser un texto'),
        validarCampos
    ], 
    categoriasControlador.editar
);

// Eliminar (Soft Delete mediante método DELETE)
router.delete('/:id_categoria', 
    [
        param('id_categoria')
        .isInt().withMessage('El id debe ser un valor numérico')
        .notEmpty().withMessage('El id es necesario para la eliminación'),
        validarCampos
    ], 
    categoriasControlador.borrar
);

export default router;