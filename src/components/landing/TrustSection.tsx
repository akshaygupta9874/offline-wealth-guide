import { Code, Globe, Monitor, Lock } from "lucide-react";

const trustPoints = [
  {
    icon: Code,
    title: "Open Source",
    detail: "Every line of code is public. Read exactly what happens to your data.",
  },
  {
    icon: Globe,
    title: "Works Offline",
    detail: "Toggle airplane mode. The app works perfectly — proof it's local.",
  },
  {
    icon: Monitor,
    title: "Live Network Monitor",
    detail: "Watch network requests in real-time. You'll see zero during processing.",
  },
  {
    icon: Lock,
    title: "No Backend",
    detail: "Pure static site. No server-side functions, no database for your data.",
  },
];

const TrustSection = () => {
  return (
    <section className="py-24 px-4 border-t border-border/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Don't trust us.
            <span className="text-gradient"> Verify.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            We don't ask you to believe our privacy claims. We built the app
            so you can prove them yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="flex gap-4 p-5 rounded-xl border border-border/30 bg-card/30"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <point.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm mb-1">{point.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{point.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Honest disclosure */}
        <div className="rounded-xl border border-primary/10 bg-primary/5 p-6 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed italic max-w-xl mx-auto">
            "Could we technically send your data to a server? Yes.
            Here's why we don't: our code is public, there's no backend,
            and our reputation as developers depends on it."
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
