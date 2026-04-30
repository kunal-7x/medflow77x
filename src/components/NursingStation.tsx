import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Thermometer, Activity, Clock, CheckSquare, Users, AlertCircle, FileDown } from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { downloadTextReport, generateShiftReport } from "@/lib/exportUtils";

export function NursingStation() {
  const { patients, updatePatientVitals, addAlert } = useHospitalData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [vitalsPatient, setVitalsPatient] = useState<any>(null);
  const [carePlanPatient, setCarePlanPatient] = useState<any>(null);
  const [chartPatient, setChartPatient] = useState<any>(null);
  const [vitalsForm, setVitalsForm] = useState({ heartRate: '', bloodPressure: '', temperature: '', oxygenSat: '' });

  const activePatients = patients.filter(p => p.status === 'active').slice(0, 30);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const tasks = [
    { id: 't1', priority: 'urgent', label: 'Medication Due', patient: activePatients[0]?.name || 'Patient', room: activePatients[0]?.bedNumber || 'N/A' },
    { id: 't2', priority: 'high', label: 'Wound Dressing', patient: activePatients[1]?.name || 'Patient', room: activePatients[1]?.bedNumber || 'N/A' },
    { id: 't3', priority: 'routine', label: 'Discharge Preparation', patient: activePatients[2]?.name || 'Patient', room: activePatients[2]?.bedNumber || 'N/A' },
    { id: 't4', priority: 'routine', label: 'Vitals Check', patient: activePatients[3]?.name || 'Patient', room: activePatients[3]?.bedNumber || 'N/A' },
    { id: 't5', priority: 'high', label: 'IV Line Change', patient: activePatients[4]?.name || 'Patient', room: activePatients[4]?.bedNumber || 'N/A' },
  ];

  const handleEmergencyAlert = () => {
    addAlert({ type: 'critical', title: 'EMERGENCY ALERT', message: 'Emergency alert triggered from Nursing Station. Immediate response required.', timestamp: new Date().toISOString(), isRead: false, priority: 'high' });
    toast({ title: "🚨 Emergency Alert Sent", description: "Emergency team has been notified" });
  };

  const handleShiftHandover = () => {
    toast({ title: "Shift Handover", description: "Shift handover initiated. Generating report..." });
  };

  const handleUpdateVitals = () => {
    if (vitalsPatient) {
      updatePatientVitals(vitalsPatient.id, {
        heartRate: parseInt(vitalsForm.heartRate) || vitalsPatient.vitals.heartRate,
        bloodPressure: vitalsForm.bloodPressure || vitalsPatient.vitals.bloodPressure,
        temperature: parseFloat(vitalsForm.temperature) || vitalsPatient.vitals.temperature,
        oxygenSat: parseInt(vitalsForm.oxygenSat) || vitalsPatient.vitals.oxygenSat,
        timestamp: new Date().toISOString()
      });
      toast({ title: "Vitals Updated", description: `Vitals updated for ${vitalsPatient.name}` });
      setVitalsPatient(null);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
      return next;
    });
    toast({ title: completedTasks.has(taskId) ? "Task Reopened" : "Task Completed", description: `Task ${completedTasks.has(taskId) ? 'marked incomplete' : 'completed'}` });
  };

  const handleGenerateHandoverReport = () => {
    const nursingPatients = activePatients.map(p => ({
      name: p.name, room: p.bedNumber, condition: p.condition,
      vitals: { temp: `${p.vitals.temperature}°C`, bp: p.vitals.bloodPressure, hr: `${p.vitals.heartRate}`, spo2: `${p.vitals.oxygenSat}%` },
      tasks: ['Routine vitals', 'Medication check']
    }));
    const report = generateShiftReport(nursingPatients, { nurse: 'Current Nurse', shift: 'Day Shift (7AM-7PM)' });
    downloadTextReport(report, 'shift_handover_report');
    toast({ title: "Report Downloaded", description: "Shift handover report generated" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Nursing Station</h1>
          <p className="text-muted-foreground text-sm mt-1">Patient care management and shift coordination</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" variant="emergency" onClick={handleEmergencyAlert}>
            <Heart className="w-4 h-4" /> Emergency Alert
          </Button>
          <Button className="gap-2" variant="outline" onClick={handleShiftHandover}>
            <Users className="w-4 h-4" /> Shift Handover
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3"><Users className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{activePatients.length}</p><p className="text-sm text-muted-foreground">Assigned Patients</p></div></div>
            <div className="flex items-center gap-3"><AlertCircle className="w-8 h-8 text-destructive" /><div><p className="text-2xl font-bold">{tasks.filter(t => t.priority === 'urgent').length}</p><p className="text-sm text-muted-foreground">Critical Tasks</p></div></div>
            <div className="flex items-center gap-3"><CheckSquare className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{completedTasks.size}</p><p className="text-sm text-muted-foreground">Tasks Completed</p></div></div>
            <div className="flex items-center gap-3"><Clock className="w-8 h-8 text-accent" /><div><p className="text-lg font-bold">Day Shift</p><p className="text-sm text-muted-foreground">7AM - 7PM</p></div></div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Patient Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vitals Monitoring</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="handover">Shift Handover</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {activePatients.slice(0, 12).map((patient) => (
              <Card key={patient.id} className="hover:shadow-medical transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <Badge variant={patient.condition === 'Critical' ? 'destructive' : patient.condition === 'Fair' ? 'warning' : 'default'}>{patient.condition}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Bed {patient.bedNumber} • {patient.diagnosis.slice(0, 25)}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1"><Thermometer className="w-4 h-4 text-destructive" /><span>{patient.vitals.temperature}°C</span></div>
                      <div className="flex items-center gap-1"><Activity className="w-4 h-4 text-primary" /><span>{patient.vitals.bloodPressure}</span></div>
                      <div className="flex items-center gap-1"><Heart className="w-4 h-4 text-primary" /><span>{patient.vitals.heartRate} BPM</span></div>
                      <div className="flex items-center gap-1"><Activity className="w-4 h-4 text-accent" /><span>{patient.vitals.oxygenSat}%</span></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setChartPatient(patient)}>View Chart</Button>
                      <Button size="sm" variant="medical" className="flex-1" onClick={() => setCarePlanPatient(patient)}>Update Care</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Vitals Monitoring Dashboard</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {activePatients.slice(0, 12).map((patient) => (
                  <div key={patient.id} className="p-4 border border-border/30 rounded-lg">
                    <h3 className="font-medium mb-2">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">Bed {patient.bedNumber}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span>Temperature:</span><span className="font-medium">{patient.vitals.temperature}°C</span></div>
                      <div className="flex justify-between text-sm"><span>Blood Pressure:</span><span className="font-medium">{patient.vitals.bloodPressure}</span></div>
                      <div className="flex justify-between text-sm"><span>Heart Rate:</span><span className="font-medium">{patient.vitals.heartRate} BPM</span></div>
                      <div className="flex justify-between text-sm"><span>SpO2:</span><span className="font-medium">{patient.vitals.oxygenSat}%</span></div>
                    </div>
                    <Button size="sm" className="w-full mt-3" variant="outline" onClick={() => {
                      setVitalsPatient(patient);
                      setVitalsForm({ heartRate: String(patient.vitals.heartRate), bloodPressure: patient.vitals.bloodPressure, temperature: String(patient.vitals.temperature), oxygenSat: String(patient.vitals.oxygenSat) });
                    }}>Update Vitals</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Task Management</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className={`p-4 border-l-4 rounded transition-all ${completedTasks.has(task.id) ? 'border-primary/30 bg-secondary/10 opacity-60' : task.priority === 'urgent' ? 'border-destructive bg-destructive/5' : task.priority === 'high' ? 'border-warning bg-warning/5' : 'border-primary bg-primary/5'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${completedTasks.has(task.id) ? 'line-through text-muted-foreground' : task.priority === 'urgent' ? 'text-destructive' : task.priority === 'high' ? 'text-warning' : 'text-primary'}`}>
                          {task.priority === 'urgent' ? 'Urgent' : task.priority === 'high' ? 'High' : 'Routine'}: {task.label}
                        </p>
                        <p className="text-sm text-muted-foreground">{task.patient} - {task.room}</p>
                      </div>
                      <Button size="sm" variant={completedTasks.has(task.id) ? 'outline' : task.priority === 'urgent' ? 'destructive' : task.priority === 'high' ? 'warning' : 'outline'} onClick={() => toggleTask(task.id)}>
                        {completedTasks.has(task.id) ? 'Reopen' : 'Complete'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="handover" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Shift Handover Report</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Critical Updates</h3>
                  <div className="space-y-2 text-sm">
                    {activePatients.filter(p => p.condition === 'Critical').slice(0, 5).map((p, i) => (
                      <p key={i}>• {p.name} ({p.bedNumber}): {p.diagnosis} - Condition: {p.condition}</p>
                    ))}
                    {activePatients.filter(p => p.condition === 'Critical').length === 0 && <p>• No critical patients at this time</p>}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Pending Tasks for Next Shift</h3>
                  <div className="space-y-2 text-sm">
                    {tasks.filter(t => !completedTasks.has(t.id)).map((t, i) => (
                      <p key={i}>• {t.room}: {t.label} - {t.patient}</p>
                    ))}
                  </div>
                </div>
                <Button className="w-full gap-2" onClick={handleGenerateHandoverReport}>
                  <FileDown className="w-4 h-4" /> Generate Handover Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Vitals Modal */}
      <Dialog open={!!vitalsPatient} onOpenChange={() => setVitalsPatient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Vitals - {vitalsPatient?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Heart Rate (BPM)</Label><Input value={vitalsForm.heartRate} onChange={e => setVitalsForm(f => ({...f, heartRate: e.target.value}))} /></div>
              <div><Label>Blood Pressure</Label><Input value={vitalsForm.bloodPressure} onChange={e => setVitalsForm(f => ({...f, bloodPressure: e.target.value}))} /></div>
              <div><Label>Temperature (°C)</Label><Input value={vitalsForm.temperature} onChange={e => setVitalsForm(f => ({...f, temperature: e.target.value}))} /></div>
              <div><Label>SpO2 (%)</Label><Input value={vitalsForm.oxygenSat} onChange={e => setVitalsForm(f => ({...f, oxygenSat: e.target.value}))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVitalsPatient(null)}>Cancel</Button>
              <Button onClick={handleUpdateVitals}>Save Vitals</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Chart Modal */}
      <Dialog open={!!chartPatient} onOpenChange={() => setChartPatient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Patient Chart - {chartPatient?.name}</DialogTitle></DialogHeader>
          {chartPatient && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">ID:</span> {chartPatient.id}</div>
                <div><span className="text-muted-foreground">Bed:</span> {chartPatient.bedNumber}</div>
                <div><span className="text-muted-foreground">Age:</span> {chartPatient.age}</div>
                <div><span className="text-muted-foreground">Condition:</span> {chartPatient.condition}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Diagnosis:</span> {chartPatient.diagnosis}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Doctor:</span> {chartPatient.doctor}</div>
              </div>
              <div className="border-t border-border/30 pt-3">
                <h4 className="font-medium mb-2">Vitals History</h4>
                {chartPatient.vitalsHistory?.slice(0, 5).map((v: any, i: number) => (
                  <div key={i} className="text-xs text-muted-foreground py-1">HR: {v.heartRate} | BP: {v.bloodPressure} | T: {v.temperature}°C | SpO2: {v.oxygenSat}%</div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Care Plan Modal */}
      <Dialog open={!!carePlanPatient} onOpenChange={() => setCarePlanPatient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Care Plan - {carePlanPatient?.name}</DialogTitle></DialogHeader>
          {carePlanPatient && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Current: {carePlanPatient.diagnosis}</p>
              <p className="text-sm">Care plan updated. Continue current treatment protocol.</p>
              <Button className="w-full" onClick={() => { toast({ title: "Care Plan Updated", description: `Care plan updated for ${carePlanPatient.name}` }); setCarePlanPatient(null); }}>Save Care Plan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
