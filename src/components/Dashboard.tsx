import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { AlertsModal } from "@/components/modals/AlertsModal";
import {
  Activity,
  Bed,
  Calendar,
  Clock,
  Heart,
  User,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Bell,
  ArrowUpRight,
  Zap
} from "lucide-react";

export function Dashboard() {
  const { getAnalytics, beds, alerts: alertsData, markAllAlertsAsRead } = useHospitalData();
  const analytics = getAnalytics();
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  const stats = [
    { title: "Total Patients", value: analytics.totalPatients.toString(), change: "+12%", icon: User, accent: "from-[hsl(48,96%,53%)] to-[hsl(42,90%,45%)]" },
    { title: "Bed Occupancy", value: `${Math.round(analytics.occupancyRate)}%`, change: "+5%", icon: Bed, accent: "from-[hsl(160,60%,45%)] to-[hsl(170,55%,40%)]" },
    { title: "Appointments", value: analytics.todayAppointments.toString(), change: "+8%", icon: Calendar, accent: "from-[hsl(200,70%,55%)] to-[hsl(210,65%,50%)]" },
    { title: "Active Staff", value: analytics.activeStaff.toString(), change: "+2%", icon: Users, accent: "from-[hsl(280,60%,55%)] to-[hsl(290,55%,50%)]" }
  ];

  const bedStatus = [
    { ward: "ICU", total: 20, occupied: 18, available: 2, maintenance: 0 },
    { ward: "General Ward A", total: 40, occupied: 35, available: 4, maintenance: 1 },
    { ward: "General Ward B", total: 40, occupied: 32, available: 7, maintenance: 1 },
    { ward: "Emergency", total: 15, occupied: 12, available: 3, maintenance: 0 },
    { ward: "Pediatrics", total: 25, occupied: 20, available: 4, maintenance: 1 }
  ];

  const recentActivities = [
    { id: 1, action: "Patient admitted", patient: "John Doe", time: "10 min ago", type: "admission" },
    { id: 2, action: "Lab results ready", patient: "Jane Smith", time: "15 min ago", type: "lab" },
    { id: 3, action: "Patient discharged", patient: "Mike Johnson", time: "20 min ago", type: "discharge" },
    { id: 4, action: "Emergency admission", patient: "Sarah Wilson", time: "25 min ago", type: "emergency" },
    { id: 5, action: "Surgery scheduled", patient: "Robert Brown", time: "30 min ago", type: "surgery" }
  ];

  const alerts = [
    { id: 1, message: "ICU bed shortage - 90% occupied", type: "warning", priority: "high" },
    { id: 2, message: "Lab equipment maintenance due", type: "info", priority: "medium" },
    { id: 3, message: "Staff schedule conflict in Ward B", type: "warning", priority: "medium" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Hospital Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time overview of hospital operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Just now
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setIsAlertsModalOpen(true)}
            className="text-xs"
          >
            <Bell className="w-3.5 h-3.5 mr-1.5" />
            Alerts ({alertsData.filter(a => !a.isRead).length})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="group relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500`} />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.accent} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs text-success">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight animate-count-up">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bed Status Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bed className="w-4 h-4 text-primary" />
              Bed Management
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time bed availability across wards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bedStatus.map((ward, index) => (
              <div key={index} className="space-y-1.5 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{ward.ward}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {ward.occupied}/{ward.total}
                  </span>
                </div>
                <Progress 
                  value={(ward.occupied / ward.total) * 100} 
                  className="h-1.5"
                />
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-status-occupied/10 text-status-occupied border-status-occupied/20">
                    {ward.occupied} Occ
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-status-available/10 text-status-available border-status-available/20">
                    {ward.available} Free
                  </Badge>
                  {ward.maintenance > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-status-maintenance/10 text-status-maintenance border-status-maintenance/20">
                      {ward.maintenance} Maint
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-lg border border-border/30 hover:border-primary/20 transition-colors bg-secondary/20">
                <div className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.type === 'warning' ? 'bg-warning' : 'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-relaxed">{alert.message}</p>
                    <Badge variant="outline" className="mt-1.5 text-[10px] px-1.5 py-0 h-4">
                      {alert.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs mt-2" size="sm">
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  activity.type === 'admission' ? 'bg-primary/10 text-primary' :
                  activity.type === 'discharge' ? 'bg-success/10 text-success' :
                  activity.type === 'emergency' ? 'bg-destructive/10 text-destructive' :
                  activity.type === 'lab' ? 'bg-accent/20 text-accent' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {activity.type === 'admission' && <User className="w-3.5 h-3.5" />}
                  {activity.type === 'discharge' && <CheckCircle className="w-3.5 h-3.5" />}
                  {activity.type === 'emergency' && <Heart className="w-3.5 h-3.5" />}
                  {activity.type === 'lab' && <Activity className="w-3.5 h-3.5" />}
                  {activity.type === 'surgery' && <Calendar className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.patient}</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertsModal 
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
      />
    </div>
  );
}
