import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;
/*
Datos de Conexion a la base de datos
Editar las credenciales de la base de datos segun tu instalacion
*/
export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'incidencias',
  password: '1234',
  port: 5432,
});