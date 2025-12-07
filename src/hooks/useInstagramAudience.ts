import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/publicDashboard";

export function useInstagramAudience() {
  const [audience, setAudience] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchDashboardData()
      .then((payload) => {
        if (!alive) return;
        setAudience(payload?.audience ?? null);
      })
      .catch((err) => {
        console.error("Failed to load audience", err);
        if (alive) setAudience(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { audience, loading };
}
