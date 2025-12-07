import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/publicDashboard";

export function useBrandAssets() {
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchDashboardData()
      .then((payload) => {
        if (!alive) return;
        setAssets(payload?.assets || {});
      })
      .catch((err) => {
        console.error("Failed to load assets", err);
        if (alive) setAssets({});
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { assets, loading };
}
