import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/publicDashboard";
import { supabase } from "@supabaseClient";

export function useBrandAssets() {
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const payload = await fetchDashboardData();
        if (!alive) return;
        if (payload?.assets && Object.keys(payload.assets).length) {
          setAssets(payload.assets);
          setLoading(false);
          return;
        }

        // Fallback: read directly from brand_assets table if edge function doesn't supply assets
        const { data, error } = await supabase
          .from("brand_assets")
          .select("key, value");
        if (error) {
          console.error("Fallback brand_assets fetch failed", error.message);
          if (alive) setAssets({});
          return;
        }
        const map: Record<string, string> = {};
        for (const row of data || []) {
          if (row.key) map[row.key] = row.value ?? "";
        }
        setAssets(map);
      } catch (err) {
        console.error("Failed to load assets", err);
        if (alive) setAssets({});
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { assets, loading };
}
