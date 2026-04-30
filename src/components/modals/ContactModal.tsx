import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MessageSquare } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
}

export function ContactModal({ isOpen, onClose, patientName, patientPhone, patientEmail }: ContactModalProps) {
  const { toast } = useToast();
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'sms'>('phone');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const handleContact = () => {
    switch (contactMethod) {
      case 'phone':
        // Simulate phone call
        toast({
          title: "Call Initiated",
          description: `Calling ${patientName} at ${patientPhone}`
        });
        break;
      case 'email':
        if (!patientEmail) {
          toast({
            title: "Error",
            description: "No email address available for this patient",
            variant: "destructive"
          });
          return;
        }
        toast({
          title: "Email Sent",
          description: `Email sent to ${patientName} at ${patientEmail}`
        });
        break;
      case 'sms':
        toast({
          title: "SMS Sent",
          description: `SMS sent to ${patientName} at ${patientPhone}`
        });
        break;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {patientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Contact Method</Label>
            <Select value={contactMethod} onValueChange={(value: 'phone' | 'email' | 'sms') => setContactMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Call
                  </div>
                </SelectItem>
                <SelectItem value="email" disabled={!patientEmail}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Patient:</strong> {patientName}
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> {patientPhone}
            </p>
            {patientEmail && (
              <p className="text-sm">
                <strong>Email:</strong> {patientEmail}
              </p>
            )}
          </div>

          {contactMethod === 'email' && (
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
          )}

          {(contactMethod === 'email' || contactMethod === 'sms') && (
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Enter ${contactMethod === 'email' ? 'email' : 'SMS'} message`}
                rows={4}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleContact}>
            {contactMethod === 'phone' ? 'Call Now' : 
             contactMethod === 'email' ? 'Send Email' : 'Send SMS'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}