import type { Transaction } from "./types";

/* ─── Anomaly Detection ─── */

export interface Anomaly {
  id: string;
  transactionId: string;
  type: "unusual_amount" | "new_merchant" | "duplicate" | "rapid_successive" | "impulse";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
}

const ESSENTIAL_CATEGORIES = ["Rent", "Utilities", "Medical", "Education", "Transport"];
const DISCRETIONARY_CATEGORIES = ["Food & Groceries", "Entertainment", "Shopping", "Subscription"];

export function detectAnomalies(transactions: Transaction[]): Anomaly[] {
  const debits = transactions.filter((t) => t.type === "debit");
  const anomalies: Anomaly[] = [];

  // 1. Unusual amounts per category (>2x category average)
  const catAmounts = new Map<string, number[]>();
  debits.forEach((t) => {
    const arr = catAmounts.get(t.category) || [];
    arr.push(t.amount);
    catAmounts.set(t.category, arr);
  });
  debits.forEach((t) => {
    const arr = catAmounts.get(t.category) || [];
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    if (t.amount > avg * 2 && arr.length > 1) {
      anomalies.push({
        id: `unusual-${t.id}`,
        transactionId: t.id,
        type: "unusual_amount",
        severity: t.amount > avg * 3 ? "high" : "medium",
        title: `Unusual ${t.category} spend`,
        description: `₹${t.amount.toLocaleString("en-IN")} is ${(t.amount / avg).toFixed(1)}x your average ${t.category} transaction of ₹${Math.round(avg).toLocaleString("en-IN")}.`,
      });
    }
  });

  // 2. New merchants (appear only once)
  const merchantCounts = new Map<string, number>();
  debits.forEach((t) => merchantCounts.set(t.merchant, (merchantCounts.get(t.merchant) || 0) + 1));
  debits.forEach((t) => {
    if (merchantCounts.get(t.merchant) === 1 && t.amount > 500) {
      anomalies.push({
        id: `new-${t.id}`,
        transactionId: t.id,
        type: "new_merchant",
        severity: "low",
        title: `New merchant: ${t.merchant}`,
        description: `First time transacting with ${t.merchant} for ₹${t.amount.toLocaleString("en-IN")}.`,
      });
    }
  });

  // 3. Rapid successive (same merchant, same day)
  const byDayMerchant = new Map<string, Transaction[]>();
  debits.forEach((t) => {
    const key = `${t.date}-${t.merchant}`;
    const arr = byDayMerchant.get(key) || [];
    arr.push(t);
    byDayMerchant.set(key, arr);
  });
  byDayMerchant.forEach((txns) => {
    if (txns.length > 1) {
      anomalies.push({
        id: `rapid-${txns[0].id}`,
        transactionId: txns[0].id,
        type: "rapid_successive",
        severity: "medium",
        title: `Multiple ${txns[0].merchant} charges`,
        description: `${txns.length} transactions to ${txns[0].merchant} on the same day totaling ₹${txns.reduce((s, t) => s + t.amount, 0).toLocaleString("en-IN")}.`,
      });
    }
  });

  return anomalies;
}

/* ─── Financial Health Score ─── */

export interface HealthScore {
  total: number;
  factors: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
    tip: string;
  }[];
}

