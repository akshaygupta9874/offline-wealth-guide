import { ArrowLeft, Shield } from "lucide-react";
import type { Transaction } from "@/lib/types";
import SummaryCards from "./SummaryCards";
import CategoryDonut from "./CategoryDonut";
import DailySpendChart from "./DailySpendChart";
import BalanceChart from "./BalanceChart";
import TransactionTable from "./TransactionTable";
import HealthScoreCard from "./HealthScoreCard";
import AnomalyCards from "./AnomalyCards";
import RoastMode from "./RoastMode";
import SubscriptionTracker from "./SubscriptionTracker";
import CalendarHeatmap from "./CalendarHeatmap";
import SpendingWrapped from "./SpendingWrapped";

interface DashboardProps {
  transactions: Transaction[];
  bankName: string;
  period: { from: string; to: string };
  onBack: () => void;
}

const Dashboard = ({ transactions, bankName, period, onBack }: DashboardProps) => {
  const formatPeriod = (from: string, to: string) => {
    const f = new Date(from).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const t = new Date(to).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return `${f} – ${t}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-card transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-display font-bold text-sm">
                Fin<span className="text-primary">Sight</span>
              </h1>
              <p className="text-[11px] text-muted-foreground">
                {bankName} · {formatPeriod(period.from, period.to)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-positive/10 text-positive text-[11px] font-medium">
            <Shield className="w-3 h-3" />
            Local only
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <SummaryCards transactions={transactions} />

        <SpendingWrapped transactions={transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryDonut transactions={transactions} />
          <DailySpendChart transactions={transactions} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HealthScoreCard transactions={transactions} />
          <AnomalyCards transactions={transactions} />
        </div>

        <CalendarHeatmap transactions={transactions} />

        <SubscriptionTracker transactions={transactions} />

        <BalanceChart transactions={transactions} />

        <RoastMode transactions={transactions} />

        <div>
          <h2 className="font-display font-semibold text-sm mb-3">Transactions</h2>
          <TransactionTable transactions={transactions} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
