import { useMemo } from "react";
import type { Transaction } from "@/lib/types";
import { calculateHealthScore } from "@/lib/analytics";

interface HealthScoreCardProps {
  transactions: Transaction[];
}

const HealthScoreCard = ({ transactions }: HealthScoreCardProps) => {
  const health = useMemo(() => calculateHealthScore(transactions), [transactions]);

  const getColor = (score: number) => {
    if (score >= 70) return "text-positive";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  // SVG gauge
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (health.total / 100) * circumference;

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <h3 className="font-display font-semibold text-sm mb-4">Financial Health</h3>

      <div className="flex items-center gap-6">
        {/* Gauge */}
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(240, 10%, 16%)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke={health.total >= 70 ? "hsl(152, 100%, 39%)" : health.total >= 40 ? "hsl(16, 78%, 53%)" : "hsl(0, 84%, 60%)"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-mono font-bold ${getColor(health.total)}`}>
              {health.total}
            </span>
            <span className="text-[10px] text-muted-foreground">{getLabel(health.total)}</span>
          </div>
        </div>

        {/* Factors */}
        <div className="flex-1 space-y-2.5">
          {health.factors.map((f) => (
            <div key={f.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">{f.name}</span>
                <span className="text-[11px] font-mono">{Math.round(f.score * f.weight)}/{f.weight}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${f.score * 100}%`,
                    backgroundColor: f.score >= 0.6 ? "hsl(152, 100%, 39%)" : f.score >= 0.3 ? "hsl(16, 78%, 53%)" : "hsl(0, 84%, 60%)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top tip */}
      {health.factors.length > 0 && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground">
            💡 {health.factors.sort((a, b) => a.score - b.score)[0].tip}
          </p>
        </div>
      )}
    </div>
  );
};

export default HealthScoreCard;
