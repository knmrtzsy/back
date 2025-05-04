import express from 'express';
import pool from '../db.js';
const router = express.Router();

// GET /api/ogretmenler
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, 
        array_agg(s.name) as subjects,
        array_agg(s.id) as subject_ids
      FROM teachers t
      LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      GROUP BY t.id
      ORDER BY t.id
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PUT /api/ogretmenler/update
router.put('/update', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id, name, subjects } = req.body;
    
    await client.query('BEGIN');
    
    // Update teacher name
    await client.query(
      'UPDATE teachers SET name = $1 WHERE id = $2',
      [name, id]
    );
    
    await client.query('DELETE FROM teacher_subjects WHERE teacher_id = $1', [id]);

    if (subjects && subjects.length > 0) {
      const values = subjects.map(subjectId => `(${id}, ${subjectId})`).join(',');
      await client.query(`
        INSERT INTO teacher_subjects(teacher_id, subject_id)
        VALUES ${values}
      `);
    }
    
    await client.query('COMMIT');

    const { rows: [updatedTeacher] } = await client.query(`
      SELECT t.*, 
        array_agg(s.name) FILTER (WHERE s.id IS NOT NULL) as subjects,
        array_agg(s.id) FILTER (WHERE s.id IS NOT NULL) as subject_ids
      FROM teachers t
      LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      WHERE t.id = $1
      GROUP BY t.id
    `, [id]);
    
    if (!updatedTeacher) {
      return res.status(404).json({ error: 'Öğretmen bulunamadı' });
    }
    
    res.json(updatedTeacher);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/ogretmenler/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, 
        array_agg(s.name) FILTER (WHERE s.id IS NOT NULL) as subjects,
        array_agg(s.id) FILTER (WHERE s.id IS NOT NULL) as subject_ids
      FROM teachers t
      LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      WHERE t.id = $1
      GROUP BY t.id
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Öğretmen bulunamadı' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/ogretmenler
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, subjects } = req.body;
    
    await client.query('BEGIN');
    
    // Insert teacher
    const { rows: [teacher] } = await client.query(
      'INSERT INTO teachers(name) VALUES($1) RETURNING *',
      [name]
    );
    
    // Insert teacher-subject relationships if subjects are provided
    if (subjects && subjects.length > 0) {
      const values = subjects.map(subjectId => `(${teacher.id}, ${subjectId})`).join(',');
      await client.query(`
        INSERT INTO teacher_subjects(teacher_id, subject_id)
        VALUES ${values}
      `);
    }
    
    await client.query('COMMIT');
    
    // Fetch the complete teacher data with subjects
    const { rows: [completeTeacher] } = await client.query(`
      SELECT t.*, 
        array_agg(s.name) FILTER (WHERE s.id IS NOT NULL) as subjects,
        array_agg(s.id) FILTER (WHERE s.id IS NOT NULL) as subject_ids
      FROM teachers t
      LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      WHERE t.id = $1
      GROUP BY t.id
    `, [teacher.id]);
    
    res.status(201).json(completeTeacher);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PUT /api/ogretmenler/:id
router.put('/:id', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, subjects } = req.body;
    const teacherId = req.params.id;
    
    await client.query('BEGIN');
    
    // Update teacher name
    await client.query(
      'UPDATE teachers SET name = $1 WHERE id = $2',
      [name, teacherId]
    );
    
    // Delete existing subject relationships
    await client.query('DELETE FROM teacher_subjects WHERE teacher_id = $1', [teacherId]);
    
    // Insert new subject relationships if provided
    if (subjects && subjects.length > 0) {
      const values = subjects.map(subjectId => `(${teacherId}, ${subjectId})`).join(',');
      await client.query(`
        INSERT INTO teacher_subjects(teacher_id, subject_id)
        VALUES ${values}
      `);
    }
    
    await client.query('COMMIT');
    
    // Fetch the updated teacher data with subjects
    const { rows: [updatedTeacher] } = await client.query(`
      SELECT t.*, 
        array_agg(s.name) FILTER (WHERE s.id IS NOT NULL) as subjects,
        array_agg(s.id) FILTER (WHERE s.id IS NOT NULL) as subject_ids
      FROM teachers t
      LEFT JOIN teacher_subjects ts ON t.id = ts.teacher_id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      WHERE t.id = $1
      GROUP BY t.id
    `, [teacherId]);
    
    if (!updatedTeacher) {
      return res.status(404).json({ error: 'Öğretmen bulunamadı' });
    }
    
    res.json(updatedTeacher);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// DELETE /api/ogretmenler/:id
router.delete('/:id', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Delete teacher-subject relationships first
    await client.query('DELETE FROM teacher_subjects WHERE teacher_id = $1', [req.params.id]);
    
    // Then delete the teacher
    const result = await client.query('DELETE FROM teachers WHERE id = $1', [req.params.id]);
    
    await client.query('COMMIT');
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Öğretmen bulunamadı' });
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