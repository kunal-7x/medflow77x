import { motion } from "framer-motion";
import { Building2, Settings2, Rocket } from "lucide-react";

const steps = [
  {
    icon: Building2,
    num: "01",
    title: "Connect Your Hospital",
    desc: "Seamlessly integrate MedFlow with your existing systems. Our onboarding team handles data migration and setup.",
  },
  {
    icon: Settings2,
    num: "02",
    title: "Configure Workflows",
    desc: "Customize modules, roles, and notification rules to match your hospital's unique processes and standards.",
  },
  {
    icon: Rocket,
    num: "03",
    title: "Go Live",
    desc: "Launch with confidence. Real-time dashboards, staff training, and dedicated support from day one.",
  },
];

export const HowItWorks = () => (
  <section id="how-it-works" className="py-24 relative">
    <div className="max-w-5xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">How It Works</p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Live in <span className="text-gradient-gold">Three Steps</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          From setup to go-live in under 4 weeks. No disruption to your existing operations.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 1, ease: "easeInOut" }}
            style={{ transformOrigin: "left" }}
          />
        </div>

        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.15 }}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl p-6 text-center relative z-10"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mx-auto mb-4">
              <step.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-primary font-mono font-bold">{step.num}</span>
            <h3 className="text-lg font-semibold mt-1 mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
