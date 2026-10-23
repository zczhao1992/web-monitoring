"use client";

import React from "react";
// import { Twitter } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const people = [
  {
    key: "sarah",
    name: "Sarah Jenkins",
    handle: "@sarah_dev",
    initials: "SJ",
    avatar: "https://i.pravatar.cc/160?img=12",
  },
  {
    key: "mike",
    name: "Mike Chen",
    handle: "@mike_builds",
    initials: "MC",
    avatar: "https://i.pravatar.cc/160?img=15",
  },
  {
    key: "david",
    name: "David Ross",
    handle: "@dross_stack",
    initials: "DR",
    avatar: "https://i.pravatar.cc/160?img=20",
  },
  {
    key: "alex",
    name: "Alex Rivera",
    handle: "@arivera_ui",
    initials: "AR",
    avatar: "https://i.pravatar.cc/160?img=28",
  },
  {
    key: "emily",
    name: "Emily Zhang",
    handle: "@ezhang_code",
    initials: "EZ",
    avatar: "https://i.pravatar.cc/160?img=5",
  },
  {
    key: "james",
    name: "James Wilson",
    handle: "@jwilson_backend",
    initials: "JW",
    avatar: "https://i.pravatar.cc/160?img=33",
  },
  {
    key: "lisa",
    name: "Lisa Patel",
    handle: "@lpatel_cloud",
    initials: "LP",
    avatar: "https://i.pravatar.cc/160?img=8",
  },
  {
    key: "tom",
    name: "Tom Baker",
    handle: "@tbaker_ops",
    initials: "TB",
    avatar: "https://i.pravatar.cc/160?img=41",
  },
];

export function LandingTestimonials() {
  const t = useTranslations("Testimonials");
  const firstRow = people.slice(0, people.length / 2);
  const secondRow = people.slice(people.length / 2);

  return (
    <section className="border-b border-slate-900/80 bg-slate-950 overflow-hidden">
      <div className="py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-50 text-center mb-8 md:mb-16 px-4">
          {t("title")}
        </h2>

        <div className="group relative flex flex-col gap-6 mask-linear-fade w-[95%] md:w-[calc(100%-8rem)] mx-auto">
          {/* First Row - Left to Right */}
          <div className="flex overflow-hidden [--gap:1rem] md:[--gap:1.5rem] gap-(--gap)">
            <div className="flex shrink-0 justify-around gap-(--gap) animate-marquee animation-duration-[80s] flex-row group-hover:paused">
              {[...firstRow, ...firstRow].map((person, i) => (
                <TestimonialCard key={i} person={person} />
              ))}
            </div>
            <div
              className="flex shrink-0 justify-around gap-(--gap) animate-marquee animation-duration-[80s] flex-row group-hover:paused"
              aria-hidden="true"
            >
              {[...firstRow, ...firstRow].map((person, i) => (
                <TestimonialCard key={i} person={person} />
              ))}
            </div>
          </div>

          {/* Second Row - Right to Left (Reverse) */}
          <div className="flex overflow-hidden [--gap:1rem] md:[--gap:1.5rem] gap-(--gap)">
            <div className="flex shrink-0 justify-around gap-(--gap) animate-marquee-reverse animation-duration-[80s] flex-row group-hover:paused">
              {[...secondRow, ...secondRow].map((person, i) => (
                <TestimonialCard key={i} person={person} />
              ))}
            </div>
            <div
              className="flex shrink-0 justify-around gap-(--gap) animate-marquee-reverse animation-duration-[80s] flex-row group-hover:paused"
              aria-hidden="true"
            >
              {[...secondRow, ...secondRow].map((person, i) => (
                <TestimonialCard key={i} person={person} />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-slate-950"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-slate-950"></div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ person }: { person: (typeof people)[0] }) {
  const t = useTranslations("Testimonials.items");

  return (
    <div className="w-87.5 h-50 shrink-0 rounded-xl border border-slate-800 bg-slate-950/50 p-6 hover:border-slate-700 transition-colors duration-300 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-700">
            <Image
              src={person.avatar}
              alt={person.name}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">
              {person.name}
            </div>
            <div className="text-xs text-slate-500">{person.handle}</div>
          </div>
        </div>
        {/* <Twitter className="h-4 w-4 text-slate-600" /> */}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">
        {t(person.key)}
      </p>
    </div>
  );
}
