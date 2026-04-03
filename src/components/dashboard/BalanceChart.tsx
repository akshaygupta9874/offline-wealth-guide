import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import type { Transaction } from "@/lib/types";

interface BalanceChartProps {
  transactions: Transaction[];
}

const BalanceChart = ({ transactions }: BalanceChartProps) => {
  const data = useMemo(() => {
    return transactions
      .sort((a, b) => a.date.localeCompare(b.date) || parseInt(a.id) - parseInt(b.id))
      .map((t) => ({
        date: t.date,
        label: new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        balance: t.balance,
      }));
  }, [transactions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground">{payload[0].payload.label}</p>
        <p className="text-sm font-mono font-semibold text-positive">
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <h3 className="font-display font-semibold text-sm mb-4">Balance Trajectory</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152, 100%, 39%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(152, 100%, 39%)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="hsl(152, 100%, 39%)"
              strokeWidth={2}
              fill="url(#balanceGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BalanceChart;
