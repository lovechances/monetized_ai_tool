"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { proSummarizeText, summarizeText } from "@/lib/api";

import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingMessage } from "@/components/LoadingMessage";
import { PageHeader } from "@/components/PageHeader";

export default function ToolsPage() {
  const { user, token, loading, error, logout } = useAuth();

  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [reportId, setReportId] = useState<number | null>(null);
  const [toolUsed, setToolUsed] = useState("");
  const [toolError, setToolError] = useState("");
  const [submittingTool, setSubmittingTool] = useState("");

  async function handleSummarize() {
    if (!token) {
      setToolError("You must be logged in.");
      return;
    }

    if (!inputText.trim()) {
      setToolError("Enter some text first.");
      return;
    }

    setSubmittingTool("summarize");
    setToolError("");
    setResult("");
    setReportId(null);
    setToolUsed("");

    try {
      const data = await summarizeText(token, inputText);

      setResult(data.summary);
      setReportId(data.report_id ?? null);
      setToolUsed("Summarize");
    } catch (err) {
      if (err instanceof Error) {
        setToolError(err.message);
      } else {
        setToolError("Summarize failed.");
      }
    } finally {
      setSubmittingTool("");
    }
  }

  async function handleProSummary() {
    if (!token) {
      setToolError("You must be logged in.");
      return;
    }

    if (!inputText.trim()) {
      setToolError("Enter some text first.");
      return;
    }

    setSubmittingTool("pro_summary");
    setToolError("");
    setResult("");
    setReportId(null);
    setToolUsed("");

    try {
      const data = await proSummarizeText(token, inputText);

      setResult(data.pro_summary);
      setToolUsed("Pro Summary");
    } catch (err) {
      if (err instanceof Error) {
        setToolError(err.message);
      } else {
        setToolError("Pro Summary failed.");
      }
    } finally {
      setSubmittingTool("");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto max-w-5xl px-8 py-10">
          <LoadingMessage message="Loading AI tools..." />
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

        <div className="mt-8">
          <PageHeader
            level="Level 157"
            title="AI Tools"
            description={
              user
                ? `Logged in as ${user.email} · Plan: ${user.plan}`
                : "Run AI tools from the frontend."
            }
          />
        </div>

        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <label className="text-sm font-medium text-gray-300">
            Text to analyze
          </label>

          <textarea
            className="mt-3 min-h-48 w-full rounded-lg border border-gray-800 bg-black px-4 py-3 text-white outline-none focus:border-gray-600"
            placeholder="Paste text here and run an AI tool..."
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSummarize}
              disabled={submittingTool !== ""}
              className="rounded-lg bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
            >
              {submittingTool === "summarize"
                ? "Summarizing..."
                : "Summarize"}
            </button>

            <button
              onClick={handleProSummary}
              disabled={submittingTool !== ""}
              className="rounded-lg border border-gray-700 px-5 py-3 font-medium text-white disabled:opacity-50"
            >
              {submittingTool === "pro_summary"
                ? "Running Pro Summary..."
                : "Pro Summary"}
            </button>
          </div>

          {toolError && (
            <p className="mt-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {toolError}
            </p>
          )}
        </div>

        {result && (
          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-950 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">Result</p>
                <h2 className="text-2xl font-semibold">{toolUsed}</h2>
              </div>

              {reportId && (
                <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
                  Report #{reportId}
                </span>
              )}
            </div>

            <div className="mt-5 whitespace-pre-wrap rounded-lg border border-gray-800 bg-black p-4 text-gray-200">
              {result}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}