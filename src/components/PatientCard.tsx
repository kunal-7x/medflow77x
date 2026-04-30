import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VitalsModal } from "@/components/modals/VitalsModal";
import { VitalsChartModal } from "@/components/modals/VitalsChartModal";
import { useHospitalData, Patient } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";
import {
  User, Calendar, MapPin, Heart, Activity, FileText, Phone, Mail,
  AlertTriangle, MoreHorizontal, TrendingUp, UserMinus, Edit, Trash2
} from "lucide-react";

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const { dischargePatient, deletePatient } = useHospitalData();
  const { toast } = useToast();
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isVitalsChartOpen, setIsVitalsChartOpen] = useState(false);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Fair': return 'bg-warning/10 text-warning border-warning/20';
      case 'Stable': return 'bg-success/10 text-success border-success/20';
      case 'Good': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getVitalStatus = (vital: string, value: number) => {
    if (vital === 'heartRate') return value > 100 || value < 60 ? 'text-warning' : 'text-success';
    if (vital === 'temperature') return value > 37.5 || value < 36 ? 'text-warning' : 'text-success';
    if (vital === 'oxygenSat') return value < 95 ? 'text-destructive' : 'text-success';
    return 'text-foreground';
  };

  const handleDischarge = () => {
    dischargePatient(patient.id);
    toast({ title: "Patient discharged", description: `${patient.name} has been successfully discharged` });
  };

  const handleDelete = () => {
    deletePatient(patient.id);
    toast({ title: "Patient record deleted", description: `${patient.name}'s record has been removed` });
  };

  return (
    <Card className="group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border/50">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-semibold">{patient.name}</CardTitle>
              <CardDescription className="flex items-center gap-3 mt-0.5 text-xs">
                <span>{patient.age}y • {patient.gender}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {patient.bedNumber}
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={getConditionColor(patient.condition)}>
              {patient.condition === 'Critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {patient.condition}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsVitalsModalOpen(true)} className="text-xs">
                  <Activity className="w-3.5 h-3.5 mr-2" /> Update Vitals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsVitalsChartOpen(true)} className="text-xs">
                  <TrendingUp className="w-3.5 h-3.5 mr-2" /> Vitals Chart
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs">
                  <Edit className="w-3.5 h-3.5 mr-2" /> Edit Patient
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDischarge} className="text-xs">
                  <UserMinus className="w-3.5 h-3.5 mr-2" /> Discharge
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-xs text-destructive focus:text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">ID:</span>
            <span className="ml-1.5 font-mono font-medium">{patient.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Doctor:</span>
            <span className="ml-1.5 font-medium">{patient.doctor}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Diagnosis:</span>
            <span className="ml-1.5 font-medium">{patient.diagnosis}</span>
          </div>
        </div>

        {patient.allergies?.length > 0 && (
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Allergies</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patient.allergies.map((allergy, index) => (
                <Badge key={index} variant="outline" className="text-[10px] bg-destructive/5 text-destructive border-destructive/20 px-1.5 py-0 h-4">
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Vitals */}
        <div className="rounded-lg p-3 bg-secondary/30 border border-border/20">
          <div className="flex items-center gap-1.5 mb-2">
            <Heart className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vitals</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">HR:</span>
              <span className={`font-mono ${getVitalStatus('heartRate', patient.vitals.heartRate)}`}>
                {patient.vitals.heartRate} bpm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BP:</span>
              <span className="font-mono">{patient.vitals.bloodPressure}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Temp:</span>
              <span className={`font-mono ${getVitalStatus('temperature', patient.vitals.temperature)}`}>
                {patient.vitals.temperature}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SpO2:</span>
              <span className={`font-mono ${getVitalStatus('oxygenSat', patient.vitals.oxygenSat)}`}>
                {patient.vitals.oxygenSat}%
              </span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3" />
            {patient.contactInfo.phone}
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3" />
            {patient.contactInfo.email}
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground border-t border-border/20 pt-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Admitted: {patient.admissionDate}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => setIsVitalsChartOpen(true)}>
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> Chart
          </Button>
          <Button size="sm" variant="default" className="flex-1 text-xs h-8" onClick={() => setIsVitalsModalOpen(true)}>
            <Activity className="w-3.5 h-3.5 mr-1" /> Vitals
          </Button>
        </div>
      </CardContent>

      <VitalsModal isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} patient={patient} />
      <VitalsChartModal isOpen={isVitalsChartOpen} onClose={() => setIsVitalsChartOpen(false)} patient={patient} />
    </Card>
  );
}
