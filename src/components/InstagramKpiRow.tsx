import React, { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useInstagramStats, useInstagramTopPosts } from "@/hooks";

function formatNumber(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "–";
  return Number(n).toLocaleString();
}

export default function InstagramKpiRow() {
  const { stats, loading: statsLoading } = useInstagramStats();
  const { posts, loading: postsLoading } = useInstagramTopPosts();

  const postLikeData = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];
    const likes = list
      .map((p) => (typeof p.likes === "number" ? p.likes : null))
      .filter((v): v is number => v !== null);
    const interactions = list.reduce((sum, p) => {
      const l = typeof p.likes === "number" ? p.likes : 0;
      const c = typeof p.comments === "number" ? p.comments : 0;
      const s = typeof p.shares === "number" ? p.shares : 0;
      return sum + l + c + s;
    }, 0);
    if (!likes.length) {
      return { avgLikes: null, totalInteractions: interactions };
    }
    const avgLikes = Math.round(
      likes.reduce((sum, val) => sum + val, 0) / Math.max(1, likes.length)
    );
    return { avgLikes, totalInteractions: interactions };
  }, [posts]);

  const computedAccountEngagement = useMemo(() => {
    const denom =
      stats.monthly_views && stats.monthly_views > 0
        ? stats.monthly_views
        : stats.followers && stats.followers > 0
          ? stats.followers
          : null;
    if (!denom) return null;
    const { totalInteractions } = postLikeData;
    if (totalInteractions <= 0) return null;
    return (totalInteractions / denom) * 100;
  }, [postLikeData, stats.followers, stats.monthly_views]);

  const monthlyGrowthPct =
    stats.monthly_views_delta ?? stats.followers_delta ?? null;

  const cards = [
    {
      label: "Total Followers",
      value: formatNumber(stats.followers)
    },
    {
      label: "Engagement Rate",
      value:
        computedAccountEngagement != null
          ? `${computedAccountEngagement.toFixed(2)}%`
          : stats.engagement || stats.engagement === 0
            ? `${stats.engagement.toFixed(2)}%`
            : "–"
    },
    {
      label: "Average Likes (30 days)",
      value: formatNumber(postLikeData.avgLikes)
    },
    {
      label: "Monthly Growth",
      value:
        monthlyGrowthPct || monthlyGrowthPct === 0
          ? `${monthlyGrowthPct.toFixed(2)}%`
          : "–",
      trendPositive: typeof monthlyGrowthPct === "number" && monthlyGrowthPct > 0
    }
  ];

  const isLoading = statsLoading || postsLoading;

  return (
    <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm"
        >
          <p className="text-sm font-semibold text-neutral-600">{card.label}</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-bold text-neutral-900">
              {isLoading ? "…" : card.value}
            </p>
            {card.trendPositive && !isLoading ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : null}
          </div>
          {card.label === "Engagement Rate" && (
            <p className="text-xs text-neutral-400">(by reach)</p>
          )}
        </div>
      ))}
    </section>
  );
}
