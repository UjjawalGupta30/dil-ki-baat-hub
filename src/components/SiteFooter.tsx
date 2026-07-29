import { Link } from "@tanstack/react-router";
import { Instagram, Mail, ShieldCheck } from "lucide-react";

const EMAIL = "dil.ki.baat.humare.sath@gmail.com";
const INSTAGRAM = "https://instagram.com/dil.ki.baat.sabkesath";

export function SiteFooter() {
  return (
    <footer className="relative px-6 pb-16 pt-4 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="hairline mb-12" />

        <div className="grid gap-12 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl italic leading-snug text-cream/85">
              Your story, without your name attached to it.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Dil Ki Baat is a community initiative by{" "}
              <span className="text-cream/80">aapkamentor.ai</span>, built by people who got tired
              of pretending they were fine. Real humans read every word.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Anonymous by design. No accounts, no tracking of who you are.
            </p>
          </div>

          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.32em] text-ember/80">Reach out</p>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="group inline-flex items-start gap-3 text-muted-foreground transition-colors hover:text-cream"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="break-all underline decoration-primary/30 underline-offset-4 transition-colors group-hover:decoration-primary">
                    {EMAIL}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 text-muted-foreground transition-colors hover:text-cream"
                >
                  <Instagram className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="underline decoration-primary/30 underline-offset-4 transition-colors group-hover:decoration-primary">
                    @dil.ki.baat.sabkesath
                  </span>
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">
              Slide into the DMs if writing feels like too much today. We usually reply within a
              day.
            </p>
          </div>

          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.32em] text-ember/80">The fine print</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/terms"
                  className="underline decoration-primary/30 underline-offset-4 transition-colors hover:text-cream hover:decoration-primary"
                >
                  Disclaimer &amp; Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="tel:14416"
                  className="underline decoration-primary/30 underline-offset-4 transition-colors hover:text-cream hover:decoration-primary"
                >
                  In crisis? Call Tele-MANAS 14416
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">
              Peer support and honest perspective. Not therapy, diagnosis or emergency care.
            </p>
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} aapkamentor.ai. Dil Ki Baat. All rights reserved.</p>
          <p className="text-muted-foreground/80">Made with a lot of feeling, in India.</p>
        </div>
      </div>
    </footer>
  );
}
