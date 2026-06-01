import { MarketingPageShell } from "@/components/landing/marketing-page-shell";
import { caseStudyPage } from "@/lib/landing-content";

export default function CasesPage() {
  return (
    <MarketingPageShell
      eyebrow={caseStudyPage.eyebrow}
      title={caseStudyPage.title}
      description={caseStudyPage.description}
    >
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-md border bg-card p-5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-primary">
            Input
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {caseStudyPage.input}
          </p>
        </aside>

        <div className="space-y-4">
          {caseStudyPage.steps.map((step) => (
            <section key={step.title} className="rounded-md border bg-card p-5">
              <h2 className="font-serif text-2xl font-semibold">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {step.description}
              </p>
            </section>
          ))}
        </div>
      </div>
    </MarketingPageShell>
  );
}
