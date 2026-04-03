import { Shield, Upload, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-abstract.jpg";

interface HeroSectionProps {
  onUpload?: () => void;
  onDemo?: () => void;
}

const HeroSection = ({ onUpload, onDemo }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-fade-in-up">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary tracking-wide">Your data never leaves your device</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in-up animation-delay-100">
          See where your
          <br />
          <span className="text-gradient">money really goes</span>
        </h1>

        {/* Subheadline */}
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
          Upload your bank statement. Get instant insights.
          No accounts, no permissions, no data collection.
          100% private, processed in your browser.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 animate-fade-in-up animation-delay-300">
          <Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
            <Upload className="w-4 h-4 mr-2" />
            Upload Statement
          </Button>
          <Button variant="hero-outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
            See Demo
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground animate-fade-in-up animation-delay-400">
          <div className="flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5 text-primary" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Open source</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-primary" />
            <span>Zero network requests</span>
          </div>
        </div>

        {/* Supported banks */}
        <p className="mt-10 text-[11px] text-muted-foreground/60 tracking-wider uppercase animate-fade-in-up animation-delay-500">
          SBI · HDFC · ICICI · Axis · Kotak · PNB
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
