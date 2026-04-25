import { useMemo } from "react";
import { Repeat, AlertCircle, Calendar } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { detectSubscriptions } from "@/lib/analytics";

interface Props {
  transactions: Transaction[];
}

const SubscriptionTracker = ({ transactions }: Props) => {
  const subs = useMemo(() => detectSubscriptions(transactions), [transactions]);

  const monthlyTotal = subs.reduce((s, x) => s + x.amount, 0);
  const annualTotal = subs.reduce((s, x) => s + x.annualCost, 0);
  const forgottenCount = subs.filter((s) => s.status === "forgotten").length;

  const statusStyles: Record<string, string> = {
    active: "bg-positive/10 text-positive border-positive/20",
    irregular: "bg-warning/10 text-warning border-warning/20",
    forgotten: "bg-destructive/10 text-destructive border-destructive/20",
  };

  if (subs.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Repeat className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">Subscriptions</h3>
        </div>
        <p className="text-xs text-muted-foreground">No recurring charges detected.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Subscriptions & Recurring</h3>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {subs.length} found
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Monthly</div>
            <div className="font-display font-bold text-sm">₹{monthlyTotal.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Yearly</div>
            <div className="font-display font-bold text-sm text-primary">₹{annualTotal.toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Forgotten</div>
            <div className="font-display font-bold text-sm text-destructive">{forgottenCount}</div>
          </div>
        </div>
        {forgottenCount > 0 && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
            <p className="text-[11px] text-foreground/80">
              {forgottenCount} subscription{forgottenCount > 1 ? "s" : ""} haven't charged in 45+ days. Worth checking if they're still needed.
            </p>
          </div>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-border/40">
        {subs.map((sub) => (
          <div key={sub.merchant} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm truncate">{sub.merchant}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusStyles[sub.status]}`}>
                  {sub.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{sub.category}</span>
                <span>·</span>
                <Calendar className="w-3 h-3" />
                <span>last {new Date(sub.lastCharged).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display font-semibold text-sm">₹{sub.amount.toLocaleString("en-IN")}</div>
              <div className="text-[10px] text-muted-foreground">₹{sub.annualCost.toLocaleString("en-IN")}/yr</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionTracker;
