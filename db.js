import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'dersprogrami',
  password: process.env.PG_PASSWORD || 'mert',  // Burayı .env dosyasından almanız gerekmekte.
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
});

export default pool;
