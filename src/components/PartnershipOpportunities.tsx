import React from "react";

const opportunities = [
  {
    title: "Content Collaborations",
    body:
      "Surf, lifestyle and travel content with your brand woven naturally into Macy’s world — from Gold Coast sessions to road trips, events and Cinca Tequila moments."
  },
  {
    title: "Brand Ambassador",
    body:
      "Ongoing partnerships that put your products in Macy’s everyday life — boards, wetsuits, apparel, accessories, wellness, food and beverage."
  },
  {
    title: "Event & Travel Integration",
    body:
      "Tap into shoots, premieres, festivals and surf trips to position your brand in premium, sun-soaked, culturally relevant moments across Australia and beyond."
  },
  {
    title: "Custom Campaigns",
    body:
      "Built-for-you campaigns around launches, women’s surf, youth markets or coastal lifestyle — combining Macy’s CT experience, free-surf profile and entrepreneurial story."
  }
];

const chips = [
  "High-impact free-surfing",
  "Gold Coast reach",
  "Purposeful storytelling",
  "Launch-ready content"
];

export default function PartnershipOpportunities() {
  return (
    <section className="mt-10 sm:mt-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-teal-500 to-emerald-400 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_30%)]" />
        <div className="relative mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Partnership Opportunities
            </h2>
            <p className="mt-3 text-base text-white/90 sm:text-lg">
              Partner with Macy Callaghan — a former Championship Tour surfer
              turned high-impact free-surfer with serious competitive pedigree.
              Born in Avoca Beach and now based on the Gold Coast, Macy blends
              polished rail power with smart, strategic surfing and a big,
              infectious personality. From tour results to tequila launches, she
              connects with audiences who love surf, travel and good times.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            {opportunities.map((item, idx) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm sm:px-6"
              >
                <h3 className="text-lg font-semibold">
                  {idx + 1}. {item.title}
                </h3>
                <p className="mt-2 text-sm text-white/90 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
