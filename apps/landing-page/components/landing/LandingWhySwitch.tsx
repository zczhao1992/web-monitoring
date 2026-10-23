"use client";

import React from "react";
import {
  X as XIcon,
  Check,
  Layers,
  Wrench,
  Hourglass,
  FileText,
  Wallet,
  Zap,
  Search,
  LayoutDashboard,
  FileJson,
  BadgeDollarSign,
} from "lucide-react";
import { useTranslations } from "next-intl";

const withoutItems = [
  { key: "dashboards", icon: Layers },
  { key: "hardSetup", icon: Wrench },
  { key: "slowSearch", icon: Hourglass },
  { key: "yaml", icon: FileText },
  { key: "cost", icon: Wallet },
] as const;

const withItems = [
  { key: "setup", icon: Zap },
  { key: "search", icon: Search },
  { key: "simple", icon: FileJson },
  { key: "pricing", icon: BadgeDollarSign },
  { key: "dashboard", icon: LayoutDashboard },
  { key: "alerts", icon: Wrench },
] as const;

export function LandingWhySwitch() {
  const t = useTranslations("WhySwitch");

  return (
    <section className="border-b border-slate-900/80 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            {t("subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Without */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 sm:p-7 hover:border-slate-700 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-full bg-slate-900 flex items-center justify-center">
                <XIcon className="h-3.5 w-3.5 text-rose-400" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-100">
                {t("without.title")}
              </span>
            </div>
            <ul className="space-y-3 text-sm text-slate-400">
              {withoutItems.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-start gap-2">
                  <Icon className="h-4 w-4 mt-0.5 text-slate-600" />
                  <span>{t(`without.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* With */}
          <div className="rounded-2xl border border-sky-500/30 bg-slate-950/90 p-6 sm:p-7 shadow-[0_0_20px_-5px_rgba(56,189,248,0.18)] hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)] hover:border-sky-500/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-full bg-sky-500/10 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-100">
                {t("with.title")}
              </span>
            </div>
            <ul className="space-y-3 text-sm text-slate-200">
              {withItems.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-start gap-2">
                  <Icon className="h-4 w-4 mt-0.5 text-sky-400" />
                  <span>{t(`with.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
