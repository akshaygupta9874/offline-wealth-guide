import { useMemo, useState } from "react";
import type { Transaction } from "@/lib/types";
import { Search, Filter, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable = ({ transactions }: TransactionTableProps) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.merchant.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, filterType]);

  const formatAmount = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-background/50 border-border/30 text-sm"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-background/50 border border-border/30">
            {(["all", "credit", "debit"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterType === type
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type === "all" ? "All" : type === "credit" ? "In" : "Out"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="max-h-[400px] overflow-y-auto">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 hover:bg-card/80 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                t.type === "credit" ? "bg-positive/10" : "bg-destructive/10"
              }`}
            >
              {t.type === "credit" ? (
                <ArrowDownLeft className="w-3.5 h-3.5 text-positive" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.description}</p>
              <p className="text-[11px] text-muted-foreground">
                {t.category} · {t.method}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-sm font-mono font-semibold ${
                  t.type === "credit" ? "text-positive" : "text-foreground"
                }`}
              >
                {t.type === "credit" ? "+" : "-"}{formatAmount(t.amount)}
              </p>
              <p className="text-[11px] text-muted-foreground">{formatDate(t.date)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-border/30 text-[11px] text-muted-foreground">
        {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default TransactionTable;
