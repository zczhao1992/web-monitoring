import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
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

export const metadata: Metadata = {
  title: "前端监控平台",
  description: "前端错误监控平台",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <ClerkProvider ui={ui}>
        <html lang={locale} suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} antialiased`}
            suppressHydrationWarning
          >
            {children}
          </body>
        </html>
      </ClerkProvider>
    </NextIntlClientProvider>
  );
}
