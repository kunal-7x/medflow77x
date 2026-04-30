import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, FileText, TrendingUp, Search, Download, CheckCircle, Loader2, Lock, Eye } from "lucide-react";
import { useHospitalData } from "@/contexts/HospitalDataContext";
import { BillingModal } from "@/components/modals/BillingModal";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { downloadTextReport, generateInvoiceReport, generateBillingReport, downloadCSV } from "@/lib/exportUtils";

export function Billing() {
  const { bills, updateBill, patients } = useHospitalData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | undefined>();
  const [viewBill, setViewBill] = useState<any>(null);
  const [viewClaim, setViewClaim] = useState<any>(null);

  // Payment flow states
  const [paymentStep, setPaymentStep] = useState(0); // 0=closed, 1=form, 2=pin, 3=processing, 4=confirmation
  const [paymentBill, setPaymentBill] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({ method: 'UPI', amount: '', name: '', upiId: '', pin: '' });

  const totalRevenue = bills.reduce((s, b) => s + b.amount, 0);
  const paidAmount = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const pendingAmount = bills.filter(b => b.status === 'pending').reduce((s, b) => s + b.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": case "approved": return "default";
      case "pending": return "warning";
      case "overdue": case "denied": return "destructive";
      default: return "secondary";
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const filteredBills = bills.filter(b => b.patientName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Mock claims from bills
  const claims = bills.filter(b => b.insuranceClaimId).map(b => ({
    ...b, claimNumber: b.insuranceClaimId, insurance: 'Insurance Provider',
    submittedDate: b.dueDate, claimStatus: b.status === 'paid' ? 'approved' : 'pending',
    approvedAmount: b.status === 'paid' ? b.amount * 0.9 : null
  }));

  const startPaymentFlow = (bill: any) => {
    setPaymentBill(bill);
    setPaymentForm({ method: 'UPI', amount: String(bill.amount), name: bill.patientName, upiId: '', pin: '' });
    setPaymentStep(1);
  };

  const handlePaymentSubmit = () => {
    if (!paymentForm.amount || !paymentForm.upiId) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    setPaymentStep(2);
  };

  const handlePinSubmit = () => {
    if (paymentForm.pin.length < 4) {
      toast({ title: "Error", description: "Enter valid PIN", variant: "destructive" });
      return;
    }
    setPaymentStep(3);
    // Simulate processing
    setTimeout(() => {
      if (paymentBill) {
        updateBill(paymentBill.id, { status: 'paid' });
      }
      setPaymentStep(4);
    }, 2500);
  };

  const closePaymentFlow = () => {
    setPaymentStep(0);
    setPaymentBill(null);
  };

  const handleExport = () => {
    downloadCSV(bills.map(b => ({ id: b.id, patient: b.patientName, amount: b.amount, status: b.status, dueDate: b.dueDate })), 'billing_export');
    toast({ title: "Exported", description: "Billing data exported as CSV" });
  };

  const handleViewInvoice = (bill: any) => {
    setViewBill(bill);
  };

  const handleExportInvoice = (bill: any) => {
    const report = generateInvoiceReport(bill);
    downloadTextReport(report, `invoice_${bill.id}`);
    toast({ title: "Invoice Downloaded", description: `Invoice ${bill.id} downloaded` });
  };

  const handleGenerateReport = (type: string) => {
    const report = generateBillingReport(bills);
    downloadTextReport(report, `billing_${type}_report`);
    toast({ title: "Report Generated", description: `${type} report downloaded` });
  };

  const handleFollowUp = (claim: any) => {
    toast({ title: "Follow-up Sent", description: `Follow-up sent for claim ${claim.claimNumber}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold">Billing & Insurance</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage patient billing and insurance claims</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" variant="default" onClick={() => setIsGenerateOpen(true)}><FileText className="w-4 h-4" /> Generate Invoice</Button>
          <Button className="gap-2" variant="medical" onClick={() => {
            const pendingBill = bills.find(b => b.status === 'pending');
            if (pendingBill) startPaymentFlow(pendingBill);
            else toast({ title: "No pending bills", description: "All bills are paid" });
          }}><CreditCard className="w-4 h-4" /> Process Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: DollarSign, value: formatCurrency(totalRevenue), label: "Total Revenue", color: "text-primary" },
          { icon: CreditCard, value: formatCurrency(paidAmount), label: "Collected", color: "text-primary" },
          { icon: FileText, value: bills.filter(b => b.status === 'pending').length, label: "Pending Bills", color: "text-warning" },
          { icon: TrendingUp, value: totalRevenue > 0 ? `${((paidAmount/totalRevenue)*100).toFixed(1)}%` : '0%', label: "Collection Rate", color: "text-accent" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-6"><div className="flex items-center gap-3"><s.icon className={`w-8 h-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="bills" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bills">Patient Bills</TabsTrigger>
          <TabsTrigger value="claims">Insurance Claims</TabsTrigger>
          <TabsTrigger value="payments">Payment Processing</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search patients, bills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport}><Download className="w-4 h-4" /> Export</Button>
        </div>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Patient Bills ({filteredBills.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredBills.slice(0, 30).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border border-border/30 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <DollarSign className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{bill.patientName}</p>
                        <p className="text-sm text-muted-foreground">{bill.id}</p>
                        <p className="text-xs text-muted-foreground">Services: {bill.items?.map(i => i.description).join(', ').slice(0, 50)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
                        <p className="text-sm text-muted-foreground">{bill.dueDate}</p>
                      </div>
                      <Badge variant={getStatusColor(bill.status) as any}>{bill.status}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewInvoice(bill)}><Eye className="w-3 h-3 mr-1" /> View</Button>
                        <Button size="sm" variant="outline" onClick={() => handleExportInvoice(bill)}><Download className="w-3 h-3 mr-1" /> Export</Button>
                        {bill.status !== 'paid' && <Button size="sm" variant="medical" onClick={() => startPaymentFlow(bill)}>Pay</Button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Insurance Claims ({claims.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {claims.slice(0, 20).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-4 border border-border/30 rounded-2xl hover:bg-secondary/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{claim.patientName}</p>
                        <p className="text-sm text-muted-foreground">{claim.claimNumber}</p>
                        <p className="text-xs text-muted-foreground">{claim.insurance} • Submitted: {claim.submittedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(claim.amount)}</p>
                        {claim.approvedAmount && <p className="text-sm text-primary">Approved: {formatCurrency(claim.approvedAmount)}</p>}
                      </div>
                      <Badge variant={getStatusColor(claim.claimStatus) as any}>{claim.claimStatus}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setViewClaim(claim)}>View Claim</Button>
                        <Button size="sm" variant="medical" onClick={() => handleFollowUp(claim)}>Follow Up</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Payment Processing</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select a pending bill from the Bills tab, or click "Process Payment" to start a payment.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Cash Payments', amount: formatCurrency(paidAmount * 0.3) },
                    { label: 'Card/UPI', amount: formatCurrency(paidAmount * 0.45) },
                    { label: 'Insurance', amount: formatCurrency(paidAmount * 0.25) },
                  ].map((m, i) => (
                    <div key={i} className="flex justify-between p-3 border border-border/30 rounded-lg">
                      <span className="text-sm">{m.label}</span><span className="font-medium text-sm">{m.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Pending Payments</h4>
                  {bills.filter(b => b.status === 'pending').slice(0, 10).map(bill => (
                    <div key={bill.id} className="flex items-center justify-between p-3 border border-border/30 rounded-lg">
                      <div><p className="text-sm font-medium">{bill.patientName}</p><p className="text-xs text-muted-foreground">{formatCurrency(bill.amount)}</p></div>
                      <Button size="sm" variant="medical" onClick={() => startPaymentFlow(bill)}>Process</Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Financial Reports</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Daily Revenue Report', desc: 'Daily billing and collection summary', type: 'daily_revenue' },
                  { title: 'Outstanding Receivables', desc: 'Aging report for unpaid bills', type: 'receivables' },
                  { title: 'Insurance Analysis', desc: 'Claims status and payer performance', type: 'insurance' },
                  { title: 'Payment Trends', desc: 'Payment method analysis and trends', type: 'trends' },
                ].map((r) => (
                  <div key={r.type} className="p-4 border border-border/30 rounded-lg">
                    <h3 className="font-medium mb-2">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{r.desc}</p>
                    <Button size="sm" variant="outline" onClick={() => handleGenerateReport(r.type)}>Generate Report</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BillingModal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} type="generate" />

      {/* View Invoice Modal */}
      <Dialog open={!!viewBill} onOpenChange={() => setViewBill(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Invoice - {viewBill?.id}</DialogTitle></DialogHeader>
          {viewBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {viewBill.patientName}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewBill.status) as any}>{viewBill.status}</Badge></div>
                <div><span className="text-muted-foreground">Due:</span> {viewBill.dueDate}</div>
                <div><span className="text-muted-foreground">Total:</span> <span className="font-bold">{formatCurrency(viewBill.amount)}</span></div>
              </div>
              <div className="border-t border-border/30 pt-3">
                <h4 className="font-medium mb-2 text-sm">Line Items</h4>
                {viewBill.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm py-1"><span>{item.description}</span><span>{formatCurrency(item.amount)}</span></div>
                ))}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-border/30 mt-2"><span>Total</span><span>{formatCurrency(viewBill.amount)}</span></div>
              </div>
              <Button className="w-full" variant="outline" onClick={() => handleExportInvoice(viewBill)}><Download className="w-4 h-4 mr-2" /> Download Invoice</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Claim Modal */}
      <Dialog open={!!viewClaim} onOpenChange={() => setViewClaim(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Claim Details - {viewClaim?.claimNumber}</DialogTitle></DialogHeader>
          {viewClaim && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Patient:</span> {viewClaim.patientName}</div>
                <div><span className="text-muted-foreground">Insurance:</span> {viewClaim.insurance}</div>
                <div><span className="text-muted-foreground">Amount:</span> {formatCurrency(viewClaim.amount)}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge>{viewClaim.claimStatus}</Badge></div>
                {viewClaim.approvedAmount && <div><span className="text-muted-foreground">Approved:</span> {formatCurrency(viewClaim.approvedAmount)}</div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Multi-step Payment Flow */}
      <Dialog open={paymentStep > 0} onOpenChange={() => closePaymentFlow()}>
        <DialogContent className="max-w-md">
          {paymentStep === 1 && (
            <>
              <DialogHeader><DialogTitle>Step 1: Payment Details</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-sm"><strong>Patient:</strong> {paymentBill?.patientName}</p>
                  <p className="text-sm"><strong>Amount:</strong> {paymentBill ? formatCurrency(paymentBill.amount) : ''}</p>
                </div>
                <div><Label>Payment Method</Label>
                  <select className="w-full p-2 border border-border/30 rounded-lg bg-background text-sm" value={paymentForm.method} onChange={e => setPaymentForm(f => ({...f, method: e.target.value}))}>
                    <option value="UPI">UPI</option><option value="Card">Credit/Debit Card</option><option value="Cash">Cash</option><option value="NetBanking">Net Banking</option>
                  </select>
                </div>
                <div><Label>Amount ($)</Label><Input value={paymentForm.amount} onChange={e => setPaymentForm(f => ({...f, amount: e.target.value}))} /></div>
                <div><Label>UPI ID / Card Number</Label><Input placeholder="user@upi or card number" value={paymentForm.upiId} onChange={e => setPaymentForm(f => ({...f, upiId: e.target.value}))} /></div>
                <DialogFooter><Button variant="outline" onClick={closePaymentFlow}>Cancel</Button><Button onClick={handlePaymentSubmit}>Continue</Button></DialogFooter>
              </div>
            </>
          )}
          {paymentStep === 2 && (
            <>
              <DialogHeader><DialogTitle>Step 2: Enter PIN</DialogTitle></DialogHeader>
              <div className="space-y-6 text-center py-4">
                <Lock className="w-12 h-12 mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Enter your {paymentForm.method} PIN to authorize payment of {formatCurrency(parseFloat(paymentForm.amount) || 0)}</p>
                <Input type="password" maxLength={6} placeholder="Enter PIN" value={paymentForm.pin} onChange={e => setPaymentForm(f => ({...f, pin: e.target.value}))} className="text-center text-2xl tracking-[1em] max-w-48 mx-auto" />
                <DialogFooter className="justify-center"><Button variant="outline" onClick={() => setPaymentStep(1)}>Back</Button><Button onClick={handlePinSubmit}>Authorize</Button></DialogFooter>
              </div>
            </>
          )}
          {paymentStep === 3 && (
            <>
              <DialogHeader><DialogTitle>Step 3: Processing</DialogTitle></DialogHeader>
              <div className="text-center py-12 space-y-4">
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                <p className="text-lg font-medium">Processing Payment...</p>
                <p className="text-sm text-muted-foreground">Please wait while we process your payment</p>
              </div>
            </>
          )}
          {paymentStep === 4 && (
            <>
              <DialogHeader><DialogTitle>Step 4: Payment Confirmed</DialogTitle></DialogHeader>
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center"><CheckCircle className="w-10 h-10 text-primary" /></div>
                <p className="text-xl font-bold">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">Transaction completed for {paymentBill?.patientName}</p>
                <div className="p-3 bg-secondary/30 rounded-lg text-sm">
                  <p><strong>Amount:</strong> {formatCurrency(parseFloat(paymentForm.amount) || 0)}</p>
                  <p><strong>Method:</strong> {paymentForm.method}</p>
                  <p><strong>Ref:</strong> TXN{Date.now()}</p>
                </div>
                <Button className="w-full" onClick={closePaymentFlow}>Done</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
