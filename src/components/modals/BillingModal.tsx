import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'generate' | 'payment';
  billId?: string;
  patientId?: string;
}

export function BillingModal({ isOpen, onClose, type, billId, patientId }: BillingModalProps) {
  const { addBill, updateBill, bills, patients } = useHospitalData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', amount: 0 }],
    paymentMethod: 'cash',
    paymentAmount: 0,
    paymentReference: ''
  });

  const bill = billId ? bills.find(b => b.id === billId) : null;

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'generate') {
      if (!formData.patientId || formData.items.some(item => !item.description || item.amount <= 0)) {
        toast({
          title: "Error",
          description: "Please fill in all fields correctly",
          variant: "destructive"
        });
        return;
      }

      try {
        const patient = patients.find(p => p.id === formData.patientId);
        addBill({
          patientId: formData.patientId,
          patientName: patient?.name || 'Unknown',
          amount: totalAmount,
          status: 'pending',
          dueDate: formData.dueDate,
          items: formData.items
        });

        toast({
          title: "Success",
          description: "Invoice generated successfully"
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate invoice",
          variant: "destructive"
        });
      }
    } else if (type === 'payment' && billId && bill) {
      if (!formData.paymentMethod || formData.paymentAmount <= 0) {
        toast({
          title: "Error",
          description: "Please enter valid payment information",
          variant: "destructive"
        });
        return;
      }

      try {
        updateBill(billId, {
          status: formData.paymentAmount >= bill.amount ? 'paid' : 'pending'
        });

        toast({
          title: "Success",
          description: "Payment processed successfully"
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process payment",
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
            {type === 'generate' ? 'Generate Invoice' : 'Process Payment'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'generate' ? (
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
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Bill Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={item.amount || ''}
                        onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="font-semibold">Total Amount: ${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {bill && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm"><strong>Patient:</strong> {bill.patientName}</p>
                  <p className="text-sm"><strong>Amount Due:</strong> ${bill.amount.toFixed(2)}</p>
                  <p className="text-sm"><strong>Due Date:</strong> {bill.dueDate}</p>
                  <p className="text-sm"><strong>Status:</strong> {bill.status}</p>
                </div>
              )}

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={formData.paymentAmount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="paymentReference">Reference/Transaction ID</Label>
                <Input
                  id="paymentReference"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
                  placeholder="Optional reference"
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {type === 'generate' ? 'Generate Invoice' : 'Process Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}