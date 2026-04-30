import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalData, Order } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  mode: 'create' | 'edit';
  defaultType?: 'Lab' | 'Imaging' | 'Pharmacy';
}

export function OrderFormModal({ isOpen, onClose, order, mode, defaultType }: OrderFormModalProps) {
  const { addOrder, updateOrder, patients } = useHospitalData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    patientId: order?.patientId || '',
    patientName: order?.patientName || '',
    type: order?.type || defaultType || 'Lab',
    test: order?.test || '',
    doctor: order?.doctor || '',
    priority: order?.priority || 'routine',
    status: order?.status || 'pending'
  });

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId,
        patientName: patient.name
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.test || !formData.doctor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const orderData = {
      ...formData,
      type: formData.type as Order['type'],
      priority: formData.priority as Order['priority'],
      status: formData.status as Order['status'],
      ordered: new Date().toISOString()
    } as Omit<Order, 'id'>;

    try {
      if (mode === 'create') {
        addOrder(orderData);
        toast({
          title: "Success",
          description: `${formData.type} order created successfully`
        });
      } else if (order) {
        updateOrder(order.id, orderData);
        toast({
          title: "Success",
          description: "Order updated successfully"
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save order",
        variant: "destructive"
      });
    }
  };

  const getTestOptions = () => {
    switch (formData.type) {
      case 'Lab':
        return [
          'Complete Blood Count',
          'Basic Metabolic Panel',
          'Lipid Panel',
          'Liver Function Tests',
          'Thyroid Function',
          'Urinalysis',
          'Blood Glucose',
          'HbA1c'
        ];
      case 'Imaging':
        return [
          'Chest X-Ray',
          'CT Scan',
          'MRI',
          'Ultrasound',
          'Echocardiogram',
          'Mammography',
          'Bone Scan'
        ];
      case 'Pharmacy':
        return [
          'Prescription',
          'Medication Review',
          'Drug Interaction Check',
          'Dosage Adjustment'
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? `New ${defaultType || 'Lab'} Order` : 'Edit Order'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient">Patient *</Label>
            <Select value={formData.patientId} onValueChange={handlePatientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.filter(p => p.status === 'active').map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Order Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Order['type'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lab">Lab</SelectItem>
                  <SelectItem value="Imaging">Imaging</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Order['priority'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="test">Test/Service *</Label>
            <Select value={formData.test} onValueChange={(value) => setFormData(prev => ({ ...prev, test: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select test or type custom" />
              </SelectTrigger>
              <SelectContent>
                {getTestOptions().map(test => (
                  <SelectItem key={test} value={test}>
                    {test}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="doctor">Ordering Physician *</Label>
            <Input
              id="doctor"
              value={formData.doctor}
              onChange={(e) => setFormData(prev => ({ ...prev, doctor: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Order['status'] }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Order' : 'Update Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}