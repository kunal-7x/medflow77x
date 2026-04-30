import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  currentDate: string;
  currentTime: string;
  patientName: string;
  doctor: string;
}

export function RescheduleModal({ 
  isOpen, 
  onClose, 
  appointmentId, 
  currentDate, 
  currentTime, 
  patientName, 
  doctor 
}: RescheduleModalProps) {
  const { updateAppointment, staff } = useHospitalData();
  const { toast } = useToast();
  
  const [newDate, setNewDate] = useState(currentDate);
  const [newTime, setNewTime] = useState(currentTime);
  const [newDoctor, setNewDoctor] = useState(doctor);
  const [reason, setReason] = useState('');

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const doctors = staff.filter(s => s.role === 'Doctor');

  const handleReschedule = () => {
    if (!newDate || !newTime) {
      toast({
        title: "Error",
        description: "Please select date and time",
        variant: "destructive"
      });
      return;
    }

    try {
      updateAppointment(appointmentId, {
        date: newDate,
        time: newTime,
        doctor: newDoctor,
        status: 'confirmed'
      });

      toast({
        title: "Success",
        description: `Appointment rescheduled for ${patientName}`
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm"><strong>Patient:</strong> {patientName}</p>
            <p className="text-sm"><strong>Current:</strong> {currentDate} at {currentTime}</p>
            <p className="text-sm"><strong>Doctor:</strong> {doctor}</p>
          </div>

          <div>
            <Label htmlFor="newDate">New Date</Label>
            <Input
              id="newDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label htmlFor="newTime">New Time</Label>
            <Select value={newTime} onValueChange={setNewTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="newDoctor">Doctor</Label>
            <Select value={newDoctor} onValueChange={setNewDoctor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doc => (
                  <SelectItem key={doc.id} value={doc.name}>
                    {doc.name} - {doc.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Reschedule</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional reason"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleReschedule}>
            Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}