import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";

interface AdmissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'admission' | 'discharge';
  patientId?: string;
}

export function AdmissionFormModal({ isOpen, onClose, type, patientId }: AdmissionFormModalProps) {
  const { addPatient, dischargePatient, beds, addAlert } = useHospitalData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    diagnosis: '',
    doctor: '',
    bedNumber: '',
    allergies: '',
    emergencyContact: '',
    phone: '',
    email: '',
    dischargeReason: '',
    followUpRequired: false
  });

  const availableBeds = beds.filter(bed => bed.status === 'available');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'admission') {
      if (!formData.name || !formData.age || !formData.diagnosis || !formData.doctor || !formData.bedNumber) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      try {
        const patientId = await addPatient({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          condition: 'Stable',
          bedNumber: formData.bedNumber,
          admissionDate: new Date().toISOString().split('T')[0],
          doctor: formData.doctor,
          diagnosis: formData.diagnosis,
          allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
          vitals: {
            heartRate: 80,
            bloodPressure: '120/80',
            temperature: 36.5,
            oxygenSat: 98,
            timestamp: new Date().toISOString()
          },
          vitalsHistory: [],
          lastUpdated: 'Just now',
          contactInfo: {
            phone: formData.phone,
            email: formData.email,
            emergencyContact: formData.emergencyContact
          },
          status: 'active'
        });

        // Assign bed
        const selectedBed = beds.find(bed => bed.number === formData.bedNumber);
        if (selectedBed) {
          // This would be handled by assignBed function if we had the bed ID
        }

        // Create admission alert
        addAlert({
          type: 'info',
          title: 'New Patient Admission',
          message: `${formData.name} has been admitted to ${formData.bedNumber}`,
          timestamp: new Date().toISOString(),
          isRead: false,
          patientId: patientId,
          priority: 'medium'
        });

        toast({
          title: "Success",
          description: "Patient admitted successfully"
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to admit patient",
          variant: "destructive"
        });
      }
    } else if (type === 'discharge' && patientId) {
      try {
        dischargePatient(patientId);
        
        addAlert({
          type: 'info',
          title: 'Patient Discharged',
          message: `Patient has been discharged. Follow-up: ${formData.followUpRequired ? 'Required' : 'Not required'}`,
          timestamp: new Date().toISOString(),
          isRead: false,
          patientId: patientId,
          priority: 'low'
        });

        toast({
          title: "Success",
          description: "Patient discharged successfully"
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to discharge patient",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === 'admission' ? 'New Patient Admission' : 'Discharge Patient'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'admission' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Patient Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    required
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
                  <Label htmlFor="bedNumber">Bed Assignment *</Label>
                  <Select value={formData.bedNumber} onValueChange={(value) => setFormData(prev => ({ ...prev, bedNumber: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select available bed" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBeds.map(bed => (
                        <SelectItem key={bed.id} value={bed.number}>
                          {bed.number} - {bed.ward}
                        </SelectItem>
                      ))}
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
                <Label htmlFor="doctor">Attending Doctor *</Label>
                <Input
                  id="doctor"
                  value={formData.doctor}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctor: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies (comma separated)</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="e.g., Penicillin, Latex"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
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
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="dischargeReason">Discharge Reason</Label>
                <Textarea
                  id="dischargeReason"
                  value={formData.dischargeReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, dischargeReason: e.target.value }))}
                  placeholder="Reason for discharge..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                />
                <Label htmlFor="followUpRequired">Follow-up appointment required</Label>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {type === 'admission' ? 'Admit Patient' : 'Discharge Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}