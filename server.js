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
    const consulta = await pool.query('SELECT * FROM articulos');
    res.json(consulta.rows);
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    res.status(500).json({ error: error.message });
  }
});