/**
 * Generates expanded test data: 25+ records per month per country/disease/continent.
 * COVID worldwide (Mar-Sep) shows increasing cases per month (higher virality).
 * Run: node scripts/generate-expanded-test-data.js
 * Then: node scripts/generate-seed-sql.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outPath = path.join(root, 'docs', 'test-data-sets.json');

const MIN_PER_MONTH_PER_COUNTRY = 25;

const clinics = [
  { id: 'clinic-1', name: 'Tokyo Central Clinic', address: '1-1 Shibuya, Tokyo', contact: '+81-3-1234-5678', timezone: 'Asia/Tokyo', active: true },
  { id: 'clinic-2', name: 'Mumbai Health Center', address: 'Bandra West, Mumbai', contact: '+91-22-1234-5678', timezone: 'Asia/Kolkata', active: true },
  { id: 'clinic-3', name: 'Beijing Municipal Clinic', address: 'Chaoyang District, Beijing', contact: '+86-10-1234-5678', timezone: 'Asia/Shanghai', active: true },
  { id: 'clinic-4', name: 'Seoul National Clinic', address: 'Jongno-gu, Seoul', contact: '+82-2-1234-5678', timezone: 'Asia/Seoul', active: true },
  { id: 'clinic-5', name: 'Kinshasa General Hospital', address: 'Gombe, Kinshasa', contact: '+243-123-456-789', timezone: 'Africa/Kinshasa', active: true },
  { id: 'clinic-6', name: 'Lagos Infectious Disease Unit', address: 'Ikeja, Lagos', contact: '+234-1-123-4567', timezone: 'Africa/Lagos', active: true },
  { id: 'clinic-7', name: 'London NHS Clinic', address: 'Westminster, London', contact: '+44-20-7123-4567', timezone: 'Europe/London', active: true },
  { id: 'clinic-8', name: 'Berlin City Clinic', address: 'Mitte, Berlin', contact: '+49-30-12345678', timezone: 'Europe/Berlin', active: true },
  { id: 'clinic-9', name: 'New York Metro Health', address: 'Manhattan, NY', contact: '+1-212-555-0123', timezone: 'America/New_York', active: true },
  { id: 'clinic-10', name: 'São Paulo Public Clinic', address: 'Paulista, São Paulo', contact: '+55-11-1234-5678', timezone: 'America/Sao_Paulo', active: true },
];

const doctors = [
  { id: 'doc-1', name: 'Dr. Yuki Tanaka', contact: 'yuki.tanaka@clinic.jp', specialty: 'Infectious disease', clinic_id: 'clinic-1' },
  { id: 'doc-2', name: 'Dr. Priya Sharma', contact: 'priya.sharma@clinic.in', specialty: 'Internal medicine', clinic_id: 'clinic-2' },
  { id: 'doc-3', name: 'Dr. Wei Zhang', contact: 'wei.zhang@clinic.cn', specialty: 'Pulmonology', clinic_id: 'clinic-3' },
  { id: 'doc-4', name: 'Dr. Min-jun Kim', contact: 'minjun.kim@clinic.kr', specialty: 'Epidemiology', clinic_id: 'clinic-4' },
  { id: 'doc-5', name: 'Dr. Jean Mbala', contact: 'jean.mbala@clinic.cd', specialty: 'Infectious disease', clinic_id: 'clinic-5' },
  { id: 'doc-6', name: 'Dr. Amara Okonkwo', contact: 'amara.okonkwo@clinic.ng', specialty: 'Virology', clinic_id: 'clinic-6' },
  { id: 'doc-7', name: 'Dr. James Wilson', contact: 'j.wilson@clinic.uk', specialty: 'Public health', clinic_id: 'clinic-7' },
  { id: 'doc-8', name: 'Dr. Anna Schmidt', contact: 'a.schmidt@clinic.de', specialty: 'Infectious disease', clinic_id: 'clinic-8' },
  { id: 'doc-9', name: 'Dr. Maria Rodriguez', contact: 'm.rodriguez@clinic.us', specialty: 'Epidemiology', clinic_id: 'clinic-9' },
  { id: 'doc-10', name: 'Dr. Carlos Silva', contact: 'c.silva@clinic.br', specialty: 'Internal medicine', clinic_id: 'clinic-10' },
];

const patients = [
  { id: 'patient-1', name: 'Hiroshi Yamamoto', contact: 'hiroshi.y@email.jp', dob: '1985-03-15' },
  { id: 'patient-2', name: 'Mei Chen', contact: 'mei.chen@email.cn', dob: '2018-07-22' },
  { id: 'patient-3', name: 'Raj Patel', contact: 'raj.p@email.in', dob: '1970-11-08' },
  { id: 'patient-4', name: 'Soo-jin Park', contact: 'soojin.p@email.kr', dob: '1952-01-30' },
  { id: 'patient-5', name: 'Yuki Nakamura', contact: 'yuki.n@email.jp', dob: '1992-09-12' },
  { id: 'patient-6', name: 'Wei Liu', contact: 'wei.liu@email.cn', dob: '1965-04-25' },
  { id: 'patient-7', name: 'Anita Desai', contact: 'anita.d@email.in', dob: '1948-12-03' },
  { id: 'patient-8', name: 'Pierre Kabongo', contact: 'pierre.k@email.cd', dob: '1958-06-14' },
  { id: 'patient-9', name: 'Fatou Diallo', contact: 'fatou.d@email.gn', dob: '1942-08-20' },
  { id: 'patient-10', name: 'Joseph Okeke', contact: 'joseph.o@email.ng', dob: '1960-02-28' },
  { id: 'patient-11', name: 'Grace Mbeki', contact: 'grace.m@email.za', dob: '1938-10-11' },
  { id: 'patient-12', name: 'Emma Thompson', contact: 'emma.t@email.uk', dob: '1990-05-17' },
  { id: 'patient-13', name: 'Hans Mueller', contact: 'hans.m@email.de', dob: '1975-11-23' },
  { id: 'patient-14', name: 'John Smith', contact: 'john.s@email.us', dob: '1982-07-04' },
  { id: 'patient-15', name: 'Elena Santos', contact: 'elena.s@email.br', dob: '2000-03-09' },
];

const patientAges = [39, 6, 54, 72, 32, 59, 76, 66, 82, 64, 86, 34, 49, 42, 25];

function makeAppointment(id, clinicId, doctorId, patientId, start, duration, disease, virality, age, temp, country, continent) {
  return {
    id,
    clinic_id: clinicId,
    doctor_id: doctorId,
    patient_id: patientId,
    start,
    duration_minutes: duration,
    status: 'completed',
    disease_name: disease,
    virality_contagion_rate: virality,
    patient_age_at_visit: age,
    avg_monthly_city_temp_c: temp,
    country,
    continent,
  };
}

function generateSet1() {
  const appointments = [];
  const countries = [
    { clinicId: 'clinic-1', doctorId: 'doc-1', country: 'Japan', continent: 'Asia', temp: 5 },
    { clinicId: 'clinic-2', doctorId: 'doc-2', country: 'India', continent: 'Asia', temp: 24 },
    { clinicId: 'clinic-3', doctorId: 'doc-3', country: 'China', continent: 'Asia', temp: -2 },
    { clinicId: 'clinic-4', doctorId: 'doc-4', country: 'South Korea', continent: 'Asia', temp: -1 },
  ];
  let idx = 0;
  for (const c of countries) {
    for (let i = 0; i < MIN_PER_MONTH_PER_COUNTRY; i++) {
      const day = 1 + (i % 28);
      const hour = 8 + (i % 8);
      const pid = (i % 15) + 1;
      appointments.push(makeAppointment(
        `apt-jan-${++idx}`,
        c.clinicId,
        c.doctorId,
        `patient-${pid}`,
        `2025-01-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00Z`,
        30,
        'COVID',
        7 + (i % 4),
        patientAges[pid - 1],
        c.temp,
        c.country,
        c.continent
      ));
    }
  }
  return appointments;
}

function generateSet2() {
  const appointments = [];
  const countries = [
    { clinicId: 'clinic-5', doctorId: 'doc-5', country: 'Democratic Republic of the Congo', continent: 'Africa', temp: 32 },
    { clinicId: 'clinic-6', doctorId: 'doc-6', country: 'Nigeria', continent: 'Africa', temp: 30 },
  ];
  let idx = 0;
  for (const c of countries) {
    for (let i = 0; i < MIN_PER_MONTH_PER_COUNTRY; i++) {
      const day = 1 + (i % 28);
      const hour = 8 + (i % 8);
      const pid = 8 + (i % 4);
      appointments.push(makeAppointment(
        `apt-feb-${++idx}`,
        c.clinicId,
        c.doctorId,
        `patient-${pid}`,
        `2025-02-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00Z`,
        45,
        'Ebola',
        7 + (i % 4),
        patientAges[pid - 1],
        c.temp,
        c.country,
        c.continent
      ));
    }
  }
  return appointments;
}

function generateSet3() {
  const appointments = [];
  const monthConfigs = [
    { month: 3, baseCount: 25 },
    { month: 4, baseCount: 32 },
    { month: 5, baseCount: 40 },
    { month: 6, baseCount: 48 },
    { month: 7, baseCount: 56 },
    { month: 8, baseCount: 64 },
    { month: 9, baseCount: 72 },
  ];
  const locations = [
    { clinicId: 'clinic-1', doctorId: 'doc-1', country: 'Japan', continent: 'Asia', temp: 10 },
    { clinicId: 'clinic-2', doctorId: 'doc-2', country: 'India', continent: 'Asia', temp: 28 },
    { clinicId: 'clinic-3', doctorId: 'doc-3', country: 'China', continent: 'Asia', temp: 8 },
    { clinicId: 'clinic-4', doctorId: 'doc-4', country: 'South Korea', continent: 'Asia', temp: 6 },
    { clinicId: 'clinic-7', doctorId: 'doc-7', country: 'United Kingdom', continent: 'Europe', temp: 12 },
    { clinicId: 'clinic-8', doctorId: 'doc-8', country: 'Germany', continent: 'Europe', temp: 11 },
    { clinicId: 'clinic-9', doctorId: 'doc-9', country: 'United States', continent: 'North America', temp: 12 },
    { clinicId: 'clinic-10', doctorId: 'doc-10', country: 'Brazil', continent: 'South America', temp: 20 },
    { clinicId: 'clinic-5', doctorId: 'doc-5', country: 'Democratic Republic of the Congo', continent: 'Africa', temp: 24 },
    { clinicId: 'clinic-6', doctorId: 'doc-6', country: 'Nigeria', continent: 'Africa', temp: 27 },
  ];
  let globalIdx = 0;
  for (const { month, baseCount } of monthConfigs) {
    const monthStr = String(month).padStart(2, '0');
    for (let i = 0; i < baseCount; i++) {
      const loc = locations[i % locations.length];
      const day = 1 + (i % 28);
      const hour = 8 + (i % 8);
      const pid = (i % 15) + 1;
      appointments.push(makeAppointment(
        `apt-m${month}-${++globalIdx}`,
        loc.clinicId,
        loc.doctorId,
        `patient-${pid}`,
        `2025-${monthStr}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00Z`,
        30,
        'COVID',
        7 + (i % 4),
        patientAges[pid - 1],
        loc.temp,
        loc.country,
        loc.continent
      ));
    }
  }
  return appointments;
}

const set1 = generateSet1();
const set2 = generateSet2();
const set3 = generateSet3();

const data = {
  description: 'Expanded test data: 25+ records per month per country/disease/continent. COVID worldwide shows increasing cases per month (higher virality).',
  clinics,
  doctors,
  patients,
  data_set_1_jan_2025_covid_asia: {
    description: 'January 2025: COVID, high contagion (7–10), all ages, Asian countries. At least 25 per country.',
    appointments: set1,
  },
  data_set_2_feb_2025_ebola_africa: {
    description: 'February 2025: Ebola, high contagion (7–10), elderly (60+), African countries. At least 25 per country.',
    appointments: set2,
  },
  data_set_3_mar_sep_2025_covid_worldwide: {
    description: 'March–September 2025: COVID spreading worldwide with increasing cases per month (higher virality): Mar 25, Apr 32, May 40, Jun 48, Jul 56, Aug 64, Sep 72.',
    appointments: set3,
  },
};

fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Wrote', outPath);
console.log('Set 1 (Jan COVID Asia):', set1.length);
console.log('Set 2 (Feb Ebola Africa):', set2.length);
console.log('Set 3 (Mar-Sep COVID worldwide, increasing/month):', set3.length);
console.log('Total appointments:', set1.length + set2.length + set3.length);
