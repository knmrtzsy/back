import express from 'express';
import pool   from '../db.js';
const router = express.Router();

// GET /api/dersler
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subjects ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/dersler
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO subjects(name) VALUES($1) RETURNING *',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/dersler/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM subjects WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
