# Macy Jane Instagram Dashboard

Instagram-only dashboard and admin shell for Macy Jane. Vite + React + Tailwind with Supabase as the backend. Public UI shows Instagram KPIs, audience, and top posts; `/admin` is reserved for auth-gated edits once you wire Supabase auth and admin forms.

## Quick start
1) Install deps  
```sh
npm install
```
2) Copy env and add your new Supabase project creds  
```sh
cp .env.example .env
```
Set:
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon>
```
3) Run dev server  
```sh
npm run dev
```

## Expected backend contract
Create a Supabase Edge Function `public-dashboard` that returns:
```json
{
  "success": true,
  "data": {
    "platform_stats": [
      {
        "platform": "instagram",
        "followers": 0,
        "monthly_views": 0,
        "engagement": 0,
        "followers_delta": null,
        "views_delta": null,
        "engagement_delta": null,
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "audience": {
      "gender": {"women": 60, "men": 40},
      "age_groups": {"18-24": 20, "25-34": 50, "35-44": 20, "45-54": 10},
      "countries": [{"label": "Australia", "pct": 45}],
      "cities": [{"label": "Sydney", "pct": 25}],
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "top_posts": {
      "instagram": [
        {
          "rank": 1,
          "url": "https://instagram.com/p/…",
          "caption": "Caption",
          "image_url": "https://…/image.jpg",
          "likes": 0,
          "comments": 0,
          "shares": 0,
          "updated_at": "2024-01-01T00:00:00Z"
        }
      ]
    },
    "assets": {
      "hero": "https://…/hero.jpg",
      "profile": "https://…/profile.jpg"
    }
  }
}
```
Only Instagram data is expected—no YouTube/TikTok.

## Deploying to Vercel
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables.
- Build command: `npm run build`
- Output dir: `dist`

## Admin wiring (Supabase)
- Auth: email magic link via Supabase Auth (use the OTP flow; no redirect URL needed for local unless you configure it).
- Tables expected (all with RLS allowing `auth.role() = 'authenticated'`):
- `platform_stats`: `platform text primary key`, `followers numeric`, `monthly_views numeric`, `engagement numeric`, `updated_at timestamptz`.
- `platform_audience`: `platform text primary key`, `gender jsonb`, `age_groups jsonb`, `countries jsonb`, `cities jsonb`, `updated_at timestamptz`.
- `top_posts`: `platform text`, `rank int`, `url text`, `caption text`, `image_url text`, `likes int`, `comments int`, `shares int`, `updated_at timestamptz`, with unique index on `(platform, rank)`.
- `brand_assets`: `key text primary key`, `value text`, `updated_at timestamptz` (keys used: `hero`, `profile`, `about_title`, `about_body`, `hero_title`, `hero_subtitle`).
- Storage: create a public bucket named `brand-assets` for hero/profile uploads; CORS allow `http://localhost:5173` and your production domain.
- Admin page lives at `/admin` and is gated by the magic-link login. After you create a user via Supabase Auth, sign in from the UI and save IG KPIs, audience, and top posts directly to those tables.

Edge function (`public-dashboard`) should return:
```json
{
  "assets": {
    "hero": "https://…/hero.jpg",
    "profile": "https://…/profile.jpg",
    "about_title": "About Macy Jane",
    "about_body": "Bio text…",
    "hero_title": "Macy Jane",
    "hero_subtitle": "Instagram-first creator..."
  }
}
```

### Suggested RLS policies
Apply `auth.role() = 'authenticated'` to all tables and restrict to service-role if desired for writes. Example for `platform_stats` (repeat similarly for other tables):
```sql
-- Enable RLS
alter table public.platform_stats enable row level security;

-- Allow authenticated to read/write instagram row
create policy "platform_stats_read" on public.platform_stats
for select using (auth.role() = 'authenticated');

create policy "platform_stats_upsert" on public.platform_stats
for insert with check (auth.role() = 'authenticated');

create policy "platform_stats_update" on public.platform_stats
for update using (auth.role() = 'authenticated');
```

Storage bucket `brand-assets` policy (public read, authenticated write):
```sql
-- Public read
create policy "Public read brand assets" on storage.objects
for select using (bucket_id = 'brand-assets');

-- Authenticated write
create policy "Authenticated write brand assets" on storage.objects
for insert with check (bucket_id = 'brand-assets' and auth.role() = 'authenticated');
create policy "Authenticated update brand assets" on storage.objects
for update using (bucket_id = 'brand-assets' and auth.role() = 'authenticated');
create policy "Authenticated delete brand assets" on storage.objects
for delete using (bucket_id = 'brand-assets' and auth.role() = 'authenticated');
```

## Repo notes
- Clean, unforked structure at `/macy-jane-dashboard`.
- `/admin` is gated by Supabase magic-link auth and writes directly to the tables above (Instagram-only).
