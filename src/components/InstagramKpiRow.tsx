import React from "react";
import KpiCard from "@/components/ui/KpiCard";
import { useInstagramStats } from "@/hooks";

export default function InstagramKpiRow() {
  const { stats, loading } = useInstagramStats();

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        followers={stats.followers}
        monthlyViews={stats.monthly_views}
        engagementPct={stats.engagement}
        followersDelta={stats.followers_delta}
        monthlyViewsDelta={stats.monthly_views_delta}
        engagementDelta={stats.engagement_delta}
        updatedAt={stats.updated_at}
        loading={loading}
      />
    </section>
  );
}
