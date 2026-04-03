import { useMemo } from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { detectAnomalies, type Anomaly } from "@/lib/analytics";

interface AnomalyCardsProps {
  transactions: Transaction[];
}

const severityConfig = {
  high: { icon: AlertTriangle, bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive", label: "High" },
  medium: { icon: AlertCircle, bg: "bg-warning/10", border: "border-warning/20", text: "text-warning", label: "Medium" },
  low: { icon: Info, bg: "bg-primary/10", border: "border-primary/20", text: "text-primary", label: "Low" },
};

const AnomalyCards = ({ transactions }: AnomalyCardsProps) => {
  const anomalies = useMemo(() => detectAnomalies(transactions), [transactions]);

  if (anomalies.length === 0) {
    return (
      <div className="rounded-xl border border-positive/20 bg-positive/5 p-5">
        <p className="text-sm text-positive font-medium">✓ No anomalies detected</p>
        <p className="text-xs text-muted-foreground mt-1">Your spending patterns look normal this period.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm">Anomalies</h3>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
          {anomalies.length} flagged
        </span>
      </div>
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
        {anomalies.map((a) => {
          const config = severityConfig[a.severity];
          const Icon = config.icon;
          return (
            <div
              key={a.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${config.border} ${config.bg}`}
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${config.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${config.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium truncate">{a.title}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bg} ${config.text} shrink-0`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnomalyCards;
