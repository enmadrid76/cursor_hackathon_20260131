/**
 * Reads docs/test-data-sets.json and generates supabase/seed-test-data.sql
 * Run: node scripts/generate-seed-sql.js
 * Then run the generated SQL in Supabase SQL Editor.
 */
const fs = require('fs');
const path = require('path');

const NAMESPACE = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'docs', 'test-data-sets.json');
const outPath = path.join(root, 'supabase', 'seed-test-data.sql');

function esc(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function uuid5(id) {
  return `uuid_generate_v5('${NAMESPACE}'::uuid, ${esc(id)})`;
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const lines = [
  '-- Test data from docs/test-data-sets.json',
  '-- Run in Supabase SQL Editor after schema.sql',
  '-- Uses deterministic UUIDs so FKs resolve correctly.',
  '',
];

// Clinics: id, name, address, contact, timezone, is_active
lines.push('INSERT INTO clinics (id, name, address, contact, timezone, is_active) VALUES');
const clinicRows = data.clinics.map((c) =>
  `  (${uuid5(c.id)}, ${esc(c.name)}, ${esc(c.address)}, ${esc(c.contact)}, ${esc(c.timezone)}, ${c.active})`
);
lines.push(clinicRows.join(',\n') + ' ON CONFLICT (id) DO NOTHING;');
lines.push('');

// Doctors: id, clinic_id, name, contact, specialty
lines.push('INSERT INTO doctors (id, clinic_id, name, contact, specialty) VALUES');
const doctorRows = data.doctors.map((d) =>
  `  (${uuid5(d.id)}, ${uuid5(d.clinic_id)}, ${esc(d.name)}, ${esc(d.contact)}, ${esc(d.specialty)})`
);
lines.push(doctorRows.join(',\n') + ' ON CONFLICT (id) DO NOTHING;');
lines.push('');

// Patients: id, name, contact, date_of_birth
lines.push('INSERT INTO patients (id, name, contact, date_of_birth) VALUES');
const patientRows = data.patients.map((p) =>
  `  (${uuid5(p.id)}, ${esc(p.name)}, ${esc(p.contact)}, ${esc(p.dob)})`
);
lines.push(patientRows.join(',\n') + ' ON CONFLICT (id) DO NOTHING;');
lines.push('');

// Appointments: collect from all three data sets
const allAppointments = [
  ...(data.data_set_1_jan_2025_covid_asia?.appointments || []),
  ...(data.data_set_2_feb_2025_ebola_africa?.appointments || []),
  ...(data.data_set_3_mar_sep_2025_covid_worldwide?.appointments || []),
];

// Schema: id, clinic_id, doctor_id, patient_id, start_at, duration_minutes, status, disease_name, virality_rate, patient_age_at_visit, avg_monthly_city_temp, country, continent
lines.push('INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, start_at, duration_minutes, status, disease_name, virality_rate, patient_age_at_visit, avg_monthly_city_temp, country, continent) VALUES');
const aptRows = allAppointments.map((a) =>
  `  (${uuid5(a.id)}, ${uuid5(a.clinic_id)}, ${uuid5(a.doctor_id)}, ${uuid5(a.patient_id)}, ${esc(a.start)}::timestamptz, ${a.duration_minutes}, ${esc(a.status)}, ${esc(a.disease_name)}, ${a.virality_contagion_rate}, ${a.patient_age_at_visit}, ${a.avg_monthly_city_temp_c}, ${esc(a.country)}, ${esc(a.continent)})`
);
lines.push(aptRows.join(',\n') + ' ON CONFLICT (id) DO NOTHING;');
lines.push('');

fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('Wrote', outPath);
console.log('Clinics:', data.clinics.length, 'Doctors:', data.doctors.length, 'Patients:', data.patients.length, 'Appointments:', allAppointments.length);
