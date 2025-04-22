import express from 'express';
import pool   from '../db.js';
const router = express.Router();

// GET /api/ogretmenler
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM teachers ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/ogretmenler
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO teachers(name) VALUES($1) RETURNING *',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ogretmenler/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM teachers WHERE id=$1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Öğretmen bulunamadı' });
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
