import React from "react";
import { useBrandAssets } from "@/hooks";

const fallbackAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Crect width='320' height='320' rx='32' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='52%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif' font-size='40' fill='%231f2937'%3EMJ%3C/text%3E%3C/svg%3E";

const fallbackTitle = "About Macy Jane";
const fallbackBody = `Macy Jane is a visual-first storyteller who blends travel, lifestyle, and community moments into punchy short-form content. Her feed is curated for brands that want bright, authentic storytelling without losing performance.

She builds sequences that hook in the first second, pairs copy with clean product framing, and keeps viewers returning with recurring series that outperform one-off posts.`;

export default function AboutSection() {
  const { assets } = useBrandAssets();
  const avatarSrc = assets.profile || assets.hero || fallbackAvatar;
  const title = assets.about_title || fallbackTitle;
  const body = assets.about_body || fallbackBody;
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
      <img
        src={avatarSrc}
        alt="Macy Jane"
        className="h-40 w-40 rounded-full object-cover ring-1 ring-black/5 sm:h-48 sm:w-48"
      />

      <div className="flex-1">
        <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
          {title}
        </h2>

        <div className="mt-1 space-y-3 text-[13.5px] leading-relaxed text-neutral-700 sm:text-sm">
          {paragraphs.length
            ? paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
            : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-pink-50 px-3 py-1 text-[11px] font-medium text-pink-600">
            Instagram-first
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-600">
            Short-form video
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-600">
            Brand collabs
          </span>
        </div>
      </div>
    </div>
  );
}
