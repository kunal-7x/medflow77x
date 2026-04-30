import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sun, Moon, Palette } from "lucide-react";
import { useThemeColor, themePresets, getPresetColor } from "@/hooks/useThemeColor";
import { LandingHero } from "@/components/landing/LandingHero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { LiveStats } from "@/components/landing/LiveStats";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { Testimonials } from "@/components/landing/Testimonials";
import { SecurityCompliance } from "@/components/landing/SecurityCompliance";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SignupModal } from "@/components/landing/SignupModal";

const GradientDivider = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6">
    <div className="h-px" style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.15), transparent)" }} />
  </div>
);

const Landing = () => {
  const [signupOpen, setSignupOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { mode, toggleMode, accentIndex, setAccentIndex } = useThemeColor();

  useEffect(() => {
    document.title = "MedFlow — Streamline Patient Care & Hospital Operations";
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ scrollBehavior: "smooth" }}>
      <LandingHero onRequestDemo={() => setSignupOpen(true)} />
      <TrustedBy />
      <GradientDivider />
      <LiveStats />
      <GradientDivider />
      <FeatureGrid />
      <GradientDivider />
      <HowItWorks />
      <GradientDivider />
      <ProductDemo />
      <GradientDivider />
      <Testimonials />
      <GradientDivider />
      <SecurityCompliance />
      <PricingPlans onGetStarted={() => setSignupOpen(true)} />
      <GradientDivider />
      <LandingFAQ />
      <LandingFooter onRequestDemo={() => setSignupOpen(true)} />
      <SignupModal open={signupOpen} onOpenChange={setSignupOpen} />

      {/* Floating controls — bottom left */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
        {/* Color picker panel */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="glass-card rounded-2xl p-3 mb-1 flex flex-col gap-2"
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">Accent Color</span>
              <div className="flex gap-1.5">
                {themePresets.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() => setAccentIndex(i)}
                    className="w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110"
                    style={{
                      backgroundColor: getPresetColor(preset.label),
                      borderColor: accentIndex === i ? getPresetColor(preset.label) : "transparent",
                      boxShadow: accentIndex === i ? `0 0 12px ${getPresetColor(preset.label)}40` : "none",
                    }}
                    title={preset.label}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          {/* Theme mode toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMode}
            className="glass-card rounded-full w-10 h-10 flex items-center justify-center hover:border-primary/30 transition-colors"
            title={mode === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {mode === "dark" ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
          </motion.button>

          {/* Color picker toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="glass-card rounded-full w-10 h-10 flex items-center justify-center hover:border-primary/30 transition-colors"
            title="Change accent color"
          >
            <Palette className="w-4 h-4 text-primary" />
          </motion.button>
        </div>
      </div>

      {/* Back to Top — bottom right */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 glass-card rounded-full w-10 h-10 flex items-center justify-center hover:border-primary/30 transition-colors"
          >
            <ArrowUp className="w-4 h-4 text-primary" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
