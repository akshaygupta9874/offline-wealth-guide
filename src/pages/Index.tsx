import { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TrustSection from "@/components/landing/TrustSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import FooterSection from "@/components/landing/FooterSection";
import UploadFlow from "@/components/upload/UploadFlow";
import Dashboard from "@/components/dashboard/Dashboard";
import { getMockStatement } from "@/lib/mockData";

type View = "landing" | "upload" | "dashboard";

const Index = () => {
  const [view, setView] = useState<View>("landing");
  const mockData = getMockStatement();

  if (view === "upload") {
    return <UploadFlow onComplete={() => setView("dashboard")} />;
  }

  if (view === "dashboard") {
    return (
      <Dashboard
        transactions={mockData.transactions}
        bankName={mockData.bank}
        period={mockData.period}
        onBack={() => setView("landing")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        onUpload={() => setView("upload")}
        onDemo={() => setView("dashboard")}
      />
      <FeaturesSection />
      <ComparisonSection />
      <TrustSection />
      <FooterSection />
    </div>
  );
};

export default Index;
