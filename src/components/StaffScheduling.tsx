import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, Clock, UserCheck, UserX, Plus, RotateCcw, Eye } from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { StaffFormModal } from "@/components/modals/StaffFormModal";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function StaffScheduling() {
  const { staff, updateStaff } = useHospitalData();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | undefined>();
  const [viewSchedule, setViewSchedule] = useState<any>(null);
  const [viewStaff, setViewStaff] = useState<any>(null);

  const activeStaff = staff.filter(s => s.status === 'active');
  const onLeave = staff.filter(s => s.status === 'on-leave');
  const offDuty = staff.filter(s => s.status === 'off-duty');
  const doctors = staff.filter(s => s.role === 'Doctor' || s.role === 'Surgeon');
  const nurses = staff.filter(s => s.role === 'Nurse');

  // Mock time-off requests
  const [requests, setRequests] = useState([
    { id: 'r1', staffName: staff[0]?.name || 'Staff Member', type: 'Time Off', dates: 'Jan 20-22, 2025', reason: 'Family vacation', status: 'pending' },
    { id: 'r2', staffName: staff[1]?.name || 'Staff Member', type: 'Shift Swap', dates: 'Next Friday', reason: 'Personal', status: 'pending' },
    { id: 'r3', staffName: staff[2]?.name || 'Staff Member', type: 'Time Off', dates: 'Feb 1-3, 2025', reason: 'Medical appointment', status: 'approved' },
  ]);

  // Mock weekly schedule
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const departments = ['Emergency', 'ICU', 'Surgery', 'General', 'Pediatrics'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "on-duty": case "approved": return "default";
      case "off-duty": return "secondary";
      case "on-leave": case "pending": return "warning";
      case "denied": return "destructive";
      default: return "secondary";
    }
  };

  const handleAutoSchedule = () => {
    toast({ title: "Auto-Schedule", description: "Schedule optimized based on staff availability and department needs" });
  };

  const handleApproveRequest = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
    toast({ title: "Approved", description: "Request approved" });
  };

  const handleDenyRequest = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'denied' } : r));
    toast({ title: "Denied", description: "Request denied" });
  };

  const handleEditStaff = (staffId: string) => {
    setEditStaffId(staffId);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Staff Scheduling</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage staff schedules, shifts, and time-off requests</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" variant="default" onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4" /> Add Shift</Button>
          <Button className="gap-2" variant="medical" onClick={handleAutoSchedule}><RotateCcw className="w-4 h-4" /> Auto Schedule</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Users, value: staff.length, label: "Total Staff", color: "text-primary" },
          { icon: UserCheck, value: activeStaff.length, label: "On Duty", color: "text-primary" },
          { icon: UserX, value: onLeave.length, label: "On Leave", color: "text-warning" },
          { icon: Clock, value: requests.filter(r => r.status === 'pending').length, label: "Pending Requests", color: "text-accent" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-6"><div className="flex items-center gap-3"><s.icon className={`w-8 h-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="requests">Time-off Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Weekly Schedule Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weekDays.slice(0, 5).map((day, di) => (
                  <div key={day} className="border border-border/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium">{day}</h3>
                      <Button size="sm" variant="outline" onClick={() => { setEditStaffId(undefined); setIsAddOpen(true); }}>Edit Day</Button>
                    </div>
                    <div className="space-y-2">
                      {departments.slice(0, 3).map((dept, deptIdx) => {
                        const deptStaff = activeStaff.filter(s => s.department === dept || deptIdx % 2 === 0).slice(deptIdx * 2, deptIdx * 2 + 3);
                        return (
                          <div key={dept} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/20">
                            <div><p className="font-medium text-sm">{di % 2 === 0 ? '7AM-7PM' : '7PM-7AM'}</p><p className="text-sm text-muted-foreground">{dept}</p></div>
                            <div className="flex flex-wrap gap-2">
                              {deptStaff.map((member) => (<Badge key={member.id} variant="outline">{member.name.split(' ').slice(0, 2).join(' ')}</Badge>))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Staff Directory ({staff.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {staff.slice(0, 50).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-border/30 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
                        <p className="text-xs text-muted-foreground">Shift: {member.shift}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(member.status) as any}>{member.status}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setViewStaff(member)}><Eye className="w-3 h-3 mr-1" /> View</Button>
                        <Button size="sm" variant="medical" onClick={() => handleEditStaff(member.id)}>Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Time-off & Shift Requests</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border border-border/30 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{request.staffName}</p>
                        <p className="text-sm text-muted-foreground">{request.type} • {request.dates}</p>
                        <p className="text-xs text-muted-foreground">Reason: {request.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(request.status) as any}>{request.status}</Badge>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={() => handleApproveRequest(request.id)}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDenyRequest(request.id)}>Deny</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Staffing Analytics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Department Coverage</h3>
                  <div className="space-y-2">
                    {['Emergency','ICU','Surgery','Cardiology','Pediatrics'].map(dept => {
                      const count = staff.filter(s => s.department === dept && s.status === 'active').length;
                      const total = staff.filter(s => s.department === dept).length;
                      const pct = total > 0 ? Math.round((count/total)*100) : 0;
                      return (
                        <div key={dept} className="flex justify-between p-3 border border-border/30 rounded">
                          <span className="text-sm">{dept}</span>
                          <span className={`font-medium text-sm ${pct >= 90 ? 'text-primary' : pct >= 70 ? 'text-warning' : 'text-destructive'}`}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Staff Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 border border-border/30 rounded"><span className="text-sm">Doctors</span><span className="font-medium text-sm">{doctors.length}</span></div>
                    <div className="flex justify-between p-3 border border-border/30 rounded"><span className="text-sm">Nurses</span><span className="font-medium text-sm">{nurses.length}</span></div>
                    <div className="flex justify-between p-3 border border-border/30 rounded"><span className="text-sm">Other Staff</span><span className="font-medium text-sm">{staff.length - doctors.length - nurses.length}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StaffFormModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} type="add" />
      <StaffFormModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditStaffId(undefined); }} type="edit" staffId={editStaffId} />

      {/* View Staff Modal */}
      <Dialog open={!!viewStaff} onOpenChange={() => setViewStaff(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Staff Details</DialogTitle></DialogHeader>
          {viewStaff && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Name:</span> {viewStaff.name}</div>
                <div><span className="text-muted-foreground">ID:</span> {viewStaff.id}</div>
                <div><span className="text-muted-foreground">Role:</span> {viewStaff.role}</div>
                <div><span className="text-muted-foreground">Department:</span> {viewStaff.department}</div>
                <div><span className="text-muted-foreground">Shift:</span> {viewStaff.shift}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewStaff.status) as any}>{viewStaff.status}</Badge></div>
                <div><span className="text-muted-foreground">Phone:</span> {viewStaff.phone}</div>
                <div><span className="text-muted-foreground">Email:</span> {viewStaff.email}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
