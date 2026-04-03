const FooterSection = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/30">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-display text-lg font-semibold mb-2">
          Fin<span className="text-primary">Sight</span>
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Privacy-first personal finance intelligence for India.
        </p>
        <p className="text-[11px] text-muted-foreground/50">
          Built with 💚 by a student who believes your money data is yours alone.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
