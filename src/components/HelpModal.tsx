import { useState } from "react";
import { LifeBuoy, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HELPLINES } from "@/lib/dilkibaat";

export function HelpModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group inline-flex items-center gap-2 rounded-full bg-ember/15 px-4 py-2 text-sm text-rose transition-colors duration-300 hover:bg-ember/25 hover:text-cream"
        >
          <LifeBuoy className="size-4 transition-transform duration-500 group-hover:rotate-45" />
          <span className="hidden sm:inline">In Distress?</span> Get Help
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">
            You are not alone — help is one call away
          </DialogTitle>
          <DialogDescription>
            Dil Ki Baat is a peer-support space, not a crisis or medical service. If you are
            thinking of harming yourself or someone else, please reach a trained professional right
            now.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {HELPLINES.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.tel}`}
              className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:bg-accent"
            >
              <Phone className="mt-1 size-5 text-primary" />
              <span>
                <span className="block font-display text-lg text-primary">{h.number}</span>
                <span className="block text-sm font-medium text-foreground">{h.name}</span>
                <span className="block text-sm text-muted-foreground">{h.detail}</span>
              </span>
            </a>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          In an emergency, call 112 (national emergency number) or go to the nearest hospital.
        </p>
      </DialogContent>
    </Dialog>
  );
}
