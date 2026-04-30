import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, AlertTriangle, CheckCircle, Clock, MessageSquare, Mail, Smartphone, Settings, Search, Trash2, Archive } from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";

export function Notifications() {
  const { alerts, markAlertAsRead, markAllAlertsAsRead, deleteAlert } = useHospitalData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("inbox");

  const [settings, setSettings] = useState([
    { id: "critical", name: "Critical Alerts", description: "Life-threatening situations", enabled: true },
    { id: "medication", name: "Medication Reminders", description: "Drug administration alerts", enabled: true },
    { id: "lab", name: "Lab Results", description: "Test results and reports", enabled: true },
    { id: "appointment", name: "Appointments", description: "Scheduling notifications", enabled: false },
    { id: "system", name: "System Updates", description: "Maintenance and updates", enabled: false }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "critical": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "warning": return <Clock className="w-4 h-4 text-warning" />;
      case "info": return <CheckCircle className="w-4 h-4 text-primary" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "critical": return "destructive";
      case "warning": return "warning";
      case "info": return "default";
      default: return "secondary";
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || a.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const handleDelete = (id: string) => {
    deleteAlert(id);
    toast({ title: "Deleted", description: "Notification deleted" });
  };

  const handleSettingsClick = () => {
    setActiveTab("settings");
  };

  const updateSetting = (id: string, enabled: boolean) => {
    setSettings(s => s.map(setting => setting.id === id ? { ...setting, enabled } : setting));
    toast({ title: "Updated", description: `${id} notifications ${enabled ? 'enabled' : 'disabled'}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Manage alerts and communication preferences
            {unreadCount > 0 && <Badge variant="destructive" className="ml-2">{unreadCount} unread</Badge>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAlertsAsRead} className="gap-2"><CheckCircle className="w-4 h-4" /> Mark All Read</Button>
          <Button className="gap-2" onClick={handleSettingsClick}><Settings className="w-4 h-4" /> Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: AlertTriangle, value: alerts.filter(a => a.type === 'critical').length, label: "Critical Alerts", color: "text-destructive" },
          { icon: Clock, value: alerts.filter(a => a.type === 'warning').length, label: "Warnings", color: "text-warning" },
          { icon: MessageSquare, value: alerts.filter(a => a.type === 'info').length, label: "Info", color: "text-primary" },
          { icon: Bell, value: unreadCount, label: "Unread", color: "text-accent" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-6"><div className="flex items-center gap-3"><s.icon className={`w-8 h-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search notifications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-border/30 rounded-xl bg-background text-sm">
              <option value="all">All Types</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {filteredAlerts.slice(0, 30).map((alert) => (
                  <div key={alert.id} className={`flex items-start gap-4 p-4 border-b border-border/20 last:border-b-0 hover:bg-secondary/30 transition-all duration-200 ${!alert.isRead ? 'bg-primary/5' : ''}`}>
                    <div className="flex-shrink-0 mt-1">{getTypeIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${!alert.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge variant={getTypeBadge(alert.type) as any} className="text-xs">{alert.type}</Badge>
                          {!alert.isRead && (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => markAlertAsRead(alert.id)}>
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(alert.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                    <div><p className="font-medium text-sm">{setting.name}</p><p className="text-sm text-muted-foreground">{setting.description}</p></div>
                    <Switch checked={setting.enabled} onCheckedChange={(enabled) => updateSetting(setting.id, enabled)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Communication Channels</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Bell, label: "In-App Notifications", desc: "Real-time alerts within the application", defaultChecked: true },
                  { icon: Mail, label: "Email Notifications", desc: "Important updates sent to your email", defaultChecked: true },
                  { icon: Smartphone, label: "SMS Alerts", desc: "Critical alerts sent to your mobile", defaultChecked: false },
                ].map((ch, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 text-center">
                      <ch.icon className="w-8 h-8 mx-auto text-primary mb-3" />
                      <h3 className="font-medium mb-2">{ch.label}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{ch.desc}</p>
                      <Switch defaultChecked={ch.defaultChecked} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
