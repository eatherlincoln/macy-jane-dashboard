import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/publicDashboard";
import { supabase } from "@supabaseClient";

type StatRow = {
  followers: number;
  monthly_views: number;
  engagement: number;
  updated_at: string | null;
  followers_delta?: number | null;
  monthly_views_delta?: number | null;
  engagement_delta?: number | null;
};

const empty: StatRow = {
  followers: 0,
  monthly_views: 0,
  engagement: 0,
  updated_at: null
};

export function useInstagramStats() {
  const [stats, setStats] = useState<StatRow>(empty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const payload = await fetchDashboardData();
        if (!alive) return;
        const row =
          (payload?.platform_stats || []).find(
            (r: any) => r.platform === "instagram"
          ) || null;

        if (row) {
          setStats({
            followers: Number(
              row.followers ?? row.follower_count ?? row.followers_count ?? 0
            ),
            monthly_views: Number(
              row.monthly_views ?? row.views ?? row.view_count ?? 0
            ),
            engagement: Number(row.engagement ?? row.engagement_rate ?? 0),
            followers_delta:
              typeof row.followers_delta === "number"
                ? row.followers_delta
                : null,
            monthly_views_delta:
              typeof row.views_delta === "number"
                ? row.views_delta
                : typeof row.monthly_views_delta === "number"
                  ? row.monthly_views_delta
                  : null,
            engagement_delta:
              typeof row.engagement_delta === "number"
                ? row.engagement_delta
              : null,
            updated_at: row.updated_at ?? null
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to load instagram stats via edge:", err);
      }

      // fallback: fetch directly from Supabase table
      try {
        const { data, error } = await supabase
          .from("platform_stats")
          .select("*")
          .eq("platform", "instagram")
          .maybeSingle();
        if (error) throw error;
        if (data) {
          if (!alive) return;
          setStats({
            followers: Number(
              data.followers ?? data.follower_count ?? data.followers_count ?? 0
            ),
            monthly_views: Number(
              data.monthly_views ?? data.views ?? data.view_count ?? 0
            ),
            engagement: Number(data.engagement ?? data.engagement_rate ?? 0),
            followers_delta: null,
            monthly_views_delta: null,
            engagement_delta: null,
            updated_at: data.updated_at ?? null
          });
        } else if (alive) {
          setStats(empty);
        }
      } catch (err) {
        console.error("Fallback platform_stats fetch failed", err);
        if (alive) setStats(empty);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { stats, loading };
}
