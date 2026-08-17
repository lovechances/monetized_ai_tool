"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

export default function UsagePage() {
  const { user, loading, error, logout } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-5xl px-8 py-10">
          <p className="text-gray-400">Loading usage...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-5xl px-8 py-10">
          <p className="text-red-400">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-8 py-10">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-400 underline">
            Back to dashboard
          </Link>

          <button
            onClick={logout}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-white"
          >
            Logout
          </button>
        </div>

        <h1 className="mt-6 text-4xl font-bold">Usage</h1>

        {user && (
          <p className="mt-3 text-gray-400">
            Plan: <span className="text-white">{user.plan}</span>
          </p>
        )}

        <p className="mt-4 text-gray-400">
          This page is now protected. It will fetch /usage/all in Level 159.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <UsageCard title="Summarize" used="-" limit="-" />
          <UsageCard title="Pro Summary" used="-" limit="-" />
        </div>
      </section>
    </main>
  );
}

function UsageCard({
  title,
  used,
  limit,
}: {
  title: string;
  used: string;
  limit: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-gray-400">
        Used: {used} / {limit}
      </p>
    </div>
  );
}