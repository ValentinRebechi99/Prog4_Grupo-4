import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { pool } from './config/bd.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (HTML, CSS, JS, imágenes)
const frontendPath = path.join(__dirname, '../frontend');
const publicPath = path.join(frontendPath, 'public');

app.use(express.static(frontendPath));
app.use(express.static(publicPath));
app.use('/public', express.static(publicPath));

// Rutas de las vistas en el puerto 3000
app.get(['/', '/index.html', '/login'], (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get(['/director', '/director.html'], (req, res) => {
    res.sendFile(path.join(publicPath, 'director.html'));
});

app.get(['/empleado', '/empleado.html'], (req, res) => {
    res.sendFile(path.join(publicPath, 'empleado.html'));
});

app.get(['/empleado-sistemas', '/empleadosistemas', '/empleadoSistemas', '/empleadoSistemas.html'], (req, res) => {
    res.sendFile(path.join(publicPath, 'empleadoSistemas.html'));
});


// ==========================================
// ARTÍCULOS
// ==========================================

app.get('/api/articulos', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id_articulo,
                a.descripcion AS descripcion_articulo,
                a.id_categoria,
                c.descripcion AS categoria_nombre,
                a.id_area,
                ar.descripcion AS area_nombre,
                a.activo
            FROM articulos a
            LEFT JOIN categorias c ON a.id_categoria = c.id_categoria
            LEFT JOIN areas ar ON a.id_area = ar.id_area
            WHERE a.activo = 1
            ORDER BY a.id_articulo ASC
        `;
        const resultado = await pool.query(query);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error en GET /api/articulos:', error);
        res.status(500).json({ error: 'Error al obtener los artículos' });
    }
});

app.post('/api/articulos', async (req, res) => {
    try {
        const { id_categoria, descripcion, id_area } = req.body;

        const query = `
            INSERT INTO articulos (id_categoria, descripcion, id_area, activo)
            VALUES ($1, $2, $3, 1)
            RETURNING *
        `;
        const resultado = await pool.query(query, [id_categoria, descripcion.trim(), id_area]);
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en POST /api/articulos:', error);
        res.status(500).json({ error: 'Error al registrar el artículo' });
    }
});

app.patch('/api/articulos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query(
            'UPDATE articulos SET activo = 0 WHERE id_articulo = $1 RETURNING *',
            [id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }
        res.status(200).json({ mensaje: 'Artículo dado de baja correctamente' });
    } catch (error) {
        console.error('Error en PATCH /api/articulos/:id:', error);
        res.status(500).json({ error: 'Error al dar de baja el artículo' });
    }
});

app.put('/api/articulos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, id_area, id_categoria } = req.body;

        if (!descripcion) {
            return res.status(400).json({ error: 'La descripción es obligatoria' });
        }

        const query = `
            UPDATE articulos
            SET descripcion = $1,
                id_area = COALESCE($2, id_area),
                id_categoria = COALESCE($3, id_categoria)
            WHERE id_articulo = $4
            RETURNING *
        `;
        const values = [descripcion, id_area || null, id_categoria || null, id];
        const resultado = await pool.query(query, values);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en PUT /api/articulos/:id:', error);
        res.status(500).json({ error: 'Error al actualizar el artículo' });
    }
});

app.get('/api/articulos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM articulos WHERE id_articulo = $1 AND activo = 1';
        const resultado = await pool.query(query, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en GET /api/articulos/:id:', error);
        res.status(500).json({ error: 'Error al consultar el artículo' });
    }
});

// ==========================================
// ÁREAS Y CATEGORÍAS
// ==========================================

app.get('/api/areas', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT id_area, descripcion FROM areas WHERE activo = 1 ORDER BY descripcion ASC'
        );
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error en GET /api/areas:', error);
        res.status(500).json({ error: 'Error al obtener las áreas' });
    }
});

app.get('/api/categorias', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM categorias WHERE activo = 1 ORDER BY id_categoria ASC'
        );
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error en GET /api/categorias:', error);
        res.status(500).json({ error: 'Error al listar categorías' });
    }
});

app.get('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query(
            'SELECT * FROM categorias WHERE id_categoria = $1 AND activo = 1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en GET /api/categorias/:id:', error);
        res.status(500).json({ error: 'Error al consultar la categoría' });
    }
});

app.post('/api/categorias', async (req, res) => {
    try {
        const { descripcion } = req.body;

        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ error: 'La descripción es obligatoria' });
        }

        const query = `
            INSERT INTO categorias (descripcion, activo)
            VALUES ($1, 1)
            RETURNING *
        `;
        const resultado = await pool.query(query, [descripcion.trim()]);

        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en POST /api/categorias:', error);
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
});

app.patch('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            UPDATE categorias
            SET activo = 0
            WHERE id_categoria = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en PATCH /api/categorias/:id:', error);
        res.status(500).json({ error: 'Error al dar de baja la categoría' });
    }
});

app.put('/api/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion } = req.body;

        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ error: 'La descripción es obligatoria' });
        }

        const query = `
            UPDATE categorias
            SET descripcion = $1
            WHERE id_categoria = $2 AND activo = 1
            RETURNING *
        `;
        const resultado = await pool.query(query, [descripcion.trim(), id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en PUT /api/categorias/:id:', error);
        res.status(500).json({ error: 'Error interno al actualizar la categoría' });
    }
});

// ==========================================
// INCIDENCIAS
// ==========================================

app.get('/api/incidencias', async (req, res) => {
    try {
        const query = `
            SELECT 
                i.id_incidencia,
                i.id_articulo,
                a.descripcion AS articulo_descripcion,
                i.descripcion_pedido,
                i.descripcion_resolucion,
                i.prioridad,
                e.descripcion AS estado,
                i.id_estado,
                i.creado AS fecha_creacion,
                uc.nombres AS creado_por_nombre,
                ua.nombres AS asignado_a_nombre
            FROM incidencias i
            LEFT JOIN articulos a ON i.id_articulo = a.id_articulo
            LEFT JOIN estados e ON i.id_estado = e.id_estado
            LEFT JOIN usuarios uc ON i.creado_por = uc.id_usuario
            LEFT JOIN usuarios ua ON i.asignado_a = ua.id_usuario
            ORDER BY i.creado DESC
        `;
        const resultado = await pool.query(query);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error en GET /api/incidencias:', error);
        res.status(500).json({ error: 'Error al obtener las incidencias' });
    }
});

app.get('/api/incidencias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                i.id_incidencia,
                i.id_articulo,
                a.descripcion AS articulo_descripcion,
                i.descripcion_pedido,
                i.descripcion_resolucion,
                i.prioridad,
                e.descripcion AS estado,
                i.creado AS fecha_creacion,
                uc.nombres AS creado_por_nombre,
                ua.nombres AS asignado_a_nombre
            FROM incidencias i
            LEFT JOIN articulos a ON i.id_articulo = a.id_articulo
            LEFT JOIN estados e ON i.id_estado = e.id_estado
            LEFT JOIN usuarios uc ON i.creado_por = uc.id_usuario
            LEFT JOIN usuarios ua ON i.asignado_a = ua.id_usuario
            WHERE i.id_incidencia = $1
        `;
        const resultado = await pool.query(query, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en GET /api/incidencias/:id:', error);
        res.status(500).json({ error: 'Error al consultar la incidencia' });
    }
});

app.post('/api/incidencias', async (req, res) => {
    try {
        const { id_articulo, descripcion_pedido, prioridad, creado_por, asignado_a } = req.body;

        if (!id_articulo || !descripcion_pedido || !descripcion_pedido.trim()) {
            return res.status(400).json({ error: 'id_articulo y descripcion_pedido son obligatorios' });
        }

        const query = `
            INSERT INTO incidencias (id_articulo, id_estado, creado_por, asignado_a, prioridad, descripcion_pedido, descripcion_resolucion)
            VALUES ($1, 1, $2, $3, $4, $5, '')
            RETURNING *
        `;
        const values = [
            id_articulo,
            creado_por || 1,
            asignado_a || 1,
            prioridad || 1,
            descripcion_pedido.trim()
        ];

        const resultado = await pool.query(query, values);
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en POST /api/incidencias:', error);
        res.status(500).json({ error: 'Error al crear la incidencia' });
    }
});

app.put('/api/incidencias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion_pedido, prioridad } = req.body;

        if (!descripcion_pedido || !descripcion_pedido.trim()) {
            return res.status(400).json({ error: 'La descripción del pedido es obligatoria' });
        }

        const query = `
            UPDATE incidencias
            SET descripcion_pedido = $1,
                prioridad = COALESCE($2, prioridad)
            WHERE id_incidencia = $3
            RETURNING *
        `;
        const resultado = await pool.query(query, [descripcion_pedido.trim(), prioridad || null, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en PUT /api/incidencias/:id:', error);
        res.status(500).json({ error: 'Error al actualizar la incidencia' });
    }
});

app.patch('/api/incidencias/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_estado, descripcion_resolucion } = req.body;

        if (!id_estado) {
            return res.status(400).json({ error: 'id_estado es obligatorio' });
        }

        // Consultar el estado actual de la incidencia
        const checkQuery = `SELECT id_incidencia, id_estado FROM incidencias WHERE id_incidencia = $1`;
        const checkRes = await pool.query(checkQuery, [id]);

        if (checkRes.rows.length === 0) {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }

        const incidenciaActual = checkRes.rows[0];

        // Regla: si se intenta cancelar (id_estado = 4), solo se permite si el estado actual es Pendiente (id_estado = 1)
        if (Number(id_estado) === 4 && Number(incidenciaActual.id_estado) !== 1) {
            return res.status(400).json({
                error: 'Solo se puede cancelar una incidencia cuando su estado es Pendiente'
            });
        }

        const query = `
            UPDATE incidencias
            SET id_estado = $1,
                descripcion_resolucion = COALESCE($2, descripcion_resolucion)
            WHERE id_incidencia = $3
            RETURNING *
        `;
        const resultado = await pool.query(query, [id_estado, descripcion_resolucion || null, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en PATCH /api/incidencias/:id/estado:', error);
        res.status(500).json({ error: 'Error al cambiar el estado de la incidencia' });
    }
});

app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});