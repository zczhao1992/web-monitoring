"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LandingHeader, LandingFooter } from "@/components/landing";

const listSectionKeys = [
  "accounts",
  "use",
  "billing",
  "ownership",
  "warranties",
] as const;

type TextSectionKey =
  | "acceptance"
  | "termination"
  | "law"
  | "changes";

type ListSectionKey = (typeof listSectionKeys)[number];

const ORDER: Array<TextSectionKey | ListSectionKey> = [
  "acceptance",
  "accounts",
  "use",
  "billing",
  "ownership",
  "termination",
  "warranties",
  "law",
  "changes",
];

const isListSection = (key: TextSectionKey | ListSectionKey) =>
  (listSectionKeys as readonly string[]).includes(key);

export default function TermsPage() {
  const t = useTranslations("Terms");

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/20 selection:text-sky-100">
      <LandingHeader />

      <main className="flex-1">
        <div className="md:w-[71%] w-[90%] mx-auto py-8 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {t("title")}
            </h1>
            <p className="text-white/60! pb-2">{t("subtitle")}</p>
          </header>

          <section className="grid">
            {ORDER.map((key) => (
              <div key={key} className="px-6 pb-4">
                <h2 className="text-lg font-semibold text-white">
                  {t(`sections.${key}.title`)}
                </h2>
                {isListSection(key) ? (
                  <ul className="list-disc pl-5 text-sm text-white/70 space-y-2">
                    <li>{t(`sections.${key}.item1`)}</li>
                    <li>{t(`sections.${key}.item2`)}</li>
                    <li>{t(`sections.${key}.item3`)}</li>
                  </ul>
                ) : (
                  <p className="text-sm text-white/70!">
                    {t(`sections.${key}.body`)}
                  </p>
                )}
              </div>
            ))}
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
