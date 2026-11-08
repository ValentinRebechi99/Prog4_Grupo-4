import express from 'express';
import apicache from 'apicache';
import CategoriasControlador from '../controllers/categorias-controller.js';

const router = express.Router();
const categoriasControlador = new CategoriasControlador();
const cache = apicache.middleware;

router.get('/', cache('5 minutes'), categoriasControlador.buscarTodos);

router.get('/:id_categoria', categoriasControlador.buscarPorId);

router.put('/:id_categoria', categoriasControlador.editar);

router.delete('/:id_categoria', categoriasControlador.borrar);

router.post('/', categoriasControlador.crear);

export default router;