// Large-scale mock data generator for a 6-floor, 200-bed hospital

const firstNames = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Christopher','Karen','Charles','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Dorothy','Paul','Kimberly','Andrew','Emily','Joshua','Donna','Kenneth','Michelle','Kevin','Carol','Brian','Amanda','George','Melissa','Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy','Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda','Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen','Benjamin','Samantha','Samuel','Katherine','Raymond','Christine','Gregory','Debra','Frank','Rachel','Alexander','Carolyn','Patrick','Janet','Jack','Catherine','Dennis','Maria','Jerry','Heather','Tyler','Diane'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell'];
const diagnoses = ['Acute Myocardial Infarction','Pneumonia','Appendicitis','Fracture - Femur','Congestive Heart Failure','COPD Exacerbation','Diabetic Ketoacidosis','Acute Pancreatitis','Cellulitis','Urinary Tract Infection','Deep Vein Thrombosis','Pulmonary Embolism','Stroke - Ischemic','Gastrointestinal Bleeding','Sepsis','Renal Failure','Liver Cirrhosis','Asthma Exacerbation','Hip Replacement Post-Op','Knee Replacement Post-Op','Cholecystitis','Diverticulitis','Bowel Obstruction','Bronchitis','Hypertensive Crisis','Atrial Fibrillation','Cardiac Arrhythmia','Meningitis','Encephalitis','Spinal Cord Injury'];
const departments = ['Cardiology','Emergency','ICU','Surgery','Pediatrics','Radiology','Oncology','Neurology','Orthopedics','Gastroenterology','Pulmonology','Nephrology','Urology','ENT','Dermatology','Psychiatry','Obstetrics','Gynecology','Ophthalmology','General Medicine'];
const medications = ['Aspirin 81mg','Metformin 500mg','Lisinopril 10mg','Atorvastatin 20mg','Amlodipine 5mg','Omeprazole 20mg','Metoprolol 50mg','Losartan 50mg','Albuterol Inhaler','Levothyroxine 50mcg','Gabapentin 300mg','Sertraline 50mg','Amoxicillin 500mg','Ciprofloxacin 500mg','Furosemide 40mg','Warfarin 5mg','Insulin Glargine','Prednisone 10mg','Hydrochlorothiazide 25mg','Pantoprazole 40mg','Clopidogrel 75mg','Tramadol 50mg','Morphine 10mg','Heparin 5000U','Enoxaparin 40mg','Vancomycin 1g','Ceftriaxone 1g','Azithromycin 250mg','Doxycycline 100mg','Fluconazole 200mg'];
const insurances = ['Blue Cross','Aetna','United Healthcare','Cigna','Medicare','Medicaid','Humana','Kaiser','Anthem','MetLife','State Farm','GEICO Health','AllState Health','Progressive Health','Liberty Mutual'];

const wards = [
  { prefix: 'ICU', ward: 'ICU', floor: 6, count: 20 },
  { prefix: 'CCU', ward: 'Cardiac Care', floor: 6, count: 10 },
  { prefix: 'ER', ward: 'Emergency', floor: 1, count: 15 },
  { prefix: 'GA', ward: 'General Ward A', floor: 2, count: 30 },
  { prefix: 'GB', ward: 'General Ward B', floor: 2, count: 30 },
  { prefix: 'SA', ward: 'Surgery A', floor: 3, count: 20 },
  { prefix: 'SB', ward: 'Surgery B', floor: 3, count: 20 },
  { prefix: 'PED', ward: 'Pediatrics', floor: 4, count: 20 },
  { prefix: 'MAT', ward: 'Maternity', floor: 4, count: 15 },
  { prefix: 'ONC', ward: 'Oncology', floor: 5, count: 15 },
  { prefix: 'NEU', ward: 'Neurology', floor: 5, count: 10 },
  { prefix: 'ORT', ward: 'Orthopedics', floor: 3, count: 15 },
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysBack));
  return d.toISOString().split('T')[0];
}

