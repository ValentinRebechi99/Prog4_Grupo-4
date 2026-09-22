import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const port = 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend de Vite
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'incidencias',
  password: '1234',
  port: 5432,
});

// Ejemplo: Endpoint para consultar usuarios o incidencias
app.get('/api/incidencias', async (req, res) => {
  try {
    // Cambia 'incidencias' por el nombre real de tu tabla
    const result = await pool.query('SELECT * FROM incidencias');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});

app.get('/api/articulos', async (req, res) => {
  try {
    const consulta = await pool.query('SELECT * FROM articulos WHERE activo = 1 ORDER BY id_articulo ASC');
    res.json(consulta.rows);
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Registrar un nuevo artículo
app.post('/api/articulos', async (req, res) => {
    try {
        const { descripcion, id_area, id_categoria } = req.body;

        // Validación básica de entrada
        if (!descripcion) {
            return res.status(400).json({ error: 'La descripción es obligatoria' });
        }

        // Inserción parametrizada para evitar SQL Injection
        // Se asumen valores predeterminados (1) si no vienen área o categoría
        const query = `
            INSERT INTO articulos (descripcion, id_area, id_categoria, activo)
            VALUES ($1, $2, $3, 1)
            RETURNING *
        `;
        const values = [descripcion, id_area || 1, id_categoria || 1];

        const resultado = await pool.query(query, values);

        // Retorna estado 201 (Created) y el artículo recién insertado
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en POST /api/articulos:', error);
        res.status(500).json({ error: 'Error al registrar artículo en la base de datos' });
    }
});

app.listen(3000, () => {
    console.log(`Servidor corriendo en http://localhost:3000`);
});

app.patch('/api/articulos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE articulos 
            SET activo = 0 
            WHERE id_articulo = $1 
            RETURNING *
        `;
        const resultado = await pool.query(query, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        // 200 OK devolviendo el recurso actualizado
        res.status(200).json(resultado.rows[0]);
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

        // 200 OK con el artículo actualizado
        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Error en PUT /api/articulos/:id:', error);
        res.status(500).json({ error: 'Error al actualizar el artículo' });
    }
});

app.get('/api/articulos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query('SELECT * FROM articulos WHERE id_articulo = $1 AND activo = 1', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }
        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/areas', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT id_area, descripcion FROM areas WHERE activo = 1 ORDER BY id_area ASC'
        );
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Error en GET /api/areas:', error);
        res.status(500).json({ error: 'Error interno al obtener las áreas' });
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

        // 201 Created cumpliendo con REST
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