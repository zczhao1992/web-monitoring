"use client";

import React from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const plans = [
  {
    key: "free",
    price: "$0",
    featured: false,
    features: ["logs", "retention", "search", "support", "webhooks", "api"],
  },
  {
    key: "starter",
    price: "$9.99",
    featured: true,
    features: ["logs", "retention", "search", "support", "webhooks", "api"],
  },
  {
    key: "pro",
    price: "$19.99",
    featured: false,
    features: ["logs", "retention", "alerts", "webhooks", "support", "api"],
  },
] as const;

export function LandingPricing() {
  const t = useTranslations("Pricing");

  return (
    <section id="pricing" className="border-b border-slate-900/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm text-slate-300">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.featured
                  ? "border-sky-500/30 bg-slate-950/90 relative shadow-[0_0_20px_-5px_rgba(14,165,233,0.15)]"
                  : "border-slate-800 bg-slate-950/80"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 -mt-3 mr-4">
                  <span className="bg-sky-500 text-slate-950 text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {t(`plans.${plan.key}.badge`)}
                  </span>
                </div>
              )}
              <div className="mb-4">
                <div
                  className={`text-xs font-medium tracking-wide uppercase ${
                    plan.featured ? "text-sky-400" : "text-slate-400"
                  }`}
                >
                  {t(`plans.${plan.key}.name`)}
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
                  {plan.price}
                  <span className="text-sm text-slate-500 font-normal">
                    {" "}
                    {t("perMonth")}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  {t(`plans.${plan.key}.description`)}
                </div>
              </div>
              <ul
                className={`mt-4 mb-6 space-y-3 text-sm ${
                  plan.featured ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check
                      className={`h-4 w-4 ${
                        plan.featured ? "text-sky-500" : "text-slate-600"
                      }`}
                      strokeWidth={1.5}
                    />
                    {t(`plans.${plan.key}.features.${feature}`)}
                  </li>
                ))}
              </ul>
              <Link
                href="#"
                className={`mt-auto w-full py-2 rounded-md text-xs transition-colors text-center ${
                  plan.featured
                    ? "bg-sky-500 font-bold text-slate-950 hover:bg-sky-400"
                    : "border border-slate-800 bg-slate-900 font-medium text-slate-300 hover:bg-slate-800"
                }`}
              >
                {t(`plans.${plan.key}.cta`)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
