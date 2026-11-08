import express from 'express';
import apicache from 'apicache';
import ArticulosControlador from '../controllers/articulos-controller.js';

const router = express.Router();
const articulosControlador = new ArticulosControlador();
const cache = apicache.middleware;

router.get('/', cache('5 minutes'), articulosControlador.buscarTodos);

export default router;