export function generateLargeDataset() {
  // Generate 220 beds
  const beds: any[] = [];
  wards.forEach(w => {
    for (let i = 1; i <= w.count; i++) {
      const num = `${w.prefix}-${String(i).padStart(2, '0')}`;
      beds.push({
        id: `B-${w.prefix}${i}`,
        number: num,
        ward: w.ward,
        floor: w.floor,
        status: 'available',
      });
    }
  });

  // Generate 120 patients
  const patients: any[] = [];
  const conditions: Array<'Critical' | 'Stable' | 'Good' | 'Fair'> = ['Critical','Stable','Good','Fair'];
  const usedBeds = new Set<number>();

  for (let i = 1; i <= 120; i++) {
    const id = `P${String(i).padStart(4, '0')}`;
    const name = `${rand(firstNames)} ${rand(lastNames)}`;
    const condition = rand(conditions);
    const isDischarged = i > 100; // 20 discharged patients
    
    let bedIdx = -1;
    let bedNumber = 'Unassigned';
    if (!isDischarged && i <= beds.length) {
      // Assign to a random available bed
      const availableIndices = beds.map((_, idx) => idx).filter(idx => !usedBeds.has(idx));
      if (availableIndices.length > 0) {
        bedIdx = rand(availableIndices);
        usedBeds.add(bedIdx);
        bedNumber = beds[bedIdx].number;
        beds[bedIdx].status = 'occupied';
        beds[bedIdx].patientId = id;
        beds[bedIdx].assignedDate = randDate(14);
      }
    }

    patients.push({
      id,
      name,
      age: randInt(1, 95),
      gender: rand(['Male','Female']),
      condition,
      bedNumber,
      admissionDate: randDate(30),
      doctor: `Dr. ${rand(firstNames)} ${rand(lastNames)}`,
      diagnosis: rand(diagnoses),
      allergies: Array.from({length: randInt(0,3)}, () => rand(['Penicillin','Latex','Sulfa','Aspirin','Codeine','Ibuprofen','Peanuts','Shellfish'])).filter((v,i,a) => a.indexOf(v)===i),
      vitals: {
        heartRate: randInt(55, 130),
        bloodPressure: `${randInt(90,180)}/${randInt(60,110)}`,
        temperature: +(35.5 + Math.random() * 3.5).toFixed(1),
        oxygenSat: randInt(88, 100),
        timestamp: new Date().toISOString()
      },
      vitalsHistory: Array.from({length: randInt(2,6)}, (_, j) => ({
        heartRate: randInt(55,130),
        bloodPressure: `${randInt(90,180)}/${randInt(60,110)}`,
        temperature: +(35.5 + Math.random()*3.5).toFixed(1),
        oxygenSat: randInt(88,100),
        timestamp: new Date(Date.now() - (j+1)*3600000).toISOString()
      })),
      lastUpdated: rand(['Just now','5 min ago','15 min ago','30 min ago','1 hour ago','2 hours ago']),
      contactInfo: {
        phone: `+1-555-${String(randInt(1000,9999))}`,
        email: `${name.toLowerCase().replace(/\s/g,'.')}@email.com`,
        emergencyContact: `${rand(firstNames)} ${rand(lastNames)} - ${rand(['Spouse','Parent','Sibling','Child','Friend'])}`
      },
      status: isDischarged ? 'discharged' : 'active'
    });
  }

  // Mark some beds as maintenance/cleaning
  beds.filter(b => b.status === 'available').slice(0, 8).forEach((b, i) => {
    b.status = i < 4 ? 'maintenance' : 'cleaning';
  });

  // Generate 60 appointments
  const appointmentTypes = ['Consultation','Follow-up','Surgery','Lab Review','Physical Therapy','Imaging Review','Pre-Op','Post-Op'];
  const appointments = Array.from({length: 60}, (_, i) => ({
    id: `A${String(i+1).padStart(4,'0')}`,
    patientId: patients[i % patients.length].id,
    patientName: patients[i % patients.length].name,
    doctor: `Dr. ${rand(firstNames)} ${rand(lastNames)}`,
    date: randDate(7),
    time: `${String(randInt(7,18)).padStart(2,'0')}:${rand(['00','15','30','45'])}`,
    type: rand(appointmentTypes),
    status: rand(['confirmed','pending','cancelled','completed']) as any,
    phone: `+1-555-${String(randInt(1000,9999))}`,
    notes: rand(['Regular checkup','Urgent follow-up','Post-surgery review','Lab results discussion',''])
  }));

  // Generate 80 orders
  const labTests = ['Complete Blood Count','Basic Metabolic Panel','Lipid Panel','Liver Function Tests','Thyroid Function','Urinalysis','HbA1c','Troponin','D-Dimer','Prothrombin Time','Blood Culture','Urine Culture'];
  const imagingTests = ['Chest X-Ray','CT Scan - Head','CT Scan - Abdomen','MRI - Brain','MRI - Spine','Ultrasound - Abdomen','Echocardiogram','Mammography','Bone Scan','PET Scan'];
  const orders = Array.from({length: 80}, (_, i) => {
    const type = rand(['Lab','Imaging','Pharmacy']) as any;
    return {
      id: `O${String(i+1).padStart(4,'0')}`,
      patientId: patients[i % patients.length].id,
      patientName: patients[i % patients.length].name,
      type,
      test: type === 'Lab' ? rand(labTests) : type === 'Imaging' ? rand(imagingTests) : rand(['Prescription','Medication Review','Dosage Adjustment']),
      doctor: `Dr. ${rand(firstNames)} ${rand(lastNames)}`,
      status: rand(['pending','in-progress','completed','cancelled']) as any,
      ordered: `${randDate(14)} ${String(randInt(6,20)).padStart(2,'0')}:${String(randInt(0,59)).padStart(2,'0')}`,
      priority: rand(['routine','urgent','stat']) as any,
      result: Math.random() > 0.5 ? rand(['Normal findings','Abnormal - follow up required','Within normal limits','Elevated levels detected','Clear - no issues']) : undefined,
      completedDate: Math.random() > 0.5 ? randDate(7) : undefined
    };
  });

  // Generate 60 medications
  const medsList = Array.from({length: 60}, (_, i) => {
    const med = rand(medications);
    const patientIdx = i % patients.length;
    return {
      id: `M${String(i+1).padStart(4,'0')}`,
      patientId: patients[patientIdx].id,
      patientName: patients[patientIdx].name,
      medication: med,
      dosage: med.split(' ').slice(1).join(' ') || '10mg',
      frequency: rand(['Once daily','Twice daily','Three times daily','Every 4 hours','Every 6 hours','Every 8 hours','As needed']),
      doctor: `Dr. ${rand(firstNames)} ${rand(lastNames)}`,
      startDate: randDate(30),
      endDate: Math.random() > 0.3 ? randDate(-14) : undefined,
      status: rand(['active','active','active','completed','discontinued']) as any,
      administrationLog: Array.from({length: randInt(0,5)}, (_, j) => ({
        timestamp: new Date(Date.now() - j * 8 * 3600000).toISOString(),
        administeredBy: `Nurse ${rand(firstNames)}`,
        notes: Math.random() > 0.7 ? rand(['Patient tolerated well','Given with food','Slight nausea reported','No adverse effects']) : undefined
      }))
    };
  });

  // Generate 250 staff
  const roles = ['Doctor','Doctor','Nurse','Nurse','Nurse','Technician','Pharmacist','Therapist','Admin','Surgeon'];
  const staffList = Array.from({length: 250}, (_, i) => {
    const role = rand(roles);
    return {
      id: `S${String(i+1).padStart(4,'0')}`,
      name: `${role === 'Doctor' || role === 'Surgeon' ? 'Dr. ' : role === 'Nurse' ? 'Nurse ' : ''}${rand(firstNames)} ${rand(lastNames)}`,
      role,
      department: rand(departments),
      shift: rand(['Day','Night','Rotating']),
      phone: `+1-555-${String(randInt(1000,9999))}`,
      email: `staff${i+1}@medflow.com`,
      status: rand(['active','active','active','active','on-leave','off-duty']) as any
    };
  });

  // Generate 50 alerts
  const alertTypes: Array<'critical' | 'warning' | 'info'> = ['critical','warning','info'];
  const alertMessages = [
    'Patient vitals abnormal - immediate attention required',
    'Bed shortage in ICU ward',
    'Lab results pending review',
    'Medication interaction detected',
    'Equipment maintenance overdue',
    'Staffing shortage - Night shift',
    'Patient fall risk assessment due',
    'Discharge planning meeting scheduled',
    'New admission arriving in 30 minutes',
    'Blood bank inventory low - Type O-',
  ];
  const alerts = Array.from({length: 50}, (_, i) => ({
    id: `AL${String(i+1).padStart(4,'0')}`,
    type: rand(alertTypes),
    title: rand(['Critical Alert','Warning','System Notice','Patient Update','Staff Notice','Equipment Alert']),
    message: rand(alertMessages),
    timestamp: new Date(Date.now() - randInt(0, 72) * 3600000).toISOString(),
    isRead: Math.random() > 0.4,
    patientId: Math.random() > 0.5 ? patients[randInt(0, 20)].id : undefined,
    priority: rand(['high','medium','low']) as any
  }));

  // Generate 60 bills
  const services = ['Room Charges','ICU Charges','Surgery','Lab Tests','Imaging','Medications','Consultation','Physical Therapy','Emergency Visit','Ambulance','Blood Work','Dialysis','Chemotherapy','Radiology','Anesthesia'];
  const bills = Array.from({length: 60}, (_, i) => {
    const patientIdx = i % patients.length;
    const itemCount = randInt(2, 6);
    const items = Array.from({length: itemCount}, () => ({
      description: rand(services),
      amount: randInt(200, 15000)
    }));
    return {
      id: `BIL${String(i+1).padStart(4,'0')}`,
      patientId: patients[patientIdx].id,
      patientName: patients[patientIdx].name,
      amount: items.reduce((s, it) => s + it.amount, 0),
      status: rand(['pending','paid','overdue','paid','paid']) as any,
      dueDate: randDate(-30),
      items,
      insuranceClaimId: Math.random() > 0.5 ? `CLM-${randInt(1000,9999)}` : undefined
    };
  });

  return { patients, beds, appointments, orders, medications: medsList, staff: staffList, alerts, bills };
}
