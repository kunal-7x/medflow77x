import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Bed,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  MapPin
} from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { BedAssignmentModal } from "@/components/modals/BedAssignmentModal";
import { useToast } from "@/hooks/use-toast";

interface BedData {
  id: string;
  number: string;
  ward: string;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';
  patient?: {
    name: string;
    id: string;
    admissionDate: string;
    condition: string;
  };
  lastCleaned?: string;
  notes?: string;
}

export function BedManagement() {
  const { beds, patients, assignBed, updateBedStatus, releaseBed, dischargePatient } = useHospitalData();
  const { toast } = useToast();
  const [selectedWard, setSelectedWard] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [isFloorPlanView, setIsFloorPlanView] = useState(false);

  // Get patients for each bed
  const bedsWithPatients = beds.map(bed => {
    const patient = bed.patientId ? patients.find(p => p.id === bed.patientId) : null;
    return {
      ...bed,
      patient: patient ? {
        name: patient.name,
        id: patient.id,
        admissionDate: patient.admissionDate,
        condition: patient.condition
      } : null
    };
  });

  const wards = ["all", "ICU", "General Ward A", "General Ward B", "Emergency", "Pediatrics"];

  const filteredBeds = bedsWithPatients.filter(bed => {
    const matchesWard = selectedWard === "all" || bed.ward === selectedWard;
    const matchesSearch = bed.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.ward.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesWard && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'occupied':
        return <User className="w-4 h-4" />;
      case 'maintenance':
        return <Settings className="w-4 h-4" />;
      case 'cleaning':
        return <Clock className="w-4 h-4" />;
      case 'reserved':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bed className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-status-available/10 text-status-available border-status-available/20';
      case 'occupied':
        return 'bg-status-occupied/10 text-status-occupied border-status-occupied/20';
      case 'maintenance':
        return 'bg-status-maintenance/10 text-status-maintenance border-status-maintenance/20';
      case 'cleaning':
        return 'bg-status-cleaning/10 text-status-cleaning border-status-cleaning/20';
      case 'reserved':
        return 'bg-status-reserved/10 text-status-reserved border-status-reserved/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const statusCounts = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
    cleaning: beds.filter(b => b.status === 'cleaning').length
  };

  const handleBedAction = (action: string, bed: any) => {
    switch (action) {
      case 'assign':
        setSelectedBed(bed);
        setIsAssignModalOpen(true);
        break;
      case 'discharge':
        if (bed.patientId) {
          dischargePatient(bed.patientId);
          toast({
            title: "Success",
            description: "Patient discharged successfully"
          });
        }
        break;
      case 'maintenance':
        updateBedStatus(bed.id, 'maintenance');
        toast({
          title: "Success",
          description: "Bed marked for maintenance"
        });
        break;
      case 'cleaning':
        updateBedStatus(bed.id, 'cleaning');
        toast({
          title: "Success",
          description: "Bed marked for cleaning"
        });
        break;
      case 'available':
        updateBedStatus(bed.id, 'available');
        toast({
          title: "Success",
          description: "Bed marked as available"
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">
            Bed Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time bed allocation and patient assignment
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFloorPlanView(!isFloorPlanView)}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isFloorPlanView ? 'List View' : 'Floor Plan View'}
          </Button>
          <Button 
            variant="medical" 
            size="sm"
            onClick={() => {
              // Find first available bed and open assignment modal
              const availableBed = beds.find(bed => bed.status === 'available');
              if (availableBed) {
                setSelectedBed(availableBed);
                setIsAssignModalOpen(true);
              } else {
                toast({
                  title: "No Available Beds",
                  description: "All beds are currently occupied or unavailable",
                  variant: "destructive"
                });
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign Patient
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="hover:shadow-medical transition-all duration-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.total}</div>
              <div className="text-sm text-muted-foreground">Total Beds</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-medical transition-all duration-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-available">{statusCounts.available}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-medical transition-all duration-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-occupied">{statusCounts.occupied}</div>
              <div className="text-sm text-muted-foreground">Occupied</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-medical transition-all duration-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-maintenance">{statusCounts.maintenance}</div>
              <div className="text-sm text-muted-foreground">Maintenance</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-medical transition-all duration-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-cleaning">{statusCounts.cleaning}</div>
              <div className="text-sm text-muted-foreground">Cleaning</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-medical transition-all duration-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-cleaning">{statusCounts.cleaning}</div>
              <div className="text-sm text-muted-foreground">Cleaning</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search beds, patients, or wards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wards.map(ward => (
                  <SelectItem key={ward} value={ward}>
                    {ward === "all" ? "All Wards" : ward}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bed Grid or Floor Plan */}
      {isFloorPlanView ? (
        <Card>
          <CardHeader>
            <CardTitle>Floor Plan View</CardTitle>
            <CardDescription>Interactive floor plan showing bed locations and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Floor 2 - ICU */}
              <div className="space-y-4">
                <h3 className="font-semibold">Floor 2 - ICU</h3>
                <div className="grid grid-cols-4 gap-2 p-4 border rounded-lg">
                  {filteredBeds.filter(bed => bed.ward === 'ICU').map((bed) => (
                    <div
                      key={bed.id}
                      className={`p-2 rounded text-center text-xs cursor-pointer transition-colors ${
                        bed.status === 'available' ? 'bg-status-available/20 hover:bg-status-available/30' :
                        bed.status === 'occupied' ? 'bg-status-occupied/20 hover:bg-status-occupied/30' :
                        bed.status === 'maintenance' ? 'bg-status-maintenance/20 hover:bg-status-maintenance/30' :
                        'bg-status-cleaning/20 hover:bg-status-cleaning/30'
                      }`}
                      onClick={() => {
                        setSelectedBed(bed);
                        if (bed.status === 'available') {
                          setIsAssignModalOpen(true);
                        }
                      }}
                    >
                      <div className="font-medium">{bed.number}</div>
                      <div className="text-xs">{bed.patient?.name || bed.status}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floor 1 - General */}
              <div className="space-y-4">
                <h3 className="font-semibold">Floor 1 - General</h3>
                <div className="grid grid-cols-4 gap-2 p-4 border rounded-lg">
                  {filteredBeds.filter(bed => bed.ward !== 'ICU').map((bed) => (
                    <div
                      key={bed.id}
                      className={`p-2 rounded text-center text-xs cursor-pointer transition-colors ${
                        bed.status === 'available' ? 'bg-status-available/20 hover:bg-status-available/30' :
                        bed.status === 'occupied' ? 'bg-status-occupied/20 hover:bg-status-occupied/30' :
                        bed.status === 'maintenance' ? 'bg-status-maintenance/20 hover:bg-status-maintenance/30' :
                        'bg-status-cleaning/20 hover:bg-status-cleaning/30'
                      }`}
                      onClick={() => {
                        setSelectedBed(bed);
                        if (bed.status === 'available') {
                          setIsAssignModalOpen(true);
                        }
                      }}
                    >
                      <div className="font-medium">{bed.number}</div>
                      <div className="text-xs">{bed.patient?.name || bed.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBeds.map((bed) => (
            <Card key={bed.id} className="hover:shadow-medical transition-all duration-200 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{bed.number}</CardTitle>
                  <Badge variant="outline" className={getStatusColor(bed.status)}>
                    {getStatusIcon(bed.status)}
                    <span className="ml-1 capitalize">{bed.status}</span>
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {bed.ward} - Floor {bed.floor}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bed.patient ? (
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Patient: {bed.patient.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {bed.patient.id} • Admitted: {bed.patient.admissionDate}
                    </div>
                    <Badge variant="outline" className={
                      bed.patient.condition === 'Critical' ? 'bg-destructive/10 text-destructive' :
                      bed.patient.condition === 'Stable' ? 'bg-success/10 text-success' :
                      'bg-warning/10 text-warning'
                    }>
                      {bed.patient.condition}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {bed.status === 'available' ? 'Ready for patient assignment' :
                     bed.status === 'maintenance' ? 'Under maintenance' :
                     bed.status === 'cleaning' ? 'Being cleaned' : 'Status unknown'}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Last cleaned: 2 hours ago
                </div>
                
                <div className="flex gap-2 pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBedAction('maintenance', bed)}>
                        Set Maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBedAction('cleaning', bed)}>
                        Set Cleaning
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBedAction('available', bed)}>
                        Mark Available
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {bed.status === 'available' && (
                    <Button 
                      variant="medical" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleBedAction('assign', bed)}
                    >
                      Assign
                    </Button>
                  )}
                  {bed.status === 'occupied' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleBedAction('discharge', bed)}
                    >
                      Discharge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredBeds.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No beds found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

      {selectedBed && (
        <BedAssignmentModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedBed(null);
          }}
          bed={selectedBed}
        />
      )}
    </div>
  );
}