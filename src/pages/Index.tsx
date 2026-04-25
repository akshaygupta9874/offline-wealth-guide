import { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TrustSection from "@/components/landing/TrustSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import FooterSection from "@/components/landing/FooterSection";
import UploadFlow from "@/components/upload/UploadFlow";
import Dashboard from "@/components/dashboard/Dashboard";
import { getMockStatement } from "@/lib/mockData";
import type { ParseResult } from "@/lib/parser";

type View = "landing" | "upload" | "dashboard";

const Index = () => {
  const [view, setView] = useState<View>("landing");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const mockData = getMockStatement();

  if (view === "upload") {
    return (
      <UploadFlow
        onComplete={(result) => {
          setParsed(result); // null means demo
          setView("dashboard");
        }}
      />
    );
  }

  if (view === "dashboard") {
    // Use parsed real data if available, else fall back to demo
    const data = parsed
      ? {
          transactions: parsed.transactions,
          bank: parsed.bankName,
          period: parsed.period.from
            ? parsed.period
            : mockData.period,
        }
      : { transactions: mockData.transactions, bank: mockData.bank, period: mockData.period };

    return (
      <Dashboard
        transactions={data.transactions}
        bankName={data.bank}
        period={data.period}
        onBack={() => { setParsed(null); setView("landing"); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        onUpload={() => setView("upload")}
        onDemo={() => { setParsed(null); setView("dashboard"); }}
      />
      <FeaturesSection />
      <ComparisonSection />
      <TrustSection />
      <FooterSection />
    </div>
  );
};

export default Index;
