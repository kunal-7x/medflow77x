import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalData, Patient } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export function VitalsModal({ isOpen, onClose, patient }: VitalsModalProps) {
  const { updatePatientVitals } = useHospitalData();
  const { toast } = useToast();
  
  const [vitals, setVitals] = useState({
    heartRate: patient.vitals.heartRate || 0,
    bloodPressure: patient.vitals.bloodPressure || '',
    temperature: patient.vitals.temperature || 0,
    oxygenSat: patient.vitals.oxygenSat || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVitals = {
      ...vitals,
      timestamp: new Date().toISOString()
    };

    updatePatientVitals(patient.id, newVitals);
    
    toast({
      title: "Success",
      description: "Vitals updated successfully"
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Vitals - {patient.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              value={vitals.heartRate}
              onChange={(e) => setVitals(prev => ({ ...prev, heartRate: Number(e.target.value) }))}
            />
          </div>

          <div>
            <Label htmlFor="bloodPressure">Blood Pressure</Label>
            <Input
              id="bloodPressure"
              placeholder="120/80"
              value={vitals.bloodPressure}
              onChange={(e) => setVitals(prev => ({ ...prev, bloodPressure: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={vitals.temperature}
              onChange={(e) => setVitals(prev => ({ ...prev, temperature: Number(e.target.value) }))}
            />
          </div>

          <div>
            <Label htmlFor="oxygenSat">Oxygen Saturation (%)</Label>
            <Input
              id="oxygenSat"
              type="number"
              value={vitals.oxygenSat}
              onChange={(e) => setVitals(prev => ({ ...prev, oxygenSat: Number(e.target.value) }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Vitals
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}