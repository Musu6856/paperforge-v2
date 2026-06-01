import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MarketingPageShell } from "@/components/landing/marketing-page-shell";
import { docsHomeCards } from "@/lib/landing-content";

export default function DocsPage() {
  return (
    <MarketingPageShell
      eyebrow="Docs"
      title="PaperForge 使用文档"
      description="这里放主流程、功能说明、模型配置和案例入口。首页只负责引导，具体说明都收在独立文档页里。"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {docsHomeCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-md border bg-card p-5 transition-colors hover:border-primary/60"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl font-semibold leading-tight">
                {card.title}
              </h2>
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </MarketingPageShell>
  );
}
