import { useState } from "react";
import { LifeBuoy, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <Button
          variant="outline"
          size="sm"
          className="group rounded-full border-primary/30 bg-primary/10 text-primary transition-all duration-500 hover:bg-primary/20 hover:text-cream"
        >
          <LifeBuoy className="size-4 transition-transform duration-500 group-hover:rotate-45" />
          <span className="hidden sm:inline">In Distress?</span> Get Help
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-panel max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-gradient-warm">
            You are not alone. Help is one call away.
          </DialogTitle>
          <DialogDescription>
            Dil Ki Baat is a peer support space, not a crisis or medical service. If you are
            thinking of harming yourself or someone else, please reach a trained professional right
            now.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {HELPLINES.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.tel}`}
              className="glass-card flex items-start gap-3 rounded-2xl p-4"
            >
              <Phone className="mt-1 size-5 shrink-0 text-primary" />
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
