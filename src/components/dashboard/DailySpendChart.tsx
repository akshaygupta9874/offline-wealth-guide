import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Transaction } from "@/lib/types";

interface DailySpendChartProps {
  transactions: Transaction[];
}

const DailySpendChart = ({ transactions }: DailySpendChartProps) => {
  const data = useMemo(() => {
    const debits = transactions.filter((t) => t.type === "debit");
    const dayMap = new Map<string, number>();
    debits.forEach((t) => {
      dayMap.set(t.date, (dayMap.get(t.date) || 0) + t.amount);
    });
    return Array.from(dayMap.entries())
      .map(([date, amount]) => ({
        date,
        label: new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground">{payload[0].payload.label}</p>
        <p className="text-sm font-mono font-semibold text-primary">
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <h3 className="font-display font-semibold text-sm mb-4">Daily Spending</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 16%)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(240, 6%, 55%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(240, 6%, 55%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(168, 100%, 45%, 0.05)" }} />
            <Bar dataKey="amount" fill="hsl(168, 100%, 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailySpendChart;
