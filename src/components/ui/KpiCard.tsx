import React from "react";
import { Instagram, Users, Eye, Heart, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

type Props = {
  followers: number;
  monthlyViews: number;
  engagementPct: number;
  followersDelta?: number | null;
  monthlyViewsDelta?: number | null;
  engagementDelta?: number | null;
  updatedAt?: string | null;
  loading?: boolean;
};

export default function KpiCard({
  followers,
  monthlyViews,
  engagementPct,
  followersDelta,
  monthlyViewsDelta,
  engagementDelta,
  updatedAt,
  loading
}: Props) {
  const formatNum = (n: number) =>
    n >= 1_000_000
      ? (n / 1_000_000).toFixed(1) + "M"
      : n >= 1000
        ? (n / 1000).toFixed(1) + "K"
        : n.toString();

  const renderDelta = (d?: number | null) => {
    if (d === null || d === undefined) {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
    if (d > 0) {
      return (
        <span className="flex items-center text-green-600 text-xs font-medium">
          <ArrowUpRight className="h-3 w-3" /> {d.toFixed(1)}%
        </span>
      );
    }
    if (d < 0) {
      return (
        <span className="flex items-center text-red-600 text-xs font-medium">
          <ArrowDownRight className="h-3 w-3" /> {Math.abs(d).toFixed(1)}%
        </span>
      );
    }
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Instagram className="h-5 w-5 text-pink-500" />
        <h3 className="text-sm font-semibold">Instagram</h3>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400">Refreshing…</p>
      ) : (
        <div className="space-y-3">
          <MetricRow
            icon={<Users className="h-4 w-4" />}
            label="Followers"
            value={formatNum(followers)}
            delta={renderDelta(followersDelta)}
          />
          <MetricRow
            icon={<Eye className="h-4 w-4" />}
            label="Monthly views"
            value={formatNum(monthlyViews)}
            delta={renderDelta(monthlyViewsDelta)}
          />
          <MetricRow
            icon={<Heart className="h-4 w-4" />}
            label="Engagement"
            value={`${engagementPct.toFixed(2)}%`}
            delta={renderDelta(engagementDelta)}
          />
          {updatedAt && (
            <p className="pt-1 text-[11px] text-gray-400">
              Updated {new Date(updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
  delta
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 text-sm text-gray-600">
        {icon} {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">{value}</span>
        {delta}
      </div>
    </div>
  );
}
