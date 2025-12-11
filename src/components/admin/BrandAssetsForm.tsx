import React, { useEffect, useState } from "react";
import { invalidateDashboardCache } from "@/lib/publicDashboard";
import { supabase } from "@supabaseClient";

type AssetKey =
  | "hero"
  | "profile"
  | "about_title"
  | "about_body"
  | "hero_title"
  | "hero_subtitle";

type AssetState = Record<AssetKey, string>;

const INITIAL: AssetState = {
  hero: "",
  profile: "",
  about_title: "",
  about_body: "",
  hero_title: "",
  hero_subtitle: ""
};

export default function BrandAssetsForm() {
  const [assets, setAssets] = useState<AssetState>(INITIAL);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("brand_assets")
        .select("key,value")
        .in("key", [
          "hero",
          "profile",
          "about_title",
          "about_body",
          "hero_title",
          "hero_subtitle"
        ]);

      if (!alive) return;

      if (error) {
        console.error("Fetch brand_assets error", error.message);
      } else if (data) {
        const next = { ...INITIAL };
        for (const row of data) {
          const k = row.key as AssetKey;
          if (k in next) next[k] = row.value ?? "";
        }
        setAssets(next);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setField = (key: AssetKey, value: string) =>
    setAssets((prev) => ({ ...prev, [key]: value }));

  const upload = async (key: "hero" | "profile", file: File | null) => {
    if (!file) {
      setMsg("Choose a file before uploading.");
      return;
    }
    setMsg(null);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${key}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("brand-assets")
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (error) {
      console.error("Upload error", error.message);
      setMsg(error.message);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("brand-assets")
      .getPublicUrl(path);

    if (publicUrl?.publicUrl) {
      setField(key, publicUrl.publicUrl);
      setMsg(`Uploaded ${key} ✅`);
    } else {
      setMsg("Upload succeeded but no public URL returned.");
    }
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const rows = (Object.keys(assets) as AssetKey[])
      .filter((k) => assets[k].trim().length > 0)
      .map((k) => ({
        key: k,
        value: assets[k].trim(),
        updated_at: new Date().toISOString()
      }));

    if (rows.length === 0) {
      setMsg("Add at least one field.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("brand_assets")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      console.error("Save brand_assets error", error.message);
      setMsg(error.message);
    } else {
      invalidateDashboardCache();
      setMsg("Brand assets saved ✅");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Brand assets (hero, profile, about copy)
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
        <div className="space-y-4">
          <UploadField
            label="Hero banner image"
            value={assets.hero}
            file={heroFile}
            onFile={(f) => setHeroFile(f)}
            onUrlChange={(v) => setField("hero", v)}
            onUpload={() => upload("hero", heroFile)}
          />
          <Field
            label="Hero title"
            placeholder="Macy Jane"
            value={assets.hero_title}
            onChange={(v) => setField("hero_title", v)}
          />
          <Field
            label="Hero subtitle"
            placeholder="Instagram-first creator storytelling through bold visuals."
            value={assets.hero_subtitle}
            onChange={(v) => setField("hero_subtitle", v)}
          />
          <UploadField
            label="Profile image"
            value={assets.profile}
            file={profileFile}
            onFile={(f) => setProfileFile(f)}
            onUrlChange={(v) => setField("profile", v)}
            onUpload={() => upload("profile", profileFile)}
          />
          <Field
            label="About title"
            placeholder="About Macy Jane"
            value={assets.about_title}
            onChange={(v) => setField("about_title", v)}
          />
          <label className="block text-sm text-neutral-700">
            About body (supports multiple paragraphs)
            <textarea
              value={assets.about_body}
              onChange={(e) => setField("about_body", e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
              rows={5}
              placeholder="Paste or type the bio/about copy…"
            />
          </label>
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
        className="mt-1 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
        placeholder={placeholder}
      />
    </label>
  );
}

function UploadField({
  label,
  value,
  file,
  onFile,
  onUrlChange,
  onUpload
}: {
  label: string;
  value: string;
  file: File | null;
  onFile: (f: File | null) => void;
  onUrlChange: (v: string) => void;
  onUpload: () => void;
}) {
  return (
    <div className="space-y-2">
      <Field
        label={`${label} URL`}
        value={value}
        onChange={onUrlChange}
        placeholder="https://…/image.jpg"
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button
          type="button"
          onClick={onUpload}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          disabled={!file}
        >
          Upload to Supabase
        </button>
        {file && (
          <span className="text-xs text-neutral-600">
            {file.name} ({Math.round(file.size / 1024)} KB)
          </span>
        )}
      </div>
    </div>
  );
}
