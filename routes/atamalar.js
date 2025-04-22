import express from 'express';
import pool from '../db.js';
const router = express.Router();

// 1) Öğretmene atanmış dersleri getir
// GET /api/atamalar/teacher-subject?teacher_id=…
router.get('/teacher-subject', async (req, res, next) => {
  try {
    const { teacher_id } = req.query;
    const { rows } = await pool.query(
      `SELECT s.id AS subject_id, s.name
       FROM teacher_subjects ts
       JOIN subjects s ON s.id = ts.subject_id
       WHERE ts.teacher_id = $1`,
      [teacher_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 2) Belirli derse atanmış öğretmenleri getir
// GET /api/atamalar/subject-teacher?subject_id=…
router.get('/subject-teacher', async (req, res, next) => {
  try {
    const { subject_id } = req.query;
    const { rows } = await pool.query(
      `SELECT t.id AS teacher_id, t.name
       FROM teacher_subjects ts
       JOIN teachers t ON t.id = ts.teacher_id
       WHERE ts.subject_id = $1`,
      [subject_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 3) Sınıfa atanmış dersleri getir
// GET /api/atamalar/class-subject?class_id=…
router.get('/class-subject', async (req, res, next) => {
  try {
    const { class_id } = req.query;
    const { rows } = await pool.query(
      `SELECT s.id AS subject_id, s.name
       FROM class_subjects cs
       JOIN subjects s ON s.id = cs.subject_id
       WHERE cs.class_id = $1`,
      [class_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 4) Sınıfa atanmış öğretmenleri getir
// GET /api/atamalar/class-teacher?class_id=…
router.get('/class-teacher', async (req, res, next) => {
  try {
    const { class_id } = req.query;
    const { rows } = await pool.query(
      `SELECT t.id AS teacher_id, t.name
       FROM class_teachers ct
       JOIN teachers t ON t.id = ct.teacher_id
       WHERE ct.class_id = $1`,
      [class_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 5) Öğretmen–ders atama
// POST /api/atamalar/teacher-subject
router.post('/teacher-subject', async (req, res, next) => {
  try {
    const { teacher_id, subject_id } = req.body;
    await pool.query(
      'INSERT INTO teacher_subjects(teacher_id, subject_id) VALUES($1,$2)',
      [teacher_id, subject_id]
    );
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

// 6) Sınıfa ders atama
// POST /api/atamalar/class-subject
router.post('/class-subject', async (req, res, next) => {
  try {
    const { class_id, subject_id } = req.body;
    await pool.query(
      'INSERT INTO class_subjects(class_id, subject_id) VALUES($1,$2)',
      [class_id, subject_id]
    );
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

// 7) Sınıfa öğretmen atama
// POST /api/atamalar/class-teacher
router.post('/class-teacher', async (req, res, next) => {
  try {
    const { class_id, teacher_id } = req.body;
    await pool.query(
      'INSERT INTO class_teachers(class_id, teacher_id) VALUES($1,$2)',
      [class_id, teacher_id]
    );
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

// 8) Zamanlama girişi (çakışma kontrolü)
// POST /api/atamalar/timetable
router.post('/timetable', async (req, res, next) => {
  try {
    const { class_id, teacher_id, subject_id, day_of_week, slot } = req.body;
    const { rows: conflict } = await pool.query(
      `SELECT 1 FROM timetables
       WHERE (class_id=$1 OR teacher_id=$2)
         AND day_of_week=$3
         AND slot=$4`,
      [class_id, teacher_id, day_of_week, slot]
    );
    if (conflict.length) {
      return res.status(409).json({ error: 'Çakışma var' });
    }
    const { rows } = await pool.query(
      `INSERT INTO timetables
         (class_id, teacher_id, subject_id, day_of_week, slot)
       VALUES($1,$2,$3,$4,$5)
       RETURNING *`,
      [class_id, teacher_id, subject_id, day_of_week, slot]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 9) Tüm zamanlama kayıtlarını getir
// GET /api/atamalar/timetables
router.get('/timetables', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.id,
             c.name  AS class,
             s.name  AS subject,
             te.name AS teacher,
             t.day_of_week,
             t.slot
      FROM timetables t
      JOIN classes c  ON c.id  = t.class_id
      JOIN subjects s ON s.id  = t.subject_id
      JOIN teachers te ON te.id = t.teacher_id
      ORDER BY t.day_of_week, t.slot
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
