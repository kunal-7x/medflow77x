import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateLargeDataset } from '@/lib/mockDataGenerator';

// Types mapped to DB schema
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: 'Critical' | 'Stable' | 'Good' | 'Fair';
  bedNumber: string;
  admissionDate: string;
  doctor: string;
  diagnosis: string;
  allergies: string[];
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSat: number;
    timestamp: string;
  };
  vitalsHistory: Array<{
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSat: number;
    timestamp: string;
  }>;
  lastUpdated: string;
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: string;
  };
  status: 'active' | 'discharged';
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  ward?: string;
  dischargeDate?: string;
}

export interface Bed {
  id: string;
  number: string;
  ward: string;
  floor: number;
  status: 'occupied' | 'available' | 'maintenance' | 'cleaning';
  patientId?: string;
  assignedDate?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  phone: string;
  notes?: string;
}

export interface Order {
  id: string;
  patientId: string;
  patientName: string;
  type: 'Lab' | 'Imaging' | 'Pharmacy';
  test: string;
  doctor: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  ordered: string;
  priority: 'routine' | 'urgent' | 'stat';
  result?: string;
  completedDate?: string;
}

export interface Medication {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  doctor: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'discontinued';
  administrationLog: Array<{
    timestamp: string;
    administeredBy: string;
    notes?: string;
  }>;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  phone: string;
  email: string;
  status: 'active' | 'on-leave' | 'off-duty';
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  patientId?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  insuranceClaimId?: string;
}

interface HospitalDataContextType {
  patients: Patient[];
  beds: Bed[];
  appointments: Appointment[];
  orders: Order[];
  medications: Medication[];
  staff: Staff[];
  alerts: Alert[];
  bills: Bill[];
  loading: boolean;
  
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<string>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  dischargePatient: (id: string) => Promise<void>;
  updatePatientVitals: (id: string, vitals: Patient['vitals']) => Promise<void>;
  
  assignBed: (bedId: string, patientId: string) => Promise<void>;
  releaseBed: (bedId: string) => Promise<void>;
  transferPatient: (patientId: string, newBedId: string) => Promise<void>;
  updateBedStatus: (bedId: string, status: Bed['status']) => Promise<void>;
  
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<string>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  
  addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<string>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  administerMedication: (id: string, administeredBy: string, notes?: string) => Promise<void>;
  
  addStaff: (staff: Omit<Staff, 'id'>) => Promise<string>;
  updateStaff: (id: string, updates: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  
  addAlert: (alert: Omit<Alert, 'id'>) => Promise<string>;
  markAlertAsRead: (id: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  
  addBill: (bill: Omit<Bill, 'id'>) => Promise<string>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  
  getAnalytics: () => any;
  refreshData: () => Promise<void>;
}

const HospitalDataContext = createContext<HospitalDataContextType | null>(null);

// Helper to map DB row to Patient
function mapDbPatient(row: any): Patient {
  return {
    id: row.id,
    name: row.name,
    age: row.age || 0,
    gender: row.gender || '',
    condition: row.condition || 'Good',
    bedNumber: row.bed_number || 'Unassigned',
    admissionDate: row.admission_date || '',
    doctor: row.doctor || '',
    diagnosis: row.diagnosis || '',
    allergies: row.allergies || [],
    vitals: row.vitals || { heartRate: 0, bloodPressure: '0/0', temperature: 0, oxygenSat: 0, timestamp: '' },
    vitalsHistory: row.vitals_history || [],
    lastUpdated: row.updated_at ? new Date(row.updated_at).toLocaleString() : 'Unknown',
    contactInfo: {
      phone: row.phone || '',
      email: row.email || '',
      emergencyContact: row.emergency_contact || ''
    },
    status: row.status || 'active',
    dateOfBirth: row.date_of_birth,
    bloodGroup: row.blood_group,
    address: row.address,
    ward: row.ward,
    dischargeDate: row.discharge_date,
  };
}

function mapDbBed(row: any): Bed {
  return { id: row.id, number: row.number, ward: row.ward, floor: row.floor, status: row.status, patientId: row.patient_id || undefined, assignedDate: row.assigned_date || undefined };
}

function mapDbAppointment(row: any): Appointment {
  return { id: row.id, patientId: row.patient_id || '', patientName: row.patient_name, doctor: row.doctor, date: row.date, time: row.time, type: row.type, status: row.status, phone: row.phone || '', notes: row.notes };
}

function mapDbOrder(row: any): Order {
  return { id: row.id, patientId: row.patient_id || '', patientName: row.patient_name, type: row.type, test: row.test, doctor: row.doctor, status: row.status, ordered: row.ordered, priority: row.priority, result: row.result, completedDate: row.completed_date };
}

function mapDbMedication(row: any): Medication {
  return { id: row.id, patientId: row.patient_id || '', patientName: row.patient_name, medication: row.medication, dosage: row.dosage, frequency: row.frequency, doctor: row.doctor, startDate: row.start_date, endDate: row.end_date, status: row.status, administrationLog: row.administration_log || [] };
}

function mapDbStaff(row: any): Staff {
  return { id: row.id, name: row.name, role: row.role, department: row.department, shift: row.shift, phone: row.phone || '', email: row.email || '', status: row.status };
}

function mapDbAlert(row: any): Alert {
  return { id: row.id, type: row.type, title: row.title, message: row.message, timestamp: row.created_at, isRead: row.is_read, patientId: row.patient_id, priority: row.priority };
}

function mapDbBill(row: any): Bill {
  return { id: row.id, patientId: row.patient_id || '', patientName: row.patient_name, amount: Number(row.amount), status: row.status, dueDate: row.due_date || '', items: row.items || [], insuranceClaimId: row.insurance_claim_id };
}

// Visitor mock data stored in memory per session
let visitorMockData: ReturnType<typeof generateLargeDataset> | null = null;
function getVisitorData() {
  if (!visitorMockData) {
    visitorMockData = generateLargeDataset();
  }
  return visitorMockData;
}

function genId() {
  return 'v-' + Math.random().toString(36).slice(2, 10);
}

export const HospitalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isVisitor } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // Load visitor mock data
  const loadVisitorData = useCallback(() => {
    const data = getVisitorData();
    setPatients(data.patients);
    setBeds(data.beds);
    setAppointments(data.appointments);
    setOrders(data.orders);
    setMedications(data.medications);
    setStaff(data.staff);
    setAlerts(data.alerts);
    setBills(data.bills);
    setLoading(false);
  }, []);

