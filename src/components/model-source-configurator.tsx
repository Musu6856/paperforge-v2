"use client";

import { KeyRound, LockKeyhole } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { getAppCopy } from "@/lib/app-language-copy";
import type { ModelSourceProvider, ModelSourceSettings } from "@/lib/types";

const PROVIDERS: { value: ModelSourceProvider; label: string; hintKey: "openaiHint" | "compatibleHint" }[] = [
  {
    value: "openai",
    label: "OpenAI",
    hintKey: "openaiHint",
  },
  {
    value: "openai-compatible",
    label: "OpenAI-compatible",
    hintKey: "compatibleHint",
  },
];

type OwnSettings = Extract<ModelSourceSettings, { source: "own" }>;

export function ModelSourceConfigurator({
  settings,
  onSettingsChange,
  compact = false,
  copy,
}: {
  settings: ModelSourceSettings;
  onSettingsChange: (settings: ModelSourceSettings) => void;
  compact?: boolean;
  copy?: ReturnType<typeof getAppCopy>["modelSource"];
}) {
  const labels = copy ?? {
    paperforgeTitle: "使用 PaperForge 提供的模型",
    paperforgeHint: "适合先试用完整流程。第一版不接入真实收费。",
    ownTitle: "使用自己的模型",
    ownHint: "API key 只保存在当前浏览器，服务端只保存脱敏配置。",
    providerFormat: "服务商格式",
    openaiHint: "使用 OpenAI 官方接口格式",
    compatibleHint: "DeepSeek、Qwen 等常见兼容接口",
    modelName: "模型名称",
    modelPlaceholder: "例如 gpt-5.2、claude-sonnet-4-5、deepseek-chat",
    baseUrlPlaceholder: "例如 https://api.deepseek.com/v1",
    apiKeyPlaceholder: "只保存在当前浏览器",
  };
  const ownSettings: OwnSettings =
    settings.source === "own"
      ? settings
      : {
          source: "own",
          provider: "openai-compatible",
          apiKey: "",
          model: "",
          baseUrl: "",
        };

  function updateOwn(patch: Partial<OwnSettings>) {
    onSettingsChange({ ...ownSettings, ...patch });
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <button
          type="button"
          onClick={() => onSettingsChange({ source: "paperforge" })}
          className="flex w-full items-start gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:border-primary/60 data-[active=true]:border-primary data-[active=true]:bg-accent/55"
          data-active={settings.source === "paperforge"}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <KeyRound className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold">
              {labels.paperforgeTitle}
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {labels.paperforgeHint}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSettingsChange(ownSettings)}
          className="flex w-full items-start gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:border-primary/60 data-[active=true]:border-primary data-[active=true]:bg-accent/55"
          data-active={settings.source === "own"}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
            <LockKeyhole className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold">{labels.ownTitle}</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {labels.ownHint}
            </span>
          </span>
        </button>
      </div>

      {settings.source === "own" && (
        <div className="space-y-4 rounded-lg border bg-background p-4">
          <div>
            <Label>{labels.providerFormat}</Label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.value}
                  type="button"
                  onClick={() => updateOwn({ provider: provider.value })}
                  className="rounded-md border px-3 py-3 text-left text-sm transition-colors hover:border-primary/60 data-[active=true]:border-primary data-[active=true]:bg-accent/55"
                  data-active={ownSettings.provider === provider.value}
                >
                  <span className="block font-medium">{provider.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {labels[provider.hintKey]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Field label={labels.modelName}>
            <Input
              value={ownSettings.model}
              onChange={(event) => updateOwn({ model: event.target.value })}
              placeholder={labels.modelPlaceholder}
              className="h-10"
            />
          </Field>

          {ownSettings.provider === "openai-compatible" && (
            <Field label="Base URL">
              <Input
                value={ownSettings.baseUrl ?? ""}
                onChange={(event) => updateOwn({ baseUrl: event.target.value })}
                placeholder={labels.baseUrlPlaceholder}
                className="h-10"
              />
            </Field>
          )}

          <Field label="API Key">
            <Input
              type="password"
              value={ownSettings.apiKey}
              onChange={(event) => updateOwn({ apiKey: event.target.value })}
              placeholder={labels.apiKeyPlaceholder}
              className="h-10"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
