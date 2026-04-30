import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus, Clock, FileText, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { AdmissionFormModal } from "@/components/modals/AdmissionFormModal";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadTextReport } from "@/lib/exportUtils";

export function Admissions() {
  const { patients, dischargePatient, addAlert } = useHospitalData();
  const { toast } = useToast();
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [detailPatient, setDetailPatient] = useState<any>(null);
  const [summaryPatient, setSummaryPatient] = useState<any>(null);

  const activePatients = patients.filter(p => p.status === 'active');
  const dischargedPatients = patients.filter(p => p.status === 'discharged').slice(0, 20);
  const pendingInsurance = activePatients.filter((_, i) => i % 7 === 0).slice(0, 5);
  const pendingSummaries = dischargedPatients.filter((_, i) => i % 3 === 0).slice(0, 5);

  const handleDischarge = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsDischargeOpen(true);
  };

  const handleQuickDischarge = (patientId: string) => {
    dischargePatient(patientId);
    toast({ title: "Patient Discharged", description: "Patient has been discharged successfully" });
  };

  const handleVerifyInsurance = (patient: any) => {
    toast({ title: "Insurance Verified", description: `Insurance verified for ${patient.name}` });
  };

  const handleCompleteSummary = (patient: any) => {
    const content = `DISCHARGE SUMMARY\n\nPatient: ${patient.name}\nID: ${patient.id}\nDiagnosis: ${patient.diagnosis}\nDoctor: ${patient.doctor}\nAdmission: ${patient.admissionDate}\nDischarge: ${new Date().toLocaleDateString()}\n\nSummary: Patient recovered well. Follow-up recommended in 2 weeks.`;
    downloadTextReport(content, `discharge_summary_${patient.id}`);
    toast({ title: "Summary Generated", description: "Discharge summary downloaded" });
  };

  const handleFollowUp = (patient: any) => {
    toast({ title: "Follow-up Scheduled", description: `Follow-up appointment scheduled for ${patient.name} in 2 weeks` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Admissions & Discharge</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage patient admissions and discharge processes</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2 text-xs" variant="default" size="sm" onClick={() => setIsAdmissionOpen(true)}>
            <UserPlus className="w-3.5 h-3.5" /> New Admission
          </Button>
          <Button className="gap-2 text-xs" variant="medical" size="sm" onClick={() => {
            if (activePatients.length > 0) {
              setSelectedPatientId(activePatients[0].id);
              setIsDischargeOpen(true);
            } else {
              toast({ title: "No patients", description: "No active patients to discharge", variant: "destructive" });
            }
          }}>
            <UserMinus className="w-3.5 h-3.5" /> Discharge
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: UserPlus, value: activePatients.length.toString(), label: "Active Admissions", color: "text-primary" },
          { icon: UserMinus, value: dischargedPatients.length.toString(), label: "Recent Discharges", color: "text-success" },
          { icon: Clock, value: pendingSummaries.length.toString(), label: "Pending Summaries", color: "text-warning" },
          { icon: AlertCircle, value: pendingInsurance.length.toString(), label: "Insurance Issues", color: "text-destructive" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold animate-count-up">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="admissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admissions">Active Admissions</TabsTrigger>
          <TabsTrigger value="discharges">Recent Discharges</TabsTrigger>
          <TabsTrigger value="pending">Pending Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="admissions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Current Admissions ({activePatients.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {activePatients.slice(0, 30).map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-primary/20 bg-secondary/10 hover:bg-secondary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-center"><p className="font-semibold text-sm font-mono">{p.bedNumber}</p><p className="text-[10px] text-muted-foreground">Bed</p></div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.doctor}</p>
                        <p className="text-[10px] text-muted-foreground">Admitted: {p.admissionDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.condition === 'Critical' ? 'destructive' : p.condition === 'Stable' ? 'default' : 'secondary'}>{p.condition}</Badge>
                      <Badge variant="outline">{p.diagnosis.slice(0, 20)}</Badge>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setDetailPatient(p)}>
                        <Eye className="w-3 h-3 mr-1" /> Details
                      </Button>
                      <Button size="sm" variant="medical" className="text-xs h-7" onClick={() => handleDischarge(p.id)}>Discharge</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discharges" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Recent Discharges ({dischargedPatients.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {dischargedPatients.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-secondary/10 hover:bg-secondary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-center"><p className="font-semibold text-sm font-mono">{p.id}</p><p className="text-[10px] text-muted-foreground">ID</p></div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.doctor}</p>
                        <p className="text-[10px] text-muted-foreground">Discharged • {p.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Discharged</Badge>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleCompleteSummary(p)}>
                        <FileText className="w-3 h-3 mr-1" /> Summary
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleFollowUp(p)}>Follow-up</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Pending Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInsurance.map((p) => (
                  <div key={`ins-${p.id}`} className="p-3 border-l-2 border-warning bg-warning/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium text-sm">Insurance Verification Required</p><p className="text-xs text-muted-foreground">{p.name} - Bed {p.bedNumber}</p></div>
                      <Button size="sm" variant="warning" className="text-xs h-7" onClick={() => handleVerifyInsurance(p)}>Verify Now</Button>
                    </div>
                  </div>
                ))}
                {pendingSummaries.map((p) => (
                  <div key={`sum-${p.id}`} className="p-3 border-l-2 border-primary bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium text-sm">Discharge Summary Pending</p><p className="text-xs text-muted-foreground">{p.name} - {p.id}</p></div>
                      <Button size="sm" variant="default" className="text-xs h-7" onClick={() => handleCompleteSummary(p)}>Complete Summary</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AdmissionFormModal isOpen={isAdmissionOpen} onClose={() => setIsAdmissionOpen(false)} type="admission" />
      <AdmissionFormModal isOpen={isDischargeOpen} onClose={() => { setIsDischargeOpen(false); setSelectedPatientId(null); }} type="discharge" patientId={selectedPatientId || undefined} />

      {/* Patient Details Modal */}
      <Dialog open={!!detailPatient} onOpenChange={() => setDetailPatient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Patient Details</DialogTitle></DialogHeader>
          {detailPatient && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{detailPatient.name}</span></div>
                <div><span className="text-muted-foreground">ID:</span> <span className="font-mono">{detailPatient.id}</span></div>
                <div><span className="text-muted-foreground">Age:</span> {detailPatient.age}</div>
                <div><span className="text-muted-foreground">Gender:</span> {detailPatient.gender}</div>
                <div><span className="text-muted-foreground">Bed:</span> {detailPatient.bedNumber}</div>
                <div><span className="text-muted-foreground">Condition:</span> <Badge variant={detailPatient.condition === 'Critical' ? 'destructive' : 'default'}>{detailPatient.condition}</Badge></div>
                <div className="col-span-2"><span className="text-muted-foreground">Diagnosis:</span> {detailPatient.diagnosis}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Doctor:</span> {detailPatient.doctor}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Allergies:</span> {detailPatient.allergies?.join(', ') || 'None'}</div>
                <div><span className="text-muted-foreground">HR:</span> {detailPatient.vitals?.heartRate} bpm</div>
                <div><span className="text-muted-foreground">BP:</span> {detailPatient.vitals?.bloodPressure}</div>
                <div><span className="text-muted-foreground">Temp:</span> {detailPatient.vitals?.temperature}°C</div>
                <div><span className="text-muted-foreground">SpO2:</span> {detailPatient.vitals?.oxygenSat}%</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
