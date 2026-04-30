import { useState } from "react";
import { PatientCard } from "@/components/PatientCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { PatientFormModal } from "@/components/modals/PatientFormModal";
import { QuickActionsModal } from "@/components/modals/QuickActionsModal";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Plus, Users, UserPlus, Calendar, Download, Zap } from "lucide-react";

export function PatientManagement() {
  const { patients } = useHospitalData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondition, setFilterCondition] = useState("all");
  const [filterWard, setFilterWard] = useState("all");
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'admit' | 'surgery' | 'report' | 'round' | null>(null);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = filterCondition === "all" || patient.condition === filterCondition;
    const matchesWard = filterWard === "all" || patient.bedNumber.includes(filterWard);
    return matchesSearch && matchesCondition && matchesWard;
  });

  const conditionCounts = {
    total: patients.length,
    critical: patients.filter(p => p.condition === 'Critical').length,
    fair: patients.filter(p => p.condition === 'Fair').length,
    stable: patients.filter(p => p.condition === 'Stable').length,
    good: patients.filter(p => p.condition === 'Good').length
  };

  const handleExportReport = () => {
    const csvContent = patients.map(p => 
      `${p.name},${p.id},${p.condition},${p.diagnosis},${p.doctor},${p.bedNumber}`
    ).join('\n');
    const blob = new Blob([`Name,ID,Condition,Diagnosis,Doctor,Bed\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast({ title: "Report exported", description: "Patient report downloaded as CSV" });
  };

  const handleQuickAction = (action: 'admit' | 'surgery' | 'report' | 'round') => {
    setSelectedAction(action);
    setIsQuickActionsOpen(true);
  };

  const statCards = [
    { label: "Total", value: conditionCounts.total, color: "text-foreground" },
    { label: "Critical", value: conditionCounts.critical, color: "text-destructive" },
    { label: "Fair", value: conditionCounts.fair, color: "text-warning" },
    { label: "Stable", value: conditionCounts.stable, color: "text-success" },
    { label: "Good", value: conditionCounts.good, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Patient Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive patient care and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReport} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
          <Button variant="default" size="sm" onClick={() => setIsAdmitModalOpen(true)} className="text-xs">
            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Admit Patient
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color} animate-count-up`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9 text-sm bg-secondary/30 border-border/30" />
            </div>
            <Select value={filterCondition} onValueChange={setFilterCondition}>
              <SelectTrigger className="w-36 h-9 text-xs bg-secondary/30 border-border/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Stable">Stable</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterWard} onValueChange={setFilterWard}>
              <SelectTrigger className="w-36 h-9 text-xs bg-secondary/30 border-border/30">
                <Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="GA">General</SelectItem>
                <SelectItem value="MAT">Maternity</SelectItem>
                <SelectItem value="ER">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No patients found.</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-primary" /> Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Admit Patient", icon: UserPlus, action: 'admit' as const },
              { label: "Schedule Surgery", icon: Calendar, action: 'surgery' as const },
              { label: "Generate Reports", icon: Download, action: 'report' as const },
              { label: "Ward Round", icon: Users, action: 'round' as const },
            ].map((item) => (
              <Button key={item.action} variant="outline" className="h-auto flex-col gap-2 p-4 hover:border-primary/30 hover:bg-primary/5" onClick={() => handleQuickAction(item.action)}>
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <PatientFormModal isOpen={isAdmitModalOpen} onClose={() => setIsAdmitModalOpen(false)} mode="create" />
      <QuickActionsModal isOpen={isQuickActionsOpen} onClose={() => setIsQuickActionsOpen(false)} action={selectedAction} />
    </div>
  );
}
