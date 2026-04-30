import { motion, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Users, Calendar, HeartPulse } from "lucide-react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const mv = { val: 0 };
        const controls = animate(mv, { val: target }, {
          duration: 2,
          ease: "easeOut",
          onUpdate: () => setValue(Math.round(mv.val)),
        });
        return () => controls.stop();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

const stats = [
  { icon: Users, value: 2400, suffix: "+", label: "Hospitals", sub: "across 48 countries" },
  { icon: HeartPulse, value: 18, suffix: "M+", label: "Patients Managed", sub: "monthly active records" },
  { icon: Calendar, value: 4, suffix: "M+", label: "Appointments", sub: "processed monthly" },
  { icon: TrendingUp, value: 34, suffix: "%", label: "Efficiency Gain", sub: "average improvement" },
];

export const LiveStats = () => (
  <section className="py-24 relative">
    <div className="absolute inset-0 opacity-30 pointer-events-none"
      style={{
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 50%, hsl(45 93% 58% / 0.06), transparent)"
      }}
    />
    <div className="max-w-6xl mx-auto px-6 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="glass-card rounded-2xl p-6 text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mx-auto mb-3 group-hover:shadow-[0_0_20px_hsl(45_93%_58%/0.12)] transition-shadow duration-500">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-1">
              <AnimatedCounter target={s.value} suffix={s.suffix} />
            </div>
            <div className="text-sm font-medium">{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
