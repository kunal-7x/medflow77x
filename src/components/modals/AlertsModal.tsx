import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Info, Zap, Search, Check, X, Clock } from "lucide-react";

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertsModal({ isOpen, onClose }: AlertsModalProps) {
  const { alerts, markAlertAsRead, markAllAlertsAsRead, deleteAlert } = useHospitalData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || alert.type === filterType;
    return matchesSearch && matchesType;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <Zap className="w-4 h-4 text-warning" />;
      case 'info':
        return <Info className="w-4 h-4 text-primary" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'info':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId);
    toast({
      title: "Alert marked as read",
      description: "Alert status updated successfully"
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAlertsAsRead();
    toast({
      title: "All alerts marked as read",
      description: "All alert statuses updated successfully"
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    deleteAlert(alertId);
    toast({
      title: "Alert deleted",
      description: "Alert removed successfully"
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Hospital Alerts ({alerts.length})</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {/* Filters */}
        <div className="flex gap-4 items-center border-b pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'critical', 'warning', 'info'].map(type => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  alert.isRead ? 'bg-muted/30' : 'bg-background'
                } hover:shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${alert.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {alert.title}
                        </h3>
                        <Badge variant="outline" className={getAlertColor(alert.type)}>
                          {alert.type}
                        </Badge>
                        <Badge variant="outline" className={
                          alert.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                          alert.priority === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-muted/10 text-muted-foreground'
                        }>
                          {alert.priority}
                        </Badge>
                        {!alert.isRead && (
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${alert.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(alert.timestamp)}
                        </span>
                        {alert.patientId && (
                          <span>Patient ID: {alert.patientId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!alert.isRead && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts found matching your criteria.</p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}