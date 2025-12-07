import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/publicDashboard";

export type InstagramPost = {
  rank: number;
  url: string;
  caption?: string | null;
  image_url?: string | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  updated_at?: string | null;
};

export function useInstagramTopPosts() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchDashboardData()
      .then((payload) => {
        if (!alive) return;
        const list = payload?.top_posts?.instagram ?? [];
        setPosts(list as InstagramPost[]);
      })
      .catch((err) => {
        console.error("Error fetching Instagram posts:", err);
        if (alive) setPosts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { posts, loading };
}
