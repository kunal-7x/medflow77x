import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import { ArrowRight, Play, Activity, Shield, Users, Zap, ChevronDown, LayoutDashboard, HeartPulse, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useMemo } from "react";
import { getPresetColor, themePresets } from "@/hooks/useThemeColor";

interface LandingHeroProps {
  onRequestDemo: () => void;
}

/* Particles */
const particles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 6 + Math.random() * 8,
  delay: Math.random() * 4,
}));

/* Word-by-word animation */
const WordReveal = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: delay + i * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

export const LandingHero = ({ onRequestDemo }: LandingHeroProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const accentIndex = parseInt(localStorage.getItem('medflow-theme-color') || '0', 10);
  const accentColor = getPresetColor(themePresets[accentIndex]?.label || 'Gold');

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const scrollToDemo = () => {
    document.getElementById("product-demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, hsl(45 93% 58% / 0.15), transparent),
              radial-gradient(ellipse 60% 40% at 80% 80%, hsl(200 60% 55% / 0.08), transparent),
              radial-gradient(ellipse 50% 30% at 10% 60%, hsl(260 40% 50% / 0.06), transparent)`
          }}
        />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "64px 64px"
          }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary/20"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}

        {/* Large shifting gradient orb */}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle, hsl(45 93% 58% / 0.08), transparent 70%)",
              "radial-gradient(circle, hsl(200 60% 55% / 0.06), transparent 70%)",
              "radial-gradient(circle, hsl(45 93% 58% / 0.08), transparent 70%)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating orbs with parallax */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(45 93% 58% / 0.06), transparent 70%)" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(200 60% 55% / 0.05), transparent 70%)" }}
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-border/30"
        style={{ background: "hsl(228 14% 6% / 0.8)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">MedFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#product-demo" className="hover:text-foreground transition-colors">Product</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
            <Button size="sm" onClick={onRequestDemo} className="rounded-xl">
              Request Demo
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Trust badge with shimmer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm mb-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer-sweep_3s_infinite]"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(45 93% 58% / 0.15), transparent)",
              }}
            />
            <Shield className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">HIPAA Compliant · SOC 2 Certified · 99.99% Uptime</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-6">
            <span className="block">
              <WordReveal text="Streamline" delay={0.2} />
            </span>
            <span className="block text-gradient-gold">
              <WordReveal text="Patient Care" delay={0.5} />
            </span>
            <span className="block text-muted-foreground/80 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mt-2">
              <WordReveal text="& Hospital Operations" delay={0.8} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The unified platform that connects clinical workflows, real-time patient monitoring,
            and administrative operations — trusted by 2,400+ hospitals worldwide.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button size="xl" onClick={onRequestDemo} className="group min-w-[200px]">
              Request Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" onClick={scrollToDemo} className="min-w-[200px] gap-2">
              <Play className="w-4 h-4" />
              View Product Tour
            </Button>
          </motion.div>
        </motion.div>

        {/* Mouse-tracking 3D glass card */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          style={{ perspective: 1000, marginBottom: "2rem" }}
          className="max-w-xs sm:max-w-md mx-auto hidden sm:block"
        >
          <motion.div
            style={{ rotateX, rotateY }}
            className="glass-card rounded-2xl p-5 pointer-events-none"
          >
            {/* Mini dashboard preview */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Live Dashboard Preview</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { icon: HeartPulse, val: "847", label: "Patients" },
                { icon: BedDouble, val: "92%", label: "Beds" },
                { icon: LayoutDashboard, val: "124", label: "Today" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-secondary/60 p-2.5 text-center">
                  <item.icon className="w-3 h-3 text-primary mx-auto mb-1" />
                  <div className="text-sm font-bold">{item.val}</div>
                  <div className="text-[9px] text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-8 rounded-lg bg-secondary/40 animate-shimmer" />
              <div className="flex-1 h-8 rounded-lg bg-secondary/40 animate-shimmer" style={{ animationDelay: "0.3s" }} />
            </div>
          </motion.div>
        </motion.div>

        {/* Floating metric cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
          {[
            { icon: Users, label: "Hospitals", value: "2,400+" },
            { icon: Zap, label: "Avg Response", value: "<200ms" },
            { icon: Shield, label: "Uptime", value: "99.99%" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 + i * 0.1 }}
              className="glass-card rounded-2xl p-4 text-center hover-lift"
            >
              <item.icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
              <div className="text-xl font-bold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-16 flex justify-center"
        >
          <motion.button
            onClick={scrollToDemo}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-muted-foreground/50 hover:text-primary transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
