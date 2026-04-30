import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Plus, Search, Filter, CheckCircle, XCircle, Eye } from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { AppointmentFormModal } from "@/components/modals/AppointmentFormModal";
import { ContactModal } from "@/components/modals/ContactModal";
import { RescheduleModal } from "@/components/modals/RescheduleModal";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Appointments() {
  const { appointments, updateAppointment, deleteAppointment, getAnalytics } = useHospitalData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [viewAppointment, setViewAppointment] = useState<any>(null);
  
  const analytics = getAnalytics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "warning";
      case "cancelled": return "destructive";
      case "completed": return "secondary";
      default: return "secondary";
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || apt.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCancel = (apt: any) => {
    updateAppointment(apt.id, { status: 'cancelled' });
    toast({ title: "Cancelled", description: `Appointment for ${apt.patientName} cancelled` });
  };

  const handleCheckIn = (apt: any) => {
    updateAppointment(apt.id, { status: 'confirmed' });
    toast({ title: "Checked In", description: `${apt.patientName} checked in` });
  };

  const handleComplete = (apt: any) => {
    updateAppointment(apt.id, { status: 'completed' });
    toast({ title: "Completed", description: `Appointment for ${apt.patientName} completed` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Appointments & Scheduling</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage patient appointments and schedules</p>
        </div>
        <Button className="gap-2" variant="default" onClick={() => setIsAppointmentModalOpen(true)}>
          <Plus className="w-4 h-4" /> New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Calendar, value: appointments.length, label: "Total Appointments", color: "text-primary" },
          { icon: CheckCircle, value: appointments.filter(a => a.status === 'confirmed').length, label: "Confirmed", color: "text-primary" },
          { icon: Clock, value: appointments.filter(a => a.status === 'pending').length, label: "Pending", color: "text-warning" },
          { icon: XCircle, value: appointments.filter(a => a.status === 'cancelled').length, label: "Cancelled", color: "text-destructive" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-6"><div className="flex items-center gap-3"><s.icon className={`w-8 h-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search patients or doctors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Appointments ({filteredAppointments.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredAppointments.slice(0, 30).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-border/30 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-semibold">{appointment.time}</p>
                        <p className="text-sm text-muted-foreground">{appointment.date}</p>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                        <p className="text-xs text-muted-foreground">{appointment.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(appointment.status) as any}>{appointment.status}</Badge>
                      <Badge variant="outline">{appointment.type}</Badge>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setViewAppointment(appointment)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedAppointment(appointment); setIsRescheduleModalOpen(true); }}>Reschedule</Button>
                        {appointment.status === 'pending' && <Button size="sm" variant="medical" className="h-7 text-xs" onClick={() => handleCheckIn(appointment)}>Check-in</Button>}
                        {appointment.status === 'confirmed' && <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleComplete(appointment)}>Complete</Button>}
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleCancel(appointment)}>Cancel</Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedAppointment(appointment); setIsContactModalOpen(true); }}>
                          <Phone className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <Card>
            <CardHeader><CardTitle>Weekly Schedule</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, di) => (
                  <div key={day} className="border border-border/30 rounded-lg p-3 min-h-[150px]">
                    <h3 className="font-semibold text-center mb-2 text-sm">{day}</h3>
                    <div className="space-y-1.5">
                      {appointments.slice(di * 3, di * 3 + 3).map((apt) => (
                        <div key={apt.id} className="text-xs p-1.5 bg-primary/10 rounded cursor-pointer hover:bg-primary/20" onClick={() => setViewAppointment(apt)}>
                          <p className="font-medium">{apt.time} - {apt.patientName.split(' ')[0]}</p>
                          <p className="text-muted-foreground">{apt.doctor.split(' ').slice(0, 2).join(' ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader><CardTitle>Calendar View</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 2;
                  const hasApts = dayNum > 0 && dayNum <= 28 && appointments.filter((_, idx) => idx % 28 === dayNum - 1).length > 0;
                  return (
                    <div key={i} className={`p-2 min-h-[80px] border border-border/20 rounded-lg ${dayNum > 0 && dayNum <= 28 ? 'hover:bg-secondary/30' : 'opacity-30'}`}>
                      {dayNum > 0 && dayNum <= 28 && (
                        <>
                          <p className="text-xs font-medium">{dayNum}</p>
                          {hasApts && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AppointmentFormModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} mode="create" />

      {selectedAppointment && (
        <>
          <ContactModal isOpen={isContactModalOpen} onClose={() => { setIsContactModalOpen(false); setSelectedAppointment(null); }} patientName={selectedAppointment.patientName} patientPhone={selectedAppointment.phone} />
          <RescheduleModal isOpen={isRescheduleModalOpen} onClose={() => { setIsRescheduleModalOpen(false); setSelectedAppointment(null); }} appointmentId={selectedAppointment.id} currentDate={selectedAppointment.date} currentTime={selectedAppointment.time} patientName={selectedAppointment.patientName} doctor={selectedAppointment.doctor} />
        </>
      )}

      {/* View Appointment Modal */}
      <Dialog open={!!viewAppointment} onOpenChange={() => setViewAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Appointment Details</DialogTitle></DialogHeader>
          {viewAppointment && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Patient:</span> {viewAppointment.patientName}</div>
                <div><span className="text-muted-foreground">Doctor:</span> {viewAppointment.doctor}</div>
                <div><span className="text-muted-foreground">Date:</span> {viewAppointment.date}</div>
                <div><span className="text-muted-foreground">Time:</span> {viewAppointment.time}</div>
                <div><span className="text-muted-foreground">Type:</span> {viewAppointment.type}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewAppointment.status) as any}>{viewAppointment.status}</Badge></div>
                <div><span className="text-muted-foreground">Phone:</span> {viewAppointment.phone}</div>
                {viewAppointment.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {viewAppointment.notes}</div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
