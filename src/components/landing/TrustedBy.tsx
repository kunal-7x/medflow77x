import { motion } from "framer-motion";

const logos = [
  "Mayo Clinic", "Johns Hopkins", "Cleveland Clinic", "Mass General",
  "Stanford Health", "Mount Sinai", "NYU Langone", "Cedars-Sinai",
];

export const TrustedBy = () => (
  <section className="py-16 border-y border-border/30 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
        Trusted by leading healthcare institutions
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex gap-12 animate-[marquee_30s_linear_infinite]">
          {[...logos, ...logos].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-sm font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-default whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);
