import React, { useEffect, useState } from "react";
import { invalidateDashboardCache } from "@/lib/publicDashboard";
import { supabase } from "@supabaseClient";

type FormState = {
  followers: string;
  monthly_views: string;
  engagement: string;
};

const emptyForm: FormState = {
  followers: "",
  monthly_views: "",
  engagement: ""
};

export default function StatsForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_stats")
        .select("*")
        .eq("platform", "instagram")
        .maybeSingle();

      if (!alive) return;
      if (error) {
        console.error("Fetch platform_stats error", error.message);
      }
      if (data) {
        setForm({
          followers: data.followers?.toString() ?? data.follower_count?.toString() ?? "",
          monthly_views: data.monthly_views?.toString() ?? data.views?.toString() ?? "",
          engagement: data.engagement?.toString() ?? data.engagement_rate?.toString() ?? ""
        });
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const followers = Number(form.followers || 0);
    const monthly = Number(form.monthly_views || 0);
    const engagement = Number(form.engagement || 0);

    const payload = {
      platform: "instagram",
      followers,
      monthly_views: monthly,
      engagement,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("platform_stats")
      .upsert(payload, { onConflict: "platform" });

    if (error) {
      console.error("Save platform_stats error", error.message);
      setMsg(error.message);
    } else {
      invalidateDashboardCache();
      setMsg("Saved Instagram KPIs ✅");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Instagram KPIs
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
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Followers"
            value={form.followers}
            onChange={(v) => setField("followers", v)}
            placeholder="420000"
          />
          <Field
            label="Monthly views"
            value={form.monthly_views}
            onChange={(v) => setField("monthly_views", v)}
            placeholder="1250000"
          />
          <Field
            label="Engagement %"
            value={form.engagement}
            onChange={(v) => setField("engagement", v)}
            placeholder="4.2"
          />
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
        inputMode="numeric"
      />
    </label>
  );
}
