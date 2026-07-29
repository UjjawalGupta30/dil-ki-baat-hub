import { Link } from "@tanstack/react-router";
import { HelpModal } from "@/components/HelpModal";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <Link to="/" className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full border border-border bg-card/60 font-display text-primary">
          ❤
        </span>
        <span className="leading-tight">
          <span className="block font-display text-xl text-gradient-gold">DilKiBaat</span>
          <span className="block text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Dil Ki Baat. Sabke Saath.
          </span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <Link
          to="/terms"
          className="hidden text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline sm:inline"
        >
          Terms
        </Link>
        <HelpModal />
      </div>
    </header>
  );
}
