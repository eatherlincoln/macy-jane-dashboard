import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/publicDashboard";
import { supabase } from "@supabaseClient";

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

    (async () => {
      try {
        const payload = await fetchDashboardData();
        if (!alive) return;
        const list = payload?.top_posts?.instagram ?? [];
        if (Array.isArray(list) && list.length) {
          setPosts(list as InstagramPost[]);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error fetching Instagram posts via edge:", err);
      }

      // fallback: fetch directly from top_posts table
      try {
        const { data, error } = await supabase
          .from("top_posts")
          .select("*")
          .eq("platform", "instagram")
          .order("rank", { ascending: true });
        if (error) throw error;
        if (alive) setPosts((data as any) || []);
      } catch (err) {
        console.error("Fallback top_posts fetch failed", err);
        if (alive) setPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { posts, loading };
}
