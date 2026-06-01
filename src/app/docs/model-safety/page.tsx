import { MarketingPageShell } from "@/components/landing/marketing-page-shell";
import { docsPages } from "@/lib/landing-content";

export default function ModelSafetyPage() {
  const page = docsPages["model-safety"];

  return (
    <MarketingPageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
    >
      <div className="space-y-6">
        {page.sections.map((section) => (
          <section key={section.title} className="rounded-md border bg-card p-6">
            <h2 className="font-serif text-2xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {section.description}
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-6">
              {section.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </MarketingPageShell>
  );
}
