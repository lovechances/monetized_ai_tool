"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSystemStatus, type SystemStatus } from "@/lib/api";

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStatus() {
      try {
        const data = await getSystemStatus();
        setStatus(data);
      } catch (err) {
        setError("Could not connect to backend");
      }
    }

    loadStatus();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-3xl px-8 py-10">
        <Link href="/" className="text-sm text-gray-400 underline">
          Back home
        </Link>

        <div className="mt-8">
          <p className="text-sm text-gray-400">Level 153</p>
          <h1 className="text-4xl font-bold">System Status</h1>
          <p className="mt-3 text-gray-400">
            This page uses the frontend API client layer.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Backend Status</h2>

          {error && <p className="text-red-400">{error}</p>}

          {!status && !error && (
            <p className="text-gray-400">Checking backend connection...</p>
          )}

          {status && (
            <div className="space-y-3">
              <StatusRow label="App" value={status.app_name} />
              <StatusRow label="Version" value={status.version} />
              <StatusRow label="Environment" value={status.environment} />
              <StatusRow
                label="Database"
                value={status.database_ok ? "OK" : "Error"}
              />
              <StatusRow
                label="Auth"
                value={status.auth_enabled ? "Enabled" : "Disabled"}
              />
              <StatusRow
                label="Billing"
                value={status.billing_enabled ? "Enabled" : "Disabled"}
              />
              <StatusRow
                label="Stripe Secret"
                value={status.stripe_secret_configured ? "Loaded" : "Missing"}
              />
              <StatusRow
                label="Stripe Price"
                value={status.stripe_price_configured ? "Loaded" : "Missing"}
              />
              <StatusRow
                label="Stripe Webhook"
                value={status.stripe_webhook_configured ? "Loaded" : "Missing"}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}