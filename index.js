import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import siniflarRouter from './routes/siniflar.js';
import ogretmenlerRouter from './routes/ogretmenler.js';
import derslerRouter from './routes/dersler.js';
import atamalarRouter from './routes/atamalar.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const tableCheck = async () => {
  try {
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'classes'
      );
    `);
  } catch (error) {
    console.error('Veritabanı tablo kontrolü sırasında hata:', error);
  }
};

tableCheck();

// Middleware to check if classes exist
const checkClassesExist = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM classes');
    if (rows[0].count === '0' && !req.path.startsWith('/api/siniflar')) {
      return res.status(403).json({ error: 'Önce sınıf eklemeniz gerekmektedir' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

app.use('/api/siniflar', siniflarRouter);
app.use(checkClassesExist);
app.use('/api/ogretmenler', ogretmenlerRouter);
app.use('/api/dersler', derslerRouter);
app.use('/api/atamalar', atamalarRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Bir hata oluştu' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
