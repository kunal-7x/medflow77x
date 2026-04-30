import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, FileCheck, KeyRound } from "lucide-react";

const badges = [
  { icon: Shield, label: "HIPAA", sub: "Full compliance" },
  { icon: Lock, label: "SOC 2 Type II", sub: "Audited annually" },
  { icon: FileCheck, label: "HITECH", sub: "Certified" },
  { icon: Server, label: "ISO 27001", sub: "Information security" },
  { icon: Eye, label: "GDPR", sub: "EU data protection" },
  { icon: KeyRound, label: "AES-256", sub: "End-to-end encryption" },
];

export const SecurityCompliance = () => (
  <section id="security" className="py-24 border-y border-border/30">
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Enterprise Security</p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Security You Can <span className="text-gradient-gold">Trust</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Built from the ground up for healthcare. Your data is protected by industry-leading security infrastructure.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
            className="group glass-card rounded-2xl p-5 flex items-center gap-4 overflow-hidden relative"
          >
            {/* Hover glow border */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ border: "1px solid hsl(45 93% 58% / 0.12)", boxShadow: "0 0 20px hsl(45 93% 58% / 0.04)" }}
            />
            <div className="p-2.5 rounded-xl bg-primary/8 border border-primary/10 shrink-0 relative z-10">
              <b.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="relative z-10">
              <div className="font-semibold text-sm">{b.label}</div>
              <div className="text-xs text-muted-foreground">{b.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
