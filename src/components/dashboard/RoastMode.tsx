import { useMemo, useState } from "react";
import { Flame, X } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { generateRoasts } from "@/lib/analytics";

interface RoastModeProps {
  transactions: Transaction[];
}

const RoastMode = ({ transactions }: RoastModeProps) => {
  const [enabled, setEnabled] = useState(false);
  const roasts = useMemo(() => generateRoasts(transactions), [transactions]);

  if (!enabled) {
    return (
      <button
        onClick={() => setEnabled(true)}
        className="w-full rounded-xl border border-border/50 bg-card/50 p-4 flex items-center justify-between hover:border-destructive/30 hover:bg-destructive/5 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:animate-pulse-glow">
            <Flame className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-left">
            <p className="text-sm font-display font-semibold">Roast Mode</p>
            <p className="text-[11px] text-muted-foreground">Brutally honest spending analysis</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-destructive transition-colors">
          Enable 🔥
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 relative">
      <button
        onClick={() => setEnabled(false)}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-destructive/10 transition-colors"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-destructive" />
        <h3 className="font-display font-semibold text-sm">Roast Mode 🔥</h3>
      </div>

      <div className="space-y-3">
        {roasts.map((roast, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-card/50 border border-border/30"
          >
            <p className="text-sm leading-relaxed">{roast}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoastMode;
