import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { buildCalendarData, type DailyCell } from "@/lib/analytics";

interface Props {
  transactions: Transaction[];
}

const intensityClass = (i: number) => {
  switch (i) {
    case 0: return "bg-muted/40";
    case 1: return "bg-primary/20";
    case 2: return "bg-primary/40";
    case 3: return "bg-primary/70";
    case 4: return "bg-primary";
    default: return "bg-muted/40";
  }
};

const DAY_LABELS = ["M", "", "W", "", "F", "", ""];

const CalendarHeatmap = ({ transactions }: Props) => {
  const { weeks, monthLabels } = useMemo(() => buildCalendarData(transactions), [transactions]);
  const [hover, setHover] = useState<DailyCell | null>(null);

  if (weeks.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">Spending Calendar</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-sm ${intensityClass(i)}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-1 mb-1.5 ml-5">
            {weeks.map((_, idx) => {
              const label = monthLabels.find((m) => m.weekIndex === idx)?.label;
              return (
                <div key={idx} className="w-3 text-[10px] text-muted-foreground">
                  {label || ""}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="w-3 h-3 text-[9px] text-muted-foreground leading-3">
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((cell) => (
                  <button
                    key={cell.date}
                    type="button"
                    onMouseEnter={() => setHover(cell)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(cell)}
                    onBlur={() => setHover(null)}
                    className={`w-3 h-3 rounded-sm transition-transform hover:scale-150 hover:ring-1 hover:ring-primary/60 ${intensityClass(cell.intensity)}`}
                    aria-label={`${cell.date}: ₹${cell.amount}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover detail */}
      <div className="mt-3 h-10 flex items-center">
        {hover ? (
          <div className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/40">
            <div>
              <div className="text-[11px] text-muted-foreground">
                {new Date(hover.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div className="text-xs font-medium">
                {hover.txnCount} {hover.txnCount === 1 ? "transaction" : "transactions"}
              </div>
            </div>
            <div className="font-display font-bold text-sm">
              ₹{hover.amount.toLocaleString("en-IN")}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">Hover or tap a day to see spend details.</p>
        )}
      </div>
    </div>
  );
};

export default CalendarHeatmap;
