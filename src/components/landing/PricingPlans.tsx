import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingPlansProps {
  onGetStarted: () => void;
}

const plans = [
  {
    name: "Starter",
    price: "Free",
    sub: "Up to 50 beds",
    features: ["Core modules", "5 staff accounts", "Email support", "Community access", "Basic analytics"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$299",
    sub: "/month per facility",
    features: ["All modules", "Unlimited staff", "SMS reminders", "Priority support", "Advanced analytics", "API access", "Custom branding"],
    cta: "Start Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "Unlimited scale",
    features: ["Everything in Pro", "Multi-facility", "Dedicated CSM", "SLA guarantee", "On-premise option", "Custom integrations", "Training & onboarding"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export const PricingPlans = ({ onGetStarted }: PricingPlansProps) => (
  <section id="pricing" className="py-24">
    <div className="max-w-5xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Pricing</p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Plans That <span className="text-gradient-gold">Scale With You</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start free. Upgrade when you're ready. No hidden fees.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{
              y: -6,
              transition: { duration: 0.2 },
            }}
            className={`group glass-card rounded-2xl p-6 relative overflow-hidden transition-shadow duration-500 ${
              plan.highlight
                ? "border-primary/30 ring-1 ring-primary/10 hover:shadow-[0_0_50px_hsl(45_93%_58%/0.12)]"
                : "hover:shadow-[0_0_30px_hsl(45_93%_58%/0.06)]"
            }`}
            style={plan.highlight ? { boxShadow: "0 0 40px hsl(45 93% 58% / 0.08)" } : undefined}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 overflow-hidden">
                {/* Shimmer on badge */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer-sweep_3s_infinite]"
                  style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.3), transparent)" }}
                />
                <Sparkles className="w-3 h-3 relative z-10" /> <span className="relative z-10">Most Popular</span>
              </div>
            )}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.sub}</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.highlight ? "default" : "outline"}
              className="w-full"
              onClick={onGetStarted}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
