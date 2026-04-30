import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, FileCheck, AlertTriangle, CheckCircle, Clock, Download, Search, Eye, Calendar, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadTextReport, generateComplianceReport } from "@/lib/exportUtils";
import { supabase } from "@/integrations/supabase/client";

interface AuditLogEntry {
  id: string;
  user_email: string | null;
  user_role: string | null;
  action: string;
  table_name: string;
  record_id: string;
  before_data: any;
  after_data: any;
  created_at: string;
}

const mockAudits = [
  { id: 1, type: "HIPAA Compliance", status: "compliant", lastCheck: "2024-01-10", nextDue: "2024-04-10", score: 98 },
  { id: 2, type: "Joint Commission", status: "pending", lastCheck: "2024-01-05", nextDue: "2024-01-25", score: 85 },
  { id: 3, type: "Fire Safety", status: "non-compliant", lastCheck: "2024-01-08", nextDue: "2024-01-20", score: 72 },
  { id: 4, type: "Medication Safety", status: "compliant", lastCheck: "2024-01-12", nextDue: "2024-02-12", score: 96 },
  { id: 5, type: "Infection Control", status: "compliant", lastCheck: "2024-01-14", nextDue: "2024-03-14", score: 94 },
  { id: 6, type: "Patient Safety", status: "pending", lastCheck: "2024-01-02", nextDue: "2024-02-02", score: 88 },
];

export function Compliance() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [audits, setAudits] = useState(mockAudits);
  const [viewAudit, setViewAudit] = useState<any>(null);
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);
  const [newAudit, setNewAudit] = useState({ type: '', date: '' });

  // Real audit logs from database
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (selectedTab === 'logs') {
      fetchAuditLogs();
    }
  }, [selectedTab]);

  const fetchAuditLogs = async () => {
    setLogsLoading(true);
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setAuditLogs(data as AuditLogEntry[]);
    if (error) console.error('Failed to fetch audit logs:', error);
    setLogsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "default";
      case "pending": return "warning";
      case "non-compliant": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "non-compliant": return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const handleExportReport = () => {
    const report = generateComplianceReport(audits);
    downloadTextReport(report, 'compliance_report');
    toast({ title: "Report Exported", description: "Compliance report downloaded" });
  };

  const handleNewAudit = () => {
    if (!newAudit.type) { toast({ title: "Error", description: "Select audit type", variant: "destructive" }); return; }
    const audit = {
      id: Date.now(), type: newAudit.type, status: 'pending' as const,
      lastCheck: new Date().toISOString().split('T')[0],
      nextDue: newAudit.date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      score: 0
    };
    setAudits(prev => [...prev, audit]);
    toast({ title: "Audit Created", description: `${newAudit.type} audit scheduled` });
    setIsNewAuditOpen(false);
    setNewAudit({ type: '', date: '' });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'default';
      case 'update': return 'warning';
      case 'delete': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    (log.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Compliance & Audit</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor regulatory compliance and audit trails</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportReport}><Download className="w-4 h-4" /> Export Report</Button>
          <Button className="gap-2" onClick={() => setIsNewAuditOpen(true)}><Plus className="w-4 h-4" /> New Audit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Shield, value: `${Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length)}%`, label: "Overall Compliance", color: "text-primary" },
          { icon: CheckCircle, value: audits.filter(a => a.status === 'compliant').length, label: "Passed Audits", color: "text-primary" },
          { icon: Clock, value: audits.filter(a => a.status === 'pending').length, label: "Pending Reviews", color: "text-warning" },
          { icon: AlertTriangle, value: audits.filter(a => a.status === 'non-compliant').length, label: "Action Items", color: "text-destructive" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-6"><div className="flex items-center gap-3"><s.icon className={`w-8 h-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Compliance Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(audit.status)}
                      <div>
                        <p className="font-medium">{audit.type}</p>
                        <p className="text-sm text-muted-foreground">Last: {audit.lastCheck} • Next: {audit.nextDue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">{audit.score}%</p>
                        <Badge variant={getStatusColor(audit.status) as any}>{audit.status}</Badge>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setViewAudit(audit)}><Eye className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Audit Management</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['HIPAA Compliance', 'Joint Commission', 'Fire Safety'].map((type) => (
                  <Card key={type}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Shield className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="font-medium">{type}</p>
                        <p className="text-sm text-muted-foreground mb-2">{type.includes('HIPAA') ? 'Privacy & Security' : type.includes('Joint') ? 'Quality Standards' : 'Emergency Preparedness'}</p>
                        <Button size="sm" onClick={() => toast({ title: "Audit Scheduled", description: `${type} audit scheduled` })}>Schedule Audit</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Database Audit Trail</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchAuditLogs}>
                    {logsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No audit logs found. Actions performed in the system will appear here.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border border-border/30 rounded-xl hover:bg-secondary/30 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          log.action === 'create' ? 'bg-primary' :
                          log.action === 'update' ? 'bg-warning' : 'bg-destructive'
                        }`} />
                        <div>
                          <p className="text-sm font-medium capitalize">{log.action} on <span className="font-mono text-primary">{log.table_name}</span></p>
                          <p className="text-xs text-muted-foreground">{log.user_email || 'System'} • {log.user_role || 'N/A'} • Record: {log.record_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                        <Badge variant={getActionColor(log.action) as any} className="text-xs">{log.action}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Policy Management</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Patient Privacy Policy", version: "v2.1", lastUpdated: "2024-01-10", status: "active" },
                  { name: "Data Security Guidelines", version: "v1.8", lastUpdated: "2024-01-08", status: "active" },
                  { name: "Emergency Response Plan", version: "v3.0", lastUpdated: "2024-01-05", status: "review" },
                  { name: "Medication Administration", version: "v2.5", lastUpdated: "2024-01-12", status: "active" }
                ].map((policy, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          <p className="text-sm text-muted-foreground">{policy.version} • Updated {policy.lastUpdated}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>{policy.status}</Badge>
                          <Button size="sm" variant="outline" onClick={() => toast({ title: "Policy Viewed", description: `Viewing ${policy.name}` })}><Eye className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Audit Modal */}
      <Dialog open={!!viewAudit} onOpenChange={() => setViewAudit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Audit Details - {viewAudit?.type}</DialogTitle></DialogHeader>
          {viewAudit && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Type:</span> {viewAudit.type}</div>
                <div><span className="text-muted-foreground">Score:</span> <span className="font-bold">{viewAudit.score}%</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewAudit.status) as any}>{viewAudit.status}</Badge></div>
                <div><span className="text-muted-foreground">Last Check:</span> {viewAudit.lastCheck}</div>
                <div><span className="text-muted-foreground">Next Due:</span> {viewAudit.nextDue}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Audit Modal */}
      <Dialog open={isNewAuditOpen} onOpenChange={() => setIsNewAuditOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Schedule New Audit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Audit Type</Label>
              <Select value={newAudit.type} onValueChange={v => setNewAudit(a => ({...a, type: v}))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {['HIPAA Compliance','Joint Commission','Fire Safety','Medication Safety','Infection Control','Patient Safety','Equipment Safety','Data Privacy'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Scheduled Date</Label><Input type="date" value={newAudit.date} onChange={e => setNewAudit(a => ({...a, date: e.target.value}))} /></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewAuditOpen(false)}>Cancel</Button>
              <Button onClick={handleNewAudit}>Create Audit</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
