import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Transaction } from "@/lib/types";

interface CategoryDonutProps {
  transactions: Transaction[];
}

const CHART_COLORS = [
  "hsl(168, 100%, 45%)",  // primary teal
  "hsl(190, 100%, 50%)",  // cyan
  "hsl(16, 78%, 53%)",    // orange
  "hsl(152, 100%, 39%)",  // green
  "hsl(260, 70%, 55%)",   // purple
  "hsl(40, 90%, 55%)",    // yellow
  "hsl(340, 75%, 55%)",   // pink
  "hsl(200, 80%, 50%)",   // blue
  "hsl(80, 60%, 45%)",    // olive
  "hsl(300, 50%, 50%)",   // magenta
];

const CategoryDonut = ({ transactions }: CategoryDonutProps) => {
  const data = useMemo(() => {
    const debits = transactions.filter((t) => t.type === "debit");
    const categoryMap = new Map<string, number>();
    debits.forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-medium">{d.name}</p>
        <p className="text-sm font-mono font-semibold text-primary">
          ₹{d.value.toLocaleString("en-IN")}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {((d.value / total) * 100).toFixed(1)}%
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <h3 className="font-display font-semibold text-sm mb-4">Spend by Category</h3>
      <div className="flex items-center gap-4">
        <div className="w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5 overflow-hidden">
          {data.slice(0, 5).map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-[11px] text-muted-foreground truncate flex-1">{d.name}</span>
              <span className="text-[11px] font-mono text-foreground shrink-0">
                ₹{d.value.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryDonut;
