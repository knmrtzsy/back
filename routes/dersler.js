import express from 'express';
import pool from '../db.js';
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

// POST /api/dersler
router.put('/update', async (req, res, next) => {
  try {
    console.log(req.body);
    const {id,name}= req.body
    const { rows } = await pool.query(
      'update subjects set name = $1 where id =$2',
      [name, id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/dersler/:id
router.delete('/:id', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // First delete from teacher_subjects
    await client.query('DELETE FROM teacher_subjects WHERE subject_id = $1', [req.params.id]);
    
    // Then delete from class_subjects
    await client.query('DELETE FROM class_subjects WHERE subject_id = $1', [req.params.id]);
    
    // Finally delete from timetables
    await client.query('DELETE FROM timetables WHERE subject_id = $1', [req.params.id]);

    // Then delete the subject itself
    const result = await client.query('DELETE FROM subjects WHERE id = $1', [req.params.id]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ders bulunamadı' });
    }

    await client.query('COMMIT');
    res.sendStatus(204);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
