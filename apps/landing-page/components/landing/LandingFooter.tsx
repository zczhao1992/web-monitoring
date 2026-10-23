import React from "react";
import Logo from "../common/logo";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LandingFooter() {
  const t = useTranslations("Footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-900/80 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Link href={"/#"} className="flex items-center">
              <Logo className="h-8 w-8" textClassName="text-[24px]" />
            </Link>
          </div>

          <div className="flex gap-8 text-xs text-slate-500">
            <Link
              href="https://github.com/one-minute-stack"
              target="_blank"
              className="hover:text-slate-300 transition-colors"
            >
              {t("links.github")}
            </Link>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={"#"}
                  // target="_blank"
                  className="flex items-center gap-2"
                >
                  <div className="relative flex h-2 w-2 cursor-pointer">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {t("operational")}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("live")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[0.7rem] text-slate-600">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div>{t("copyright", { year: currentYear })}</div>
            <div className="hidden sm:block text-slate-800">•</div>
            <div className="flex items-center gap-1">
              {t.rich("builtWith", {
                heart: (chunks) => (
                  <span className="text-red-500 mx-1">{chunks}</span>
                ),
              })}
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-400">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-slate-400">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
