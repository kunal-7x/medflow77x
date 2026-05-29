import { createClient } from '@supabase/supabase-js';
import { generateLargeDataset } from './src/lib/mockDataGenerator.ts';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Generating data...");
  const data = generateLargeDataset();

  console.log("Clearing old data...");
  await supabase.from('bills').delete().neq('id', '0');
  await supabase.from('alerts').delete().neq('id', '0');
  await supabase.from('staff').delete().neq('id', '0');
  await supabase.from('medications').delete().neq('id', '0');
  await supabase.from('orders').delete().neq('id', '0');
  await supabase.from('appointments').delete().neq('id', '0');
  await supabase.from('patients').delete().neq('id', '0');
  await supabase.from('beds').delete().neq('id', '0');

  console.log("Inserting beds...");
  const { error: bedErr } = await supabase.from('beds').insert(data.beds.map(b => ({
    id: b.id,
    number: b.number,
    ward: b.ward,
    floor: b.floor,
    status: b.status,
    patient_id: b.patientId || null,
    assigned_date: b.assignedDate || null
  })));
  if (bedErr) console.error("Error inserting beds:", bedErr);

  console.log("Inserting patients...");
  const { error: patErr } = await supabase.from('patients').insert(data.patients.map(p => ({
    id: p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    condition: p.condition,
    bed_number: p.bedNumber,
    admission_date: p.admissionDate,
    doctor: p.doctor,
    diagnosis: p.diagnosis,
    allergies: p.allergies,
    vitals: p.vitals,
    vitals_history: p.vitalsHistory,
    updated_at: new Date().toISOString(),
    phone: p.contactInfo.phone,
    email: p.contactInfo.email,
    emergency_contact: p.contactInfo.emergencyContact,
    status: p.status
  })));
  if (patErr) console.error("Error inserting patients:", patErr);

  console.log("Inserting staff...");
  const { error: staffErr } = await supabase.from('staff').insert(data.staff.map(s => ({
    id: s.id,
    name: s.name,
    role: s.role,
    department: s.department,
    shift: s.shift,
    phone: s.phone,
    email: s.email,
    status: s.status
  })));
  if (staffErr) console.error("Error inserting staff:", staffErr);

  console.log("Inserting appointments...");
  const { error: apptErr } = await supabase.from('appointments').insert(data.appointments.map(a => ({
    id: a.id,
    patient_id: a.patientId,
    patient_name: a.patientName,
    doctor: a.doctor,
    date: a.date,
    time: a.time,
    type: a.type,
    status: a.status,
    phone: a.phone,
    notes: a.notes
  })));
  if (apptErr) console.error("Error inserting appointments:", apptErr);

  console.log("Inserting orders...");
  const { error: orderErr } = await supabase.from('orders').insert(data.orders.map(o => ({
    id: o.id,
    patient_id: o.patientId,
    patient_name: o.patientName,
    type: o.type,
    test: o.test,
    doctor: o.doctor,
    status: o.status,
    ordered: o.ordered,
    priority: o.priority,
    result: o.result || null,
    completed_date: o.completedDate || null
  })));
  if (orderErr) console.error("Error inserting orders:", orderErr);

  console.log("Inserting medications...");
  const { error: medErr } = await supabase.from('medications').insert(data.medications.map(m => ({
    id: m.id,
    patient_id: m.patientId,
    patient_name: m.patientName,
    medication: m.medication,
    dosage: m.dosage,
    frequency: m.frequency,
    doctor: m.doctor,
    start_date: m.startDate,
    end_date: m.endDate || null,
    status: m.status,
    administration_log: m.administrationLog
  })));
  if (medErr) console.error("Error inserting meds:", medErr);

  console.log("Inserting alerts...");
  const { error: alertErr } = await supabase.from('alerts').insert(data.alerts.map(a => ({
    id: a.id,
    type: a.type,
    title: a.title,
    message: a.message,
    is_read: a.isRead,
    patient_id: a.patientId || null,
    priority: a.priority
  })));
  if (alertErr) console.error("Error inserting alerts:", alertErr);

  console.log("Inserting bills...");
  const { error: billErr } = await supabase.from('bills').insert(data.bills.map(b => ({
    id: b.id,
    patient_id: b.patientId,
    patient_name: b.patientName,
    amount: b.amount,
    status: b.status,
    due_date: b.dueDate,
    items: b.items,
    insurance_claim_id: b.insuranceClaimId || null
  })));
  if (billErr) console.error("Error inserting bills:", billErr);

  console.log("Seed complete!");
}

seed().catch(console.error);
