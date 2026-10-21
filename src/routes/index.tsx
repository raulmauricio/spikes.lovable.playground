import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GoogleLoginPanel } from "@/components/GoogleLoginPanel";

const SECTIONS = [
  { id: "prompts", label: "Prompts" },
  { id: "google-login", label: "Google Login" },
  { id: "ai-data", label: "AI Data" },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estate AI — Minimal Real Estate Intelligence" },
      { name: "description", content: "A minimal real estate platform powered by AI." },
      { property: "og:title", content: "Estate AI — Minimal Real Estate Intelligence" },
      { property: "og:description", content: "A minimal real estate platform powered by AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function TabNav({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <nav aria-label="Sections" className="flex justify-center">
      <div role="tablist" className="flex gap-1 rounded-full bg-secondary p-1">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={active === i}
            aria-controls={s.id}
            onClick={() => onSelect(i)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300 sm:px-5 sm:text-sm ${
              active === i
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Section({ id, title, active }: { id: string; title: string; active: boolean }) {
  return (
    <section
      id={id}
      role="tabpanel"
      aria-hidden={!active}
      className="flex h-full w-full shrink-0 flex-col overflow-y-auto px-6 pt-10 sm:px-12"
    >
      <h1 className="text-center text-3xl font-light tracking-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      <div className="mx-auto mt-10 w-full max-w-4xl flex-1">
        {id === "google-login" && <GoogleLoginPanel />}
      </div>
    </section>
  );
}

function Index() {
  const [active, setActive] = useState(0);
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="py-6">
        <TabNav active={active} onSelect={setActive} />
      </header>
      <main className="relative flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {SECTIONS.map((s, i) => (
            <Section key={s.id} id={s.id} title={s.label} active={active === i} />
          ))}
        </div>
      </main>
    </div>
  );
}
