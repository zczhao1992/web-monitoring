"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Settings as SettingsIcon } from "lucide-react";
import LocaleSwitcher from "./LocaleSwitcher";

export default function TopBar() {
  const t = useTranslations("TopBar");

  return (
    <div className="flex h-16 items-center gap-3 border-b pr-4">

      {/* Search + language + settings */}
      <div className="ml-auto flex w-full max-w-xl items-center gap-2">
        <div className="relative w-full">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-8 rounded-xl"
          />
        </div>
        <LocaleSwitcher />
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/10">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
