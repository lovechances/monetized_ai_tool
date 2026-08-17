"use client";

import Link from "next/link";

import { DashboardActionCard } from "@/components/DashboardActionCard";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, loading, error, logout } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-6xl px-8 py-10">
          <p className="text-gray-400">Loading dashboard...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-6xl px-8 py-10">
          <p className="text-red-400">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-8 py-10">
        <header className="mb-10 flex flex-col gap-6 border-b border-gray-900 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">
              Monetized AI Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Welcome back
            </h1>

            {user && (
              <p className="mt-3 text-gray-400">
                Logged in as{" "}
                <span className="text-white">{user.email}</span>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Link
              href="/billing"
              className="rounded-lg bg-white px-4 py-2 font-medium text-black"
            >
              Upgrade
            </Link>

            <button
              onClick={logout}
              className="rounded-lg border border-gray-700 px-4 py-2 font-medium text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <StatCard
            label="Current Plan"
            value={user?.plan || "-"}
            description="Your active access level."
          />

          <StatCard
            label="AI Tools"
            value="2"
            description="Summarize and Pro Summary are available in the app."
          />

          <StatCard
            label="Account Status"
            value={user?.is_active ? "Active" : "Inactive"}
            description="Backend account status from /auth/me."
          />
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <p className="mt-2 text-gray-400">
              Jump into the main areas of your AI SaaS workspace.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <DashboardActionCard
              title="Run AI Tools"
              description="Use the summarize and pro-summary tools from a real frontend interface."
              href="/tools"
              badge="Level 157"
            />

            <DashboardActionCard
              title="Upload Files"
              description="Upload documents and data files for future AI analysis."
              href="/uploads"
              badge="Level 164"
            />

            <DashboardActionCard
              title="View Reports"
              description="See saved AI outputs tied to your account."
              href="/reports"
              badge="Level 158"
            />

            <DashboardActionCard
              title="Check Usage"
              description="Track monthly usage limits for free and pro tools."
              href="/usage"
              badge="Level 159"
            />

            <DashboardActionCard
              title="Manage Billing"
              description="Upgrade through Stripe and unlock pro access."
              href="/billing"
              badge="Level 160"
            />
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <h2 className="text-2xl font-semibold">System Progress</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ProgressItem label="Backend auth" status="Complete" />
            <ProgressItem label="Protected pages" status="Complete" />
            <ProgressItem label="Dashboard shell" status="In progress" />
            <ProgressItem label="AI tool UI" status="Next" />
          </div>
        </section>
      </section>
    </main>
  );
}

function ProgressItem({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-black px-4 py-3">
      <span className="text-gray-400">{label}</span>
      <span className="text-sm font-medium text-white">{status}</span>
    </div>
  );
}