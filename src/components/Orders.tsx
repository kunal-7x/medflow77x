import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TestTube, Scan, Plus, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { OrderFormModal } from "@/components/modals/OrderFormModal";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadCSV } from "@/lib/exportUtils";

export function Orders() {
  const { orders, updateOrder } = useHospitalData();
  const { toast } = useToast();
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isImagingModalOpen, setIsImagingModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [detailOrder, setDetailOrder] = useState<any>(null);
  const [statusOrder, setStatusOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'in-progress');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const allOrders = orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in-progress": return "warning";
      case "pending": return "secondary";
      default: return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat": return "destructive";
      case "urgent": return "warning";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Lab": return TestTube;
      case "Imaging": return Scan;
      default: return FileText;
    }
  };

  const handleUpdateStatus = () => {
    if (statusOrder && newStatus) {
      updateOrder(statusOrder.id, { status: newStatus as any, ...(newStatus === 'completed' ? { completedDate: new Date().toISOString().split('T')[0], result: 'Results available' } : {}) });
      toast({ title: "Status Updated", description: `Order status changed to ${newStatus}` });
      setStatusOrder(null);
      setNewStatus('');
    }
  };

  const handleMarkReviewed = (order: any) => {
    updateOrder(order.id, { result: `Reviewed: ${order.result || 'Normal findings'}` });
    toast({ title: "Marked Reviewed", description: `Results for ${order.patientName} marked as reviewed` });
  };

  const handleExportOrders = () => {
    downloadCSV(orders.map(o => ({ id: o.id, patient: o.patientName, type: o.type, test: o.test, doctor: o.doctor, status: o.status, priority: o.priority, ordered: o.ordered })), 'orders_report');
    toast({ title: "Exported", description: "Orders report downloaded" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Orders & Results</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage lab orders, imaging requests, and results</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" variant="default" onClick={() => setIsLabModalOpen(true)}>
            <Plus className="w-4 h-4" /> New Lab Order
          </Button>
          <Button className="gap-2" variant="medical" onClick={() => setIsImagingModalOpen(true)}>
            <Plus className="w-4 h-4" /> New Imaging
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: FileText, value: orders.length, label: "Total Orders", color: "text-primary" },
          { icon: Clock, value: activeOrders.length, label: "Pending/Active", color: "text-warning" },
          { icon: CheckCircle, value: completedOrders.length, label: "Completed", color: "text-success" },
          { icon: AlertTriangle, value: orders.filter(o => o.priority === 'stat').length, label: "STAT Orders", color: "text-destructive" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-6"><div className="flex items-center gap-3"><s.icon className={`w-8 h-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">Active Orders</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Active Orders ({activeOrders.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {activeOrders.slice(0, 30).map((order) => {
                  const TypeIcon = getTypeIcon(order.type);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border/30 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <TypeIcon className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{order.test}</p>
                          <p className="text-sm text-muted-foreground">{order.patientName}</p>
                          <p className="text-xs text-muted-foreground">Ordered by {order.doctor} • {order.ordered}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getPriorityColor(order.priority) as any}>{order.priority}</Badge>
                        <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                        <Badge variant="outline">{order.type}</Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDetailOrder(order)}><Eye className="w-3 h-3 mr-1" /> Details</Button>
                          <Button size="sm" variant="medical" onClick={() => { setStatusOrder(order); setNewStatus(order.status); }}>Update Status</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Completed Results ({completedOrders.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {completedOrders.slice(0, 30).map((order) => {
                  const TypeIcon = getTypeIcon(order.type);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border/30 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <TypeIcon className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{order.test}</p>
                          <p className="text-sm text-muted-foreground">{order.patientName}</p>
                          <p className="text-xs text-muted-foreground">Completed: {order.completedDate} • {order.doctor}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium text-sm">{order.result || 'Results available'}</p>
                          <Badge variant="default">completed</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDetailOrder(order)}>View Report</Button>
                          <Button size="sm" variant="medical" onClick={() => handleMarkReviewed(order)}>Mark Reviewed</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order History ({allOrders.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={handleExportOrders}>Export</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {allOrders.slice(0, 50).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border border-border/30 rounded-xl hover:bg-secondary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-mono text-muted-foreground w-16">{order.id}</div>
                      <div>
                        <p className="text-sm font-medium">{order.test}</p>
                        <p className="text-xs text-muted-foreground">{order.patientName} • {order.doctor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                      <Badge variant="outline">{order.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OrderFormModal isOpen={isLabModalOpen} onClose={() => setIsLabModalOpen(false)} mode="create" defaultType="Lab" />
      <OrderFormModal isOpen={isImagingModalOpen} onClose={() => setIsImagingModalOpen(false)} mode="create" defaultType="Imaging" />

      {/* Order Detail Modal */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order Details</DialogTitle></DialogHeader>
          {detailOrder && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Order ID:</span> <span className="font-mono">{detailOrder.id}</span></div>
                <div><span className="text-muted-foreground">Type:</span> {detailOrder.type}</div>
                <div><span className="text-muted-foreground">Patient:</span> {detailOrder.patientName}</div>
                <div><span className="text-muted-foreground">Doctor:</span> {detailOrder.doctor}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Test:</span> {detailOrder.test}</div>
                <div><span className="text-muted-foreground">Priority:</span> <Badge variant={getPriorityColor(detailOrder.priority) as any}>{detailOrder.priority}</Badge></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(detailOrder.status) as any}>{detailOrder.status}</Badge></div>
                <div className="col-span-2"><span className="text-muted-foreground">Ordered:</span> {detailOrder.ordered}</div>
                {detailOrder.result && <div className="col-span-2"><span className="text-muted-foreground">Result:</span> {detailOrder.result}</div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={!!statusOrder} onOpenChange={() => setStatusOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Update Order Status</DialogTitle></DialogHeader>
          {statusOrder && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{statusOrder.test} for {statusOrder.patientName}</p>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setStatusOrder(null)}>Cancel</Button>
                <Button onClick={handleUpdateStatus}>Update</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
