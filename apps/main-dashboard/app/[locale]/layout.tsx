import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSidebar from "@/components/dashboard/SidebarNav";
import { SidebarInset } from "@/components/ui/sidebar";
import TopBar from "@/components/dashboard/TopBar";
import QueryProvider from "@/providers/query-provider";
import { routing } from "@/i18n/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const satoshi = localFont({
  src: "../../assets/fonts/Satoshi-Bold.otf",
  variable: "--font-satoshi",
  weight: "700",
});

type Props = {
  children: React.ReactNode;
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

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <ClerkProvider ui={ui}>
      <html lang={locale} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} antialiased`}
          suppressHydrationWarning
        >
          <NextIntlClientProvider>
            <TooltipProvider>
              <QueryProvider>
                <DashboardSidebar>
                  <SidebarInset>
                    <TopBar />
                    <div className="py-4 pr-4">
                      <div className="mx-auto max-w-7xl">{children}</div>
                    </div>
                  </SidebarInset>
                </DashboardSidebar>
              </QueryProvider>
            </TooltipProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
