import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    quote: "MedFlow transformed how we manage patient flow. Our ER wait times dropped by 38% in the first month. The real-time dashboard alone was worth the switch.",
    name: "Dr. Sarah Chen",
    role: "Chief Medical Officer",
    hospital: "Pacific Health Network",
    initials: "SC",
    stars: 5,
  },
  {
    quote: "The nursing handover module eliminated information gaps between shifts. Patient safety incidents decreased by 52% after implementation. It's genuinely life-saving technology.",
    name: "Maria Gonzalez",
    role: "Director of Nursing",
    hospital: "Mount Cedar Medical Center",
    initials: "MG",
    stars: 5,
  },
  {
    quote: "We evaluated 12 hospital management platforms. MedFlow was the only one that handled our multi-facility complexity without requiring custom development. Outstanding product.",
    name: "Dr. James Mitchell",
    role: "VP of Operations",
    hospital: "Northstar Health System",
    initials: "JM",
    stars: 5,
  },
];

export const Testimonials = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Trusted by <span className="text-gradient-gold">Healthcare Leaders</span>
          </h2>
        </motion.div>

        <div className="relative min-h-[280px]">
          <AnimatePresence mode="wait">
            {testimonials.map((t, i) =>
              i === active ? (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="glass-card rounded-2xl p-8 md:p-10 border border-primary/10 absolute inset-0"
                  style={{ boxShadow: "0 0 40px hsl(45 93% 58% / 0.05)" }}
                >
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <p className="text-lg md:text-xl leading-relaxed mb-6 text-foreground/90">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.role}, {t.hospital}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === active ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
