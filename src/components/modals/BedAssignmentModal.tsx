import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalData, Bed } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";

interface BedAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: Bed;
}

export function BedAssignmentModal({ isOpen, onClose, bed }: BedAssignmentModalProps) {
  const { assignBed, patients } = useHospitalData();
  const { toast } = useToast();
  
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Show ALL active patients - those without beds AND those with beds (for transfers)
  const availablePatients = patients.filter(patient => 
    patient.status === 'active'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatientId) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive"
      });
      return;
    }

    try {
      assignBed(bed.id, selectedPatientId);
      toast({
        title: "Success",
        description: `Patient assigned to bed ${bed.number}`
      });
      setSelectedPatientId('');
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign bed",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Patient to Bed {bed.number}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient">Select Patient ({availablePatients.length} available)</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {availablePatients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.id}) - {patient.diagnosis.slice(0, 30)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Bed:</strong> {bed.number}</p>
            <p><strong>Ward:</strong> {bed.ward}</p>
            <p><strong>Floor:</strong> {bed.floor}</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Assign Patient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
