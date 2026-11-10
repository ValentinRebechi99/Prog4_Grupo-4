import express from 'express';
import IncidenciasControlador from '../controllers/incidencias-controller.js';
import autenticar from '../middlewares/autenticar.js';

const router = express.Router();
const incidenciasControlador = new IncidenciasControlador();

router.use(autenticar);

router.get('/', incidenciasControlador.buscarTodos);
router.get('/:id', incidenciasControlador.buscarPorId);
router.post('/', incidenciasControlador.crear);
router.put('/:id', incidenciasControlador.editar);
router.patch('/:id/estado', incidenciasControlador.cambiarEstado);

export default router;
