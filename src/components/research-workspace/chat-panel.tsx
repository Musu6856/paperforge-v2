"use client";

import { ChevronDown, CircleDot, Loader2, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { shouldSubmitChatDraftFromKeyDown } from "@/lib/chat-input-keyboard";
import type { ResearchChatViewMessage } from "@/lib/research-chat-view";

type ChatPanelProps = {
  messages: ResearchChatViewMessage[];
  isBusy: boolean;
  onSubmit: (content: string) => Promise<void> | void;
  headerTitle?: string;
  headerSubtitle?: string;
  placeholder?: string;
  emptyState?: React.ReactNode;
  userLabel?: string;
  assistantLabel?: string;
  sendLabel?: string;
};

export function ChatPanel({
  messages,
  isBusy,
  onSubmit,
  headerTitle = "Research Chat",
  headerSubtitle = "Discuss the current findings and refine the direction.",
  placeholder = "Type a thought, a correction, or a question.",
  emptyState,
  userLabel = "You",
  assistantLabel = "PaperForge",
  sendLabel = "Send message",
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  async function submitDraft() {
    const content = draft.trim();
    if (!content || isBusy) return;
    setDraft("");
    await onSubmit(content);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitDraft();
  }

  async function handleDraftKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (!shouldSubmitChatDraftFromKeyDown(event)) return;

    event.preventDefault();
    await submitDraft();
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-14 shrink-0 flex-col justify-center border-b px-5 py-3">
        <div className="text-sm font-medium text-foreground">{headerTitle}</div>
        <div className="text-xs text-muted-foreground">{headerSubtitle}</div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 && emptyState ? (
          emptyState
        ) : (
          <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? "max-w-full self-end text-right"
                    : "max-w-full self-start text-left"
                }
              >
                <div className="mb-1 text-xs text-muted-foreground">
                  {message.role === "user" ? userLabel : assistantLabel}
                </div>
                <div
                  className={
                    message.isPending
                      ? "max-w-full min-w-0 overflow-hidden rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2 text-muted-foreground"
                      : "max-w-full min-w-0 overflow-hidden rounded-md border bg-card px-3 py-2 text-card-foreground"
                  }
                  aria-live={message.isPending ? "polite" : undefined}
                >
                  {message.isPending ? (
                    <div className="flex items-center gap-2 text-sm leading-6">
                      <Loader2 className="size-4 shrink-0 animate-spin" />
                      <span>{message.content}</span>
                    </div>
                  ) : (
                    <MarkdownRenderer
                      content={message.content}
                      className="paperforge-markdown text-sm leading-6"
                    />
                  )}
                </div>
                {message.agentRun ? (
                  <AgentRunInlineTrace run={message.agentRun} />
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>

      <form className="shrink-0 border-t bg-background p-3" onSubmit={handleSubmit}>
        <div className="mx-auto flex max-w-3xl items-stretch gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleDraftKeyDown}
            rows={2}
            className="min-h-10 flex-1 resize-none overflow-y-auto rounded-md border bg-background px-3 py-2 text-sm leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={placeholder}
            disabled={isBusy}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isBusy}
            className="inline-flex w-11 self-stretch shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            aria-label={sendLabel}
          >
            <SendHorizontal size={17} />
          </button>
        </div>
      </form>
    </section>
  );
}

function AgentRunInlineTrace({
  run,
}: {
  run: NonNullable<ResearchChatViewMessage["agentRun"]>;
}) {
  return (
    <details
      className="group mt-2 max-w-full rounded-md border bg-background text-left"
      open={run.statusTone === "warning"}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <CircleDot className="size-3.5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              Agent
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {run.summaryLabel}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AgentInlineStatusBadge label={run.statusLabel} tone={run.statusTone} />
          <span className="text-[11px] text-muted-foreground">
            {run.durationLabel}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t px-3 py-2">
        <div className="grid gap-1.5 text-[11px] leading-5 text-muted-foreground sm:grid-cols-3">
          {run.metadata.map((item) => (
            <div key={item.label} className="min-w-0">
              <span>{item.label}: </span>
              <span className="break-words font-medium text-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
        {run.error ? (
          <p className="mt-2 rounded-sm border border-amber-200 bg-[oklch(0.965_0.03_85)] px-2 py-1.5 text-[11px] leading-5 text-[oklch(0.38_0.07_65)]">
            {run.error}
          </p>
        ) : null}
        {run.steps.length > 0 ? (
          <div className="mt-2 divide-y rounded-md border">
            {run.steps.map((step) => (
              <div
                key={step.id}
                className="px-2 py-1.5 text-[11px]"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <span className="truncate font-medium text-foreground">
                    {step.label}
                  </span>
                  <span className="text-muted-foreground">
                    {step.statusLabel} · {step.durationLabel}
                  </span>
                </div>
                {step.summary ? (
                  <p className="mt-1 line-clamp-2 leading-5 text-muted-foreground">
                    {step.summary}
                  </p>
                ) : null}
                {step.details.length > 0 ? (
                  <dl className="mt-1 grid gap-x-3 gap-y-1 leading-5 text-muted-foreground sm:grid-cols-2">
                    {step.details.slice(0, 4).map((detail) => (
                      <div key={`${step.id}-${detail.label}`} className="min-w-0">
                        <dt className="inline">{detail.label}: </dt>
                        <dd className="inline break-words font-medium text-foreground">
                          {detail.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </details>
  );
}

function AgentInlineStatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "success" | "warning";
}) {
  const className =
    tone === "success"
      ? "border-[oklch(0.82_0.04_155)] bg-[oklch(0.965_0.026_155)] text-[oklch(0.34_0.065_155)]"
      : tone === "warning"
        ? "border-[oklch(0.82_0.04_85)] bg-[oklch(0.965_0.03_85)] text-[oklch(0.38_0.07_65)]"
        : "border-border bg-muted/30 text-muted-foreground";

  return (
    <span className={`rounded-sm border px-1.5 py-0.5 text-[11px] ${className}`}>
      {label}
    </span>
  );
}
