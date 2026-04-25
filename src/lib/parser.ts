/**
 * Bank statement parser.
 *
 * Pipeline:
 *   1) PDF → text lines (preserving Y-position grouping)
 *   2) Detect bank from header text
 *   3) Run bank-specific row parser that extracts:
 *        date, description, debit, credit, balance
 *   4) Categorize merchant via heuristic keyword map
 */

import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import type { Transaction, BankId } from "./types";

/* ─── 1. Extract text lines from a PDF ─── */

/**
 * Extract text from a PDF, grouping items by their Y position so a single
 * statement row produces a single line string. Returns an array of lines
 * across all pages.
 */
export async function extractPdfLines(file: File, password?: string): Promise<string[]> {
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(buf),
    password: password ?? "",
  }).promise;

  const allLines: string[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();

    // Group items by integer Y bucket (PDF coordinates have decimals from kerning)
    const rowMap = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items as TextItem[]) {
      if (!("str" in item) || !item.str) continue;
      // transform = [a, b, c, d, e, f]; e=x, f=y
      const x = item.transform[4];
      const y = Math.round(item.transform[5]);
      const arr = rowMap.get(y) || [];
      arr.push({ x, str: item.str });
      rowMap.set(y, arr);
    }

    // Sort rows top-to-bottom (higher Y = top of page in PDF coords)
    const sortedYs = [...rowMap.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) {
      const items = rowMap.get(y)!.sort((a, b) => a.x - b.x);
      const line = items.map((i) => i.str).join(" ").replace(/\s+/g, " ").trim();
      if (line) allLines.push(line);
    }
  }

  await doc.destroy();
  return allLines;
}

/* ─── 2. Bank detection ─── */

export function detectBank(lines: string[]): BankId | null {
  const head = lines.slice(0, 30).join(" ").toUpperCase();
  if (/STATE BANK OF INDIA|\bSBI\b/.test(head)) return "sbi";
  if (/HDFC BANK/.test(head)) return "hdfc";
  if (/ICICI BANK/.test(head)) return "icici";
  if (/AXIS BANK/.test(head)) return "axis";
  if (/KOTAK MAHINDRA|KOTAK BANK/.test(head)) return "kotak";
  if (/PUNJAB NATIONAL BANK|\bPNB\b/.test(head)) return "pnb";
  return null;
}

/* ─── 3. Row parsing ─── */

