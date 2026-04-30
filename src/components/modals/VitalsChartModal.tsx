import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHospitalData, Patient } from "@/contexts/HospitalDataContext";
import { Heart, Thermometer, Activity, Droplets, TrendingUp, TrendingDown } from "lucide-react";

interface VitalsChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export function VitalsChartModal({ isOpen, onClose, patient }: VitalsChartModalProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");

  const vitalsData = [patient.vitals, ...patient.vitalsHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getVitalStatus = (vital: string, value: number | string) => {
    switch (vital) {
      case 'heartRate':
        const hr = value as number;
        if (hr < 60 || hr > 100) return 'warning';
        return 'normal';
      case 'temperature':
        const temp = value as number;
        if (temp < 36.1 || temp > 37.5) return 'warning';
        return 'normal';
      case 'oxygenSat':
        const sat = value as number;
        if (sat < 95) return 'critical';
        if (sat < 98) return 'warning';
        return 'normal';
      case 'bloodPressure':
        const bp = value as string;
        const [systolic] = bp.split('/').map(Number);
        if (systolic > 140 || systolic < 90) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'normal':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-warning" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-success" />;
    return null;
  };

  const currentVitals = vitalsData[0];
  const previousVitals = vitalsData[1];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Vitals Chart - {patient.name} ({patient.id})
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="current" className="h-full">
          <TabsList>
            <TabsTrigger value="current">Current Vitals</TabsTrigger>
            <TabsTrigger value="history">Vitals History</TabsTrigger>
            <TabsTrigger value="trends">Trends & Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-red-500" />
                    Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentVitals.heartRate}</span>
                    <Badge variant="outline" className={getStatusColor(getVitalStatus('heartRate', currentVitals.heartRate))}>
                      {getVitalStatus('heartRate', currentVitals.heartRate)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">bpm</p>
                  {previousVitals && (
                    <div className="flex items-center gap-1 mt-2">
                      {getTrendIcon(currentVitals.heartRate, previousVitals.heartRate)}
                      <span className="text-xs text-muted-foreground">
                        {currentVitals.heartRate - previousVitals.heartRate > 0 ? '+' : ''}
                        {currentVitals.heartRate - previousVitals.heartRate} from last reading
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Blood Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentVitals.bloodPressure}</span>
                    <Badge variant="outline" className={getStatusColor(getVitalStatus('bloodPressure', currentVitals.bloodPressure))}>
                      {getVitalStatus('bloodPressure', currentVitals.bloodPressure)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">mmHg</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentVitals.temperature}</span>
                    <Badge variant="outline" className={getStatusColor(getVitalStatus('temperature', currentVitals.temperature))}>
                      {getVitalStatus('temperature', currentVitals.temperature)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">°C</p>
                  {previousVitals && (
                    <div className="flex items-center gap-1 mt-2">
                      {getTrendIcon(currentVitals.temperature, previousVitals.temperature)}
                      <span className="text-xs text-muted-foreground">
                        {(currentVitals.temperature - previousVitals.temperature).toFixed(1)}°C from last
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    Oxygen Saturation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentVitals.oxygenSat}</span>
                    <Badge variant="outline" className={getStatusColor(getVitalStatus('oxygenSat', currentVitals.oxygenSat))}>
                      {getVitalStatus('oxygenSat', currentVitals.oxygenSat)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">%</p>
                  {previousVitals && (
                    <div className="flex items-center gap-1 mt-2">
                      {getTrendIcon(currentVitals.oxygenSat, previousVitals.oxygenSat)}
                      <span className="text-xs text-muted-foreground">
                        {currentVitals.oxygenSat - previousVitals.oxygenSat}% from last
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Latest Reading Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Recorded:</strong> {formatDate(currentVitals.timestamp)} at {formatTime(currentVitals.timestamp)}</p>
                  <p><strong>Patient Condition:</strong> <Badge variant="outline">{patient.condition}</Badge></p>
                  <p><strong>Attending Doctor:</strong> {patient.doctor}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex gap-2 mb-4">
              {['24h', '7d', '30d', 'all'].map(range => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </Button>
              ))}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vitalsData.map((vital, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {formatDate(vital.timestamp)} - {formatTime(vital.timestamp)}
                      </span>
                      {index === 0 && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Heart Rate:</span>
                        <span className="ml-2 font-medium">{vital.heartRate} bpm</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">BP:</span>
                        <span className="ml-2 font-medium">{vital.bloodPressure} mmHg</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Temp:</span>
                        <span className="ml-2 font-medium">{vital.temperature}°C</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">O2 Sat:</span>
                        <span className="ml-2 font-medium">{vital.oxygenSat}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vitals Trends Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Heart Rate Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-gradient-to-r from-red-50 to-red-100 rounded flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Chart visualization would be here</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Temperature Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-gradient-to-r from-orange-50 to-orange-100 rounded flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Chart visualization would be here</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Clinical Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      Patient vitals showing {patient.condition.toLowerCase()} condition. 
                      {vitalsData.length > 1 && vitalsData[0].heartRate > vitalsData[1].heartRate && " Heart rate trending upward. "}
                      Continue monitoring per protocol.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>Print Chart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}