import type { Transaction } from "./types";

// Realistic mock transactions for demo
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", date: "2025-03-01", description: "Salary Credit", rawDescription: "NEFT/CR/ACME TECHNOLOGIES PVT LTD/SAL/MAR", type: "credit", amount: 45000, balance: 52340, category: "Salary / Income", merchant: "Acme Technologies", method: "NEFT" },
  { id: "2", date: "2025-03-02", description: "Rent Payment", rawDescription: "UPI/DR/408251054163/Ramesh Kumar/SBIN/ramesh.k/Rent", type: "debit", amount: 12000, balance: 40340, category: "Rent", merchant: "Ramesh Kumar", method: "UPI" },
  { id: "3", date: "2025-03-03", description: "Swiggy Order", rawDescription: "UPI/DR/553074094426/Swiggy/utib/swiggy.payu/Payment", type: "debit", amount: 347, balance: 39993, category: "Food & Groceries", merchant: "Swiggy", method: "UPI" },
  { id: "4", date: "2025-03-04", description: "Zepto Groceries", rawDescription: "UPI/DR/553074094426/Zepto Ma/utib/zepto.payu/Payme", type: "debit", amount: 523, balance: 39470, category: "Food & Groceries", merchant: "Zepto", method: "UPI" },
  { id: "5", date: "2025-03-04", description: "ATM Withdrawal", rawDescription: "ATM CASH 6166 +JADAVPUR E-LOBBY 095 KOLKAT", type: "debit", amount: 5000, balance: 34470, category: "ATM Withdrawal", merchant: "ATM", method: "ATM" },
  { id: "6", date: "2025-03-05", description: "Netflix Subscription", rawDescription: "UPI/DR/601470702076/Netflix/HDFC/netflix.com/Sub", type: "debit", amount: 649, balance: 33821, category: "Subscription", merchant: "Netflix", method: "UPI" },
  { id: "7", date: "2025-03-05", description: "Uber Ride", rawDescription: "UPI/DR/088351054163/UBER INDIA/YESB/uber.paytm/Ride", type: "debit", amount: 189, balance: 33632, category: "Transport", merchant: "Uber", method: "UPI" },
  { id: "8", date: "2025-03-06", description: "Amazon Shopping", rawDescription: "UPI/DR/778351054163/Amazon Pay/ICIC/amazonpay/Shop", type: "debit", amount: 2499, balance: 31133, category: "Shopping", merchant: "Amazon", method: "UPI" },
  { id: "9", date: "2025-03-07", description: "Airtel Recharge", rawDescription: "UPI/DR/998351054163/Airtel/PAYTM/airtel/Recharge", type: "debit", amount: 299, balance: 30834, category: "Utilities", merchant: "Airtel", method: "UPI" },
  { id: "10", date: "2025-03-07", description: "Blinkit Order", rawDescription: "UPI/DR/118351054163/Blinkit/YESB/blinkit/Groceries", type: "debit", amount: 412, balance: 30422, category: "Food & Groceries", merchant: "Blinkit", method: "UPI" },
  { id: "11", date: "2025-03-08", description: "Zomato Order", rawDescription: "UPI/DR/228351054163/Zomato/HDFC/zomato/Food", type: "debit", amount: 576, balance: 29846, category: "Food & Groceries", merchant: "Zomato", method: "UPI" },
  { id: "12", date: "2025-03-09", description: "IRCTC Ticket", rawDescription: "POS/IRCTC WEB/NEW DELHI/TRAIN TICKET", type: "debit", amount: 1245, balance: 28601, category: "Transport", merchant: "IRCTC", method: "ONLINE" },
  { id: "13", date: "2025-03-10", description: "Spotify Subscription", rawDescription: "UPI/DR/338351054163/Spotify/AXIS/spotify/Sub", type: "debit", amount: 119, balance: 28482, category: "Subscription", merchant: "Spotify", method: "UPI" },
  { id: "14", date: "2025-03-10", description: "Peer Transfer", rawDescription: "UPI/DR/448351054163/Alok Jana/YESB/alok.jana/Payment", type: "debit", amount: 1500, balance: 26982, category: "Transfer", merchant: "Alok Jana", method: "UPI" },
  { id: "15", date: "2025-03-11", description: "Swiggy Order", rawDescription: "UPI/DR/558351054163/Swiggy/utib/swiggy/Food", type: "debit", amount: 289, balance: 26693, category: "Food & Groceries", merchant: "Swiggy", method: "UPI" },
  { id: "16", date: "2025-03-12", description: "Electricity Bill", rawDescription: "UPI/DR/668351054163/BESCOM/SBI/bescom/Bill", type: "debit", amount: 1870, balance: 24823, category: "Utilities", merchant: "BESCOM", method: "UPI" },
  { id: "17", date: "2025-03-13", description: "Flipkart Shopping", rawDescription: "UPI/DR/778351054163/Flipkart/AXIS/flipkart/Shop", type: "debit", amount: 1599, balance: 23224, category: "Shopping", merchant: "Flipkart", method: "UPI" },
  { id: "18", date: "2025-03-14", description: "Freelance Payment", rawDescription: "UPI/CR/888351054163/Priya M/HDFC/priya.m/Freelance", type: "credit", amount: 8000, balance: 31224, category: "Salary / Income", merchant: "Priya M", method: "UPI" },
  { id: "19", date: "2025-03-15", description: "BookMyShow", rawDescription: "UPI/DR/998351054163/BookMyShow/PAYTM/bms/Tickets", type: "debit", amount: 750, balance: 30474, category: "Entertainment", merchant: "BookMyShow", method: "UPI" },
  { id: "20", date: "2025-03-15", description: "Rapido Ride", rawDescription: "UPI/DR/108351054163/Rapido/YESB/rapido/Ride", type: "debit", amount: 85, balance: 30389, category: "Transport", merchant: "Rapido", method: "UPI" },
  { id: "21", date: "2025-03-16", description: "Groww Investment", rawDescription: "UPI/DR/218351054163/Groww/AXIS/groww/SIP", type: "debit", amount: 2000, balance: 28389, category: "Investment", merchant: "Groww", method: "UPI" },
  { id: "22", date: "2025-03-17", description: "Zepto Late Night", rawDescription: "UPI/DR/328351054163/Zepto Ma/utib/zepto/Groceries", type: "debit", amount: 678, balance: 27711, category: "Food & Groceries", merchant: "Zepto", method: "UPI" },
  { id: "23", date: "2025-03-18", description: "Pharmacy", rawDescription: "UPI/DR/438351054163/Apollo Pharm/HDFC/apollo/Med", type: "debit", amount: 340, balance: 27371, category: "Medical", merchant: "Apollo Pharmacy", method: "UPI" },
  { id: "24", date: "2025-03-19", description: "YouTube Premium", rawDescription: "UPI/DR/548351054163/Google/ICIC/google/YTPrem", type: "debit", amount: 149, balance: 27222, category: "Subscription", merchant: "YouTube Premium", method: "UPI" },
  { id: "25", date: "2025-03-20", description: "Swiggy Order", rawDescription: "UPI/DR/658351054163/Swiggy/utib/swiggy/Food", type: "debit", amount: 445, balance: 26777, category: "Food & Groceries", merchant: "Swiggy", method: "UPI" },
];

export function getMockStatement() {
  return {
    bank: "SBI",
    accountHolder: "Akshay Kumar",
    accountNumber: "XXXX XXXX 4521",
    period: { from: "2025-03-01", to: "2025-03-20" },
    transactions: MOCK_TRANSACTIONS,
  };
}
