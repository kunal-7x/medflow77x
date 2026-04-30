import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How long does implementation take?", a: "Most hospitals are fully operational within 2–4 weeks. Our onboarding team handles data migration, staff training, and system integration with your existing infrastructure." },
  { q: "Is MedFlow HIPAA compliant?", a: "Yes. MedFlow is fully HIPAA compliant and SOC 2 Type II certified. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We undergo annual third-party security audits." },
  { q: "Can MedFlow integrate with existing systems?", a: "Absolutely. We support HL7 FHIR, DICOM, and REST APIs for integration with EHR/EMR systems, lab systems, imaging, pharmacy, and billing platforms." },
  { q: "What happens to our data if we cancel?", a: "Your data is yours. We provide full data export in standard formats within 30 days of cancellation. No lock-in, no surprises." },
  { q: "Do you offer on-premise deployment?", a: "Yes. Enterprise plan includes options for on-premise, private cloud, or hybrid deployment to meet your organization's security and compliance requirements." },
  { q: "What training and support do you provide?", a: "All plans include documentation and email support. Professional and Enterprise plans include live training sessions, a dedicated customer success manager, and 24/7 priority support." },
];

export const LandingFAQ = () => (
  <section className="py-24">
    <div className="max-w-3xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">FAQ</p>
        <h2 className="text-4xl font-extrabold tracking-tight mb-4">
          Questions & <span className="text-gradient-gold">Answers</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass-card rounded-2xl px-5 border border-border/30"
            >
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);
