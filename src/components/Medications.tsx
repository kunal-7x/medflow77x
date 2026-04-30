import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Package, AlertTriangle, Clock, Plus, Search, Shield, Eye } from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { MedicationFormModal } from "@/components/modals/MedicationFormModal";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadTextReport, generateMedicationReport } from "@/lib/exportUtils";

export function Medications() {
  const { medications, patients } = useHospitalData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
  const [isAdministerOpen, setIsAdministerOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<string | undefined>();
  const [detailMed, setDetailMed] = useState<any>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const activeMeds = medications.filter(m => m.status === 'active');
  
  // Mock inventory based on unique medication names
  const uniqueMeds = [...new Set(medications.map(m => m.medication))];
  const inventory = uniqueMeds.slice(0, 20).map((name, i) => ({
    id: `INV-${i}`, name, stock: Math.floor(Math.random() * 200) + 5,
    minLevel: 30, expiry: `2025-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-15`,
    location: `Pharmacy ${String.fromCharCode(65 + (i % 5))}-${i+1}`,
    status: Math.random() > 0.7 ? 'low' : Math.random() > 0.9 ? 'critical' : 'adequate'
  }));

  const drugInteractions = [
    { id: 1, severity: 'critical', drugs: 'Warfarin + Aspirin', patient: activeMeds[0]?.patientName || 'Patient', desc: 'Increased bleeding risk. Consider alternative therapy.' },
    { id: 2, severity: 'moderate', drugs: 'Metformin + Contrast dye', patient: activeMeds[1]?.patientName || 'Patient', desc: 'Monitor kidney function. Hold metformin before imaging.' },
    { id: 3, severity: 'moderate', drugs: 'Lisinopril + Potassium', patient: activeMeds[2]?.patientName || 'Patient', desc: 'Risk of hyperkalemia. Monitor potassium levels.' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "adequate": return "default";
      case "due": case "low": return "warning";
      case "overdue": case "critical": return "destructive";
      default: return "secondary";
    }
  };

  const handleAdminister = (medId: string) => { setSelectedMedId(medId); setIsAdministerOpen(true); };

  const handleUpdateStock = (item: any) => { toast({ title: "Stock Updated", description: `${item.name} stock updated` }); };
  const handleReorder = (item: any) => { toast({ title: "Reorder Placed", description: `Reorder placed for ${item.name}` }); };
  const handleReviewInteraction = (interaction: any) => { toast({ title: "Interaction Reviewed", description: `${interaction.drugs} interaction reviewed and acknowledged` }); };

  const handleGenerateReport = (type: string) => {
    const report = generateMedicationReport(medications);
    downloadTextReport(report, `medication_${type}_report`);
    toast({ title: "Report Generated", description: `${type} report downloaded` });
  };

  const filteredMeds = activeMeds.filter(m => m.medication.toLowerCase().includes(searchTerm.toLowerCase()) || m.patientName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Medications & Pharmacy</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage prescriptions, inventory, and drug safety</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" variant="default" onClick={() => setIsPrescribeOpen(true)}><Plus className="w-4 h-4" /> New Prescription</Button>
          <Button className="gap-2" variant="medical" onClick={() => setIsInventoryOpen(true)}><Package className="w-4 h-4" /> Manage Inventory</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Pill, value: activeMeds.length, label: "Active Prescriptions", color: "text-primary" },
          { icon: Clock, value: Math.floor(activeMeds.length * 0.25), label: "Due for Administration", color: "text-warning" },
          { icon: AlertTriangle, value: drugInteractions.length, label: "Drug Interactions", color: "text-destructive" },
          { icon: Package, value: inventory.filter(i => i.status !== 'adequate').length, label: "Low Stock Items", color: "text-accent" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-6"><div className="flex items-center gap-3"><s.icon className={`w-8 h-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Medications</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search medications, patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Active Prescriptions ({filteredMeds.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredMeds.slice(0, 30).map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-4 border border-border/30 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <Pill className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{med.medication}</p>
                        <p className="text-sm text-muted-foreground">{med.patientName}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency} • {med.doctor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(med.status) as any}>{med.status}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setDetailMed(med)}><Eye className="w-3 h-3 mr-1" /> Details</Button>
                        <Button size="sm" variant="medical" onClick={() => handleAdminister(med.id)}>Administer</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Medication Inventory</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {inventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-border/30 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <Package className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Location: {item.location}</p>
                        <p className="text-xs text-muted-foreground">Expires: {item.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold">{item.stock}</p>
                        <p className="text-sm text-muted-foreground">Min: {item.minLevel}</p>
                      </div>
                      <Badge variant={getStatusColor(item.status) as any}>{item.status}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleReorder(item)}>Reorder</Button>
                        <Button size="sm" variant="medical" onClick={() => handleUpdateStock(item)}>Update Stock</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Drug Interaction Alerts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drugInteractions.map((interaction) => (
                  <div key={interaction.id} className={`p-4 border-l-4 rounded ${interaction.severity === 'critical' ? 'border-destructive bg-destructive/5' : 'border-warning bg-warning/5'}`}>
                    <div className="flex items-start gap-3">
                      {interaction.severity === 'critical' ? <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" /> : <Shield className="w-5 h-5 text-warning mt-0.5" />}
                      <div className="flex-1">
                        <p className={`font-medium ${interaction.severity === 'critical' ? 'text-destructive' : 'text-warning'}`}>{interaction.severity === 'critical' ? 'Critical' : 'Moderate'} Interaction</p>
                        <p className="text-sm text-muted-foreground">Patient: {interaction.patient} - {interaction.drugs}</p>
                        <p className="text-xs text-muted-foreground mt-1">{interaction.desc}</p>
                      </div>
                      <Button size="sm" variant={interaction.severity === 'critical' ? 'destructive' : 'warning'} onClick={() => handleReviewInteraction(interaction)}>Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Medication Reports</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Usage Reports', desc: 'Medication usage patterns and compliance', type: 'usage' },
                  { title: 'Inventory Reports', desc: 'Stock levels and expiry tracking', type: 'inventory' },
                  { title: 'Safety Reports', desc: 'Adverse reactions and interactions', type: 'safety' },
                  { title: 'Cost Analysis', desc: 'Medication costs and budget tracking', type: 'cost' },
                ].map((r) => (
                  <div key={r.type} className="p-4 border border-border/30 rounded-lg">
                    <h3 className="font-medium mb-2">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{r.desc}</p>
                    <Button size="sm" variant="outline" onClick={() => handleGenerateReport(r.type)}>Generate Report</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MedicationFormModal isOpen={isPrescribeOpen} onClose={() => setIsPrescribeOpen(false)} type="prescribe" />
      <MedicationFormModal isOpen={isAdministerOpen} onClose={() => { setIsAdministerOpen(false); setSelectedMedId(undefined); }} type="administer" medicationId={selectedMedId} />

      {/* Medication Detail Modal */}
      <Dialog open={!!detailMed} onOpenChange={() => setDetailMed(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Medication Details</DialogTitle></DialogHeader>
          {detailMed && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Medication:</span> {detailMed.medication}</div>
                <div><span className="text-muted-foreground">Dosage:</span> {detailMed.dosage}</div>
                <div><span className="text-muted-foreground">Patient:</span> {detailMed.patientName}</div>
                <div><span className="text-muted-foreground">Frequency:</span> {detailMed.frequency}</div>
                <div><span className="text-muted-foreground">Doctor:</span> {detailMed.doctor}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge>{detailMed.status}</Badge></div>
                <div><span className="text-muted-foreground">Start:</span> {detailMed.startDate}</div>
                <div><span className="text-muted-foreground">End:</span> {detailMed.endDate || 'Ongoing'}</div>
              </div>
              {detailMed.administrationLog?.length > 0 && (
                <div className="border-t border-border/30 pt-3">
                  <h4 className="font-medium mb-2">Administration Log</h4>
                  {detailMed.administrationLog.slice(0, 5).map((log: any, i: number) => (
                    <div key={i} className="text-xs text-muted-foreground py-1">{new Date(log.timestamp).toLocaleString()} - {log.administeredBy}{log.notes ? ` (${log.notes})` : ''}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Inventory Management Modal */}
      <Dialog open={isInventoryOpen} onOpenChange={() => setIsInventoryOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Inventory Management</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {inventory.filter(i => i.status !== 'adequate').map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-border/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Stock: {item.stock} / Min: {item.minLevel}</p>
                </div>
                <Badge variant={getStatusColor(item.status) as any}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
