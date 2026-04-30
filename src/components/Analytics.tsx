import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Bed, DollarSign, Clock, Download, Filter, Activity } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadialBarChart, RadialBar } from "recharts";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV, downloadJSON } from "@/lib/exportUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Analytics() {
  const { patients, beds, appointments, orders, bills, staff, medications } = useHospitalData();
  const { toast } = useToast();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("6months");

  const activePatients = patients.filter(p => p.status === 'active').length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const totalBeds = beds.length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const totalRevenue = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidRevenue = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
  const activeStaff = staff.filter(s => s.status === 'active').length;
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

  const chartData = [
    { month: "Jul", occupancy: 78, revenue: 980000, patients: 85, admissions: 32 },
    { month: "Aug", occupancy: 82, revenue: 1100000, patients: 92, admissions: 38 },
    { month: "Sep", occupancy: 85, revenue: 1250000, patients: 88, admissions: 35 },
    { month: "Oct", occupancy: 88, revenue: 1350000, patients: 95, admissions: 41 },
    { month: "Nov", occupancy: 90, revenue: 1450000, patients: 102, admissions: 44 },
    { month: "Dec", occupancy: occupancyRate, revenue: totalRevenue, patients: activePatients, admissions: 38 },
  ];

  const deptData = [
    { name: "Emergency", value: 92, fill: "hsl(45, 93%, 58%)" },
    { name: "ICU", value: 88, fill: "hsl(160, 60%, 45%)" },
    { name: "Surgery", value: 95, fill: "hsl(200, 70%, 55%)" },
    { name: "Cardiology", value: 85, fill: "hsl(280, 60%, 55%)" },
    { name: "Pediatrics", value: 90, fill: "hsl(0, 55%, 50%)" },
    { name: "Oncology", value: 82, fill: "hsl(35, 70%, 50%)" },
  ];

  const conditionData = [
    { name: "Critical", value: patients.filter(p => p.condition === 'Critical' && p.status === 'active').length, fill: "hsl(0, 55%, 50%)" },
    { name: "Stable", value: patients.filter(p => p.condition === 'Stable' && p.status === 'active').length, fill: "hsl(45, 93%, 58%)" },
    { name: "Good", value: patients.filter(p => p.condition === 'Good' && p.status === 'active').length, fill: "hsl(160, 60%, 45%)" },
    { name: "Fair", value: patients.filter(p => p.condition === 'Fair' && p.status === 'active').length, fill: "hsl(200, 70%, 55%)" },
  ];

  const handleExport = () => {
    const exportData = {
      summary: { totalPatients: patients.length, activePatients, totalBeds, occupancyRate, totalRevenue, activeStaff, totalOrders: orders.length, totalMedications: medications.length },
      chartData, deptData, conditionData
    };
    downloadJSON(exportData, 'analytics_export');
    toast({ title: "Analytics Exported", description: "Analytics data downloaded as JSON" });
  };

  const handleFilterApply = () => {
    setIsFilterOpen(false);
    toast({ title: "Filter Applied", description: `Showing data for ${filterPeriod}` });
  };

  const kpis = [
    { label: "Bed Occupancy", value: `${occupancyRate}%`, trend: 5.2, icon: Bed, color: "from-[hsl(45,93%,58%)] to-[hsl(38,80%,48%)]" },
    { label: "Active Patients", value: activePatients.toString(), trend: 3.1, icon: Users, color: "from-[hsl(160,60%,45%)] to-[hsl(170,55%,40%)]" },
    { label: "Revenue", value: formatCurrency(totalRevenue), trend: 12.5, icon: DollarSign, color: "from-[hsl(200,70%,55%)] to-[hsl(210,65%,50%)]" },
    { label: "Active Staff", value: activeStaff.toString(), trend: 1.8, icon: Activity, color: "from-[hsl(280,60%,55%)] to-[hsl(290,55%,50%)]" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Analytics & Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Hospital performance insights and data analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-xs" size="sm" onClick={() => setIsFilterOpen(true)}><Filter className="w-3.5 h-3.5" /> Filter</Button>
          <Button variant="outline" className="gap-2 text-xs" size="sm" onClick={handleExport}><Download className="w-3.5 h-3.5" /> Export</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="group relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500`} />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1 animate-count-up">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary">{kpi.trend}%</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Occupancy & Admission Trends</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 10%, 16%)" />
                    <XAxis dataKey="month" stroke="hsl(225, 8%, 50%)" fontSize={11} />
                    <YAxis stroke="hsl(225, 8%, 50%)" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(225, 12%, 10%)', border: '1px solid hsl(225, 10%, 16%)', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="occupancy" stroke="hsl(45, 93%, 58%)" fill="url(#goldGrad)" strokeWidth={2} name="Occupancy %" />
                    <Area type="monotone" dataKey="admissions" stroke="hsl(200, 70%, 55%)" fill="url(#blueGrad)" strokeWidth={2} name="Admissions" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Patient Conditions</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={conditionData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value">
                      {conditionData.map((entry, index) => (<Cell key={index} fill={entry.fill} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(225, 12%, 10%)', border: '1px solid hsl(225, 10%, 16%)', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {conditionData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                      <span className="text-muted-foreground">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 10%, 16%)" />
                  <XAxis dataKey="month" stroke="hsl(225, 8%, 50%)" fontSize={11} />
                  <YAxis stroke="hsl(225, 8%, 50%)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(225, 12%, 10%)', border: '1px solid hsl(225, 10%, 16%)', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="hsl(45, 93%, 58%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Financial Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: formatCurrency(totalRevenue), color: "text-primary" },
                  { label: "Collections", value: formatCurrency(paidRevenue), color: "text-primary" },
                  { label: "Outstanding", value: formatCurrency(totalRevenue - paidRevenue), color: "text-warning" },
                  { label: "Collection Rate", value: totalRevenue > 0 ? `${((paidRevenue / totalRevenue) * 100).toFixed(1)}%` : '0%', color: "text-primary" },
                ].map((m, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-secondary/20 border border-border/30">
                    <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Operational Metrics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Beds", value: totalBeds },
                  { label: "Occupied", value: occupiedBeds },
                  { label: "Available", value: beds.filter(b => b.status === 'available').length },
                  { label: "Maintenance", value: beds.filter(b => b.status === 'maintenance').length },
                  { label: "Total Orders", value: orders.length },
                  { label: "Pending Orders", value: orders.filter(o => o.status === 'pending').length },
                  { label: "Appointments", value: appointments.length },
                  { label: "Active Meds", value: medications.filter(m => m.status === 'active').length },
                ].map((m, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-secondary/20 border border-border/30">
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Clinical Quality</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Safety Score", value: "98.5%", color: "text-primary" },
                  { label: "Readmission Rate", value: "2.1%", color: "text-primary" },
                  { label: "Med Accuracy", value: "99.2%", color: "text-primary" },
                  { label: "Patient Satisfaction", value: "4.7/5", color: "text-primary" },
                ].map((m, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-secondary/20 border border-border/30">
                    <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Filter Modal */}
      <Dialog open={isFilterOpen} onOpenChange={() => setIsFilterOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Filter Analytics</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Time Period</label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleFilterApply}>Apply Filter</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
