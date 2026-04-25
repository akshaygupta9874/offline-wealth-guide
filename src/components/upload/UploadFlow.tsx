import { useState, useCallback } from "react";
import { Upload, FileText, Lock, HelpCircle, ChevronDown, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BANKS, type BankId } from "@/lib/types";
import { probePdf } from "@/lib/pdf";
import { parseStatement, type ParseResult } from "@/lib/parser";

interface UploadFlowProps {
  /** Called with parsed result when user uploads a real PDF. */
  onComplete: (result: ParseResult | null) => void;
}

type Step = "upload" | "password" | "ready";

const UploadFlow = ({ onComplete }: UploadFlowProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankId | null>(null);
  const [password, setPassword] = useState("");
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  /** Inspect a freshly chosen file: open it; if encrypted, prompt for password. */
  const inspectFile = useCallback(async (f: File) => {
    setFile(f);
    setError(null);
    setPassword("");
    setPageCount(null);
    setChecking(true);

    const result = await probePdf(f);
    setChecking(false);

    if (result.kind === "ok") {
      setPageCount(result.pageCount);
      setStep("ready");
    } else if (result.kind === "needs_password") {
      setStep("password");
    } else if (result.kind === "invalid") {
      setError("Couldn't read this PDF. It may be corrupted.");
      setStep("upload");
      setFile(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      void inspectFile(dropped);
    } else if (dropped) {
      setError("Please upload a PDF file.");
    }
  }, [inspectFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      void inspectFile(selected);
    } else if (selected) {
      setError("Please upload a PDF file.");
    }
  };

  /** Try the entered password against the file. */
  const handleUnlock = async () => {
    if (!file || !password) return;
    setError(null);
    setProcessing(true);

    const result = await probePdf(file, password);
    setProcessing(false);

    if (result.kind === "ok") {
      setPageCount(result.pageCount);
      setStep("ready");
    } else if (result.kind === "wrong_password" || result.kind === "needs_password") {
      setError("Wrong password. Check the hint below and try again.");
    } else {
      setError("Couldn't unlock this PDF.");
    }
  };

  const handleAnalyze = () => {
    setProcessing(true);
    if (!file) {
      setProcessing(false);
      onComplete(null);
      return;
    }
    parseStatement(file, password || undefined)
      .then((result) => {
        setProcessing(false);
        if (result.transactions.length === 0) {
          setError(
            "Couldn't extract any transactions. The format may not be supported yet — try the demo data instead.",
          );
          return;
        }
        onComplete(result);
      })
      .catch(() => {
        setProcessing(false);
        setError("Failed to parse the statement. The PDF may be scanned or in an unsupported format.");
      });
  };

  /* ─── Step: upload ─── */
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
              accept="application/pdf,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {checking ? (
                <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-primary" />
              )}
            </div>
            <p className="font-display font-semibold text-sm mb-1">
              {checking ? "Reading file..." : dragOver ? "Drop it!" : "Drop PDF here"}
            </p>
            <p className="text-xs text-muted-foreground">or tap to browse</p>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Button variant="hero-outline" onClick={() => onComplete(null)} className="text-sm">
              Try with demo data instead
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60">
            <Lock className="w-3 h-3" />
            <span>Processed locally · Never uploaded · Works offline</span>
          </div>
        </div>
      </div>
    );
  }

  const bankInfo = selectedBank ? BANKS[selectedBank] : null;

  /* ─── Step: password ─── */
  if (step === "password") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-1">Password Protected</h1>
            <p className="text-sm text-muted-foreground truncate px-4">
              {file?.name}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              This PDF is encrypted. Enter the password to unlock it locally.
            </p>
          </div>

          {/* Bank selector — needed to show password hint */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1.5 block">Your Bank</label>
            <div className="relative">
              <button
                onClick={() => setShowBankSelect(!showBankSelect)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border/50 bg-card/50 text-sm hover:border-primary/30 transition-colors"
              >
                <span>{bankInfo ? bankInfo.fullName : "Select for password hint"}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              {showBankSelect && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg overflow-hidden z-10 shadow-xl max-h-64 overflow-y-auto">
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
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter" && password && !processing) void handleUnlock(); }}
              autoFocus
              className={`bg-card/50 h-12 ${error ? "border-destructive/60" : "border-border/50"}`}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

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
            onClick={handleUnlock}
            disabled={!password || processing}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Unlocking locally...
              </span>
            ) : (
              "Unlock PDF"
            )}
          </Button>

          <button
            onClick={() => { setStep("upload"); setFile(null); setPassword(""); setError(null); }}
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
  }

  /* ─── Step: ready (unlocked, confirm analyze) ─── */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-positive/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-5 h-5 text-positive" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">Statement Ready</h1>
          <p className="text-sm text-muted-foreground truncate px-4">{file?.name}</p>
          {pageCount !== null && (
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              {pageCount} page{pageCount === 1 ? "" : "s"} · unlocked locally
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-4 mb-6 flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{file?.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {file ? (file.size / 1024).toFixed(1) : 0} KB · ready to analyze
            </p>
          </div>
        </div>

        <Button
          variant="hero"
          size="lg"
          className="w-full text-base py-6"
          onClick={handleAnalyze}
          disabled={processing}
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing locally...
            </span>
          ) : (
            "Analyze Statement"
          )}
        </Button>

        <button
          onClick={() => { setStep("upload"); setFile(null); setPassword(""); setError(null); setPageCount(null); }}
          className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Choose a different file
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60">
          <Lock className="w-3 h-3" />
          <span>All processing happens on your device</span>
        </div>
      </div>
    </div>
  );
};

export default UploadFlow;
