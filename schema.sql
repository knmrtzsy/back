-- veritabanını oluştur
CREATE DATABASE dersprogrami;

-- veritabanını seç
\c dersprogrami;

-- sınıflar tablosu
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- öğretmenler tablosu
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- dersler tablosu
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- öğretmen-ders ilişkisi tablosu
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(id),
  subject_id INTEGER REFERENCES subjects(id),
  UNIQUE(teacher_id, subject_id)
);

-- sınıf-ders ilişkisi tablosu
CREATE TABLE IF NOT EXISTS class_subjects (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id),
  subject_id INTEGER REFERENCES subjects(id),
  UNIQUE(class_id, subject_id)
);

-- sınıf-öğretmen ilişkisi tablosu
CREATE TABLE IF NOT EXISTS class_teachers (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id),
  teacher_id INTEGER REFERENCES teachers(id),
  UNIQUE(class_id, teacher_id)
);

-- zamanlama tablosu
CREATE TABLE IF NOT EXISTS timetables (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id),
  teacher_id INTEGER REFERENCES teachers(id),
  subject_id INTEGER REFERENCES subjects(id),
  day_of_week VARCHAR(20) NOT NULL,
  slot VARCHAR(20) NOT NULL,
  UNIQUE(class_id, day_of_week, slot),
  UNIQUE(teacher_id, day_of_week, slot)
); 