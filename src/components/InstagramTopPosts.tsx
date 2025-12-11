import React from "react";
import { Heart, MessageCircle, Share2, Instagram, Activity } from "lucide-react";
import { useInstagramTopPosts } from "@/hooks";

function k(n: number | null | undefined) {
  if (n == null) return "0";
  if (n >= 1000) return `${Math.round(n / 100) / 10}K`;
  return String(n);
}

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect fill='%23fce7f3' width='600' height='600'/%3E%3Ctext x='50%25' y='52%25' dominant-baseline='middle' text-anchor='middle' fill='%23be185d' font-size='48' font-family='Arial, sans-serif'%3EMacy%20Jane%3C/text%3E%3C/svg%3E";

export default function InstagramTopPosts() {
  const { posts, loading } = useInstagramTopPosts();

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading…</p>;
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-neutral-500">
        <div className="mb-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-neutral-50">
          <Instagram size={14} className="text-pink-600" />
        </div>
        No Instagram posts yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((p, i) => {
          const reach =
            typeof p.reach === "number"
              ? p.reach
              : typeof p.impressions === "number"
                ? p.impressions
                : null;
          const saves = typeof p.saves === "number" ? p.saves : 0;
          const interactions =
            (typeof p.likes === "number" ? p.likes : 0) +
            (typeof p.comments === "number" ? p.comments : 0) +
            (typeof p.shares === "number" ? p.shares : 0) +
            saves;
          const engagementRate =
            reach && reach > 0 ? (interactions / reach) * 100 : null;
          const hasImg =
            typeof p.image_url === "string" && p.image_url.trim().length > 0;
          const src = hasImg
            ? p.updated_at
              ? `${p.image_url}${
                  p.image_url.includes("?") ? "&" : "?"
                }v=${new Date(p.updated_at).getTime()}`
              : p.image_url
            : fallbackImage;

          return (
            <a
              key={`${p.rank}-${i}`}
              href={p.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md"
            >
              <article>
                <div className="relative w-full">
                  <img
                    src={src}
                    alt={p.caption || "Instagram post"}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      if (e.currentTarget.dataset.fbk) return;
                      e.currentTarget.dataset.fbk = "1";
                      e.currentTarget.src = fallbackImage;
                    }}
                    loading="lazy"
                  />
                </div>

                <footer className="flex justify-around text-xs p-2 text-neutral-600">
                  <span className="inline-flex items-center gap-1">
                    <Heart size={14} /> {k(p.likes)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={14} /> {k(p.comments)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Share2 size={14} /> {k(p.shares)}
                  </span>
                  {engagementRate != null ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-700">
                      <Activity size={13} />
                      {engagementRate.toFixed(2)}% ERR
                    </span>
                  ) : null}
                </footer>
              </article>
            </a>
          );
        })}
      </div>

      <Aggregates posts={posts} />
    </div>
  );
}

function Aggregates({ posts }: { posts: any[] }) {
  const totals = posts.reduce(
    (acc, p) => {
      const likes = typeof p.likes === "number" ? p.likes : 0;
      const comments = typeof p.comments === "number" ? p.comments : 0;
      const shares = typeof p.shares === "number" ? p.shares : 0;
      const saves = typeof p.saves === "number" ? p.saves : 0;
      acc.likes += likes;
      acc.comments += comments;
      acc.shares += shares;
      acc.saves += saves;
      return acc;
    },
    { likes: 0, comments: 0, shares: 0, saves: 0 }
  );

  const avgLikes =
    posts.length > 0 ? Math.round(totals.likes / Math.max(posts.length, 1)) : 0;
  const commentsRatio =
    totals.likes > 0 ? (totals.comments / totals.likes) * 100 : 0;

  const fmt = (n: number) => {
    if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const items = [
    { label: "Total Likes (30d)", value: fmt(totals.likes), color: "text-sky-700" },
    { label: "Total Comments (30d)", value: fmt(totals.comments), color: "text-cyan-600" },
    { label: "Total Shares (30d)", value: fmt(totals.shares), color: "text-emerald-600" },
    { label: "Total Saves (30d)", value: fmt(totals.saves), color: "text-amber-600" },
    { label: "Avg Likes", value: fmt(avgLikes), color: "text-emerald-600" },
    { label: "Comments Ratio", value: `${commentsRatio.toFixed(2)}%`, color: "text-amber-600" }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 border-t pt-4 text-center text-sm text-neutral-600 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className={`text-lg font-semibold ${item.color}`}>{item.value}</div>
          <div className="text-xs text-neutral-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
