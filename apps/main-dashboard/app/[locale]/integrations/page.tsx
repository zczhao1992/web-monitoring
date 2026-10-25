import React from "react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import NextJs from "../../../assets/frameworks/next-js.svg";
import ExpressJs from "../../../assets/frameworks/express-js.svg";
import NestJs from "../../../assets/frameworks/nest-js.png";
import RemixJs from "../../../assets/frameworks/remix-js.png";
import Django from "../../../assets/frameworks/django.svg";
import Flask from "../../../assets/frameworks/Flask.svg";

const integrations = [
  {
    id: "nextjs",
    name: "Next.js",
    descriptionKey: "nextjs",
    logo: NextJs,
    docsUrl: "https://oneminutelogs.com/docs/nextjs",
    available: true,
  },
  {
    id: "express",
    name: "Express.js",
    descriptionKey: "express",
    logo: ExpressJs,
    docsUrl: "https://oneminutelogs.com/docs/express",
    available: true,
  },
  {
    id: "nestjs",
    name: "NestJS",
    descriptionKey: "nestjs",
    logo: NestJs,
    docsUrl: "#",
    available: false,
  },
  {
    id: "remix",
    name: "Remix",
    descriptionKey: "remix",
    logo: RemixJs,
    docsUrl: "#",
    available: false,
  },
  {
    id: "django",
    name: "Django",
    descriptionKey: "django",
    logo: Django,
    docsUrl: "#",
    available: false,
  },
  {
    id: "flask",
    name: "Flask",
    descriptionKey: "flask",
    logo: Flask,
    docsUrl: "#",
    available: false,
  },
];

export default async function Page() {
  const t = await getTranslations("Integrations");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("description")}
        </p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {integrations.map((integration) => {
          if (integration.available) {
            return (
              <Link
                key={integration.id}
                href={integration.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="h-32 mb-2 rounded-lg border border-white/5 bg-white/4 px-5 py-4 transition-all duration-200 hover:border-[#00C2A8]/20 hover:bg-white/3 hover:shadow-md hover:shadow-[#00C2A8]/10">
                  <div className="flex flex-col h-full">
                    <div className="h-12 w-12 rounded-lg bg-white/90 border border-white/5 flex items-center justify-center p-2.5 mb-3">
                      <Image
                        src={integration.logo}
                        alt={`${integration.name} logo`}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white mb-0.5">
                        {integration.name}
                      </h3>
                      <p className="text-xs text-white/40 leading-tight">
                        {t(`frameworks.${integration.descriptionKey}`)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          }

          return (
            <div key={integration.id} className="group cursor-not-allowed">
              <div className="h-32 rounded-lg border border-white/5 bg-white/2 px-5 py-4 opacity-70">
                <div className="flex flex-col h-full">
                  <div
                    className={`h-12 w-12 rounded-lg border border-white/5 ${
                      integration.name === "Remix" ||
                      integration.name === "Django"
                        ? "bg-black/90"
                        : "bg-white"
                    } flex items-center justify-center p-2.5 mb-3`}
                  >
                    <Image
                      src={integration.logo}
                      alt={`${integration.name} logo`}
                      width={55}
                      height={55}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-0.5">
                      {integration.name}
                    </h3>
                    <p className="text-xs text-white/40 leading-tight">
                      {t("comingSoon")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
