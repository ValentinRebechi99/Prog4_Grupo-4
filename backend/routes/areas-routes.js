import express from 'express';
import apicache from 'apicache';
import AreasControlador from '../controllers/areas-controller.js';

const router = express.Router();
const areasControlador = new AreasControlador();
const cache = apicache.middleware;

router.get('/', cache('5 minutes'), areasControlador.buscarTodos);

export default router;