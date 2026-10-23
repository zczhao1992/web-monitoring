import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingCTA() {
  const t = useTranslations("CTA");

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-50">
          {t("title")} <br />
          {t("titleLine2")}
        </h2>
        <p className="mt-6 text-sm sm:text-base text-slate-400">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-sky-500/90 px-6 py-3 text-sm font-semibold tracking-tight text-slate-950 shadow-sm hover:bg-sky-400 transition-colors"
          >
            {t("getStarted")}
          </Link>
        </div>
      </div>
    </section>
  );
}
