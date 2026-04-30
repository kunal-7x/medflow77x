import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";

interface MedicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'prescribe' | 'administer';
  medicationId?: string;
  patientId?: string;
}

export function MedicationFormModal({ isOpen, onClose, type, medicationId, patientId }: MedicationFormModalProps) {
  const { addMedication, administerMedication, patients, staff, medications } = useHospitalData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    medication: '',
    dosage: '',
    frequency: '',
    doctor: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    administeredBy: '',
    notes: ''
  });

  const nurses = staff.filter(s => s.role === 'Nurse');
  const doctors = staff.filter(s => s.role === 'Doctor');
  const medication = medicationId ? medications.find(m => m.id === medicationId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'prescribe') {
      if (!formData.patientId || !formData.medication || !formData.dosage || !formData.frequency || !formData.doctor) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      try {
        const patient = patients.find(p => p.id === formData.patientId);
        addMedication({
          patientId: formData.patientId,
          patientName: patient?.name || 'Unknown',
          medication: formData.medication,
          dosage: formData.dosage,
          frequency: formData.frequency,
          doctor: formData.doctor,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: 'active',
          administrationLog: []
        });

        toast({
          title: "Success",
          description: "Medication prescribed successfully"
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to prescribe medication",
          variant: "destructive"
        });
      }
    } else if (type === 'administer' && medicationId) {
      if (!formData.administeredBy) {
        toast({
          title: "Error",
          description: "Please select who administered the medication",
          variant: "destructive"
        });
        return;
      }

      try {
        administerMedication(medicationId, formData.administeredBy, formData.notes);
        
        toast({
          title: "Success",
          description: "Medication administration recorded"
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to record medication administration",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'prescribe' ? 'New Prescription' : 'Administer Medication'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'prescribe' ? (
            <>
              <div>
                <Label htmlFor="patientId">Patient *</Label>
                <Select 
                  value={formData.patientId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.filter(p => p.status === 'active').map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.bedNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="medication">Medication *</Label>
                <Input
                  id="medication"
                  value={formData.medication}
                  onChange={(e) => setFormData(prev => ({ ...prev, medication: e.target.value }))}
                  placeholder="e.g., Aspirin"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g., 81mg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="Four times daily">Four times daily</SelectItem>
                      <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                      <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                      <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="doctor">Prescribing Doctor *</Label>
                <Select 
                  value={formData.doctor} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, doctor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        {doctor.name} - {doctor.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {medication && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm"><strong>Patient:</strong> {medication.patientName}</p>
                  <p className="text-sm"><strong>Medication:</strong> {medication.medication}</p>
                  <p className="text-sm"><strong>Dosage:</strong> {medication.dosage}</p>
                  <p className="text-sm"><strong>Frequency:</strong> {medication.frequency}</p>
                </div>
              )}

              <div>
                <Label htmlFor="administeredBy">Administered By *</Label>
                <Select 
                  value={formData.administeredBy} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, administeredBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nurse" />
                  </SelectTrigger>
                  <SelectContent>
                    {nurses.map(nurse => (
                      <SelectItem key={nurse.id} value={nurse.name}>
                        {nurse.name} - {nurse.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any notes about administration..."
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {type === 'prescribe' ? 'Prescribe' : 'Record Administration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}