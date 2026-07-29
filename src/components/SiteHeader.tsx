import { Link } from "@tanstack/react-router";
import { Heart, Mic } from "lucide-react";
import { HelpModal } from "@/components/HelpModal";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="glass-panel mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full py-2.5 pl-3 pr-2.5 sm:pl-5 sm:pr-4">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-primary/25">
            <span className="animate-pulse-ring absolute inset-0 rounded-full bg-primary/15" />
            <Heart className="relative size-4 fill-primary/80 text-primary" />
            <Mic className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-background p-[1px] text-primary/80" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-[1.15rem] tracking-tight text-cream">
              Dil Ki Baat
            </span>
            <span className="mt-1 truncate text-[0.58rem] uppercase tracking-[0.24em] text-primary/70">
              by aapkamentor.ai
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            to="/terms"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-primary sm:inline"
          >
            Terms
          </Link>
          <HelpModal />
        </div>
      </div>
    </header>
  );
}
