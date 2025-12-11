import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

// Secrets must not start with SUPABASE_ prefix in the dashboard.
const supabaseUrl = Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey =
  Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAnonKey = Deno.env.get("ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");

if (!supabaseUrl) {
  console.error("Missing SUPABASE_URL environment variable");
}

const supabase = createClient(
  supabaseUrl ?? "",
  supabaseServiceRoleKey || supabaseAnonKey || ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { data: platformStats, error: statsError } = await supabase
      .from("platform_stats")
      .select("*");
    if (statsError) throw statsError;

    const { data: audience, error: audienceError } = await supabase
      .from("platform_audience")
      .select("*")
      .maybeSingle();
    if (audienceError) throw audienceError;

    const { data: topPosts, error: postsError } = await supabase
      .from("top_posts")
      .select("*")
      .order("rank", { ascending: true });
    if (postsError) throw postsError;

    const { data: assetsRows, error: assetsError } = await supabase
      .from("brand_assets")
      .select("key, value");
    if (assetsError) throw assetsError;

    const assets: Record<string, string> = {};
    for (const row of assetsRows || []) {
      if (row.key) assets[row.key] = row.value ?? "";
    }

    const payload = {
      success: true,
      data: {
        platform_stats: platformStats ?? [],
        audience: audience ?? null,
        top_posts: { instagram: topPosts ?? [] },
        assets
      }
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("public-dashboard error", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
