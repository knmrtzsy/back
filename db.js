import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'dersprogrami',
  password: process.env.PG_PASSWORD || '1234',
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
});


pool.on('error', (err) => {
  console.error('Beklenmeyen veritabanı hatası:', err);
});


pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Veritabanına bağlanırken hata oluştu:', err);
  } else {
    console.log('Veritabanı bağlantısı başarılı:', res.rows[0]);
  }
});

export default pool;
