import React from "react";
import {
  useBrandAssets,
  useInstagramTopPosts,
  useInstagramStats
} from "@/hooks";

export default function DebugPage() {
  const { assets, loading: assetsLoading } = useBrandAssets();
  const { posts, loading: postsLoading } = useInstagramTopPosts();
  const { stats, loading: statsLoading } = useInstagramStats();

  React.useEffect(() => {
    // Console visibility for quick diagnostics
    console.log("[debug] assets", assets);
    console.log("[debug] top_posts", posts);
    console.log("[debug] stats", stats);
  }, [assets, posts, stats]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-neutral-900">Debug</h1>
        <p className="text-sm text-neutral-600">
          Assets, top posts, and stats as seen by the public frontend.
        </p>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Brand assets</h2>
          <span className="text-xs text-neutral-500">
            {assetsLoading ? "Loading…" : "Loaded"}
          </span>
        </div>
        <DebugRow label="hero">{assets.hero}</DebugRow>
        {assets.hero ? (
          <img
            src={assets.hero}
            alt="hero preview"
            className="mt-2 h-32 w-full rounded-lg object-cover ring-1 ring-black/5"
          />
        ) : null}
        <DebugRow label="profile">{assets.profile}</DebugRow>
        {assets.profile ? (
          <img
            src={assets.profile}
            alt="profile preview"
            className="mt-2 h-24 w-24 rounded-full object-cover ring-1 ring-black/5"
          />
        ) : null}
        <DebugRow label="about_title">{assets.about_title}</DebugRow>
        <DebugRow label="about_body">{assets.about_body}</DebugRow>
        <DebugRow label="hero_title">{assets.hero_title}</DebugRow>
        <DebugRow label="hero_subtitle">{assets.hero_subtitle}</DebugRow>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Top posts</h2>
          <span className="text-xs text-neutral-500">
            {postsLoading ? "Loading…" : `Loaded (${posts.length})`}
          </span>
        </div>
        <pre className="overflow-auto rounded-lg bg-neutral-50 p-3 text-xs text-neutral-800">
          {JSON.stringify(posts, null, 2)}
        </pre>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {posts.map((p) => (
            <div key={p.rank} className="space-y-1 rounded-lg border p-2">
              <p className="text-xs font-semibold text-neutral-700">
                #{p.rank} {p.caption || ""}
              </p>
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.caption || "post"}
                  className="h-24 w-full rounded-md object-cover ring-1 ring-black/5"
                />
              ) : (
                <p className="text-[11px] text-neutral-500">No image_url</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Stats</h2>
          <span className="text-xs text-neutral-500">
            {statsLoading ? "Loading…" : "Loaded"}
          </span>
        </div>
        <pre className="overflow-auto rounded-lg bg-neutral-50 p-3 text-xs text-neutral-800">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </section>
    </div>
  );
}

function DebugRow({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-28 shrink-0 font-medium text-neutral-700">{label}</span>
      <span className="break-all text-neutral-800">{children || <em className="text-neutral-500">null</em>}</span>
    </div>
  );
}
