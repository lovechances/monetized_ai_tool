"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { getAllUsage, type UsageStatus } from "@/lib/api";

import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingMessage } from "@/components/LoadingMessage";
import { PageHeader } from "@/components/PageHeader";

export default function UsagePage() {
  const { user, token, loading, error, logout } = useAuth();

  const [usageItems, setUsageItems] = useState<UsageStatus[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState("");

  useEffect(() => {
    async function loadUsage() {
      if (!token) {
        return;
      }

      setUsageLoading(true);
      setUsageError("");

      try {
        const data = await getAllUsage(token);

        if (Array.isArray(data)) {
          setUsageItems(data);
        } else if (Array.isArray(data.usage)) {
          setUsageItems(data.usage);
        } else if (Array.isArray(data.tools)) {
          setUsageItems(data.tools);
        } else {
          setUsageItems([]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setUsageError(err.message);
        } else {
          setUsageError("Failed to load usage.");
        }
      } finally {
        setUsageLoading(false);
      }
    }

    loadUsage();
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-5xl px-8 py-10">
          <LoadingMessage message="Loading usage..." />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-5xl px-8 py-10">
          <ErrorMessage message={error} />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-8 py-10">
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

        <div className="mt-8">
          <PageHeader
            level="Level 159"
            title="Usage + Plan"
            description={
              user
                ? `Logged in as ${user.email} · Plan: ${user.plan}`
                : "View monthly usage and plan limits."
            }
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            <p className="text-sm text-gray-400">Current Plan</p>
            <p className="mt-3 text-3xl font-bold capitalize">
              {user?.plan || "-"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Your backend account plan from /auth/me.
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            <p className="text-sm text-gray-400">Tracked Tools</p>
            <p className="mt-3 text-3xl font-bold">{usageItems.length}</p>
            <p className="mt-2 text-sm text-gray-500">
              Number of tools returned by /usage/all.
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            <p className="text-sm text-gray-400">Account Status</p>
            <p className="mt-3 text-3xl font-bold">
              {user?.is_active ? "Active" : "Inactive"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Your account can access protected routes.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Monthly Usage</h2>
              <p className="mt-2 text-sm text-gray-400">
                These numbers come from your backend usage tracker.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/tools"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
              >
                Run AI Tool
              </Link>

              <Link
                href="/billing"
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-white"
              >
                Upgrade
              </Link>
            </div>
          </div>

          {usageLoading && (
            <p className="mt-6 text-gray-400">Loading usage data...</p>
          )}

          {usageError && (
            <p className="mt-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {usageError}
            </p>
          )}

          {!usageLoading && !usageError && usageItems.length === 0 && (
            <div className="mt-6 rounded-lg border border-gray-800 bg-black p-6">
              <p className="text-gray-300">No usage data found.</p>
              <p className="mt-2 text-sm text-gray-500">
                Run an AI tool first, then come back here.
              </p>
            </div>
          )}

          {!usageLoading && !usageError && usageItems.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {usageItems.map((item) => (
                <UsageCard key={item.tool_name} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function UsageCard({ item }: { item: UsageStatus }) {
  const percentUsed =
    item.limit > 0 ? Math.min((item.used / item.limit) * 100, 100) : 0;

  const isLocked = item.limit === 0;

  return (
    <article className="rounded-xl border border-gray-800 bg-black p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Tool</p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            {formatToolName(item.tool_name)}
          </h3>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs ${
            isLocked
              ? "border-red-900 text-red-300"
              : "border-gray-700 text-gray-300"
          }`}
        >
          {isLocked ? "Locked" : `${item.remaining} left`}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Used</span>
          <span className="text-white">
            {item.used} / {item.limit}
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-900">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${percentUsed}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-gray-900 bg-gray-950 p-3">
            <p className="text-xs text-gray-500">Plan</p>
            <p className="mt-1 text-sm font-medium text-white capitalize">
              {item.plan}
            </p>
          </div>

          <div className="rounded-lg border border-gray-900 bg-gray-950 p-3">
            <p className="text-xs text-gray-500">Used</p>
            <p className="mt-1 text-sm font-medium text-white">{item.used}</p>
          </div>

          <div className="rounded-lg border border-gray-900 bg-gray-950 p-3">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="mt-1 text-sm font-medium text-white">
              {item.remaining}
            </p>
          </div>
        </div>

        {isLocked && (
          <p className="mt-4 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            This tool is not available on your current plan.
          </p>
        )}
      </div>
    </article>
  );
}

function formatToolName(toolName: string) {
  if (toolName === "summarize") {
    return "Summarize";
  }

  if (toolName === "pro_summary") {
    return "Pro Summary";
  }

  return toolName;
}