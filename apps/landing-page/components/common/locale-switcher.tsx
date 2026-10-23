"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);

  const switchLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;
      setPendingLocale(nextLocale);
      router.replace(pathname, { locale: nextLocale });
    },
    [locale, pathname, router]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("label")}
          className="gap-1.5 text-slate-300 hover:bg-slate-900 hover:text-slate-50"
        >
          <Languages className="h-4 w-4" />
          <span className="text-xs font-medium">
            {locale === "zh" ? t("zh") : t("en")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-32 bg-slate-900 border-slate-800"
      >
        {routing.locales.map((item) => (
          <DropdownMenuItem
            key={item}
            disabled={pendingLocale !== null && pendingLocale !== item}
            onSelect={() => switchLocale(item)}
            className="text-slate-200 hover:bg-slate-800! hover:text-white"
          >
            {t(item)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
