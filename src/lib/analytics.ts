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
