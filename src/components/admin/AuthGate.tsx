import React, { useState } from "react";
import { useSupabaseAuth } from "@/hooks";

type Props = { children: React.ReactNode };

export default function AuthGate({ children }: Props) {
  const { session, loading, signIn } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!email.trim() || !password) {
      setStatus("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setStatus(error.message);
    } else {
      setStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-xl border border-neutral-200 bg-white px-6 py-4 text-sm text-neutral-600 shadow-sm">
          Checking session…
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-neutral-900">
            Macy Jane Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Sign in with your admin email and password.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <label className="block text-sm text-neutral-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-sm text-neutral-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-500"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {status && (
            <p className="mt-3 text-sm text-rose-600">
              {status}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
