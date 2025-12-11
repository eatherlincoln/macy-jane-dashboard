import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/publicDashboard";
import { supabase } from "@supabaseClient";

export function useInstagramAudience() {
  const [audience, setAudience] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const payload = await fetchDashboardData();
        if (!alive) return;
        if (payload?.audience) {
          setAudience(payload.audience);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to load audience via edge", err);
      }

      // fallback: read from platform_audience
      try {
        const { data, error } = await supabase
          .from("platform_audience")
          .select("*")
          .eq("platform", "instagram")
          .maybeSingle();
        if (error) throw error;
        if (alive) setAudience((data as any) || null);
      } catch (err) {
        console.error("Fallback platform_audience fetch failed", err);
        if (alive) setAudience(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { audience, loading };
}
