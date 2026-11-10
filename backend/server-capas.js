import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';


//estren@correo.com
import areasRoutes from './routes/areas-routes.js';
import categoriasRoutes from './routes/categorias-routes.js';
import articulosRoutes from './routes/articulos-routes.js';
import authRoutes from './routes/auth-routes.js';
import usuariosRoutes from './routes/usuarios-routes.js';
import incidenciasRoutes from './routes/incidencias-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const frontendPath = path.join(__dirname, '../frontend');
const pagesPath = path.join(frontendPath, 'src/pages');

app.use(express.static(frontendPath));
app.use('/src', express.static(path.join(frontendPath, 'src')));
app.use('/css', express.static(path.join(pagesPath, 'css')));
app.use('/imagenes', express.static(path.join(frontendPath, 'src/imagenes')));
app.use('/js', express.static(frontendPath));


app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==========================================
// REGISTRAR RUTAS EN CAPAS
// ==========================================
app.use('/api/areas', areasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/articulos', articulosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/incidencias', incidenciasRoutes);

app.listen(port, () => {
    console.log(`🚀 Servidor en capas corriendo en http://localhost:${port}`);
});