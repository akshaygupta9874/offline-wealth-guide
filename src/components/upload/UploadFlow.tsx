import { useState, useCallback } from "react";
import { Upload, FileText, Lock, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BANKS, type BankId } from "@/lib/types";

interface UploadFlowProps {
  onComplete: () => void;
}

const UploadFlow = ({ onComplete }: UploadFlowProps) => {
  const [step, setStep] = useState<"upload" | "password">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankId | null>(null);
  const [password, setPassword] = useState("");
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      setStep("password");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      setFile(selected);
      setStep("password");
    }
  };

  const handleProcess = () => {
    setProcessing(true);
    // Simulate processing with mock data
    setTimeout(() => {
      setProcessing(false);
      onComplete();
    }, 1500);
  };

  if (step === "upload") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold mb-2">Upload Statement</h1>
            <p className="text-sm text-muted-foreground">
              Drop your bank statement PDF. It stays on your device.
            </p>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-300
              ${dragOver
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border/50 hover:border-primary/30 hover:bg-card/50"
              }
            `}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="font-display font-semibold text-sm mb-1">
              {dragOver ? "Drop it!" : "Drop PDF here"}
            </p>
            <p className="text-xs text-muted-foreground">or tap to browse</p>
          </div>

          <div className="mt-6 text-center">
            <Button variant="hero-outline" onClick={onComplete} className="text-sm">
              Try with demo data instead
            </Button>
          </div>

          {/* Trust indicator */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60">
            <Lock className="w-3 h-3" />
            <span>Processed locally · Never uploaded · Works offline</span>
          </div>
        </div>
      </div>
    );
  }

  const bankInfo = selectedBank ? BANKS[selectedBank] : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">Unlock Statement</h1>
          <p className="text-sm text-muted-foreground">
            {file?.name}
          </p>
        </div>

        {/* Bank selector */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Your Bank</label>
          <div className="relative">
            <button
              onClick={() => setShowBankSelect(!showBankSelect)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border/50 bg-card/50 text-sm hover:border-primary/30 transition-colors"
            >
              <span>{bankInfo ? bankInfo.fullName : "Select your bank"}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {showBankSelect && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg overflow-hidden z-10 shadow-xl">
                {Object.values(BANKS).map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => { setSelectedBank(bank.id); setShowBankSelect(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-b border-border/30 last:border-0"
                  >
                    {bank.fullName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Password input */}
        <div className="mb-2">
          <label className="text-xs text-muted-foreground mb-1.5 block">PDF Password</label>
          <Input
            type="password"
            placeholder="Enter PDF password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-card/50 border-border/50 h-12"
          />
        </div>

        {/* Password hint */}
        {bankInfo && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 mb-6">
            <HelpCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-primary font-medium">{bankInfo.name} password format</p>
              <p className="text-xs text-muted-foreground mt-0.5">{bankInfo.passwordHint}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">e.g. {bankInfo.passwordExample}</p>
            </div>
          </div>
        )}

        {!bankInfo && <div className="mb-6" />}

        <Button
          variant="hero"
          size="lg"
          className="w-full text-base py-6"
          onClick={handleProcess}
          disabled={!selectedBank || !password || processing}
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Processing locally...
            </span>
          ) : (
            "Analyze Statement"
          )}
        </Button>

        <button
          onClick={() => { setStep("upload"); setFile(null); }}
          className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Choose a different file
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60">
          <Lock className="w-3 h-3" />
          <span>Password used locally to unlock · Never stored or transmitted</span>
        </div>
      </div>
    </div>
  );
};

export default UploadFlow;