export function calculateHealthScore(transactions: Transaction[]): HealthScore {
  const totalCredit = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit = transactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const debits = transactions.filter((t) => t.type === "debit");

  // 1. Savings rate (30%)
  const savingsRate = totalCredit > 0 ? (totalCredit - totalDebit) / totalCredit : 0;
  const savingsScore = Math.min(savingsRate / 0.3, 1); // 30%+ savings = perfect

  // 2. Spending stability (25%) — low variance in daily spend
  const dailySpend = new Map<string, number>();
  debits.forEach((t) => dailySpend.set(t.date, (dailySpend.get(t.date) || 0) + t.amount));
  const dailyAmounts = Array.from(dailySpend.values());
  const avgDaily = dailyAmounts.reduce((s, v) => s + v, 0) / (dailyAmounts.length || 1);
  const variance = dailyAmounts.reduce((s, v) => s + Math.pow(v - avgDaily, 2), 0) / (dailyAmounts.length || 1);
  const cv = avgDaily > 0 ? Math.sqrt(variance) / avgDaily : 0;
  const stabilityScore = Math.max(0, 1 - cv / 2); // Lower CV = more stable

  // 3. Essential vs discretionary (20%)
  const essentialSpend = debits.filter((t) => ESSENTIAL_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const discretionarySpend = debits.filter((t) => DISCRETIONARY_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const essentialRatio = totalDebit > 0 ? essentialSpend / totalDebit : 0;
  const essentialScore = Math.min(essentialRatio / 0.5, 1); // 50%+ essential = good

  // 4. Subscription load (15%)
  const subSpend = debits.filter((t) => t.category === "Subscription").reduce((s, t) => s + t.amount, 0);
  const subRatio = totalDebit > 0 ? subSpend / totalDebit : 0;
  const subScore = Math.max(0, 1 - subRatio / 0.15); // <15% of spend in subs = good

  // 5. Anomaly frequency (10%)
  const anomalyCount = detectAnomalies(transactions).length;
  const anomalyScore = Math.max(0, 1 - anomalyCount / 10);

  const factors = [
    { name: "Savings Rate", score: savingsScore, maxScore: 1, weight: 30, tip: savingsScore < 0.5 ? "Try to save at least 20% of your income" : "Great savings discipline!" },
    { name: "Spending Stability", score: stabilityScore, maxScore: 1, weight: 25, tip: stabilityScore < 0.5 ? "Your spending is erratic — try budgeting daily limits" : "Consistent spending patterns" },
    { name: "Essential Ratio", score: essentialScore, maxScore: 1, weight: 20, tip: essentialScore < 0.5 ? "Too much discretionary spend — cut food delivery & shopping" : "Good balance of needs vs wants" },
    { name: "Subscription Load", score: subScore, maxScore: 1, weight: 15, tip: subScore < 0.5 ? "Subscriptions eating too much — audit and cancel unused ones" : "Subscriptions under control" },
    { name: "Anomaly Score", score: anomalyScore, maxScore: 1, weight: 10, tip: anomalyScore < 0.5 ? "Too many unusual transactions — review flagged items" : "No concerning patterns" },
  ];

  const total = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));

  return { total, factors };
}

/* ─── Roast Mode ─── */

export function generateRoasts(transactions: Transaction[]): string[] {
  const debits = transactions.filter((t) => t.type === "debit");
  const totalCredit = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit = debits.reduce((s, t) => s + t.amount, 0);
  const roasts: string[] = [];

  // Food delivery count
  const foodCount = debits.filter((t) =>
    ["Swiggy", "Zomato", "Zepto", "Blinkit"].includes(t.merchant)
  ).length;
  if (foodCount > 5) {
    roasts.push(`You ordered food ${foodCount} times this month. Your kitchen filed a missing person report. 🍕`);
  }

  // Savings rate
  const savingsRate = totalCredit > 0 ? ((totalCredit - totalDebit) / totalCredit) * 100 : 0;
  if (savingsRate < 10) {
    roasts.push(`Your savings rate is ${savingsRate.toFixed(1)}%. A piggy bank earns more respect than that. 🐷`);
  }

  // ATM fees
  const atmCount = debits.filter((t) => t.category === "ATM Withdrawal").length;
  if (atmCount > 0) {
    roasts.push(`You went to the ATM ${atmCount} time${atmCount > 1 ? "s" : ""}. You literally paid the bank to give you your own money. 🏧`);
  }

  // Subscription stack
  const subs = debits.filter((t) => t.category === "Subscription");
  if (subs.length >= 3) {
    const subTotal = subs.reduce((s, t) => s + t.amount, 0);
    roasts.push(`${subs.length} subscriptions costing ₹${subTotal.toLocaleString("en-IN")}/month. You're basically paying rent to the internet. 📺`);
  }

  // Late night spending (Zepto at night in description)
  const zepto = debits.filter((t) => t.merchant === "Zepto");
  if (zepto.length >= 2) {
    roasts.push(`Zepto ${zepto.length} times? At this point, just move into a grocery store. 🛒`);
  }

  // Shopping
  const shopping = debits.filter((t) => t.category === "Shopping");
  if (shopping.length >= 2) {
    const shopTotal = shopping.reduce((s, t) => s + t.amount, 0);
    roasts.push(`₹${shopTotal.toLocaleString("en-IN")} on shopping. Your cart has more commitment issues than you do. 🛍️`);
  }

  // Transport
  const transport = debits.filter((t) => ["Uber", "Rapido", "Ola"].includes(t.merchant));
  if (transport.length >= 2) {
    roasts.push(`${transport.length} cab rides. Your legs are filing for unemployment. 🚕`);
  }

  // Investment roast (positive)
  const investments = debits.filter((t) => t.category === "Investment");
  if (investments.length === 0) {
    roasts.push(`Zero investments this month. Your future self just unfollowed you. 📉`);
  }

  // Generic closer
  if (roasts.length < 3) {
    roasts.push(`You spent ₹${totalDebit.toLocaleString("en-IN")} this month. That's not a budget, that's a confession. 💸`);
  }

  return roasts;
}

