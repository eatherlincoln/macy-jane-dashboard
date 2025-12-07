import React, { useMemo } from "react";
import { useInstagramStats, useBrandAssets } from "@/hooks";

const fallbackHero =
  "linear-gradient(135deg, rgba(236,72,153,0.9), rgba(59,130,246,0.9))";

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export default function Hero() {
  const { stats, loading } = useInstagramStats();
  const { assets } = useBrandAssets();

  const { monthlyViews, followers } = useMemo(() => {
    return {
      monthlyViews: stats.monthly_views || 0,
      followers: stats.followers || 0
    };
  }, [stats]);

  return (
    <section className="relative w-full">
      <div
        className="h-[360px] w-full bg-cover bg-center sm:h-[440px]"
        style={{
          backgroundImage: assets.hero
            ? `url('${assets.hero}')`
            : fallbackHero
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="absolute inset-0">
        <div className="mx-auto flex h-full max-w-content flex-col justify-end px-6 md:px-10">
          <div className="mb-5 md:mb-6">
            <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-sm md:text-5xl">
              {assets.hero_title || "Macy Jane"}
            </h1>
            <p className="mt-2 text-base text-white/90 drop-shadow-sm md:text-lg">
              {assets.hero_subtitle ||
                "Instagram-first creator storytelling through bold visuals."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pb-4 md:pb-6">
            <span className="rounded-full bg-black/60 px-5 py-2 text-sm font-semibold text-white shadow-lg">
              {loading ? "Loading…" : `${formatNumber(monthlyViews)} monthly views`}
            </span>
            <span className="rounded-full bg-black/60 px-5 py-2 text-sm font-semibold text-white shadow-lg">
              {loading ? "Loading…" : `${formatNumber(followers)} followers`}
            </span>
            <a
              href="/admin"
              className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-white/20"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
