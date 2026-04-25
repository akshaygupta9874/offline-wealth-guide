import { useMemo, useState } from "react";
import { Sparkles, Trophy, Flame, Calendar, Store, ChevronRight, X } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { generateWrapped } from "@/lib/analytics";

interface Props {
  transactions: Transaction[];
}

const SpendingWrapped = ({ transactions }: Props) => {
  const stats = useMemo(() => generateWrapped(transactions), [transactions]);
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      bg: "from-primary/30 via-primary/10 to-background",
      icon: <Sparkles className="w-5 h-5" />,
      label: "Your Story",
      title: `${stats.txnCount} transactions`,
      subtitle: `across ${stats.uniqueMerchants} merchants`,
      footer: `You moved ₹${stats.totalSpent.toLocaleString("en-IN")} this period.`,
    },
    {
      bg: "from-warning/30 via-warning/10 to-background",
      icon: <Store className="w-5 h-5" />,
      label: "Top Merchant",
      title: stats.topMerchant.name,
      subtitle: `${stats.topMerchant.count} visits`,
      footer: `₹${stats.topMerchant.amount.toLocaleString("en-IN")} — basically your second home.`,
    },
    {
      bg: "from-destructive/30 via-destructive/10 to-background",
      icon: <Flame className="w-5 h-5" />,
      label: "Biggest Splurge",
      title: stats.biggestTxn ? `₹${stats.biggestTxn.amount.toLocaleString("en-IN")}` : "—",
      subtitle: stats.biggestTxn?.merchant || "",
      footer: stats.biggestTxn
        ? `On ${new Date(stats.biggestTxn.date).toLocaleDateString("en-IN", { day: "numeric", month: "long" })} — was it worth it?`
        : "",
    },
    {
      bg: "from-positive/30 via-positive/10 to-background",
      icon: <Trophy className="w-5 h-5" />,
      label: "Top Category",
      title: stats.topCategory.name,
      subtitle: `${stats.topCategory.pct.toFixed(0)}% of all spend`,
      footer: `₹${stats.topCategory.amount.toLocaleString("en-IN")} went here.`,
    },
    {
      bg: "from-primary/40 via-primary/15 to-background",
      icon: <Calendar className="w-5 h-5" />,
      label: "Busiest Day",
      title: stats.busiestDay.date
        ? new Date(stats.busiestDay.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
        : "—",
      subtitle: `₹${stats.busiestDay.amount.toLocaleString("en-IN")} in one day`,
      footer: "That was the day your wallet really worked overtime.",
    },
    {
      bg: "from-primary/50 via-accent/20 to-background",
      icon: <span className="text-xl leading-none">{stats.personality.emoji}</span>,
      label: "Your Money Personality",
      title: stats.personality.title,
      subtitle: "",
      footer: stats.personality.description,
    },
  ];

  const next = () => setSlide((s) => (s + 1) % slides.length);
  const prev = () => setSlide((s) => (s - 1 + slides.length) % slides.length);
  const close = () => { setOpen(false); setSlide(0); };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)] group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">New</span>
            </div>
            <h3 className="font-display font-bold text-base mb-1">Your Spending Wrapped</h3>
            <p className="text-xs text-muted-foreground">A 6-slide story of where your money went.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    );
  }

  const cur = slides[slide];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <button
        onClick={close}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-card transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-sm">
        {/* Progress bars */}
        <div className="flex gap-1 mb-4">
          {slides.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
              <div
                className={`h-full bg-primary transition-all ${i < slide ? "w-full" : i === slide ? "w-full" : "w-0"}`}
              />
            </div>
          ))}
        </div>

        {/* Slide */}
        <div
          key={slide}
          className={`relative aspect-[9/14] rounded-2xl border border-border/50 bg-gradient-to-br ${cur.bg} p-6 flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300`}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/50">
              {cur.icon}
              <span className="text-[10px] uppercase tracking-widest font-semibold">{cur.label}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-3xl leading-tight">{cur.title}</h2>
            {cur.subtitle && <p className="text-base text-foreground/70">{cur.subtitle}</p>}
          </div>

          <div>
            <p className="text-sm text-foreground/80 mb-3">{cur.footer}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="font-display font-bold">Fin<span className="text-primary">Sight</span></span>
              <span>·</span>
              <span>Slide {slide + 1} of {slides.length}</span>
            </div>
          </div>

          {/* Tap zones */}
          <button onClick={prev} className="absolute inset-y-0 left-0 w-1/3" aria-label="Previous" />
          <button onClick={next} className="absolute inset-y-0 right-0 w-2/3" aria-label="Next" />
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-3">
          Tap left/right to navigate
        </p>
      </div>
    </div>
  );
};

export default SpendingWrapped;
