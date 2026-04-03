export interface Transaction {
  id: string;
  date: string;
  description: string;
  rawDescription: string;
  type: "credit" | "debit";
  amount: number;
  balance: number;
  category: string;
  merchant: string;
  method: "UPI" | "ATM" | "NEFT" | "IMPS" | "POS" | "ONLINE" | "OTHER";
}

export interface BankStatement {
  bank: string;
  accountHolder: string;
  accountNumber: string; // masked
  period: { from: string; to: string };
  transactions: Transaction[];
}

export type BankId = "sbi" | "hdfc" | "icici" | "axis" | "kotak" | "pnb";

export interface BankInfo {
  id: BankId;
  name: string;
  fullName: string;
  color: string;
  passwordHint: string;
  passwordExample: string;
}

export const BANKS: Record<BankId, BankInfo> = {
  sbi: {
    id: "sbi",
    name: "SBI",
    fullName: "State Bank of India",
    color: "#1a4d8f",
    passwordHint: "First 4 letters of name (CAPS) + DDMM of DOB",
    passwordExample: "AKSH0103",
  },
  hdfc: {
    id: "hdfc",
    name: "HDFC",
    fullName: "HDFC Bank",
    color: "#004c8f",
    passwordHint: "Date of birth in DDMMYYYY format",
    passwordExample: "01031999",
  },
  icici: {
    id: "icici",
    name: "ICICI",
    fullName: "ICICI Bank",
    color: "#b02a30",
    passwordHint: "DOB in DDMMYYYY or last 4 digits of account number",
    passwordExample: "01031999",
  },
  axis: {
    id: "axis",
    name: "Axis",
    fullName: "Axis Bank",
    color: "#97144d",
    passwordHint: "Customer ID or date of birth",
    passwordExample: "Customer ID",
  },
  kotak: {
    id: "kotak",
    name: "Kotak",
    fullName: "Kotak Mahindra Bank",
    color: "#ed1c24",
    passwordHint: "Date of birth in DDMMYYYY format",
    passwordExample: "01031999",
  },
  pnb: {
    id: "pnb",
    name: "PNB",
    fullName: "Punjab National Bank",
    color: "#1e3a5f",
    passwordHint: "Account number or customer ID",
    passwordExample: "Account number",
  },
};

export const CATEGORIES = [
  "Food & Groceries",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Medical",
  "Education",
  "Rent",
  "Investment",
  "Transfer",
  "Salary / Income",
  "ATM Withdrawal",
  "Subscription",
  "Miscellaneous",
] as const;

export type Category = (typeof CATEGORIES)[number];
