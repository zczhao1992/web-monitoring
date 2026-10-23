"use client";

import Image from "next/image";
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo from "../common/logo";
import { LocaleSwitcher } from "../common/locale-switcher";
import { useClerk, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingHeader() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const t = useTranslations("Header");

  if (!isLoaded) {
    return null;
  }

  const logoutHanlder = async () => {
    await signOut();
  };
  return (
    <>
      <header className="w-full border-b border-slate-900/80 backdrop-blur-sm sticky top-0 z-50 bg-slate-950/80">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 py-3 px-4 sm:px-6 lg:px-8">
          <Link href="/#" className="flex items-center gap-1">
            <Logo />
          </Link>

          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-sky-500/10 text-sky-200 font-medium border border-sky-500/40">
                        <Image
                          src={user ? user?.imageUrl : ""}
                          alt={"User"}
                          width={32}
                          height={32}
                          className="rounded-full ring-1 ring-slate-700"
                        />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-slate-900 border-slate-800"
                  align="end"
                >
                  <Link href={"http://localhost:3001"} target="__blank">
                    <DropdownMenuItem className="text-slate-200 hover:bg-slate-800! hover:text-white">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t("userMenu.dashboard")}
                    </DropdownMenuItem>
                  </Link>
                  <Link href={"http://localhost:3001/settings"}>
                    <DropdownMenuItem className="text-slate-200 hover:bg-slate-800! hover:text-white">
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t("userMenu.billing")}
                    </DropdownMenuItem>
                  </Link>
                  <Link
                    href={"http://localhost:3001/settings"}
                    target="__blank"
                  >
                    <DropdownMenuItem className="text-slate-200 hover:bg-slate-800! hover:text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      {t("userMenu.settings")}
                    </DropdownMenuItem>
                  </Link>
                  <Link href={"mailto:contact@oneminutelogs.com"}>
                    <DropdownMenuItem className="text-slate-200 hover:bg-slate-800! hover:text-white">
                      <LifeBuoy className="mr-2 h-4 w-4" />
                      {t("userMenu.support")}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-red-500/10!"
                    onClick={() => logoutHanlder()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("userMenu.logOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href={"/sign-in"}
                  className="hidden cursor-pointer sm:inline-flex items-center rounded-sm border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium tracking-tight text-slate-100 hover:border-slate-600 hover:bg-slate-900 transition-colors"
                >
                  {t("logIn")}
                </Link>
                <Link
                  href={"/sign-up"}
                  className="inline-flex cursor-po items-center rounded-sm bg-sky-500/90 px-3.5 py-1.5 text-xs font-semibold tracking-tight text-slate-950 shadow-sm hover:bg-sky-400 transition-colors"
                >
                  {t("getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
