import React, { useEffect, useState } from "react";
import { invalidateDashboardCache } from "@/lib/publicDashboard";
import { supabase } from "@supabaseClient";

type CountryCity = { label: string; pct: string };

type FormState = {
  men: string;
  women: string;
  age_18_24: string;
  age_25_34: string;
  age_35_44: string;
  age_45_54: string;
  countries: CountryCity[];
  cities: CountryCity[];
};

const defaultList: CountryCity[] = [
  { label: "", pct: "" },
  { label: "", pct: "" },
  { label: "", pct: "" }
];

const emptyForm: FormState = {
  men: "",
  women: "",
  age_18_24: "",
  age_25_34: "",
  age_35_44: "",
  age_45_54: "",
  countries: defaultList,
  cities: defaultList
};

export default function AudienceForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_audience")
        .select("*")
        .eq("platform", "instagram")
        .maybeSingle();

      if (!alive) return;
      if (error) {
        console.error("Fetch audience error", error.message);
      }
      if (data) {
        const gender = data.gender || {};
        const ages = data.age_groups || {};
        const countries = data.countries || data.top_countries || [];
        const cities = data.cities || data.top_cities || [];

        setForm({
          men: (gender.men ?? gender.male ?? "").toString(),
          women: (gender.women ?? gender.female ?? "").toString(),
          age_18_24: (ages["18-24"] ?? ages["18_24"] ?? "").toString(),
          age_25_34: (ages["25-34"] ?? ages["25_34"] ?? "").toString(),
          age_35_44: (ages["35-44"] ?? ages["35_44"] ?? "").toString(),
          age_45_54: (ages["45-54"] ?? ages["45_54"] ?? "").toString(),
          countries: normalizeList(countries),
          cities: normalizeList(cities)
        });
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setField = (key: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setList = (
    key: "countries" | "cities",
    idx: number,
    field: "label" | "pct",
    value: string
  ) =>
    setForm((prev) => {
      const next = prev[key].slice();
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, [key]: next };
    });

  const save = async () => {
    setSaving(true);
    setMsg(null);

    const payload = {
      platform: "instagram",
      gender: {
        men: Number(form.men || 0),
        women: Number(form.women || 0)
      },
      age_groups: {
        "18-24": Number(form.age_18_24 || 0),
        "25-34": Number(form.age_25_34 || 0),
        "35-44": Number(form.age_35_44 || 0),
        "45-54": Number(form.age_45_54 || 0)
      },
      countries: serializeList(form.countries),
      cities: serializeList(form.cities),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("platform_audience")
      .upsert(payload, { onConflict: "platform" });

    if (error) {
      console.error("Save audience error", error.message);
      setMsg(error.message);
    } else {
      invalidateDashboardCache();
      setMsg("Saved audience ✅");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Audience (Instagram)
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
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Men %"
              value={form.men}
              onChange={(v) => setField("men", v)}
            />
            <Field
              label="Women %"
              value={form.women}
              onChange={(v) => setField("women", v)}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-neutral-800">
              Age groups %
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label="18–24"
                value={form.age_18_24}
                onChange={(v) => setField("age_18_24", v)}
              />
              <Field
                label="25–34"
                value={form.age_25_34}
                onChange={(v) => setField("age_25_34", v)}
              />
              <Field
                label="35–44"
                value={form.age_35_44}
                onChange={(v) => setField("age_35_44", v)}
              />
              <Field
                label="45–54"
                value={form.age_45_54}
                onChange={(v) => setField("age_45_54", v)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ListEditor
              title="Top countries"
              rows={form.countries}
              onChange={(idx, field, val) => setList("countries", idx, field, val)}
            />
            <ListEditor
              title="Top cities"
              rows={form.cities}
              onChange={(idx, field, val) => setList("cities", idx, field, val)}
            />
          </div>
        </div>
      )}

      {msg && <p className="mt-3 text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm text-neutral-700">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
        inputMode="numeric"
      />
    </label>
  );
}

function ListEditor({
  title,
  rows,
  onChange
}: {
  title: string;
  rows: CountryCity[];
  onChange: (idx: number, field: "label" | "pct", val: string) => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <p className="mb-3 text-sm font-medium text-neutral-800">{title}</p>
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-[2fr,1fr] gap-2">
            <input
              value={row.label}
              onChange={(e) => onChange(idx, "label", e.target.value)}
              placeholder="Location"
              className="h-9 rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
            />
            <input
              value={row.pct}
              onChange={(e) => onChange(idx, "pct", e.target.value)}
              placeholder="%"
              className="h-9 rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
              inputMode="numeric"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizeList(list: any): CountryCity[] {
  const arr: CountryCity[] = Array.isArray(list) ? list : [];
  const mapped = arr
    .map((item: any) => ({
      label:
        item?.label ??
        item?.country ??
        item?.city ??
        item?.name ??
        item?.title ??
        "",
      pct: (item?.pct ?? item?.percentage ?? item?.value ?? "").toString()
    }))
    .filter((r) => r.label);

  // always return 3 rows for UX
  while (mapped.length < 3) {
    mapped.push({ label: "", pct: "" });
  }
  return mapped.slice(0, 3);
}

function serializeList(list: CountryCity[]) {
  return (list || [])
    .filter((row) => row.label?.trim())
    .map((row) => ({
      label: row.label.trim(),
      pct: Number(row.pct || 0)
    }));
}