// Indian date formats: DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, DD-MMM-YY
const DATE_PATTERNS = [
  /^(\d{2})[/-](\d{2})[/-](\d{2,4})/,                        // 01/03/2025 or 01-03-25
  /^(\d{2})[\s-]([A-Za-z]{3})[\s-](\d{2,4})/,                // 01-Mar-2025 or 01 Mar 25
];

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function parseDate(token: string): string | null {
  for (const pat of DATE_PATTERNS) {
    const m = token.match(pat);
    if (!m) continue;
    let dd = m[1].padStart(2, "0");
    let mm: string;
    let yyyy = m[3];

    if (isNaN(Number(m[2]))) {
      const k = m[2].toLowerCase().slice(0, 3);
      mm = MONTHS[k] ?? "";
      if (!mm) continue;
    } else {
      mm = m[2].padStart(2, "0");
    }
    if (yyyy.length === 2) yyyy = (Number(yyyy) > 50 ? "19" : "20") + yyyy;
    if (Number(dd) < 1 || Number(dd) > 31 || Number(mm) < 1 || Number(mm) > 12) continue;

    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

/**
 * Parse a number that may use Indian format: 1,23,456.78 or 12,345.67.
 * Optional trailing CR/DR markers (some banks).
 */
function parseAmount(s: string): number | null {
  const cleaned = s.replace(/[,\s]/g, "").replace(/(CR|DR)$/i, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * Generic Indian-bank row parser.
 *
 * Strategy: walk lines, find ones starting with a date. Extract trailing
 * numeric tokens — last one is balance, the one before is the txn amount.
 * Determine debit vs credit from explicit CR/DR markers, position columns,
 * or balance delta.
 */
function parseRows(lines: string[]): Transaction[] {
  const txns: Transaction[] = [];
  let prevBalance: number | null = null;
  let id = 1;

  for (const line of lines) {
    // Quick reject: must start with a date-ish token
    const dateToken = line.split(/\s+/)[0];
    const date = parseDate(dateToken);
    if (!date) continue;

    // Collect all numeric-looking tokens from the line
    // (with optional Indian commas, decimals, CR/DR suffix)
    const numRegex = /(-?\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?(?:\s?(?:CR|DR|Cr|Dr))?)/g;
    const matches = [...line.matchAll(numRegex)].map((m) => m[1]);

    // Need at least 2 numbers (amount + balance)
    if (matches.length < 2) continue;

    const numericValues = matches.map((m) => ({ raw: m, val: parseAmount(m) })).filter((x) => x.val !== null) as { raw: string; val: number }[];
    if (numericValues.length < 2) continue;

    const balanceTok = numericValues[numericValues.length - 1];
    const amountTok = numericValues[numericValues.length - 2];

    // Determine credit vs debit
    let type: "credit" | "debit" = "debit";
    if (/CR$/i.test(amountTok.raw)) type = "credit";
    else if (/DR$/i.test(amountTok.raw)) type = "debit";
    else if (prevBalance !== null) {
      // Use balance delta as fallback
      type = balanceTok.val > prevBalance ? "credit" : "debit";
    }

    // Description = everything between the date and the first numeric token
    const firstNumIdx = line.indexOf(numericValues[0].raw);
    let rawDescription = line.slice(dateToken.length, firstNumIdx).trim();
    // Strip trailing chq nos and ref ids when preserving the human-readable part
    rawDescription = rawDescription.replace(/\s+\d{5,}\s*$/, "").trim();
    if (!rawDescription) continue;

    const merchant = extractMerchant(rawDescription);
    const description = humanizeDescription(rawDescription, merchant);
    const category = categorize(merchant, rawDescription);
    const method = detectMethod(rawDescription);

    txns.push({
      id: String(id++),
      date,
      description,
      rawDescription,
      type,
      amount: Math.abs(amountTok.val),
      balance: balanceTok.val,
      category,
      merchant,
      method,
    });
    prevBalance = balanceTok.val;
  }

  return txns;
}

/* ─── 4. Merchant / category heuristics ─── */

const MERCHANT_KEYWORDS: { match: RegExp; merchant: string; category: string }[] = [
  { match: /SWIGGY/i,             merchant: "Swiggy",          category: "Food & Groceries" },
  { match: /ZOMATO/i,             merchant: "Zomato",          category: "Food & Groceries" },
  { match: /ZEPTO/i,              merchant: "Zepto",           category: "Food & Groceries" },
  { match: /BLINKIT|GROFER/i,     merchant: "Blinkit",         category: "Food & Groceries" },
  { match: /BIGBASKET|BB DAILY/i, merchant: "BigBasket",       category: "Food & Groceries" },
  { match: /UBER/i,               merchant: "Uber",            category: "Transport" },
  { match: /OLA/i,                merchant: "Ola",             category: "Transport" },
  { match: /RAPIDO/i,             merchant: "Rapido",          category: "Transport" },
  { match: /IRCTC/i,              merchant: "IRCTC",           category: "Transport" },
  { match: /NETFLIX/i,            merchant: "Netflix",         category: "Subscription" },
  { match: /SPOTIFY/i,            merchant: "Spotify",         category: "Subscription" },
  { match: /PRIME|AMAZON\s*PRIME/i, merchant: "Amazon Prime",  category: "Subscription" },
  { match: /YOUTUBE|YT\s?PREM/i,  merchant: "YouTube Premium", category: "Subscription" },
  { match: /HOTSTAR|DISNEY/i,     merchant: "Hotstar",         category: "Subscription" },
  { match: /AMAZON/i,             merchant: "Amazon",          category: "Shopping" },
  { match: /FLIPKART/i,           merchant: "Flipkart",        category: "Shopping" },
  { match: /MYNTRA/i,             merchant: "Myntra",          category: "Shopping" },
  { match: /MEESHO|AJIO/i,        merchant: "Ajio",            category: "Shopping" },
  { match: /AIRTEL/i,             merchant: "Airtel",          category: "Utilities" },
  { match: /JIO/i,                merchant: "Jio",             category: "Utilities" },
  { match: /VI\s|VODAFONE/i,      merchant: "Vi",              category: "Utilities" },
  { match: /BESCOM|TATA POWER|ELECTRICITY|ADANI/i, merchant: "Electricity", category: "Utilities" },
  { match: /APOLLO|MEDPLUS|PHARMEASY|1MG/i, merchant: "Pharmacy", category: "Medical" },
  { match: /GROWW|ZERODHA|UPSTOX|KUVERA|COIN/i, merchant: "Investment", category: "Investment" },
  { match: /BOOKMYSHOW|BMS\b|PVR|INOX/i, merchant: "BookMyShow", category: "Entertainment" },
  { match: /ATM|CASH WDL|CASH WITHDRAWAL/i, merchant: "ATM", category: "ATM Withdrawal" },
  { match: /SALARY|SAL CR|SAL\b/i, merchant: "Salary",        category: "Salary / Income" },
  { match: /RENT/i,               merchant: "Rent",            category: "Rent" },
];

function extractMerchant(raw: string): string {
  for (const k of MERCHANT_KEYWORDS) {
    if (k.match.test(raw)) return k.merchant;
  }
  // Try UPI handle pattern: "...@bank" or "...VPA NAME"
  const upi = raw.match(/([A-Za-z][A-Za-z\s.&]{2,30})\/[A-Z]{3,4}\//);
  if (upi) return upi[1].trim();

  // Last resort: first capitalized chunk
  const chunk = raw.split(/[/_*]/).find((s) => /[A-Za-z]{3,}/.test(s));
  return chunk?.trim().slice(0, 30) || "Unknown";
}

function categorize(merchant: string, raw: string): string {
  for (const k of MERCHANT_KEYWORDS) {
    if (k.match.test(raw) || k.match.test(merchant)) return k.category;
  }
  if (/UPI|IMPS|NEFT/i.test(raw)) return "Transfer";
  return "Miscellaneous";
}

function detectMethod(raw: string): Transaction["method"] {
  if (/UPI/i.test(raw)) return "UPI";
  if (/NEFT/i.test(raw)) return "NEFT";
  if (/IMPS/i.test(raw)) return "IMPS";
  if (/ATM|CASH WDL/i.test(raw)) return "ATM";
  if (/POS\b/i.test(raw)) return "POS";
  if (/ONLINE|WEB/i.test(raw)) return "ONLINE";
  return "OTHER";
}

function humanizeDescription(raw: string, merchant: string): string {
  if (merchant && merchant !== "Unknown") return merchant;
  return raw.slice(0, 40);
}

/* ─── 5. Top-level orchestration ─── */

export interface ParseResult {
  bank: BankId | null;
  bankName: string;
  transactions: Transaction[];
  period: { from: string; to: string };
  warnings: string[];
}

export async function parseStatement(file: File, password?: string): Promise<ParseResult> {
  const lines = await extractPdfLines(file, password);
  const bank = detectBank(lines);
  const transactions = parseRows(lines);

  const warnings: string[] = [];
  if (!bank) warnings.push("Couldn't auto-detect bank from header.");
  if (transactions.length === 0) warnings.push("No transactions parsed — statement format may be unsupported.");

  // Determine period
  const dates = transactions.map((t) => t.date).sort();
  const period = dates.length > 0
    ? { from: dates[0], to: dates[dates.length - 1] }
    : { from: "", to: "" };

  const bankName = bank
    ? ({ sbi: "SBI", hdfc: "HDFC", icici: "ICICI", axis: "Axis", kotak: "Kotak", pnb: "PNB" }[bank])
    : "Bank Statement";

  return { bank, bankName, transactions, period, warnings };
}
