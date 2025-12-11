import React, { useEffect, useState } from "react";
import { invalidateDashboardCache } from "@/lib/publicDashboard";
import { supabase } from "@supabaseClient";

type PostRow = {
  url: string;
  caption: string;
  image_url: string;
  likes: string;
  comments: string;
  shares: string;
};

const RANKS = [1, 2, 3, 4];

const emptyRow = (): PostRow => ({
  url: "",
  caption: "",
  image_url: "",
  likes: "",
  comments: "",
  shares: ""
});

export default function TopPostsForm() {
  const [rows, setRows] = useState<Record<number, PostRow>>({
    1: emptyRow(),
    2: emptyRow(),
    3: emptyRow(),
    4: emptyRow()
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("top_posts")
        .select("*")
        .eq("platform", "instagram")
        .order("rank", { ascending: true });

      if (!alive) return;
      if (error) {
        console.error("Fetch top_posts error", error.message);
      } else if (data) {
        const next = { ...rows };
        for (const r of data) {
          const rank = Number(r.rank);
          if (!RANKS.includes(rank)) continue;
          next[rank] = {
            url: r.url ?? "",
            caption: r.caption ?? "",
            image_url: r.image_url ?? "",
            likes: toStringSafe(r.likes),
            comments: toStringSafe(r.comments),
            shares: toStringSafe(r.shares)
          };
        }
        setRows(next);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (rank: number, key: keyof PostRow, value: string) =>
    setRows((prev) => ({ ...prev, [rank]: { ...prev[rank], [key]: value } }));

  const uploadThumbnail = async (rank: number, file: File) => {
    setMsg(null);
    setUploading((prev) => ({ ...prev, [rank]: true }));
    try {
      const ext = file.name.split(".").pop();
      const path = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-thumbnails")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("post-thumbnails").getPublicUrl(path);
      if (data?.publicUrl) {
        setField(rank, "image_url", data.publicUrl);
        setMsg(`Uploaded thumbnail for post #${rank}`);
      }
    } catch (err: any) {
      console.error("Upload thumbnail error", err?.message || err);
      setMsg(err?.message || "Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [rank]: false }));
    }
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);

    const payload = RANKS.map((rank) => rows[rank])
      .filter((r) => r.url.trim())
      .map((r, idx) => ({
        platform: "instagram",
        rank: RANKS[idx],
        url: r.url.trim(),
        caption: r.caption.trim() || null,
        image_url: r.image_url.trim() || null,
        likes: toInt(r.likes),
        comments: toInt(r.comments),
        shares: toInt(r.shares),
        updated_at: new Date().toISOString()
      }));

    const { error } = await supabase
      .from("top_posts")
      .upsert(payload, { onConflict: "platform,rank" });

    if (error) {
      console.error("Save top_posts error", error.message);
      setMsg(error.message);
    } else {
      invalidateDashboardCache();
      setMsg("Saved top posts ✅");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Top Instagram posts
        </h2>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {RANKS.map((rank) => {
            const r = rows[rank];
            return (
              <section
                key={rank}
                className="rounded-xl border border-neutral-200 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-neutral-50 text-xs text-neutral-700">
                    #{rank}
                  </span>
                  <h3 className="text-sm font-semibold text-neutral-800">
                    Post {rank}
                  </h3>
                </div>

                <div className="space-y-3">
                  <Field
                    label="Post URL"
                    value={r.url}
                    onChange={(v) => setField(rank, "url", v)}
                    placeholder="https://instagram.com/p/…"
                  />
                  <Field
                    label="Caption (optional)"
                    value={r.caption}
                    onChange={(v) => setField(rank, "caption", v)}
                    placeholder="Caption"
                  />
                  <Field
                    label="Image URL"
                    value={r.image_url}
                    onChange={(v) => setField(rank, "image_url", v)}
                    placeholder="https://…/image.jpg"
                  />
                  <FileUpload
                    label="Upload thumbnail (optional)"
                    loading={!!uploading[rank]}
                    onSelect={(file) => uploadThumbnail(rank, file)}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <Field
                      label="Likes"
                      value={r.likes}
                      onChange={(v) => setField(rank, "likes", v)}
                    />
                    <Field
                      label="Comments"
                      value={r.comments}
                      onChange={(v) => setField(rank, "comments", v)}
                    />
                    <Field
                      label="Shares"
                      value={r.shares}
                      onChange={(v) => setField(rank, "shares", v)}
                    />
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm text-neutral-700">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-9 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
        placeholder={placeholder}
      />
    </label>
  );
}

function FileUpload({
  label,
  loading,
  onSelect
}: {
  label: string;
  loading: boolean;
  onSelect: (file: File) => void;
}) {
  return (
    <div className="text-sm text-neutral-700">
      {label}
      <input
        type="file"
        accept="image/*"
        disabled={loading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
        className="mt-1 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-800 hover:file:bg-neutral-200 disabled:cursor-not-allowed disabled:file:bg-neutral-200"
      />
      {loading && <p className="text-xs text-neutral-500">Uploading…</p>}
    </div>
  );
}

const toInt = (v: string) => {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toStringSafe = (v: any) =>
  v === null || v === undefined ? "" : String(v);
