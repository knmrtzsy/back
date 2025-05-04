import express from 'express';
import pool   from '../db.js';
const router = express.Router();

// GET /api/siniflar
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM classes ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/siniflar
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO classes(name) VALUES($1) RETURNING *',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/update', async (req, res, next) => {
  try {
    console.log(req.body);
    const {id,name}= req.body
    const { rows } = await pool.query(
      'update classes set name = $1 where id =$2',
      [name, id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/siniflar/:id
router.delete('/:id', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Zamanlama kayıtlarını sil
    await client.query('DELETE FROM timetables WHERE class_id = $1', [req.params.id]);

    // Sınıfa atanmış öğretmenleri sil
    await client.query('DELETE FROM class_teachers WHERE class_id = $1', [req.params.id]);

    // Sınıfa atanmış dersleri sil
    await client.query('DELETE FROM class_subjects WHERE class_id = $1', [req.params.id]);

    // En son sınıfı sil
    const result = await client.query('DELETE FROM classes WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Sınıf bulunamadı' });
    }

    res.sendStatus(204);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});


export default router;
