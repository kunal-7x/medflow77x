import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Calendar, Download, Users, Clock, FileText } from "lucide-react";

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'admit' | 'surgery' | 'report' | 'round' | null;
}

export function QuickActionsModal({ isOpen, onClose, action }: QuickActionsModalProps) {
  const { addPatient, patients, staff, getAnalytics } = useHospitalData();
  const { toast } = useToast();
  
  // Admit Patient Form
  const [admitForm, setAdmitForm] = useState({
    name: '',
    age: '',
    gender: '',
    diagnosis: '',
    doctor: '',
    bedNumber: '',
    emergencyContact: '',
    phone: '',
    email: '',
    allergies: ''
  });

  // Surgery Form
  const [surgeryForm, setSurgeryForm] = useState({
    patientId: '',
    surgeryType: '',
    surgeon: '',
    date: '',
    time: '',
    room: '',
    notes: ''
  });

  // Report Form
  const [reportForm, setReportForm] = useState({
    type: '',
    department: '',
    dateRange: '',
    format: 'pdf'
  });

  // Ward Round Form
  const [roundForm, setRoundForm] = useState({
    ward: '',
    doctor: '',
    startTime: '',
    notes: ''
  });

  const handleAdmitPatient = () => {
    if (!admitForm.name || !admitForm.diagnosis || !admitForm.doctor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newPatient = {
      name: admitForm.name,
      age: parseInt(admitForm.age) || 25,
      gender: admitForm.gender || 'Male',
      condition: 'Stable' as const,
      bedNumber: admitForm.bedNumber || 'Unassigned',
      admissionDate: new Date().toISOString().split('T')[0],
      doctor: admitForm.doctor,
      diagnosis: admitForm.diagnosis,
      allergies: admitForm.allergies ? admitForm.allergies.split(',').map(a => a.trim()) : [],
      vitals: {
        heartRate: 75,
        bloodPressure: '120/80',
        temperature: 36.5,
        oxygenSat: 98,
        timestamp: new Date().toISOString()
      },
      vitalsHistory: [],
      lastUpdated: 'Just now',
      contactInfo: {
        phone: admitForm.phone,
        email: admitForm.email,
        emergencyContact: admitForm.emergencyContact
      },
      status: 'active' as const
    };

    addPatient(newPatient);
    toast({
      title: "Patient admitted successfully",
      description: `${admitForm.name} has been admitted to the hospital`
    });
    
    setAdmitForm({
      name: '', age: '', gender: '', diagnosis: '', doctor: '', bedNumber: '',
      emergencyContact: '', phone: '', email: '', allergies: ''
    });
    onClose();
  };

  const handleScheduleSurgery = () => {
    toast({
      title: "Surgery scheduled",
      description: `${surgeryForm.surgeryType} scheduled for ${surgeryForm.date}`
    });
    setSurgeryForm({
      patientId: '', surgeryType: '', surgeon: '', date: '', time: '', room: '', notes: ''
    });
    onClose();
  };

  const handleGenerateReport = () => {
    const analytics = getAnalytics();
    toast({
      title: "Report generated",
      description: `${reportForm.type} report for ${reportForm.department} has been generated`
    });
    setReportForm({ type: '', department: '', dateRange: '', format: 'pdf' });
    onClose();
  };

  const handleStartWardRound = () => {
    toast({
      title: "Ward round started",
      description: `Ward round for ${roundForm.ward} has been initiated`
    });
    setRoundForm({ ward: '', doctor: '', startTime: '', notes: '' });
    onClose();
  };

  const getActionIcon = () => {
    switch (action) {
      case 'admit': return <UserPlus className="w-5 h-5" />;
      case 'surgery': return <Calendar className="w-5 h-5" />;
      case 'report': return <Download className="w-5 h-5" />;
      case 'round': return <Users className="w-5 h-5" />;
      default: return null;
    }
  };

  const getActionTitle = () => {
    switch (action) {
      case 'admit': return 'Admit New Patient';
      case 'surgery': return 'Schedule Surgery';
      case 'report': return 'Generate Report';
      case 'round': return 'Start Ward Round';
      default: return 'Quick Action';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            {getActionTitle()}
          </DialogTitle>
        </DialogHeader>
        
        {action === 'admit' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={admitForm.name}
                  onChange={(e) => setAdmitForm({...admitForm, name: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={admitForm.age}
                  onChange={(e) => setAdmitForm({...admitForm, age: e.target.value})}
                  placeholder="Age"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={admitForm.gender} onValueChange={(value) => setAdmitForm({...admitForm, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bedNumber">Bed Number</Label>
                <Input
                  id="bedNumber"
                  value={admitForm.bedNumber}
                  onChange={(e) => setAdmitForm({...admitForm, bedNumber: e.target.value})}
                  placeholder="e.g., ICU-01"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Input
                id="diagnosis"
                value={admitForm.diagnosis}
                onChange={(e) => setAdmitForm({...admitForm, diagnosis: e.target.value})}
                placeholder="Primary diagnosis"
              />
            </div>
            
            <div>
              <Label htmlFor="doctor">Attending Doctor *</Label>
              <Select value={admitForm.doctor} onValueChange={(value) => setAdmitForm({...admitForm, doctor: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {staff.filter(s => s.role === 'Doctor').map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.name}>
                      {doctor.name} - {doctor.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={admitForm.phone}
                  onChange={(e) => setAdmitForm({...admitForm, phone: e.target.value})}
                  placeholder="Patient phone number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={admitForm.email}
                  onChange={(e) => setAdmitForm({...admitForm, email: e.target.value})}
                  placeholder="Patient email"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={admitForm.emergencyContact}
                onChange={(e) => setAdmitForm({...admitForm, emergencyContact: e.target.value})}
                placeholder="Emergency contact name and relationship"
              />
            </div>
            
            <div>
              <Label htmlFor="allergies">Known Allergies</Label>
              <Input
                id="allergies"
                value={admitForm.allergies}
                onChange={(e) => setAdmitForm({...admitForm, allergies: e.target.value})}
                placeholder="Separate multiple allergies with commas"
              />
            </div>
          </div>
        )}

        {action === 'surgery' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="patientId">Patient</Label>
              <Select value={surgeryForm.patientId} onValueChange={(value) => setSurgeryForm({...surgeryForm, patientId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.id}) - {patient.diagnosis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="surgeryType">Surgery Type</Label>
                <Input
                  id="surgeryType"
                  value={surgeryForm.surgeryType}
                  onChange={(e) => setSurgeryForm({...surgeryForm, surgeryType: e.target.value})}
                  placeholder="e.g., Appendectomy"
                />
              </div>
              <div>
                <Label htmlFor="surgeon">Surgeon</Label>
                <Select value={surgeryForm.surgeon} onValueChange={(value) => setSurgeryForm({...surgeryForm, surgeon: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select surgeon" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.filter(s => s.role === 'Doctor').map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={surgeryForm.date}
                  onChange={(e) => setSurgeryForm({...surgeryForm, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={surgeryForm.time}
                  onChange={(e) => setSurgeryForm({...surgeryForm, time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="room">Operating Room</Label>
                <Input
                  id="room"
                  value={surgeryForm.room}
                  onChange={(e) => setSurgeryForm({...surgeryForm, room: e.target.value})}
                  placeholder="OR-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Surgery Notes</Label>
              <Textarea
                id="notes"
                value={surgeryForm.notes}
                onChange={(e) => setSurgeryForm({...surgeryForm, notes: e.target.value})}
                placeholder="Pre-operative notes and special instructions"
              />
            </div>
          </div>
        )}

        {action === 'report' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportForm.type} onValueChange={(value) => setReportForm({...reportForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient-census">Patient Census</SelectItem>
                    <SelectItem value="financial">Financial Summary</SelectItem>
                    <SelectItem value="occupancy">Bed Occupancy</SelectItem>
                    <SelectItem value="medication">Medication Usage</SelectItem>
                    <SelectItem value="staff">Staff Performance</SelectItem>
                    <SelectItem value="quality">Quality Metrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={reportForm.department} onValueChange={(value) => setReportForm({...reportForm, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="general">General Ward</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={reportForm.dateRange} onValueChange={(value) => setReportForm({...reportForm, dateRange: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="format">Format</Label>
                <Select value={reportForm.format} onValueChange={(value) => setReportForm({...reportForm, format: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Type:</strong> {reportForm.type || 'Not selected'}</p>
                  <p><strong>Department:</strong> {reportForm.department || 'Not selected'}</p>
                  <p><strong>Date Range:</strong> {reportForm.dateRange || 'Not selected'}</p>
                  <p><strong>Format:</strong> {reportForm.format.toUpperCase()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {action === 'round' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ward">Ward</Label>
                <Select value={roundForm.ward} onValueChange={(value) => setRoundForm({...roundForm, ward: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="general-a">General Ward A</SelectItem>
                    <SelectItem value="general-b">General Ward B</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="roundDoctor">Lead Doctor</Label>
                <Select value={roundForm.doctor} onValueChange={(value) => setRoundForm({...roundForm, doctor: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.filter(s => s.role === 'Doctor').map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        {doctor.name} - {doctor.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={roundForm.startTime}
                onChange={(e) => setRoundForm({...roundForm, startTime: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="roundNotes">Round Notes</Label>
              <Textarea
                id="roundNotes"
                value={roundForm.notes}
                onChange={(e) => setRoundForm({...roundForm, notes: e.target.value})}
                placeholder="Special instructions or focus areas for this round"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Patients in Selected Ward
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patients.filter(p => p.status === 'active').slice(0, 3).map(patient => (
                    <div key={patient.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm">{patient.name} - {patient.bedNumber}</span>
                      <Badge variant="outline">{patient.condition}</Badge>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    {patients.filter(p => p.status === 'active').length} total patients to visit
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => {
            switch (action) {
              case 'admit': handleAdmitPatient(); break;
              case 'surgery': handleScheduleSurgery(); break;
              case 'report': handleGenerateReport(); break;
              case 'round': handleStartWardRound(); break;
            }
          }}>
            {action === 'admit' && 'Admit Patient'}
            {action === 'surgery' && 'Schedule Surgery'}
            {action === 'report' && 'Generate Report'}
            {action === 'round' && 'Start Ward Round'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}