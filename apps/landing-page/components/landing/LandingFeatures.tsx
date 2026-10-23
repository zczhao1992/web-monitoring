"use client";

import React from "react";
import { Zap, Search, Eye, FileJson } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const featureCards = [
  { key: "capture", icon: Zap, iconClass: "bg-sky-500/10", color: "text-sky-400" },
  {
    key: "search",
    icon: Search,
    iconClass: "bg-emerald-500/10",
    color: "text-emerald-400",
  },
  {
    key: "stream",
    icon: Eye,
    iconClass: "bg-pink-500/10",
    color: "text-pink-400",
  },
  {
    key: "alerts",
    icon: FileJson,
    iconClass: "bg-cyan-500/10",
    color: "text-cyan-400",
  },
] as const;

export function LandingFeatures() {
  const t = useTranslations("Features");

  return (
    <>
      {/* Founder's Story */}
      <section id="story" className="border-b border-slate-900/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-medium tracking-wide text-sky-400 uppercase mb-4">
              {t("story.eyebrow")}
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50 mb-6">
              {t("story.title")}
            </h2>
            <div className="space-y-5 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                {t.rich("story.paragraph1", {
                  strong: (chunks) => (
                    <span className="text-slate-100 font-medium">{chunks}</span>
                  ),
                })}
              </p>
              <p>{t("story.paragraph2")}</p>
              <p>{t("story.paragraph3")}</p>
              <p>{t("story.paragraph4")}</p>
              <p>{t("story.paragraph5")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-slate-900/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
                {t("section.title")}
              </h2>
            </div>
            <p className="max-w-md text-sm sm:text-base text-slate-300">
              {t("section.subtitle")}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {featureCards.map(({ key, icon: Icon, iconClass, color }) => (
              <motion.article
                key={key}
                variants={itemVariants}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 overflow-hidden flex flex-col hover:border-slate-700 transition-colors duration-300"
              >
                <div className="p-6 sm:p-8">
                  <div
                    className={`h-10 w-10 rounded-lg ${iconClass} flex items-center justify-center mb-5`}
                  >
                    <Icon className={`${color} h-5 w-5`} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-50 mb-2">
                    {t(`cards.${key}.title`)}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {t.rich(`cards.${key}.description`, {
                      code: (chunks) => (
                        <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">
                          {chunks}
                        </code>
                      ),
                    })}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
