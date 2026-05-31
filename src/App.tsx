import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { HospitalDataProvider } from "@/contexts/HospitalDataContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import { Dashboard } from "./components/Dashboard";
import { PatientManagement } from "./components/PatientManagement";
import { BedManagement } from "./components/BedManagement";
import { Appointments } from "./components/Appointments";
import { Admissions } from "./components/Admissions";
import { Orders } from "./components/Orders";
import { NursingStation } from "./components/NursingStation";
import { Medications } from "./components/Medications";
import { Billing } from "./components/Billing";
import { StaffScheduling } from "./components/StaffScheduling";
import { Analytics } from "./components/Analytics";
import { Compliance } from "./components/Compliance";
import { Notifications } from "./components/Notifications";
import { Settings } from "./components/Settings";
import { Sidebar } from "./components/Sidebar";
import { SoundToggle } from "./components/SoundToggle";
import { Loader2 } from "lucide-react";
import AIChatbot from "./components/AIChatbot";
import { chatEvents } from "@/lib/chatEvents";
import { getAiActionRoute } from "@/lib/aiNavigation";
import { Component, useEffect, type ReactNode } from "react";

const queryClient = new QueryClient();

class RouteErrorBoundary extends Component<
  { children: ReactNode; resetKey: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-md rounded-2xl border border-border/40 bg-card p-6 text-center shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">This view could not render.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The page recovered from an invalid record. Go back to the dashboard and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign("/dashboard")}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <div className="h-screen overflow-hidden bg-background flex w-full">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col h-screen">
        <header className="h-12 flex items-center justify-end px-4 gap-2 shrink-0">
          <SoundToggle />
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6 pt-0">
          <RouteErrorBoundary resetKey={`${location.pathname}${location.search}`}>
            <PageTransition>
              {children}
            </PageTransition>
          </RouteErrorBoundary>
        </div>
      </main>
    </div>
  );
};

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const { user, role, loading, isVisitor } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !isVisitor) return <Navigate to="/login" replace />;
  
  if (!isVisitor && allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

function ThemeLoader() {
  useThemeColor();
  return null;
}

function AiActionNavigator() {
  const navigate = useNavigate();

  useEffect(() => {
    return chatEvents.on("action", (payload) => {
      const route = getAiActionRoute(payload);
      if (!route) return;
      window.setTimeout(() => navigate(route), 180);
    });
  }, [navigate]);

  return null;
}

function AppRoutes() {
  const { user, loading, isVisitor } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={(user || isVisitor) ? <Navigate to="/dashboard" replace /> : <PageTransition><Login /></PageTransition>} />
      <Route path="/" element={(user || isVisitor) ? <Navigate to="/dashboard" replace /> : <PageTransition><Landing /></PageTransition>} />
      <Route path="/landing" element={<Navigate to="/" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute allowedRoles={['admin','doctor','nurse']}><PatientManagement /></ProtectedRoute>} />
      <Route path="/beds" element={<ProtectedRoute><BedManagement /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute allowedRoles={['admin','doctor','receptionist']}><Appointments /></ProtectedRoute>} />
      <Route path="/admissions" element={<ProtectedRoute allowedRoles={['admin','receptionist']}><Admissions /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute allowedRoles={['admin','doctor']}><Orders /></ProtectedRoute>} />
      <Route path="/nursing" element={<ProtectedRoute allowedRoles={['admin','doctor','nurse']}><NursingStation /></ProtectedRoute>} />
      <Route path="/medications" element={<ProtectedRoute allowedRoles={['admin','doctor','nurse']}><Medications /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin','receptionist']}><Billing /></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffScheduling /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin','doctor']}><Analytics /></ProtectedRoute>} />
      <Route path="/compliance" element={<ProtectedRoute allowedRoles={['admin']}><Compliance /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HospitalDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ThemeLoader />
            <AiActionNavigator />
            <AppRoutes />
            <AIChatbot />
          </BrowserRouter>
        </TooltipProvider>
      </HospitalDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
