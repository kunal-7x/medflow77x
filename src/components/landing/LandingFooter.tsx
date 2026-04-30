import { Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface LandingFooterProps {
  onRequestDemo: () => void;
}

export const LandingFooter = ({ onRequestDemo }: LandingFooterProps) => (
  <footer className="border-t border-border/30">
    {/* Final CTA with gradient background */}
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse 60% 50% at 50% 50%, hsl(45 93% 58% / 0.06), transparent),
            radial-gradient(ellipse 40% 30% at 30% 70%, hsl(200 60% 55% / 0.04), transparent)`
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto px-6 text-center relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Ready to Transform<br />
          <span className="text-gradient-gold">Your Hospital?</span>
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Join 2,400+ hospitals already using MedFlow to deliver better care, faster.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="xl" onClick={onRequestDemo} className="group">
            Request Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl" onClick={() => window.location.href = '/login'}>
            Start Free Trial
          </Button>
        </div>
      </motion.div>
    </section>

    {/* Links */}
    <div className="max-w-7xl mx-auto px-6 py-12 border-t border-border/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {[
          { title: "Product", links: ["Features", "Pricing", "Security", "Integrations", "API Docs"] },
          { title: "Company", links: ["About", "Careers", "Blog", "Press", "Contact"] },
          { title: "Resources", links: ["Documentation", "Whitepapers", "Case Studies", "Webinars", "Support"] },
          { title: "Legal", links: ["Privacy Policy", "Terms of Service", "BAA", "Cookie Policy", "Accessibility"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs uppercase tracking-[0.15em] text-muted-foreground/70 mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">MedFlow</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} MedFlow Health Technologies, Inc. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);
