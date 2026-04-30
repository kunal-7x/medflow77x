import { motion, useInView } from "framer-motion";
import { Monitor, LayoutDashboard, Users, BedDouble, Calendar, BarChart3, Bell, HeartPulse, Activity, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";

/* Animated counter for stat cards */
const MiniCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const start = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      setVal(Math.round(t * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

/* SVG Bar Chart */
const AnimatedBarChart = () => {
  const bars = [65, 45, 80, 55, 70, 90, 60];
  return (
    <svg viewBox="0 0 140 60" className="w-full h-full">
      {bars.map((h, i) => (
        <motion.rect
          key={i}
          x={4 + i * 19}
          y={60}
          width={14}
          rx={3}
          height={0}
          fill={i === 5 ? "hsl(45 93% 58%)" : "hsl(228 10% 18%)"}
          animate={{ height: h * 0.55, y: 60 - h * 0.55 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
};

/* SVG Line Chart */
const AnimatedLineChart = () => {
  const path = "M0,40 Q20,35 35,25 T70,30 T105,15 T140,20";
  return (
    <svg viewBox="0 0 140 50" className="w-full h-full">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(45 93% 58%)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(200 60% 55%)" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <motion.path
        d={path}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
};

/* Shimmer row */
const PatientRow = ({ name, status, delay }: { name: string; status: string; delay: number }) => {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex items-center gap-2 py-1 text-[8px]">
      {revealed ? (
        <>
          <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[6px] text-primary font-bold">{name[0]}</span>
          </div>
          <span className="flex-1 text-foreground/70 truncate">{name}</span>
          <span className={`px-1.5 py-0.5 rounded text-[6px] font-medium ${
            status === "Stable" ? "bg-[hsl(160,50%,42%)]/15 text-[hsl(160,50%,55%)]" :
            status === "Critical" ? "bg-destructive/15 text-destructive" :
            "bg-primary/15 text-primary"
          }`}>{status}</span>
        </>
      ) : (
        <>
          <div className="w-3 h-3 rounded-full animate-shimmer" />
          <div className="flex-1 h-2 rounded animate-shimmer" />
          <div className="w-8 h-3 rounded animate-shimmer" />
        </>
      )}
    </div>
  );
};

const sidebarIcons = [LayoutDashboard, Users, BedDouble, Calendar, BarChart3, Bell];

const patients = [
  { name: "Sarah Mitchell", status: "Stable" },
  { name: "James Cooper", status: "Critical" },
  { name: "Emily Watson", status: "Monitoring" },
  { name: "Michael Chen", status: "Stable" },
  { name: "Ana Rodriguez", status: "Stable" },
];

export const ProductDemo = () => {
  const [showToast, setShowToast] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setShowToast(true), 2500);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <section id="product-demo" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Product Tour</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            See MedFlow <span className="text-gradient-gold">In Action</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Experience the platform that's transforming hospital operations for thousands of healthcare teams.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group"
        >
          {/* Browser frame */}
          <div className="glass-card rounded-2xl overflow-hidden border border-border/40">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/40" />
                <div className="w-3 h-3 rounded-full bg-warning/40" />
                <div className="w-3 h-3 rounded-full bg-[hsl(160,50%,42%)]/40" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg bg-secondary/50 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Monitor className="w-3 h-3" />
                  app.medflow.io/dashboard
                </div>
              </div>
              {/* Live indicator */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(160,50%,42%)] animate-pulse" />
                <span className="text-[9px] uppercase tracking-wider text-[hsl(160,50%,55%)] font-mono">Live</span>
              </div>
            </div>

            {/* Dashboard content — desktop */}
            <div className="aspect-video bg-background relative overflow-hidden hidden sm:block">
              <div className="absolute inset-0 flex" style={{ transform: "scale(0.65)", transformOrigin: "top left", width: "153.8%", height: "153.8%", pointerEvents: "none" }}>
                {/* Sidebar */}
                <div className="w-14 bg-card border-r border-border/30 flex flex-col items-center py-4 gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  {sidebarIcons.map((Icon, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-semibold">Dashboard</div>
                      <div className="text-[10px] text-muted-foreground">Real-time overview</div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="px-2 py-1 rounded-md bg-secondary/60 text-[9px] text-muted-foreground">Today</div>
                      <div className="px-2 py-1 rounded-md bg-primary/15 text-[9px] text-primary font-medium">This Week</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { icon: HeartPulse, val: 847, suffix: "", label: "Total Patients", color: "text-primary" },
                      { icon: BedDouble, val: 92, suffix: "%", label: "Bed Occupancy", color: "text-[hsl(160,50%,55%)]" },
                      { icon: Calendar, val: 124, suffix: "", label: "Appointments", color: "text-[hsl(200,60%,55%)]" },
                      { icon: Users, val: 56, suffix: "", label: "Staff On Duty", color: "text-[hsl(260,40%,60%)]" },
                    ].map((s, i) => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.4 + i * 0.12 }}
                        className="rounded-xl bg-card border border-border/30 p-3"
                      >
                        <s.icon className={`w-3.5 h-3.5 ${s.color} mb-1.5`} />
                        <div className="text-lg font-bold">
                          <MiniCounter target={s.val} suffix={s.suffix} />
                        </div>
                        <div className="text-[8px] text-muted-foreground">{s.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-2 rounded-xl bg-card border border-border/30 p-3">
                      <div className="text-[9px] font-medium mb-2">Weekly Admissions</div>
                      <div className="h-16">{inView && <AnimatedBarChart />}</div>
                    </div>
                    <div className="col-span-2 rounded-xl bg-card border border-border/30 p-3">
                      <div className="text-[9px] font-medium mb-2">Patient Recovery Trend</div>
                      <div className="h-16">{inView && <AnimatedLineChart />}</div>
                    </div>
                    <div className="col-span-1 rounded-xl bg-card border border-border/30 p-3 flex flex-col justify-between">
                      <div className="text-[9px] font-medium">Quick Stats</div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-[8px] text-muted-foreground">Avg Wait</div>
                          <div className="text-xs font-bold">12m</div>
                        </div>
                        <div>
                          <div className="text-[8px] text-muted-foreground">Satisfaction</div>
                          <div className="text-xs font-bold text-[hsl(160,50%,55%)]">96%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-card border border-border/30 p-3">
                    <div className="text-[9px] font-medium mb-2">Recent Patients</div>
                    <div className="space-y-0.5">
                      {patients.map((p, i) => (
                        <PatientRow key={p.name} name={p.name} status={p.status} delay={1000 + i * 300} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toast notification */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: 0 }}
                animate={showToast ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute bottom-3 right-3 z-20"
              >
                <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2 border border-[hsl(160,50%,42%)]/20"
                  style={{ boxShadow: "0 4px 20px hsl(0 0% 0% / 0.4)" }}>
                  <CheckCircle className="w-3.5 h-3.5 text-[hsl(160,50%,55%)]" />
                  <div>
                    <div className="text-[9px] font-medium">Patient Discharged</div>
                    <div className="text-[7px] text-muted-foreground">Sarah Mitchell — Room 204</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Mobile fallback */}
            <div className="aspect-video bg-background relative overflow-hidden flex sm:hidden items-center justify-center">
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Live Dashboard Preview</p>
                <p className="text-xs text-muted-foreground">Best viewed on desktop for the full interactive experience</p>
              </div>
            </div>
          </div>

          {/* Conversion strip */}
          <div className="mt-8 glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                "MedFlow reduced our patient discharge time by <span className="text-primary font-bold">42%</span> and
                eliminated paper-based errors entirely."
              </p>
              <p className="text-xs text-muted-foreground mt-1">— Dr. Sarah Chen, CMO at Pacific Health Network</p>
            </div>
            <Button onClick={() => window.location.href = '/login'} className="shrink-0">
              Try It Free
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
