import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalData, Patient } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  mode: 'create' | 'edit';
}

export function PatientFormModal({ isOpen, onClose, patient, mode }: PatientFormModalProps) {
  const { addPatient, updatePatient } = useHospitalData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    age: patient?.age || 0,
    gender: patient?.gender || '',
    diagnosis: patient?.diagnosis || '',
    doctor: patient?.doctor || '',
    phone: patient?.contactInfo.phone || '',
    email: patient?.contactInfo.email || '',
    emergencyContact: patient?.contactInfo.emergencyContact || '',
    allergies: patient?.allergies?.join(', ') || '',
    condition: patient?.condition || 'Good'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.diagnosis || !formData.doctor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const patientData = {
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender,
      diagnosis: formData.diagnosis,
      doctor: formData.doctor,
      condition: formData.condition as Patient['condition'],
      allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
      contactInfo: {
        phone: formData.phone,
        email: formData.email,
        emergencyContact: formData.emergencyContact
      },
      bedNumber: patient?.bedNumber || 'Unassigned',
      admissionDate: patient?.admissionDate || new Date().toISOString().split('T')[0],
      vitals: patient?.vitals || {
        heartRate: 0,
        bloodPressure: '0/0',
        temperature: 0,
        oxygenSat: 0,
        timestamp: new Date().toISOString()
      },
      vitalsHistory: patient?.vitalsHistory || [],
      lastUpdated: 'Just now',
      status: patient?.status || 'active'
    } as Omit<Patient, 'id'>;

    try {
      if (mode === 'create') {
        addPatient(patientData);
        toast({
          title: "Success",
          description: "Patient added successfully"
        });
      } else if (patient) {
        updatePatient(patient.id, patientData);
        toast({
          title: "Success",
          description: "Patient updated successfully"
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save patient",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Patient' : 'Edit Patient'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
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
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value as Patient['condition'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Stable">Stable</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="doctor">Attending Physician *</Label>
            <Input
              id="doctor"
              value={formData.doctor}
              onChange={(e) => setFormData(prev => ({ ...prev, doctor: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="allergies">Allergies (comma-separated)</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
              placeholder="e.g., Penicillin, Latex, Shellfish"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
              placeholder="Name - Relationship"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Add Patient' : 'Update Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}