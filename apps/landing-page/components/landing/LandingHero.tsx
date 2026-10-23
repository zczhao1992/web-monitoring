"use client";

import React, { useState, useEffect } from "react";
import { Check, ArrowRight, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type LogSnippet = {
  time: string;
  level: "INFO" | "DEBUG" | "WARN" | "ERROR";
  messageKey: string;
  color: string;
};

const LOG_LEVEL_COLORS: Record<LogSnippet["level"], string> = {
  INFO: "text-sky-400",
  DEBUG: "text-emerald-400",
  WARN: "text-amber-400",
  ERROR: "text-rose-400",
};

const LOG_SNIPPETS: LogSnippet[] = [
  { time: "12:16:24", level: "INFO", messageKey: "signedIn" },
  { time: "12:16:25", level: "DEBUG", messageKey: "cacheHit" },
  { time: "12:16:26", level: "INFO", messageKey: "dashboardRendered" },
  { time: "12:16:28", level: "WARN", messageKey: "rateLimit" },
  { time: "12:16:29", level: "INFO", messageKey: "webhookReceived" },
  { time: "12:16:31", level: "ERROR", messageKey: "syncFailed" },
].map((log) => ({
  ...log,
  level: log.level as LogSnippet["level"],
  color: LOG_LEVEL_COLORS[log.level as LogSnippet["level"]],
}));

export function LandingHero() {
  const t = useTranslations("Hero");
  const tLogs = useTranslations("Hero.logs");
  const [logs, setLogs] = useState(LOG_SNIPPETS.slice(0, 3));
  const METRIC_REFRESH_SECONDS = 4;
  const [requestsPerMin, setRequestsPerMin] = useState(842);
  const [avgLatencyMs, setAvgLatencyMs] = useState(29);

  useEffect(() => {
    const interval = setInterval(() => {
      setRequestsPerMin((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10;
        const next = prev + delta;
        return Math.max(780, Math.min(980, next));
      });
      setAvgLatencyMs((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return Math.max(20, Math.min(50, next));
      });
    }, METRIC_REFRESH_SECONDS * 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live logs
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextIndex =
          (LOG_SNIPPETS.indexOf(prev[prev.length - 1]) + 1) %
          LOG_SNIPPETS.length;
        const newLog = LOG_SNIPPETS[nextIndex];
        // Keep only last 3 logs
        return [...prev.slice(1), newLog];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: t("panel.metrics.errors"),
      value: "0",
      status: t("panel.metrics.allClear"),
      color: "text-emerald-400",
    },
    {
      label: t("panel.metrics.requests"),
      value: requestsPerMin.toLocaleString(),
      unit: "/m",
      status: t("panel.metrics.streamingIn"),
      color: "text-sky-400",
    },
    {
      label: t("panel.metrics.avgLatency"),
      value: avgLatencyMs,
      unit: "ms",
      status:
        avgLatencyMs < 35
          ? t("panel.metrics.feelsFast")
          : t("panel.metrics.watchLatency"),
      color: avgLatencyMs < 35 ? "text-emerald-400" : "text-amber-400",
    },
  ];

  return (
    <section className="relative border-b border-slate-900/80 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center relative z-10">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-xs font-medium text-sky-400 mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            {t("badge")}
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-50 leading-[1.1] mb-6">
            {t("titleLine1")} <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-emerald-400">
              {t("titleHighlight")}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed mb-8">
            {t("subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link href="/dashboard/overview">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 py-3 text-sm font-bold tracking-tight text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-colors"
              >
                {t("getStarted")} <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-emerald-500/10">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span>{t("bullets.free")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-sky-500/10">
                <Check className="h-3 w-3 text-sky-400" />
              </div>
              <span>{t("bullets.noCard")}</span>
            </div>
          </div>
        </motion.div>

        {/* Right metrics panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative group"
        >
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium tracking-tight text-slate-200">
                  {t("panel.liveProduction")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[0.65rem] text-slate-400 font-mono">
                  us-east-1
                </div>
              </div>
            </div>

            {/* Simple Metrics */}
            <div className="grid grid-cols-3 gap-px bg-slate-800/50 border-b border-slate-800/70">
              {metrics.map((metric, i) => (
                <div
                  key={i}
                  className="bg-slate-950/80 p-5 hover:bg-slate-900/80 transition-colors"
                >
                  <div className="text-[0.65rem] uppercase tracking-wide text-slate-500 font-semibold mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xl font-bold tracking-tight text-50">
                    {metric.value}
                    {metric.unit && (
                      <span className="text-sm text-slate-500 font-medium ml-0.5">
                        {metric.unit}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[0.65rem] ${metric.color} mt-1 font-medium`}
                  >
                    {metric.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Live logs snippet */}
            <div className="bg-slate-950 p-4 min-h-45 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-medium text-slate-400">
                  {t("panel.liveStream")}
                </span>
              </div>

              <div className="flex-1 space-y-3 font-mono text-[0.7rem] overflow-hidden relative">
                {/* Gradient overlay for fade out */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-slate-950 to-transparent z-10 pointer-events-none"></div>

                <AnimatePresence mode="popLayout">
                  {logs.map((log) => (
                    <motion.div
                      key={log.time + log.messageKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-3 items-baseline group/log"
                    >
                      <span className="text-slate-600 shrink-0">
                        {log.time}
                      </span>
                      <span className={`font-bold shrink-0 w-10 ${log.color}`}>
                        {log.level}
                      </span>
                      <span className="text-slate-300 truncate group-hover/log:text-slate-100 transition-colors">
                        {tLogs(log.messageKey)}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 text-[0.65rem] text-slate-500 flex items-center justify-between">
                <span>{t("panel.hint")}</span>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-800 animate-pulse"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-800 animate-pulse delay-75"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-800 animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
