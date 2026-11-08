import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;
/*
Datos de Conexion a la base de datos
Editar las credenciales de la base de datos segun tu instalacion
*/
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'incidencias_db',
  password: process.env.DB_PASSWORD || 'secret',
  port: Number(process.env.DB_PORT) || 5432,
});