import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";
import { StartResearchLink } from "./start-research-link";

type MarketingPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function MarketingPageShell({
  eyebrow,
  title,
  description,
  children,
}: MarketingPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/70 bg-muted/20">
          <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
              >
                <ArrowLeft className="size-4" />
                返回首页
              </Link>
              <StartResearchLink
                label="开始研究"
                variant="outline"
                size="sm"
                showArrow={false}
              />
            </div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-primary">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
        </section>
        <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
