import { Link } from "@tanstack/react-router";
import { HelpModal } from "@/components/HelpModal";

export function SiteHeader() {
  return (
    <header className="relative z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-10">
      <Link to="/" className="group flex min-w-0 items-center gap-3">
        <span className="relative grid size-10 shrink-0 place-items-center">
          <span className="absolute inset-0 rounded-full bg-ember/20 blur-md transition-all duration-500 group-hover:bg-ember/35" />
          <span className="relative font-display text-lg text-primary">❤</span>
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-display text-[1.35rem] text-gradient-warm">
            DilKiBaat
          </span>
          <span className="block truncate text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
            Anonymous. Unhurried. Heard.
          </span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-5">
        <Link
          to="/terms"
          className="hidden text-sm text-muted-foreground transition-colors hover:text-primary sm:inline"
        >
          Terms
        </Link>
        <HelpModal />
      </div>
    </header>
  );
}