  const fetchAll = useCallback(async () => {
    if (isVisitor) { loadVisitorData(); return; }
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [pRes, bRes, aRes, oRes, mRes, sRes, alRes, biRes] = await Promise.all([
        supabase.from('patients').select('*').order('created_at', { ascending: false }),
        supabase.from('beds').select('*').order('number'),
        supabase.from('appointments').select('*').order('date', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('medications').select('*').order('created_at', { ascending: false }),
        supabase.from('staff').select('*').order('name'),
        supabase.from('alerts').select('*').order('created_at', { ascending: false }),
        supabase.from('bills').select('*').order('created_at', { ascending: false }),
      ]);
      
      setPatients((pRes.data || []).map(mapDbPatient));
      setBeds((bRes.data || []).map(mapDbBed));
      setAppointments((aRes.data || []).map(mapDbAppointment));
      setOrders((oRes.data || []).map(mapDbOrder));
      setMedications((mRes.data || []).map(mapDbMedication));
      setStaff((sRes.data || []).map(mapDbStaff));
      setAlerts((alRes.data || []).map(mapDbAlert));
      setBills((biRes.data || []).map(mapDbBill));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  }, [user, isVisitor, loadVisitorData]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime subscriptions (only for real users)
  useEffect(() => {
    if (!user || isVisitor) return;
    
    const channel = supabase.channel('realtime-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        supabase.from('patients').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) setPatients(data.map(mapDbPatient));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beds' }, () => {
        supabase.from('beds').select('*').order('number').then(({ data }) => {
          if (data) setBeds(data.map(mapDbBed));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        supabase.from('appointments').select('*').order('date', { ascending: false }).then(({ data }) => {
          if (data) setAppointments(data.map(mapDbAppointment));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        supabase.from('alerts').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) setAlerts(data.map(mapDbAlert));
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isVisitor]);

  // ======== VISITOR LOCAL CRUD ========
  // For visitors, all CRUD operations mutate local state only — zero DB calls.

  // --- Patient CRUD ---
  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    if (isVisitor) {
      const id = genId();
      setPatients(prev => [{ ...patient, id } as Patient, ...prev]);
      return id;
    }
    const { data, error } = await supabase.from('patients').insert({
      name: patient.name, age: patient.age, gender: patient.gender, condition: patient.condition,
      bed_number: patient.bedNumber, admission_date: patient.admissionDate || new Date().toISOString().split('T')[0],
      doctor: patient.doctor, diagnosis: patient.diagnosis, allergies: patient.allergies,
      phone: patient.contactInfo?.phone, email: patient.contactInfo?.email, emergency_contact: patient.contactInfo?.emergencyContact,
      status: patient.status || 'active', vitals: patient.vitals || {}, vitals_history: patient.vitalsHistory || [],
      blood_group: patient.bloodGroup, address: patient.address, ward: patient.ward,
    }).select('id').single();
    if (error) throw error;
    await fetchAll();
    return data!.id;
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    if (isVisitor) {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return;
    }
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.bedNumber !== undefined) dbUpdates.bed_number = updates.bedNumber;
    if (updates.doctor !== undefined) dbUpdates.doctor = updates.doctor;
    if (updates.diagnosis !== undefined) dbUpdates.diagnosis = updates.diagnosis;
    if (updates.allergies !== undefined) dbUpdates.allergies = updates.allergies;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.vitals !== undefined) dbUpdates.vitals = updates.vitals;
    if (updates.vitalsHistory !== undefined) dbUpdates.vitals_history = updates.vitalsHistory;
    if (updates.contactInfo) {
      if (updates.contactInfo.phone !== undefined) dbUpdates.phone = updates.contactInfo.phone;
      if (updates.contactInfo.email !== undefined) dbUpdates.email = updates.contactInfo.email;
      if (updates.contactInfo.emergencyContact !== undefined) dbUpdates.emergency_contact = updates.contactInfo.emergencyContact;
    }
    dbUpdates.updated_at = new Date().toISOString();
    const { error } = await supabase.from('patients').update(dbUpdates).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const deletePatient = async (id: string) => {
    if (isVisitor) {
      setBeds(prev => prev.map(b => b.patientId === id ? { ...b, patientId: undefined, status: 'available' as const } : b));
      setPatients(prev => prev.filter(p => p.id !== id));
      return;
    }
    await supabase.from('beds').update({ patient_id: null, status: 'available' }).eq('patient_id', id);
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const dischargePatient = async (id: string) => {
    if (isVisitor) {
      setBeds(prev => prev.map(b => b.patientId === id ? { ...b, patientId: undefined, status: 'cleaning' as const } : b));
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'discharged' as const, bedNumber: 'Discharged', dischargeDate: new Date().toISOString().split('T')[0] } : p));
      return;
    }
    await supabase.from('beds').update({ patient_id: null, status: 'cleaning' }).eq('patient_id', id);
    await supabase.from('patients').update({ status: 'discharged', bed_number: 'Discharged', discharge_date: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }).eq('id', id);
    await fetchAll();
  };

  const updatePatientVitals = async (id: string, vitals: Patient['vitals']) => {
    if (isVisitor) {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, vitals, vitalsHistory: [vitals, ...p.vitalsHistory] } : p));
      return;
    }
    const patient = patients.find(p => p.id === id);
    const newHistory = patient ? [vitals, ...patient.vitalsHistory] : [vitals];
    await supabase.from('patients').update({ vitals, vitals_history: newHistory as any, updated_at: new Date().toISOString() }).eq('id', id);
    await fetchAll();
  };

  // --- Bed CRUD ---
  const assignBed = async (bedId: string, patientId: string) => {
    if (isVisitor) {
      const bed = beds.find(b => b.id === bedId);
      setBeds(prev => prev.map(b => b.id === bedId ? { ...b, patientId, status: 'occupied' as const, assignedDate: new Date().toISOString().split('T')[0] } : b));
      if (bed) setPatients(prev => prev.map(p => p.id === patientId ? { ...p, bedNumber: bed.number } : p));
      return;
    }
    const bed = beds.find(b => b.id === bedId);
    await supabase.from('beds').update({ patient_id: patientId, status: 'occupied', assigned_date: new Date().toISOString().split('T')[0] }).eq('id', bedId);
    if (bed) await supabase.from('patients').update({ bed_number: bed.number, updated_at: new Date().toISOString() }).eq('id', patientId);
    await fetchAll();
  };

  const releaseBed = async (bedId: string) => {
    if (isVisitor) {
      setBeds(prev => prev.map(b => b.id === bedId ? { ...b, patientId: undefined, status: 'available' as const, assignedDate: undefined } : b));
      return;
    }
    await supabase.from('beds').update({ patient_id: null, status: 'available', assigned_date: null }).eq('id', bedId);
    await fetchAll();
  };

  const transferPatient = async (patientId: string, newBedId: string) => {
    const currentBed = beds.find(b => b.patientId === patientId);
    if (currentBed) await releaseBed(currentBed.id);
    await assignBed(newBedId, patientId);
  };

  const updateBedStatus = async (bedId: string, status: Bed['status']) => {
    if (isVisitor) {
      setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status } : b));
      return;
    }
    await supabase.from('beds').update({ status }).eq('id', bedId);
    await fetchAll();
  };

  // --- Appointment CRUD ---
  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    if (isVisitor) {
      const id = genId();
      setAppointments(prev => [{ ...appointment, id } as Appointment, ...prev]);
      return id;
    }
    const { data, error } = await supabase.from('appointments').insert({
      patient_id: appointment.patientId || null, patient_name: appointment.patientName,
      doctor: appointment.doctor, date: appointment.date, time: appointment.time,
      type: appointment.type, status: appointment.status, phone: appointment.phone, notes: appointment.notes,
    }).select('id').single();
    if (error) throw error;
    await fetchAll();
    return data!.id;
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (isVisitor) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      return;
    }
    const dbUpdates: any = {};
    if (updates.doctor !== undefined) dbUpdates.doctor = updates.doctor;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.time !== undefined) dbUpdates.time = updates.time;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    dbUpdates.updated_at = new Date().toISOString();
    await supabase.from('appointments').update(dbUpdates).eq('id', id);
    await fetchAll();
  };

  const deleteAppointment = async (id: string) => {
    if (isVisitor) { setAppointments(prev => prev.filter(a => a.id !== id)); return; }
    await supabase.from('appointments').delete().eq('id', id);
    await fetchAll();
  };

  // --- Order CRUD ---
  const addOrder = async (order: Omit<Order, 'id'>) => {
    if (isVisitor) {
      const id = genId();
      setOrders(prev => [{ ...order, id } as Order, ...prev]);
      return id;
    }
    const { data, error } = await supabase.from('orders').insert({
      patient_id: order.patientId || null, patient_name: order.patientName,
      type: order.type, test: order.test, doctor: order.doctor, status: order.status, priority: order.priority,
    }).select('id').single();
    if (error) throw error;
    await fetchAll();
    return data!.id;
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    if (isVisitor) { setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o)); return; }
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.result !== undefined) dbUpdates.result = updates.result;
    if (updates.completedDate !== undefined) dbUpdates.completed_date = updates.completedDate;
    await supabase.from('orders').update(dbUpdates).eq('id', id);
    await fetchAll();
  };

  const deleteOrder = async (id: string) => {
    if (isVisitor) { setOrders(prev => prev.filter(o => o.id !== id)); return; }
    await supabase.from('orders').delete().eq('id', id);
    await fetchAll();
  };

  // --- Medication CRUD ---
  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    if (isVisitor) {
      const id = genId();
      setMedications(prev => [{ ...medication, id } as Medication, ...prev]);
      return id;
    }
    const { data, error } = await supabase.from('medications').insert({
      patient_id: medication.patientId || null, patient_name: medication.patientName,
      medication: medication.medication, dosage: medication.dosage, frequency: medication.frequency,
      doctor: medication.doctor, start_date: medication.startDate, end_date: medication.endDate || null, status: medication.status,
    }).select('id').single();
    if (error) throw error;
    await fetchAll();
    return data!.id;
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    if (isVisitor) { setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m)); return; }
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.administrationLog !== undefined) dbUpdates.administration_log = updates.administrationLog;
    await supabase.from('medications').update(dbUpdates).eq('id', id);
    await fetchAll();
  };

  const deleteMedication = async (id: string) => {
    if (isVisitor) { setMedications(prev => prev.filter(m => m.id !== id)); return; }
    await supabase.from('medications').delete().eq('id', id);
    await fetchAll();
  };

  const administerMedication = async (id: string, administeredBy: string, notes?: string) => {
    if (isVisitor) {
      setMedications(prev => prev.map(m => m.id === id ? { ...m, administrationLog: [{ timestamp: new Date().toISOString(), administeredBy, notes }, ...m.administrationLog] } : m));
      return;
    }
    const med = medications.find(m => m.id === id);
    const newLog = [{ timestamp: new Date().toISOString(), administeredBy, notes }, ...(med?.administrationLog || [])];
    await supabase.from('medications').update({ administration_log: newLog as any }).eq('id', id);
    await fetchAll();
  };

  // --- Staff CRUD ---
  const addStaff = async (s: Omit<Staff, 'id'>) => {
    if (isVisitor) {
      const id = genId();
      setStaff(prev => [{ ...s, id } as Staff, ...prev]);
      return id;
    }
    const { data, error } = await supabase.from('staff').insert({
      name: s.name, role: s.role, department: s.department, shift: s.shift, phone: s.phone, email: s.email, status: s.status,
    }).select('id').single();
    if (error) throw error;
    await fetchAll();
    return data!.id;
  };

  const updateStaff = async (id: string, updates: Partial<Staff>) => {
    if (isVisitor) { setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s)); return; }
    await supabase.from('staff').update(updates as any).eq('id', id);
    await fetchAll();
  };

  const deleteStaff = async (id: string) => {
    if (isVisitor) { setStaff(prev => prev.filter(s => s.id !== id)); return; }
    await supabase.from('staff').delete().eq('id', id);
    await fetchAll();
  };

  // --- Alert CRUD ---
  const addAlert = async (alert: Omit<Alert, 'id'>) => {
    if (isVisitor) {
      const id = genId();
      setAlerts(prev => [{ ...alert, id } as Alert, ...prev]);
      return id;
    }
    const { data, error } = await supabase.from('alerts').insert({
      type: alert.type, title: alert.title, message: alert.message, is_read: false,
      patient_id: alert.patientId || null, priority: alert.priority,
    }).select('id').single();
    if (error) throw error;
    await fetchAll();
    return data!.id;
  };

  const markAlertAsRead = async (id: string) => {
    if (isVisitor) { setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a)); return; }
    await supabase.from('alerts').update({ is_read: true }).eq('id', id);
    await fetchAll();
  };

  const markAllAlertsAsRead = async () => {
    if (isVisitor) { setAlerts(prev => prev.map(a => ({ ...a, isRead: true }))); return; }
    await supabase.from('alerts').update({ is_read: true }).eq('is_read', false);
    await fetchAll();
  };

  const deleteAlert = async (id: string) => {
    if (isVisitor) { setAlerts(prev => prev.filter(a => a.id !== id)); return; }
    await supabase.from('alerts').delete().eq('id', id);
    await fetchAll();
  };

  // --- Bill CRUD ---
  const addBill = async (bill: Omit<Bill, 'id'>) => {
    if (isVisitor) {
      const id = genId();
      setBills(prev => [{ ...bill, id } as Bill, ...prev]);
      return id;
    }
    const { data, error } = await supabase.from('bills').insert({
      patient_id: bill.patientId || null, patient_name: bill.patientName,
      amount: bill.amount, status: bill.status, due_date: bill.dueDate,
      items: bill.items as any, insurance_claim_id: bill.insuranceClaimId || null,
    }).select('id').single();
    if (error) throw error;
    await fetchAll();
    return data!.id;
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    if (isVisitor) { setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b)); return; }
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.items !== undefined) dbUpdates.items = updates.items;
    dbUpdates.updated_at = new Date().toISOString();
    await supabase.from('bills').update(dbUpdates).eq('id', id);
    await fetchAll();
  };

  const deleteBill = async (id: string) => {
    if (isVisitor) { setBills(prev => prev.filter(b => b.id !== id)); return; }
    await supabase.from('bills').delete().eq('id', id);
    await fetchAll();
  };

  // Analytics
  const getAnalytics = () => {
    const totalPatients = patients.filter(p => p.status === 'active').length;
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
    const todayAppointments = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const activeStaff = staff.filter(s => s.status === 'active').length;
    const totalRevenue = bills.reduce((s, b) => s + b.amount, 0);
    const pendingPayments = bills.filter(b => b.status === 'pending').length;
    return { totalPatients, totalBeds, occupiedBeds, occupancyRate, todayAppointments, pendingOrders, completedOrders, activeStaff, totalRevenue, pendingPayments, unreadAlerts: alerts.filter(a => !a.isRead).length };
  };

  const value: HospitalDataContextType = {
    patients, beds, appointments, orders, medications, staff, alerts, bills, loading,
    addPatient, updatePatient, deletePatient, dischargePatient, updatePatientVitals,
    assignBed, releaseBed, transferPatient, updateBedStatus,
    addAppointment, updateAppointment, deleteAppointment,
    addOrder, updateOrder, deleteOrder,
    addMedication, updateMedication, deleteMedication, administerMedication,
    addStaff, updateStaff, deleteStaff,
    addAlert, markAlertAsRead, markAllAlertsAsRead, deleteAlert,
    addBill, updateBill, deleteBill,
    getAnalytics, refreshData: fetchAll,
  };

  return <HospitalDataContext.Provider value={value}>{children}</HospitalDataContext.Provider>;
};

export const useHospitalData = () => {
  const context = useContext(HospitalDataContext);
  if (!context) throw new Error('useHospitalData must be used within a HospitalDataProvider');
  return context;
};
