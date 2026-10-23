import React from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import {
  LandingHeader,
  LandingHero,
  LandingTrustedBy,
  LandingFeatures,
  LandingSetup,
  LandingTestimonials,
  LandingWhySwitch,
  LandingPricing,
  LandingCTA,
  LandingFooter,
} from "@/components/landing";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/20 selection:text-sky-100">
      <LandingHeader />

      <main className="flex-1">
        <LandingHero />
        <LandingTrustedBy />

        <LandingSetup />

        <LandingWhySwitch />

        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
