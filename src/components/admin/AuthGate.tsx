import React, { useState } from "react";
import { useSupabaseAuth } from "@/hooks";

type Props = { children: React.ReactNode };

export default function AuthGate({ children }: Props) {
  const { session, loading, signIn } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!email.trim()) {
      setStatus("Enter an email to receive the magic link.");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email.trim());
    setSubmitting(false);
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Check your inbox for the magic link.");
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
            Sign in with your email to receive a magic link.
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
                required
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {submitting ? "Sending…" : "Send magic link"}
            </button>
          </form>

          {status && (
            <p className="mt-3 text-sm text-neutral-600">
              {status}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
