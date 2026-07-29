import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { HELPLINES } from "@/lib/dilkibaat";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Disclaimer & Terms of Service | Dil Ki Baat" },
      {
        name: "description",
        content:
          "Plain-language disclaimer, privacy notes and terms of service for Dil Ki Baat — an anonymous peer-support space by aapkamentor.ai.",
      },
      { property: "og:title", content: "Disclaimer & Terms of Service | Dil Ki Baat" },
      {
        property: "og:description",
        content: "How Dil Ki Baat handles your anonymous story, your privacy, and your safety.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

const SECTIONS = [
  {
    q: "1. What Dil Ki Baat is — and what it is not",
    a: "Dil Ki Baat is an anonymous peer-support and community-listening space run by aapkamentor.ai. It is NOT therapy, counselling, medical advice, legal advice, or an emergency service. Nothing shared here creates a doctor–patient, therapist–client, or professional relationship. Advice you receive comes from volunteers, mentors and community members sharing lived experience — please use your own judgment before acting on it.",
  },
  {
    q: "2. If you are in crisis, please call a helpline",
    a: `If you are thinking of harming yourself or someone else, do not wait for a reply here. Call ${HELPLINES.map((h) => `${h.name} at ${h.number}`).join(" or ")}, or the national emergency number 112. These services are free and available 24×7.`,
  },
  {
    q: "3. Anonymity — how we protect you",
    a: "We do not ask for your name, email or phone number. We store a random ID in your browser only so your device can reopen your own chat. Your story is stored with the details you typed and nothing else. Please do not include real names, phone numbers, addresses, workplaces or anything that could identify you or another person — if you do, we may edit or delete it.",
  },
  {
    q: "4. Publishing your story",
    a: "If you choose 'Yes' or 'Maybe' for an Instagram highlight, our team may share your story publicly — always without your identity, and often lightly edited for length, clarity or safety. If you choose 'No', we will not publish it. You can ask us to remove a published story at any time by writing to us.",
  },
  {
    q: "5. Disappearing chats",
    a: "If you turn on live chat, you choose how long messages live: 1 hour, 24 hours, or never expire. Expired messages stop being shown and are removed from active view. Chats are private between you and a Dil Ki Baat mentor. Please note that anyone with access to your device could see an open chat window.",
  },
  {
    q: "6. Community rules",
    a: "Be kind. No hate speech, harassment, threats, sexual content involving minors, doxxing, spam, or promotion of self-harm. Do not post other people's private information. We may remove or archive any submission at our discretion, without notice.",
  },
  {
    q: "7. Your content and our use of it",
    a: "You keep ownership of what you write. By submitting, you give aapkamentor.ai a non-exclusive, royalty-free licence to store, moderate, anonymise, lightly edit and publish it on Dil Ki Baat channels for community support purposes. You confirm the story is yours to share.",
  },
  {
    q: "8. Limitation of liability",
    a: "Dil Ki Baat and aapkamentor.ai are provided 'as is'. To the maximum extent permitted by law, we are not liable for any decisions you make based on community advice, for interruptions in service, or for indirect or consequential losses. You use this space at your own discretion.",
  },
  {
    q: "9. Age",
    a: "You should be 16 or older to submit a story. If you are younger, please talk to a trusted adult, a school counsellor, or call Childline India at 1098.",
  },
  {
    q: "10. Changes & contact",
    a: "We may update these terms as the community grows; the latest version always lives on this page. For removals, questions or concerns, reach us through the Dil Ki Baat Instagram page (@dil.ki.baat.sabkesath).",
  },
];

function Terms() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-8">
        <h1 className="font-display text-4xl text-gradient-gold sm:text-5xl">
          Disclaimer & Terms of Service
        </h1>
        <p className="mt-4 text-muted-foreground">
          Written in plain language, so you actually read it. Tap any point to expand.
        </p>

        <div className="mt-6 rounded-2xl cream-card p-5">
          <p className="font-display text-xl">The short version</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>This is peer support, not therapy or emergency care.</li>
            <li>We never ask for your identity — please don't share anyone else's either.</li>
            <li>We only publish your story if you allowed it, and always anonymously.</li>
            <li>In a crisis, call Tele-MANAS 14416 or 112 immediately.</li>
          </ul>
        </div>

        <Accordion type="single" collapsible className="mt-8">
          {SECTIONS.map((s) => (
            <AccordionItem key={s.q} value={s.q}>
              <AccordionTrigger className="text-left font-display text-lg text-primary">
                {s.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{s.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-10 text-sm text-muted-foreground">
          <Link to="/" className="text-primary underline underline-offset-4">
            ← Back to Dil Ki Baat
          </Link>
        </p>
      </main>
    </div>
  );
}
