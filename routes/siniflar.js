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

// DELETE /api/siniflar/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM classes WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
