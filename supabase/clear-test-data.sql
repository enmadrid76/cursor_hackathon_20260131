-- Delete all test data (run before seed-test-data.sql to reload).
-- Order matters: appointments first (FK to doctors, patients, clinics), then doctors, patients, clinics.

DELETE FROM appointments;
DELETE FROM doctors;
DELETE FROM patients;
DELETE FROM clinics;
