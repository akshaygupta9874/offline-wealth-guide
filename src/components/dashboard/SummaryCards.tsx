import { useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingDown } from "lucide-react";
import type { Transaction } from "@/lib/types";

interface SummaryCardsProps {
  transactions: Transaction[];
}

const SummaryCards = ({ transactions }: SummaryCardsProps) => {
  const stats = useMemo(() => {
    const totalCredit = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = transactions[transactions.length - 1]?.balance ?? 0;
    const savingsRate = totalCredit > 0 ? ((totalCredit - totalDebit) / totalCredit) * 100 : 0;

    return { totalCredit, totalDebit, currentBalance, savingsRate };
  }, [transactions]);

  const cards = [
    {
      label: "Income",
      value: stats.totalCredit,
      icon: ArrowDownLeft,
      iconBg: "bg-positive/10",
      iconColor: "text-positive",
    },
    {
      label: "Spent",
      value: stats.totalDebit,
      icon: ArrowUpRight,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
    {
      label: "Balance",
      value: stats.currentBalance,
      icon: Wallet,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Savings Rate",
      value: stats.savingsRate,
      icon: TrendingDown,
      iconBg: stats.savingsRate > 20 ? "bg-positive/10" : "bg-warning/10",
      iconColor: stats.savingsRate > 20 ? "text-positive" : "text-warning",
      isPercent: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border/50 bg-card/50 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mb-0.5">{card.label}</p>
          <p className="text-xl font-mono font-bold">
            {card.isPercent
              ? `${card.value.toFixed(1)}%`
              : `₹${card.value.toLocaleString("en-IN")}`}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
