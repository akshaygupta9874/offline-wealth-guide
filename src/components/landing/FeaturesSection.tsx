import {
  PieChart,
  TrendingUp,
  AlertTriangle,
  Repeat,
  Brain,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: PieChart,
    title: "Smart Categorization",
    description: "AI-powered transaction labeling. UPI strings become human-readable categories instantly.",
  },
  {
    icon: TrendingUp,
    title: "Spending Forecast",
    description: "Predict your end-of-month balance. Know if you'll make it to salary day.",
  },
  {
    icon: AlertTriangle,
    title: "Anomaly Detection",
    description: "Spot unusual transactions, duplicate charges, and spending spikes automatically.",
  },
  {
    icon: Repeat,
    title: "Subscription Tracker",
    description: "Find recurring charges and forgotten subscriptions draining your account.",
  },
  {
    icon: Brain,
    title: "Financial Health Score",
    description: "A 0–100 score with actionable tips to improve your financial habits.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Knowledge",
    description: "Everything runs in your browser. No server, no database, no data collection. Ever.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Intelligence without
            <span className="text-gradient"> surveillance</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every feature that CRED and MoneyView offer — without ever seeing your data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group relative p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 transition-all duration-300 animate-fade-in-up animation-delay-${(i + 1) * 100}`}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
