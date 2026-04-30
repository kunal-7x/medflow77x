import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Building2, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignupModal = ({ open, onOpenChange }: SignupModalProps) => {
  const [step, setStep] = useState<"email" | "details" | "done">("email");
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep("details");
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("done");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setStep("email"); setEmail(""); }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative glass-card rounded-2xl p-8 w-full max-w-md z-10"
            style={{ boxShadow: "0 0 60px hsl(45 93% 58% / 0.08)" }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold mb-1">Request a Demo</h3>
                  <p className="text-sm text-muted-foreground">See MedFlow in action with a personalized walkthrough.</p>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Work email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30" /></div>
                  <div className="relative flex justify-center text-xs"><span className="px-2 bg-card text-muted-foreground">or</span></div>
                </div>
                <Button variant="outline" className="w-full" type="button" onClick={() => window.location.href = '/login'}>
                  Sign in to existing account
                </Button>
              </form>
            )}

            {step === "details" && (
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Tell us about you</h3>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Full name" className="pl-10 h-11 rounded-xl" required />
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Hospital / Organization" className="pl-10 h-11 rounded-xl" required />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Phone number" className="pl-10 h-11 rounded-xl" />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Submit Request <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}

            {step === "done" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Demo Request Received</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Our team will reach out within 24 hours to schedule your personalized walkthrough.
                </p>
                <Button variant="outline" onClick={handleClose}>Close</Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
