import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, BedDouble, Calendar, ClipboardList,
  Stethoscope, Pill, CreditCard, UserCog, BarChart3, Shield, Bell
} from "lucide-react";

const features = [
  { icon: LayoutDashboard, title: "Real-Time Dashboard", desc: "Live census, bed availability, and critical alerts in one unified command center.", stat: "< 1s refresh" },
  { icon: Users, title: "Patient Management", desc: "Complete EMR with vitals tracking, history, allergies, and real-time condition monitoring.", stat: "18M+ records" },
  { icon: BedDouble, title: "Bed & Room Management", desc: "Visual floor maps with drag-and-drop bed assignments and automated cleaning workflows.", stat: "98% utilization" },
  { icon: Calendar, title: "Appointments & Scheduling", desc: "Smart scheduling with conflict detection, SMS reminders, and multi-provider support.", stat: "4M+ monthly" },
  { icon: ClipboardList, title: "Orders & Results", desc: "Integrated lab and imaging order workflows with real-time result notifications.", stat: "2hr avg TAT" },
  { icon: Stethoscope, title: "Nursing Shift Handover", desc: "Structured handover notes with patient summaries, tasks, and priority flags.", stat: "Zero missed items" },
  { icon: Pill, title: "Medications & Pharmacy", desc: "Barcode verification, interaction checks, and automated dispensing integration.", stat: "99.9% accuracy" },
  { icon: CreditCard, title: "Billing & Claims", desc: "Itemized billing, insurance claim submission, and automated payment tracking.", stat: "$2.1B processed" },
  { icon: UserCog, title: "Staff Scheduling", desc: "AI-optimized shift planning with overtime tracking and credential management.", stat: "34% less overtime" },
  { icon: BarChart3, title: "Analytics & Reporting", desc: "Custom dashboards with drill-down analytics and automated compliance reports.", stat: "200+ metrics" },
  { icon: Shield, title: "Compliance & Audit", desc: "Full audit trail with before/after snapshots meeting HIPAA, HITECH, and Joint Commission standards.", stat: "100% traceable" },
  { icon: Bell, title: "Smart Notifications", desc: "Priority-based alerts with escalation rules and on-call paging integration.", stat: "< 30s delivery" },
];

export const FeatureGrid = () => (
  <section id="features" className="py-24 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Platform Capabilities</p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Everything You Need,<br />
          <span className="text-gradient-gold">Nothing You Don't</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          12 deeply integrated modules designed by clinicians, built by engineers, and trusted by hospitals worldwide.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative glass-card rounded-2xl p-6 cursor-default overflow-hidden"
          >
            {/* Animated gradient border on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: "inset 0 1px 0 hsl(45 93% 58% / 0.15), 0 0 30px hsl(45 93% 58% / 0.06)",
                border: "1px solid hsl(45 93% 58% / 0.15)",
              }}
            />
            {/* Gradient sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, hsl(45 93% 58% / 0.04), transparent)" }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/15 group-hover:shadow-[0_0_15px_hsl(45_93%_58%/0.15)] transition-shadow duration-500">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-mono">
                  {f.stat}
                </span>
              </div>
              <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
