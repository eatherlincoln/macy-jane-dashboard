import React from "react";
import { useSupabaseAuth } from "@/hooks";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function AdminLayout({ title, children }: Props) {
  const { signOut } = useSupabaseAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-neutral-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4 sm:px-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Admin
            </p>
            <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100"
            >
              Return to site
            </a>
            <button
              onClick={() => signOut()}
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-content px-6 py-8 sm:px-8">
        <div className="space-y-8">{children}</div>
      </main>
    </div>
  );
}
