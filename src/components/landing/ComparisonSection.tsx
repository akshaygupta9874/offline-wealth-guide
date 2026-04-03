import { Check, X } from "lucide-react";

const comparisons = [
  { name: "CRED", issue: "Sees all your data", us: "Zero-knowledge analysis" },
  { name: "MoneyView", issue: "Reads your SMS", us: "No permissions needed" },
  { name: "Fi / Jupiter", issue: "Must switch banks", us: "Works with any bank" },
  { name: "Excel", issue: "Manual, no intelligence", us: "AI-powered insights" },
];

const ComparisonSection = () => {
  return (
    <section className="py-24 px-4 border-t border-border/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">
          Why <span className="text-gradient">FinSight</span>?
        </h2>

        <div className="space-y-3">
          {comparisons.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/30"
            >
              <span className="text-sm font-display font-semibold w-24 shrink-0">{c.name}</span>
              <div className="flex items-center gap-2 text-xs text-destructive/80 flex-1 min-w-0">
                <X className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{c.issue}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-positive flex-1 min-w-0">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{c.us}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