/* ─── Subscription Detection ─── */

export interface Subscription {
  merchant: string;
  category: string;
  amount: number;
  occurrences: number;
  lastCharged: string;
  annualCost: number;
  status: "active" | "irregular" | "forgotten";
  confidence: number;
}

export function detectSubscriptions(transactions: Transaction[]): Subscription[] {
  const debits = transactions.filter((t) => t.type === "debit");
  if (debits.length === 0) return [];

  const byMerchant = new Map<string, Transaction[]>();
  debits.forEach((t) => {
    const arr = byMerchant.get(t.merchant) || [];
    arr.push(t);
    byMerchant.set(t.merchant, arr);
  });

  const today = new Date(Math.max(...debits.map((t) => new Date(t.date).getTime())));
  const subs: Subscription[] = [];

  byMerchant.forEach((txns, merchant) => {
    const isSubCategory = txns[0].category === "Subscription";
    const occurrences = txns.length;
    const amounts = txns.map((t) => t.amount);
    const avg = amounts.reduce((s, v) => s + v, 0) / amounts.length;
    const variance = amounts.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / amounts.length;
    const cv = avg > 0 ? Math.sqrt(variance) / avg : 1;

    const qualifies = isSubCategory || (occurrences >= 2 && cv < 0.15);
    if (!qualifies) return;

    const lastCharged = txns.map((t) => t.date).sort().slice(-1)[0];
    const daysSince = Math.floor((today.getTime() - new Date(lastCharged).getTime()) / 86400000);

    let status: Subscription["status"] = "active";
    if (daysSince > 45) status = "forgotten";
    else if (cv > 0.25) status = "irregular";

    const confidence = Math.min(
      1,
      (isSubCategory ? 0.6 : 0.3) + Math.max(0, 1 - cv) * 0.3 + Math.min(occurrences / 3, 1) * 0.1
    );

    subs.push({
      merchant,
      category: txns[0].category,
      amount: Math.round(avg),
      occurrences,
      lastCharged,
      annualCost: Math.round(avg * 12),
      status,
      confidence,
    });
  });

  return subs.sort((a, b) => b.annualCost - a.annualCost);
}

/* ─── Calendar Heatmap ─── */

export interface DailyCell {
  date: string;
  amount: number;
  txnCount: number;
  intensity: number; // 0-4
}

export function buildCalendarData(transactions: Transaction[]): {
  weeks: DailyCell[][];
  maxAmount: number;
  monthLabels: { weekIndex: number; label: string }[];
} {
  const debits = transactions.filter((t) => t.type === "debit");
  if (debits.length === 0) return { weeks: [], maxAmount: 0, monthLabels: [] };

  const byDate = new Map<string, { amount: number; count: number }>();
  debits.forEach((t) => {
    const cur = byDate.get(t.date) || { amount: 0, count: 0 };
    cur.amount += t.amount;
    cur.count += 1;
    byDate.set(t.date, cur);
  });

  const times = debits.map((t) => new Date(t.date).getTime());
  const start = new Date(Math.min(...times));
  const end = new Date(Math.max(...times));
  const sDay = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - sDay);
  const eDay = (end.getDay() + 6) % 7;
  end.setDate(end.getDate() + (6 - eDay));

  const maxAmount = Math.max(...Array.from(byDate.values()).map((v) => v.amount));
  const cells: DailyCell[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    const data = byDate.get(iso);
    const amount = data?.amount || 0;
    const intensity =
      amount === 0 ? 0 :
      amount < maxAmount * 0.25 ? 1 :
      amount < maxAmount * 0.5  ? 2 :
      amount < maxAmount * 0.75 ? 3 : 4;
    cells.push({ date: iso, amount, txnCount: data?.count || 0, intensity });
    cur.setDate(cur.getDate() + 1);
  }

  const weeks: DailyCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, idx) => {
    const first = new Date(w[0].date);
    if (first.getMonth() !== lastMonth) {
      monthLabels.push({ weekIndex: idx, label: first.toLocaleDateString("en-IN", { month: "short" }) });
      lastMonth = first.getMonth();
    }
  });

  return { weeks, maxAmount, monthLabels };
}

