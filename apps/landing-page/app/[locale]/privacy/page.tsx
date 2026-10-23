"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LandingHeader, LandingFooter } from "@/components/landing";

const listSectionKeys = ["collect", "usage", "choices"] as const;

type ListSectionKey = (typeof listSectionKeys)[number];

type TextSectionKey =
  | "overview"
  | "rights"
  | "cookies"
  | "retention"
  | "security"
  | "sharing"
  | "transfers"
  | "children"
  | "law"
  | "changes";

const ORDER: Array<TextSectionKey | ListSectionKey> = [
  "overview",
  "collect",
  "usage",
  "rights",
  "cookies",
  "retention",
  "security",
  "sharing",
  "transfers",
  "children",
  "law",
  "choices",
  "changes",
];

const isListSection = (key: TextSectionKey | ListSectionKey) =>
  (listSectionKeys as readonly string[]).includes(key);

export default function PrivacyPage() {
  const t = useTranslations("Privacy");

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/20 selection:text-sky-100">
      <LandingHeader />

      <main className="flex-1">
        <div className="md:w-[71%] w-[90%] mx-auto py-10 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {t("title")}
            </h1>
            <p className="text-white/60!">{t("subtitle")}</p>
            <p className="text-xs text-white/40!">{t("applies")}</p>
          </header>

          <section className="px-3 space-y-6">
            {ORDER.map((key) =>
              isListSection(key) ? (
                <div key={key} className="space-y-2">
                  <h2 className="text-lg font-semibold text-white">
                    {t(`sections.${key}.title`)}
                  </h2>
                  <ul className="list-disc pl-5 text-sm text-white/70! space-y-1">
                    <li>{t(`sections.${key}.item1`)}</li>
                    <li>{t(`sections.${key}.item2`)}</li>
                    <li>{t(`sections.${key}.item3`)}</li>
                    {key === "collect" || key === "usage" ? (
                      <li>{t(`sections.${key}.item4`)}</li>
                    ) : null}
                  </ul>
                </div>
              ) : (
                <div key={key} className="space-y-2">
                  <h2 className="text-lg font-semibold text-white">
                    {t(`sections.${key}.title`)}
                  </h2>
                  <p className="text-sm text-white/70!">
                    {t(`sections.${key}.body`)}
                  </p>
                </div>
              )
            )}
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
