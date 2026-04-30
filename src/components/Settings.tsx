import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getIsMuted, setIsMuted, playSound } from "@/hooks/useSoundSystem";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Globe,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  Monitor,
  Lock,
  Mail,
  Phone,
  Building2,
  Clock
} from "lucide-react";

export function Settings() {
  const { toast } = useToast();
  const [soundMuted, setSoundMuted] = useState(getIsMuted());
  
  const [profile, setProfile] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@medflow.com",
    phone: "+1 (555) 123-4567",
    department: "Cardiology",
    role: "Senior Physician",
    hospital: "MedFlow General Hospital"
  });

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    medicationReminders: true,
    labResults: true,
    appointments: true,
    systemUpdates: false,
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true
  });

  const [display, setDisplay] = useState({
    compactMode: false,
    animationsEnabled: true,
    autoRefresh: true,
    refreshInterval: "30",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    language: "en"
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
    autoLock: true,
    loginNotifications: true
  });

  const handleSaveProfile = () => {
    localStorage.setItem('medflow-profile', JSON.stringify(profile));
    playSound('success');
    toast({ title: "Profile saved", description: "Your profile has been updated successfully." });
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('medflow-notifications', JSON.stringify(notifications));
    playSound('success');
    toast({ title: "Notifications updated", description: "Notification preferences saved." });
  };

  const handleSaveDisplay = () => {
    localStorage.setItem('medflow-display', JSON.stringify(display));
    playSound('success');
    toast({ title: "Display settings saved", description: "Display preferences updated." });
  };

  const handleSaveSecurity = () => {
    localStorage.setItem('medflow-security', JSON.stringify(security));
    playSound('success');
    toast({ title: "Security settings saved", description: "Security preferences updated." });
  };

  const handleToggleSound = (muted: boolean) => {
    setSoundMuted(muted);
    setIsMuted(muted);
    if (!muted) playSound('toggle');
    toast({ title: muted ? "Sound muted" : "Sound enabled", description: muted ? "UI sounds are now muted." : "UI sounds are now enabled." });
  };

  const handleResetSettings = () => {
    playSound('click');
    localStorage.removeItem('medflow-profile');
    localStorage.removeItem('medflow-notifications');
    localStorage.removeItem('medflow-display');
    localStorage.removeItem('medflow-security');
    toast({ title: "Settings reset", description: "All settings have been reset to defaults." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and application preferences</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetSettings} className="gap-2 text-xs">
          <RotateCcw className="w-3.5 h-3.5" /> Reset All
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display & Sound</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={profile.department} onValueChange={v => setProfile(p => ({...p, department: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Cardiology","Emergency","ICU","Surgery","Pediatrics","Radiology","Oncology"].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={profile.role} onChange={e => setProfile(p => ({...p, role: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital</Label>
                  <Input id="hospital" value={profile.hospital} onChange={e => setProfile(p => ({...p, hospital: e.target.value}))} />
                </div>
              </div>
              <Button onClick={handleSaveProfile} className="gap-2"><Save className="w-4 h-4" /> Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="w-4 h-4 text-primary" /> Alert Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {([
                { key: 'criticalAlerts', label: 'Critical Alerts', desc: 'Life-threatening patient situations', icon: Shield },
                { key: 'medicationReminders', label: 'Medication Reminders', desc: 'Drug administration schedules', icon: Clock },
                { key: 'labResults', label: 'Lab Results', desc: 'Test results and reports', icon: Database },
                { key: 'appointments', label: 'Appointments', desc: 'Scheduling updates', icon: Clock },
                { key: 'systemUpdates', label: 'System Updates', desc: 'Maintenance and updates', icon: Monitor },
              ] as const).map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch checked={notifications[item.key]} onCheckedChange={v => setNotifications(n => ({...n, [item.key]: v}))} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="w-4 h-4 text-primary" /> Delivery Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { key: 'emailNotifications', label: 'Email', desc: 'Receive notifications via email' },
                { key: 'smsNotifications', label: 'SMS', desc: 'Receive SMS alerts for critical events' },
                { key: 'desktopNotifications', label: 'Desktop', desc: 'Browser push notifications' },
              ] as const).map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={notifications[item.key]} onCheckedChange={v => setNotifications(n => ({...n, [item.key]: v}))} />
                </div>
              ))}
              <Button onClick={handleSaveNotifications} className="gap-2"><Save className="w-4 h-4" /> Save Notifications</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display & Sound */}
        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Volume2 className="w-4 h-4 text-primary" /> Sound Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/30">
                <div className="flex items-center gap-3">
                  {soundMuted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-primary" />}
                  <div>
                    <p className="text-sm font-medium">UI Sounds</p>
                    <p className="text-xs text-muted-foreground">Pleasant click and feedback sounds for interactions</p>
                  </div>
                </div>
                <Switch checked={!soundMuted} onCheckedChange={v => handleToggleSound(!v)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="w-4 h-4 text-primary" /> Display Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                <div>
                  <p className="text-sm font-medium">Compact Mode</p>
                  <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
                </div>
                <Switch checked={display.compactMode} onCheckedChange={v => setDisplay(d => ({...d, compactMode: v}))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                <div>
                  <p className="text-sm font-medium">Animations</p>
                  <p className="text-xs text-muted-foreground">Enable smooth transitions and effects</p>
                </div>
                <Switch checked={display.animationsEnabled} onCheckedChange={v => setDisplay(d => ({...d, animationsEnabled: v}))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                <div>
                  <p className="text-sm font-medium">Auto Refresh</p>
                  <p className="text-xs text-muted-foreground">Automatically refresh dashboard data</p>
                </div>
                <Switch checked={display.autoRefresh} onCheckedChange={v => setDisplay(d => ({...d, autoRefresh: v}))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Refresh Interval</Label>
                  <Select value={display.refreshInterval} onValueChange={v => setDisplay(d => ({...d, refreshInterval: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={display.dateFormat} onValueChange={v => setDisplay(d => ({...d, dateFormat: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <Select value={display.timeFormat} onValueChange={v => setDisplay(d => ({...d, timeFormat: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveDisplay} className="gap-2"><Save className="w-4 h-4" /> Save Display Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-primary" /> Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add extra layer of account security</p>
                </div>
                <Switch checked={security.twoFactorEnabled} onCheckedChange={v => setSecurity(s => ({...s, twoFactorEnabled: v}))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                <div>
                  <p className="text-sm font-medium">Auto-Lock Screen</p>
                  <p className="text-xs text-muted-foreground">Lock screen when idle</p>
                </div>
                <Switch checked={security.autoLock} onCheckedChange={v => setSecurity(s => ({...s, autoLock: v}))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                <div>
                  <p className="text-sm font-medium">Login Notifications</p>
                  <p className="text-xs text-muted-foreground">Get notified of new login sessions</p>
                </div>
                <Switch checked={security.loginNotifications} onCheckedChange={v => setSecurity(s => ({...s, loginNotifications: v}))} />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Select value={security.sessionTimeout} onValueChange={v => setSecurity(s => ({...s, sessionTimeout: v}))}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Change Password</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm password" />
                </div>
              </div>
              <Button onClick={handleSaveSecurity} className="gap-2"><Save className="w-4 h-4" /> Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="w-4 h-4 text-primary" /> System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Application Version", value: "2.5.0" },
                  { label: "Database Status", value: "Connected", badge: true },
                  { label: "Last Backup", value: "2 hours ago" },
                  { label: "Storage Used", value: "42.3 GB / 100 GB" },
                  { label: "Active Sessions", value: "12" },
                  { label: "Uptime", value: "99.97%" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {item.badge ? (
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{item.value}</Badge>
                    ) : (
                      <p className="text-sm font-medium">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="w-4 h-4 text-primary" /> Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => {
                  const data = localStorage.getItem('hospital-data');
                  if (data) {
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `medflow_backup_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    playSound('success');
                    toast({ title: "Backup created", description: "Data exported successfully." });
                  }
                }}>
                  <Database className="w-5 h-5 text-primary" />
                  <span className="text-xs">Export Backup</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => {
                  playSound('click');
                  toast({ title: "Cache cleared", description: "Application cache has been cleared." });
                }}>
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <span className="text-xs">Clear Cache</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={() => {
                  if (confirm('This will reset all data. Continue?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}>
                  <Building2 className="w-5 h-5 text-destructive" />
                  <span className="text-xs">Factory Reset</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