/* ─── Spending Wrapped ─── */

export interface WrappedStats {
  totalSpent: number;
  totalIncome: number;
  txnCount: number;
  uniqueMerchants: number;
  topMerchant: { name: string; amount: number; count: number };
  topCategory: { name: string; amount: number; pct: number };
  biggestTxn: Transaction | null;
  busiestDay: { date: string; amount: number };
  personality: { title: string; description: string; emoji: string };
}

export function generateWrapped(transactions: Transaction[]): WrappedStats {
  const debits = transactions.filter((t) => t.type === "debit");
  const totalSpent = debits.reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);

  const merchantMap = new Map<string, { amount: number; count: number }>();
  debits.forEach((t) => {
    const cur = merchantMap.get(t.merchant) || { amount: 0, count: 0 };
    cur.amount += t.amount;
    cur.count += 1;
    merchantMap.set(t.merchant, cur);
  });
  const tm = [...merchantMap.entries()].sort((a, b) => b[1].amount - a[1].amount)[0];
  const topMerchant = tm
    ? { name: tm[0], amount: tm[1].amount, count: tm[1].count }
    : { name: "—", amount: 0, count: 0 };

  const catMap = new Map<string, number>();
  debits.forEach((t) => catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount));
  const tc = [...catMap.entries()].sort((a, b) => b[1] - a[1])[0];
  const topCategory = tc
    ? { name: tc[0], amount: tc[1], pct: totalSpent > 0 ? (tc[1] / totalSpent) * 100 : 0 }
    : { name: "—", amount: 0, pct: 0 };

  const biggestTxn = debits.length > 0 ? [...debits].sort((a, b) => b.amount - a.amount)[0] : null;

  const dayMap = new Map<string, number>();
  debits.forEach((t) => dayMap.set(t.date, (dayMap.get(t.date) || 0) + t.amount));
  const bd = [...dayMap.entries()].sort((a, b) => b[1] - a[1])[0];
  const busiestDay = bd ? { date: bd[0], amount: bd[1] } : { date: "", amount: 0 };

  const foodPct = (catMap.get("Food & Groceries") || 0) / (totalSpent || 1);
  const shopPct = (catMap.get("Shopping") || 0) / (totalSpent || 1);
  const investPct = (catMap.get("Investment") || 0) / (totalSpent || 1);
  const subPct = (catMap.get("Subscription") || 0) / (totalSpent || 1);
  const savingsRate = totalIncome > 0 ? (totalIncome - totalSpent) / totalIncome : 0;

  let personality = { title: "The Balanced Spender", description: "You keep things in check across categories.", emoji: "⚖️" };
  if (savingsRate > 0.3) personality = { title: "The Disciplined Saver", description: "You stash more than you splash. Future-you says thanks.", emoji: "🏦" };
  else if (foodPct > 0.3) personality = { title: "The Food Connoisseur", description: "Your wallet has a permanent reservation at Swiggy.", emoji: "🍱" };
  else if (shopPct > 0.25) personality = { title: "The Retail Therapist", description: "Add to cart is your love language.", emoji: "🛍️" };
  else if (subPct > 0.1) personality = { title: "The Subscription Stacker", description: "You collect monthly charges like Pokémon cards.", emoji: "📺" };
  else if (investPct > 0.15) personality = { title: "The Compounding Mind", description: "You see ₹100 today as ₹1000 tomorrow.", emoji: "📈" };

  return {
    totalSpent,
    totalIncome,
    txnCount: debits.length,
    uniqueMerchants: merchantMap.size,
    topMerchant,
    topCategory,
    biggestTxn,
    busiestDay,
    personality,
  };
}
