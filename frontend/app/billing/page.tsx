"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { createCheckoutSession } from "@/lib/api";

export default function BillingPage() {
  const { user, token, loading, error, logout } = useAuth();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function handleUpgrade() {
    if (!token) {
      setCheckoutError("You must be logged in to upgrade.");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const data = await createCheckoutSession(token);

      const checkoutUrl = data.checkout_url || data.url || data.session_url;

      if (!checkoutUrl) {
        setCheckoutError("Backend did not return a checkout URL.");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      if (err instanceof Error) {
        setCheckoutError(err.message);
      } else {
        setCheckoutError("Failed to start checkout.");
      }
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-5xl px-8 py-10">
          <p className="text-gray-400">Loading billing...</p>
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

  const isPro = user?.plan === "pro";

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
          <p className="text-sm text-gray-400">Level 160</p>
          <h1 className="text-4xl font-bold">Billing</h1>

          {user && (
            <p className="mt-3 text-gray-400">
              Logged in as <span className="text-white">{user.email}</span> ·
              Current Plan:{" "}
              <span className="rounded-full border border-gray-700 px-3 py-1 text-sm text-white">
                {user.plan}
              </span>
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <PlanCard
            title="Free"
            price="$0"
            description="Starter access for testing the AI tools."
            features={[
              "5 summaries per month",
              "Saved report history",
              "Usage tracking",
              "Pro Summary locked",
            ]}
            current={user?.plan === "free"}
          />

          <PlanCard
            title="Pro"
            price="$199"
            description="Unlock higher limits and premium AI tools."
            features={[
              "100 summaries per month",
              "100 pro summaries per month",
              "Pro Summary unlocked",
              "Higher usage limits",
            ]}
            current={isPro}
            highlighted
          />
        </div>

        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <h2 className="text-2xl font-semibold">Upgrade Status</h2>

          {isPro ? (
            <div className="mt-5 rounded-lg border border-green-900 bg-green-950/30 p-5">
              <p className="font-medium text-green-300">
                You are already on the Pro plan.
              </p>
              <p className="mt-2 text-sm text-green-200/80">
                Pro Summary should now be unlocked in AI Tools.
              </p>

              <div className="mt-4 flex gap-3">
                <Link
                  href="/tools"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
                >
                  Use Pro Tools
                </Link>

                <Link
                  href="/usage"
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-white"
                >
                  View Usage
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-gray-800 bg-black p-5">
              <p className="text-gray-300">
                Upgrade to unlock Pro Summary and higher monthly limits.
              </p>

              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="mt-5 rounded-lg bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
              >
                {checkoutLoading ? "Starting Checkout..." : "Upgrade to Pro"}
              </button>

              {checkoutError && (
                <p className="mt-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                  {checkoutError}
                </p>
              )}

              <p className="mt-4 text-xs text-gray-500">
                This uses Stripe test mode during local development.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function PlanCard({
  title,
  price,
  description,
  features,
  current,
  highlighted,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  current: boolean;
  highlighted?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border p-6 ${
        highlighted
          ? "border-gray-500 bg-gray-950"
          : "border-gray-800 bg-gray-950"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-2 text-gray-400">{description}</p>
        </div>

        {current && (
          <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
            Current
          </span>
        )}
      </div>

      <p className="mt-6 text-4xl font-bold">{price}</p>
      <p className="mt-1 text-sm text-gray-500">per month</p>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="text-sm text-gray-300">
            ✓ {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}